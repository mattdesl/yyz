import { math } from "yyz";

export const settings = {
  animate: true,
};

function TestRect() {
  return (props) => {
    return <rect x={20} y={20} width={100} height={250} {...props} />;
  };
}

TestRect.config = {
  fill: { type: "color", default: "#ff00ff" },
};

function TestUI({ fill }) {
  return (
    <background fill={fill}>
      <TestRect x={250} y={60} />
      <TestRect x={100} y={60} />
      {math.linspace(4).map((_, i) => {
        return <TestRect y={80 + 80 * i} height={20} />;
      })}
      {fill === "#ffffff" && <TestRect key="foobar" y={700} />}
    </background>
  );
}

TestUI.config = {
  fill: { type: "color", default: "#ff00aa" },
};

export default TestUI;
