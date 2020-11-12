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
