import { math, random } from "yyz";

export const settings = {
  dimensions: [1280, 1280],
  animate: true,
  restart: false,
};

export default (props, { width, height, playhead }) => {
  const count = 20;
  const radius = 10;
  const margin = min(width, height) * 0.1;
  return math.range(count).map((i) => {
    const x = math.map(i, 0, count - 1, margin, width - margin);
    const offset = (sin((i / count) * 4 + playhead * PI * 2) * height) / 4;
    return <arc fill="green" x={x} y={height / 2 + offset} radius={radius} />;
  });
};
