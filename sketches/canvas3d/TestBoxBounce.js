import { math, color } from "yyz";
import Camera from "./Camera";
import { Mesh } from "./Mesh";
import { BoxGeometry } from "./Geometry";

export const settings = {
  animate: true,
  duration: 2,
  dimensions: [1080, 1080],
  fps: 15,
  playbackRate: "throttle",
};

export default function MovingCircle(props, { width, height, playhead }) {
  const foreground = "black";
  const background = "hsl(0, 0%, 90%)";
  const geometry = BoxGeometry({ subdivisions: [1, 1, 1] });
  return (props, { width, height, playhead }) => {
    const k = pow(sin(playhead * PI), 0.85);
    const count = math.lerp(5, 20, k);
    const cubes = math.linspace(floor(count), true).map((u) => {
      let position = [u * 2 - 1, 0, 0];

      let cBlend = sin(PI / 2 + u * PI * 1 + playhead * PI * 2) * 0.5 + 0.5;
      const t = 0.25;
      cBlend = math.smoothstep(0.5 - t, 0.5 + t, cBlend);

      const stroke = foreground;

      // Could introduce some variable stroke coloring here...
      // const stroke = color.blend("white", "black", cBlend).hex;

      const ys = sin(playhead * PI * 2 + u * PI) * 0.5 + 0.5;
      position = position.slice();
      const xoff = -0.25;
      const yoff = 0.5;
      position[1] += ys / 2 - yoff;
      const xp = sin(playhead * PI * 2 + u * PI) * 0.5 + 0.5;
      position[0] -= (xp / 4) * (1 - u) + xoff;

      const spacing = (1 / 20) * 1;
      return (
        <Mesh
          geometry={geometry}
          position={position}
          scale={[cBlend * spacing, ys, 1]}
          lineWidth={4}
          lineJoin="round"
          lineCap="round"
          stroke={stroke}
        />
      );
    });

    // layer up the final graphics
    return (
      <background fill={background}>
        <Camera isometric zoom={0.75} position={[1, 1, -1]}>
          {cubes}
        </Camera>
      </background>
    );
  };
}
