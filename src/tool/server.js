const maxstache = require("maxstache");
const URL = require("url");
const serveStatic = require("sirv");
// const liveReload = require("inject-lr-script");
const express = require("express");
const path = require("path");
const getPort = require("get-port");
const fs = require("fs");
const WebSocket = require("ws");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

const IS_DEV = process.env.NODE_ENV !== "production";
const templateFile = require.resolve("./template.html");
// const liveReloadInput = require.resolve("./livereload/index.js");
// const LIVE_RELOAD_PATH = "yyz/livereload.js";
const YYZ_SCRIPT_PATH = "bundle.js";
const DEFAULT_PORT = 9966;

module.exports = async function createServer(opts = {}) {
  const dir = opts.dir || process.cwd();
  const srcJS = opts.srcJS || "bundle.js";
  const srcCSS = opts.srcCSS || "bundle.css";
  const bundlerMiddleware = opts.middleware;
  const app = middleware();

  let port = process.env.PORT;
  if (!port) {
    const basePort = DEFAULT_PORT;
    port = await getPort({ port: basePort });
    if (port !== basePort) {
      console.warn(`Port ${basePort} is in use; using port ${port}`);
    }
  }

  let server = await new Promise((resolve, reject) => {
    const server = app
      .listen(port, () => resolve(server))
      .once("error", reject);
  });

  const wss = new WebSocket.Server({ server });

  // wss.on('connection', function connection(ws) {
  //   ws.on('message', function incoming(message) {
  //     console.log('received: %s', message);
  //   });

  //   ws.send('something');
  // });

  return {
    port,
    server,
    reload,
    close() {
      return server.close();
    },
  };

  function reload() {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("reload-js");
      }
    });
  }

  async function sendDefaultIndex(req, res) {
    const defaultHTML = await readFile(templateFile, "utf8");
    const html = maxstache(defaultHTML, {
      title: "yyz",
      css: `<link rel="stylesheet" href="${srcCSS}">`,
      entry: `<script src="${srcJS}" type="module"></script>`,
    });
    res.set("Content-Type", "text/html");
    res.status(200);
    res.send(html);
  }

  function middleware() {
    const app = express();
    // app.use(
    //   liveReload({
    //     local: true,
    //     async: false,
    //     defer: false,
    //     path: "yyz/livereload.js",
    //   })
    // );
    app.use((req, res, next) => {
      const pathname = URL.parse(req.url).pathname;
      if (pathname === "/" || /^\/index(\.html?)?$/i.test(pathname)) {
        sendDefaultIndex(req, res);
      } else {
        next(null);
      }
    });
    if (bundlerMiddleware) app.use(bundlerMiddleware);
    app.use(
      serveStatic(dir, {
        dev: IS_DEV,
      })
    );
    app.use((req, res, next) => {
      const pathname = URL.parse(req.url).pathname;
      if (pathname === "/favicon.ico") {
        res.sendStatus(204);
      } else {
        next(null);
      }
    });
    return app;
  }
};
