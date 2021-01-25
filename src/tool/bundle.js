const prettyMs = require("pretty-ms");
const createPluginSvelte = require("./esbuild-plugin-svelte");
const createPluginYYZ = require("./esbuild-plugin-yyz");
const isDev = true;
const injectPath = require.resolve
  ? require.resolve("../yyz/builtins.js")
  : false;

module.exports = async function createBundler(esbuild, serviceOpts = {}) {
  const service = await esbuild.startService(serviceOpts);

  const pluginSvelte = createPluginSvelte({ dev: isDev });
  let curOptions = {};
  let instance;
  let useIncremental = true;

  return {
    service,
    setOptions(opts) {
      Object.assign(curOptions, opts);
    },
    async transform(code) {
      const { srcJS, srcCSS } = curOptions;
      const start = Date.now();
      const result = await service.transform(code, {
        define: {
          __YYZ_IS_DEV__: isDev,
          __YYZ_SCRIPT_SRC__: JSON.stringify(srcJS),
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
      const {
        srcJS,
        srcCSS,
        entry,
        outfile,
        outdir,
        write = true,
        sketch,
      } = curOptions;

      const start = Date.now();
      const pluginYYZ = createPluginYYZ({ sketch, dev: isDev });
      let result;
      if (instance) {
        result = instance.rebuild();
      } else {
        result = await service.build({
          entryPoints: [].concat(entry).filter(Boolean),
          bundle: true,
          outfile,
          write,
          define: {
            __YYZ_IS_DEV__: isDev,
            __YYZ_SCRIPT_SRC__: JSON.stringify(srcJS),
          },
          outdir,
          incremental: useIncremental,
          inject: [require.resolve("../yyz/builtins.js")],
          sourcemap: false,
          jsxFactory: "__yyz_node",
          jsxFragment: "__yyz_fragment",
          format: "iife",
          loader: {
            ".js": "jsx",
            ".ts": "tsx",
          },
          plugins: [pluginYYZ, pluginSvelte],
        });
        if (useIncremental) instance = result;
      }
      await result;
      const now = Date.now();
      console.log(`Bundled in ${prettyMs(now - start)}`);
      return result;
    },
    reset() {
      if (instance) {
        instance.rebuild.dispose();
        instance = null;
      }
    },
    dispose() {
      this.reset();
      service.stop();
    },
  };
};
