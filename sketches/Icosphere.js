import { math, random } from "yyz";
import createCamera from "perspective-camera";
import createIcosphere from "primitive-icosphere";

export const settings = {
  animate: true,
  duration: 8,
};

export default function MovingCircle(props, { width, height, playhead }) {
  // a 3D camera utility
  const camera = createCamera({
    fov: Math.PI / 4,
    near: 0.01,
    far: 100,
    viewport: [0, 0, width, height],
  });

  // icosahedron geometry utility
  const icosphere = createIcosphere(1, { subdivisions: 1 });

  return (props, { width, height, playhead }) => {
    // rotate camera around center
    const angle = playhead * PI * 2;
    const r = 4;
    const x = cos(angle) * r;
    const z = sin(angle) * r;
    camera.identity();
    camera.translate([x, 0, z]);
    camera.lookAt([0, 0, 0]);
    camera.viewport = [0, 0, width, height];
    camera.update();

    // transform 3D positions to 2D screen space with our camera
    const positions = icosphere.positions.map((p) => {
      const pos = camera.project(p);
      pos[1] = height - pos[1]; // invert Y coord
      return pos;
    });

    // get elements for each vertex
    const vertices = positions.map((p) => (
      <point x={p[0]} y={p[1]} fill="white" />
    ));

    const cells = icosphere.cells.map((cell) => {
      const points = cell.map((i) => positions[i]);
      return (
        <path
          points={points}
          stroke="hsl(0, 0%, 50%)"
          lineJoin="round"
          lineWidth={2}
        />
      );
    });

    return (
      <background fill="black">
        {cells}
        {vertices}
      </background>
    );
  };
}
