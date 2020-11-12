import { math, random } from "yyz";

export default (props, { width, height }) => {
  const angle = PI / 2;
  return (
    <background fill="hsl(0, 0%, 95%)">
      <arc
        x={width / 2}
        y={height / 2}
        stroke="red"
        start={angle}
        end={angle + PI}
        radius={width / 4}
        lineWidth={width * 0.05}
      />
    </background>
  );
};
