import { math, random } from "yyz";
import Normalize from "./Normalize";

export default (props, { width, height }) => {
  const arcs = math.linspace(5, true).map((t) => {
    const x = math.mapRange(t, 0, 1, -0.5, 0.5);
    return <arc x={x} fill radius={0.05} />;
  });
  // Everything within this component will
  // get normalized to a -1..1 range
  return <Normalize>{arcs}</Normalize>;
};
