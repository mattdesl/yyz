import { random as DefaultRandom, config } from "yyz";

export const settings = {
  animate: true,
  clear: false,
};

const ClearOnce = (props, state) => (
  <background {...props}>{props.children}</background>
);
ClearOnce.once = true;

function ClearWithAlpha() {
  let first = true;
  return (props) => {
    const { children, alpha = 1 } = props;
    const shouldClear = first;
    first = false;
    return (
      <background
        {...props}
        clear={shouldClear}
        alpha={shouldClear ? 1 : alpha}
      >
        {children}
      </background>
    );
  };
}

export default function MovingPoints(props, { width, height }) {
  const random = DefaultRandom.createRandom();
  const points = [];
  for (let i = 0; i < 100; i++) {
    points.push({
      position: [width / 2, height / 2],
      direction: DefaultRandom.insideCircle(1),
    });
  }

  return (props, { deltaTime }) => {
    const speed = min(width, height) * 0.05;
    const children = points.map((p) => {
      p.position[0] += p.direction[0] * deltaTime * speed;
      p.position[1] += p.direction[1] * deltaTime * speed;
      return <point {...props} x={p.position[0]} y={p.position[1]} />;
    });
    return children;
  };
}

export function main({ backgroundAlpha, background, foreground }) {
  return (
    <ClearWithAlpha fill={background} alpha={backgroundAlpha}>
      <MovingPoints fill={foreground} />
    </ClearWithAlpha>
  );
}

main.config = {
  backgroundAlpha: config.number(0.05),
  background: config.color("red"),
  foreground: config.color("blue"),
};
