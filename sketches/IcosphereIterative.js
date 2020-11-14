import { math, random } from "yyz";
import createCamera from "perspective-camera";
import createIcosphere from "primitive-icosphere";

export const settings = {
  animate: false,
  duration: 10,
};

export default function MovingCircle(props, { width, height }) {
  const camera = createCamera({
    fov: Math.PI / 4,
    near: 0.01,
    far: 100,
    viewport: [0, 0, width, height],
  });

  const icosphere = createIcosphere(1, { subdivisions: 1 });

  const positions = icosphere.positions.map((p) => {
    const pos = camera.project(p);
    pos[1] = height - pos[1]; // invert Y coord
    return pos;
  });

  return ({ playhead }) => {
    //set up our camera
    const angle = playhead * PI * 2;
    const r = 4;
    const x = cos(angle) * r;
    const z = sin(angle) * r;
    camera.translate([x, 0, z]);
    camera.lookAt([0, 0, 0]);
    camera.viewport = [0, 0, width, height];
    camera.update();

    const points = positions.map((p) => <point x={p[0]} y={p[1]} />);

    const cells = icosphere.cells.map((cell) => {
      const points = cell.map((i) => positions[i]);
      return (
        <path
          points={points}
          stroke="hsl(0, 0%, 75%)"
          lineJoin="round"
          lineWidth={2}
        />
      );
    });

    return (
      <g>
        {cells}
        {points}
      </g>
    );
  };
}
