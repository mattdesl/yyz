# yyz

Experimental generative art toolkit based on JSX and esbuild. *Currently just a proof of concept*! Don't rely on this for anything, but feel free to poke around and check out the code locally to test it.

```sh
git clone

cd yyz
npm install

# now run one of the sketches
node . sketches/DotSin.js

# or...
node . sketches/RadialCircle.js

# or...
node . sketches/Random.js
```

Once it's running, you can edit the code in the selected `sketches/*.js` file to see it evaluate at runtime. Hit `Cmd/Ctrl + S` to download a higher resolution output (saved to your Downloads folder).

See [canvas-sketch](https://github.com/mattdesl/canvas-sketch) for a similar toolkit (without JSX/esbuild) that is much more complete.

## Sketches

Sketches are defined with JSX, like the following:

```js
import { math, random } from "yyz";

export const settings = {
  dimensions: [1280, 1280],
  animate: true,
};

export default (props, { width, height, playhead }) => {
  const count = 20;
  const radius = 10;
  const margin = min(width, height) * 0.1;
  return math.range(count).map((i) => {
    const x = math.map(i, 0, count - 1, margin, width - margin);
    const offset = (sin((i / count) * 4 + playhead * PI * 2) * height) / 4;
    return <arc x={x} y={height / 2 + offset} radius={radius} />;
  });
};
```

## Randomness

Each time you reload the page, you will get a fixed seeded randomness for the `yyz` random utility. See the `Random.js` sketch:

```js
import { math, random } from "yyz";
import paperColors from "paper-colors";
import palettes from "nice-color-palettes";

export const settings = {
  dimensions: [1280, 1280],
};

export default (props, { width, height, playhead }) => {
  const count = 10;
  const points = [];
  const dim = Math.min(width, height);
  const margin = dim * 0.2;
  const background = random.pick(paperColors).hex;
  const palette = random.shuffle(random.pick(palettes)).slice(0, 3);
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      const color = random.pick(palette);
      const px = math.mapRange(x, 0, count - 1, margin, width - margin);
      const py = math.mapRange(y, 0, count - 1, margin, height - margin);
      const radius = Math.abs(random.gaussian(0, dim * 0.02));
      const p = <arc x={px} y={py} fill={color} radius={radius} />;
      points.push(p);
    }
  }
  return <background fill={background}>{points}</background>;
};
```

## Print Resolution Exports

Check the `settings` defined below. Then all your units will be in the units you specify, here it's `in` for inches:

```js
import { math, random } from "yyz";

export const settings = {
  units: "in",
  dimensions: [12, 12],
  pixelsPerInch: 300,
};

export default (props, { width, height, playhead }) => {
  const count = 10;
  const arcs = math.linspace(count).map((t) => {
    const x = math.mapRange(t, 0, 1, 0.25, 0.75 - 0.25 / 2) * width;
    const y = height / 2;
    const radius = math.mapRange(t, 0, 1, 0.05, 0.25) * width;
    const lineWidth = 0.005 * width;
    return (
      <arcpath
        steps={9}
        lineJoin="round"
        lineWidth={lineWidth}
        x={x}
        y={y}
        radius={radius}
        fill={false}
        stroke="black"
      />
    );
  });
  return <background fill="hsl(0, 0%, 95%)">{arcs}</background>;
};
```

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/yyz/blob/master/LICENSE.md) for details.
