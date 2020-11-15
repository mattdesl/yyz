import { math, random as PureRandom } from "yyz";
import { vec2 } from "gl-matrix";

export const settings = {
  dimensions: [1080, 960],
  // pixelsPerInch: 150,
  // orientation: "landscape",
  animate: true,
  duration: 4,
  loop: false,
};

export default (props, { width, height }) => {
  const center = [width / 2, height / 2];
  const position = center.slice();
  const circles = [];
  const lines = [];
  const random = PureRandom.createRandom();
  const foreground = "black";

  return (props, state) => {
    // iterate many times per frame
    let maxLines = 0;
    while (maxLines < 250) {
      maxLines += step(props, state);
    }
    // return the rendering for this frame
    return (
      <background fill="hsl(0, 0%, 97%)">
        {lines}
        {circles}
      </background>
    );
  };

  function outside() {}

  function step(props, { playhead }) {
    const dim = min(width, height);
    const direction = random.onCircle();
    const dist = random.gaussian(1 * dim * 0.01, 10 * dim * 0.01);
    vec2.scaleAndAdd(position, position, direction, dist);

    const distFromCenter = vec2.distance(position, center);
    const distFromXCenter = Math.abs(position[0] - width / 2);
    if (distFromXCenter > width / 2) {
      vec2.copy(position, [width / 2, height * playhead]);
    }

    const arc = (
      <point
        x={position[0]}
        fill={foreground}
        y={position[1]}
        radius={dim * 0.001}
      />
    );
    let newLines = 0;
    circles.forEach((a) => {
      const p0 = [a.props.x, a.props.y];
      const p1 = position.slice();
      const d = vec2.distance(p0, p1);
      const t = 1 * dim * 0.05;
      if (d < t) {
        const line = (
          <path
            lineWidth={dim * 0.00075}
            stroke={foreground}
            points={[p0, p1]}
            alpha={0.5}
          />
        );
        lines.push(line);
        newLines++;
      }
    });
    circles.push(arc);
    return newLines;
  }
};
