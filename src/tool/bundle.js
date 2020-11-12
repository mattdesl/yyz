const esbuild = require("esbuild");
const path = require("path");
const prettyMs = require("pretty-ms");
const isDev = true;

module.exports = async function createBundler() {
  const service = await esbuild.startService();
  const plugin = createPlugin();
  let curOptions = {};

  return {
    setOptions(opts) {
      Object.assign(curOptions, opts);
    },
    async bundle() {
      const { port, src, entry, outfile, outdir, write = true } = curOptions;

      const start = Date.now();
      const result = await service.build({
        entryPoints: [].concat(entry).filter(Boolean),
        bundle: true,
        outfile,
        write,
        define: {
          __YYZ_IS_DEV__: isDev,
          __YYZ_SCRIPT_SRC__: JSON.stringify(src),
        },
        outdir,
        inject: [path.resolve(__dirname, "../yyz/builtins.js")],
        sourcemap: true,
        // globalName,
        jsxFactory: "__yyz_node",
        jsxFragment: "__yyz_fragment",
        format: "iife",
        loader: { ".js": "jsx" },
        plugins: [plugin],
      });
      const now = Date.now();
      console.log(`Bundled in ${prettyMs(now - start)}`);
      return result;
    },
    dispose() {
      service.stop();
    },
  };

  function createPlugin() {
    return {
      name: "yyz",
      setup(build) {
        build.onResolve({ filter: /^yyz$/ }, (args) => ({
          path: require.resolve("../yyz/index.js"),
        }));
        build.onResolve({ filter: /^path$/ }, (args) => ({
          path: require.resolve("path-browserify"),
        }));
        build.onResolve({ filter: /^yyz\/sketch$/ }, (args) => ({
          path: curOptions.sketch,
        }));

        build.onResolve({ filter: /^yyz\/livereload$/ }, (args) => ({
          path: isDev
            ? require.resolve("../yyz/livereload/index.js")
            : require.resolve("../yyz/livereload/empty.js"),
        }));
      },
    };
  }
};
