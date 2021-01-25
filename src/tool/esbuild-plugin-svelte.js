// modified from
// https://github.com/EMH333/esbuild-svelte/blob/main/configurable/index.js

const svelte = require("svelte/compiler");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

const convertMessage = ({ message, start, end, filename, frame }) => ({
  text: message,
  location: start &&
    end && {
      file: filename,
      line: start.line,
      column: start.column,
      length: start.line === end.line ? end.column - start.column : 0,
      lineText: frame,
    },
});

module.exports = function createPluginSvelte(options = {}) {
  const { dev = false, cwd = process.cwd() } = options;
  return {
    name: "esbuild-svelte",
    setup(build) {
      const cssCode = new Map();
      //if the css exists in our map, then output it with the css loader
      build.onLoad({ filter: /\.esbuild-svelte-css$/ }, (args) => {
        const css = cssCode.get(args.path);
        console.log("css path", args.path);
        return css ? { contents: css, loader: "css" } : null;
      });
      //main loader
      build.onLoad({ filter: /\.svelte$/ }, async (args) => {
        let source = await readFile(args.path, "utf8");
        const filename = path.relative(cwd, args.path);
        try {
          if (options.preprocessor) {
            source = (
              await svelte.preprocess(source, options.preprocessor, {
                filename,
              })
            ).code;
          }
          let compileOptions = {
            dev,
            css: false,
            ...options.compileOptions,
          };
          let { js, css, warnings } = svelte.compile(source, {
            ...compileOptions,
            filename,
          });

          let contents = js.code + `\n//# sourceMappingURL=` + js.map.toUrl();
          // if svelte emits css seperately, then store it in a map and import it from the js
          if (!compileOptions.css && css.code) {
            let cssPath = args.path
              .replace(".svelte", ".esbuild-svelte-css")
              .replace(/\\/g, "/");
            cssCode.set(
              cssPath,
              css.code + `/*# sourceMappingURL=${css.map.toUrl()}*/`
            );
            contents = `import "${cssPath}";\n` + contents;
          }
          console.log("js path", args.path);
          // console.log(contents);
          return {
            contents,
            warnings: warnings.map(convertMessage),
          };
        } catch (e) {
          return { errors: [convertMessage(e)] };
        }
      });
    },
  };
};
