import { math, random } from "yyz";

export default (props) => {
  const {
    stroke = "black",
    rows = 1,
    columns = 1,
    width = 1,
    height = 1,
    border = true,
  } = props;
  const xn = columns + 1;
  const yn = rows + 1;
  return [
    <rect
      {...props}
      x={-width / 2}
      y={-height / 2}
      width={width}
      height={height}
      fill={false}
      stroke={stroke}
    />,
    ...math.linspace(yn, true).map((v, i) => {
      if (i === 0 || i === yn - 1) return;
      v = v * 2 - 1;
      return (
        <line
          {...props}
          x1={-width / 2}
          y1={(v * height) / 2}
          x2={width / 2}
          y2={(v * height) / 2}
        />
      );
    }),
    ...math.linspace(xn, true).map((u, i) => {
      if (i === 0 || i === xn - 1) return;
      u = u * 2 - 1;
      return (
        <line
          {...props}
          x1={(u * width) / 2}
          y1={-height / 2}
          x2={(u * width) / 2}
          y2={height / 2}
        />
      );
    }),
  ];
};
