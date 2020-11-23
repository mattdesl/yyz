import { random, config } from "yyz";

export const settings = {
  animate: true,
  clear: false,
  duration: Infinity,
};

export default function Sketch(
  { fill, radius, speed },
  { frame, width, height }
) {
  return (
    <background fill={frame === 0 ? fill : false} clear={false}>
      <point radius={radius} x={frame * speed} y={frame * speed} />
    </background>
  );
}

Sketch.config = {
  speed: config.number(1),
  radius: config.number(20, { min: 25, max: 50, step: 1 }),
  fill: config.color("orange"),
};
