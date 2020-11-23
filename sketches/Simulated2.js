import { random as DefaultRandom } from "yyz";

export const settings = {
  animate: true,
  clear: false,
};

function Once() {
  let cleared = false;
  return (props) => {
    const Type = props.type;
    const result = cleared ? (
      <>{props.children}</>
    ) : (
      <Type {...props}>{props.children}</Type>
    );
    cleared = true;
    return result;
  };
}

export default function (props, { width, height }) {
  const points = [];
  const random = DefaultRandom.createRandom();

  for (let i = 0; i < 100; i++) {
    points.push({
      position: [width / 2, height / 2],
      direction: DefaultRandom.insideCircle(1),
    });
  }

  return (props, { deltaTime, frame }) => {
    const speed = min(width, height) * 0.05;
    const children = points.map((p) => {
      p.position[0] += p.direction[0] * deltaTime * speed;
      p.position[1] += p.direction[1] * deltaTime * speed;
      return <point x={p.position[0]} y={p.position[1]} />;
    });
    return (
      <Once type="background" fill="red">
        {children}
      </Once>
    );
  };
}
