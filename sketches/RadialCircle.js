import { math, random } from "yyz";

export const settings = {
  dimensions: [1024, 1024],
  animate: false,
};

// The main export is the utility itself, which rendering
// it alone won't show much
export default function RadialCircle({
  children,
  target,
  x = 0,
  y = 0,
  angle = 0,
  radius = 1,
  count = 10,
}) {
  const mapped = math.linspace(count).map((t) => {
    const theta = angle + t * PI * 2;
    const nx = x + cos(theta) * radius;
    const ny = y + sin(theta) * radius;
    return <g translate={[nx, ny]}>{children}</g>;
  });
  return <>{mapped}</>;
}

// We can also have a 'main' export which gets run if
// this sketch is the main executed one, this way we can
// test it out visually
export function main(props, { width, height }) {
  const dim = Math.min(width, height);
  const length = dim * 0.05;
  const lineWidth = dim * 0.01;
  return (
    <RadialCircle count={20} x={width / 2} y={height / 2} radius={dim / 4}>
      <segment length={length} lineWidth={lineWidth} />
      <segment length={length} angle={PI / 2} lineWidth={lineWidth} />
    </RadialCircle>
  );
}
