module.exports = function createPlugin({ dev = false, sketch } = {}) {
  const yyzEntry = require.resolve("../yyz/index.js");
  const pathEntry = require.resolve("path-browserify");
  const liveReloadEntry = dev
    ? require.resolve("../yyz/livereload/index.js")
    : require.resolve("../yyz/livereload/empty.js");
  return {
    name: "yyz",
    setup(build) {
      build.onResolve({ filter: /^yyz$/ }, (args) => ({
        path: yyzEntry,
      }));
      build.onResolve({ filter: /^path$/ }, (args) => ({
        path: pathEntry,
      }));
      build.onResolve({ filter: /^yyz\/sketch$/ }, (args) => ({
        path: sketch,
      }));
      build.onResolve({ filter: /^yyz\/livereload$/ }, (args) => ({
        path: liveReloadEntry,
      }));
    },
  };
};
