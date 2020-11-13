const path = require("path");
const URL = require("url");
const esbuild = require("esbuild");
const createBundler = require("./bundle");
const createWatcher = require("./watch");
const createServer = require("./server");
const errorPopup = require("./error-popup");
const chalk = require("chalk");
const fs = require("fs");

async function cli() {
  const argv = require("minimist")(process.argv.slice(2));
  const _entry = argv._[0];
  if (!_entry) {
    console.error(
      `\n${chalk.red(
        "Error:"
      )} You must specify an entry file, e.g.\n  yyz MySketch.js\n`
    );
    process.exit(1);
  }
  const sketch = path.isAbsolute(_entry)
    ? _entry
    : path.resolve(process.cwd(), _entry);
  if (!fs.existsSync(sketch)) {
    console.error(
      `\n${chalk.red(
        "Error:"
      )} Cannot find a sketch file by the path ${path.resolve(
        process.cwd(),
        sketch
      )}\n`
    );
    process.exit(1);
  }

  return start({ ...argv, sketch });
}

async function start(opts) {
  const { sketch } = opts;

  // let dist = opts.dist || "build";
  // if (!path.isAbsolute(dist)) dist = path.resolve(process.cwd(), dist);

  const entry = path.resolve(__dirname, "../index.js");
  const src = URL.parse(path.basename(sketch)).pathname;
  const outfile = null;
  const dir = opts.dir || process.cwd();
  // path.resolve(dist, "bundle.js");
  // console.log(outfile);

  let timer = null;
  let timerDelay = 0;

  const bundler = await createBundler(esbuild);
  bundler.setOptions({
    write: false,
    sketch,
    outfile: src,
    src,
    entry,
  });

  let bundlePromise = doBundle();

  const server = await createServer({
    src,
    dir,
    async middleware(req, res, next) {
      const pathname = URL.parse(req.url).pathname;
      if (pathname === `/${src}`) {
        try {
          const result = await bundlePromise;
          const file = result.outputFiles.find((f) => /\.js$/i.test(f.path));
          if (result.errors) {
            res.type("js");
            res.status(200);
            res.send(errorPopup(result.errors));
          } else if (file) {
            res.type("js");
            res.status(200);
            res.send(file.text);
          } else {
            res.status(500).send(`no file found by .js`);
          }
        } catch (err) {
          console.error("Error searching for source map:", err.message);
          res.status(500).send(`uncaught error while waiting for bundle`);
        }
      } else if (pathname === `/${src}.map`) {
        try {
          const result = await bundlePromise;
          const file = result.outputFiles.find((f) =>
            /\.js.map$/i.test(f.path)
          );
          if (file) {
            res.set("Content-Type", "application/octet-stream");
            res.status(200);
            res.send(file.text);
          } else {
            res.status(500).send(`no file found by .js.map`);
          }
        } catch (err) {
          console.error("Error searching for source map:", err.message);
          res.status(500).send(`uncaught error while waiting for source map`);
        }
      } else {
        next(null);
      }
    },
  });
  const watcher = createWatcher(["**/*.js", sketch]);

  watcher.on("change", (file) => {
    if (path.resolve(file) === outfile) {
      return;
    }
    if (timer != null) clearTimeout(timer);
    timer = setTimeout(rebuild, timerDelay);
  });

  const uri = `http://localhost:/${server.port}/`;
  console.log(`\n  Server listening on:\n  ${chalk.green(chalk.bold(uri))}\n`);

  triggerReload();

  function rebuild() {
    bundlePromise = doBundle();
    triggerReload();
  }

  function doBundle() {
    return bundler.bundle().catch((error) => {
      return {
        errors: error.errors,
        warnings: [],
        outputFiles: [],
      };
    });
  }

  async function triggerReload() {
    if (timer != null) clearTimeout(timer);
    timer = null;
    server.reload();
  }
}

if (require.main === module) {
  cli();
}
