import { math, random } from "yyz";

const App = (props, { width, height }) => {
  const count = random.rangeFloor(2, 5);
  const dim = Math.min(width, height);
  return math.linspace(count).map((t) => {
    const angle = Math.PI * 2 * t;
    const r = dim / 4;
    const x = width / 2 + Math.cos(angle) * r;
    const y = height / 2 + Math.sin(angle) * r;
    return (
      <segment
        x={x}
        y={y}
        angle={angle}
        lineWidth={dim * 0.01}
        length={dim / 4}
      />
    );
  });
};

const PlayheadCircle = (props, { playhead }) => (
  <arc {...props} start={0} end={playhead * PI * 2} />
);

const Circle = (props, { width, height }) => {
  return <PlayheadCircle stroke radius={0.5} fill={false} />;
};

const RandomPoints = ({ count = 100 }, { playhead }) => {
  return math.linspace(count).map(() => {
    const radius = 0.05;
    return (
      <point
        x={random.range(-1 - radius, 1 + radius)}
        y={math.wrap(
          random.range(-1, 1) + playhead * PI * 1,
          -1 - radius,
          1 + radius
        )}
        radius={radius}
        fill="red"
      />
    );
  });
};

const ArcLines = (props, { width, height, playhead }) => {
  return math.linspace(12).map((t) => {
    const angle = PI * 2 * t + sin(playhead * PI * 2);
    const r = 0.5;
    const u = cos(angle) * r;
    const v = sin(angle) * r;
    const lineWidth = math.mapRange(
      sin(PI * 2 * t + playhead * PI * 2),
      -1,
      1,
      0.0,
      0.05
    );
    return (
      <segment x={u} y={v} angle={angle} lineWidth={lineWidth} length={0.15} />
    );
  });
};

const Theme = ({ data, foreground = "black", children }) => {
  data.set(Theme, { foreground });
  return <>{children}</>;
};

const Sketch = () => {
  return (
    <Normalize>
      <ArcLines />
    </Normalize>
  );
};

export const settings = {
  dimensions: [1280, 1280],
};

export default Sketch;
