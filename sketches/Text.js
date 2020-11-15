import { math, random } from "yyz";

export const settings = {
  duration: 5,
  scaleToView: false,
  animate: true,
};

export default (props, { width, height, playhead, frame }) => {
  const dim = min(width, height);
  const gridSize = round(dim / 40);
  const cells = new Array(gridSize * gridSize).fill(0);

  const nodes = math
    .linspace(500)
    .map((t, i) => {
      let x = width / 2 + random.gaussian(0, dim / 8);
      let y = height / 2 + random.gaussian(0, dim / 8);
      x = floor(x / gridSize) * gridSize;
      y = floor(y / gridSize) * gridSize;
      const idx = x + y * gridSize;
      if (cells[idx]) return null;
      cells[idx] = true;
      const text = y > height / 2 ? ". . . falling" : "drifting . . .";

      const a = dim * 0.0025;
      const f = 4;
      const n0 = random.noise3D(
        (x / width) * 2 - 1,
        (y / height) * 2 - 1,
        -1,
        f,
        a
      );
      const n1 = random.noise3D(
        (x / width) * 2 - 1,
        (y / height) * 2 - 1,
        1,
        f,
        a
      );

      const chrIdx = math.mapRange(
        x,
        0.3 * width,
        width * 0.7,
        0,
        text.length - 1,
        true
      );
      const charOff = sin((y / height) * 5 + playhead * 10) * 4;
      let cidx = chrIdx + charOff;
      if (cidx < 0 || cidx >= text.length) return false;
      cidx = math.mod(cidx, text.length);
      const chr = text.charAt(cidx);

      x += n0;
      y += n1;
      return [chr, x, y];
    })
    .filter(Boolean);

  return (
    <background fill="hsl(0, 0%, 95%)">
      {nodes.map(([chr, x, y]) => {
        return (
          <text
            x={x}
            y={y}
            fill="hsl(0, 0%, 10%)"
            fontSize={gridSize}
            fontStyle="bold"
            fontFamily="Andale Mono, Courier New"
          >
            {chr}
          </text>
        );
      })}
    </background>
  );
};

function loopNoise(random, x, y, t, scale = 1) {
  const duration = scale;
  const current = t * scale;
  return (
    ((duration - current) * random.noise3D(x, y, current) +
      current * random.noise3D(x, y, current - duration)) /
    duration
  );
}
