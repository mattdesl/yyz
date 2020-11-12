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
