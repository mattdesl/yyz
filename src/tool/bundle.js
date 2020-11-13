const prettyMs = require("pretty-ms");
const isDev = true;
const injectPath = require.resolve
  ? require.resolve("../yyz/builtins.js")
  : false;

module.exports = async function createBundler(esbuild, serviceOpts = {}) {
  const service = await esbuild.startService(serviceOpts);

  const plugin = createPlugin();
  let curOptions = {};

  return {
    service,
    setOptions(opts) {
      Object.assign(curOptions, opts);
    },
    async transform(code) {
      const { src } = curOptions;
      const start = Date.now();
      const result = await service.transform(code, {
        define: {
          __YYZ_IS_DEV__: isDev,
          __YYZ_SCRIPT_SRC__: JSON.stringify(src),
        },
        // inject: [injectPath],
        sourcemap: "inline",
        jsxFactory: "__yyz_node",
        jsxFragment: "__yyz_fragment",
        format: "iife",
        loader: "jsx",
        // plugins: [plugin],
      });
      const now = Date.now();
      console.log(`Transformed in ${prettyMs(now - start)}`);
      return result;
    },
    async bundle() {
      const { src, entry, outfile, outdir, write = true } = curOptions;

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
        inject: [require.resolve("../yyz/builtins.js")],
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
