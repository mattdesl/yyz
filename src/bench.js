const esbuild = require("esbuild");
const entry = require.resolve("./three");

(async () => {
  const service = await esbuild.startService();

  let sum = 0;
  let count = 0;
  const result = await service.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    incremental: true,
    sourcemap: false,
  });
  const times = new Array(50).fill(0);
  await times.reduce(async (p, _) => {
    await p;
    const now = Date.now();
    const start = Date.now();
    await result.rebuild();
    const delta = Date.now() - start;
    sum += delta;
    count++;
  }, Promise.resolve());
  sum /= count;

  console.log("Average Time", sum);

  await service.stop();
})();
