import { math, color } from "yyz";
import Camera from "./Camera";
import { Mesh } from "./Mesh";
import { BoxGeometry } from "./Geometry";
import * as eases from "eases";

export const settings = {
  animate: true,
  duration: 2,
  dimensions: [1080, 1080],
  fps: 15,
  playbackRate: "throttle",
};

export default function MovingCircle(props, { width, height, playhead }) {
  const foreground = "black";
  const background = "hsl(0, 0%, 100%)";
  const geometry = BoxGeometry({ subdivisions: [1, 1, 1] });
  return (props, { width, height, playhead }) => {
    const k = pow(sin(playhead * PI), 0.85);
    const count = 8;
    const cubes = math.linspace(floor(count), true).map((u) => {
      let position = [u * 2 - 1, 0, 0];

      let cBlend = sin(PI / 2 + u * 2 + playhead * PI * 2) * 0.5 + 0.5;
      // let cBlend = sin(PI / 2 + u * PI * 1 + playhead * PI * 2) * 0.5 + 0.5;
      const t = 0.25;
      // cBlend = math.smoothstep(0.5 - t, 0.5 + t, cBlend);
      cBlend = eases.sineInOut(cBlend);

      const stroke = foreground;

      // Could introduce some variable stroke coloring here...
      // const stroke = color.blend("white", "black", cBlend).hex;

      let ys = sin(PI / 2 + playhead * PI * 2 + u * 2) * 0.5 + 0.5;
      ys = eases.quadInOut(ys);
      // ys = 1;
      // ys = math.map(ys, 0, 1, 0.5, 1.5);

      // const ys = 1; //sin(playhead * PI * 2) * 0.5 + 0.5;
      position = position.slice();
      const xoff = -0.25;
      const yoff = 0.5;
      position[1] += ys / 2 - yoff;
      const xp = sin(playhead * PI * 2 + u * PI) * 0.5 + 0.5;
      // position[0] -= (xp / 4) * (1 - u) + xoff;

      const rot = sin(playhead * PI * 2 + u * PI * 2);
      const spacing = (1 / (count - 1)) * 2;
      // const thick = spacing / 1;
      // const thick = spacing / 2;
      const thick = cBlend * spacing * 0.5;
      // position[0] -= thick / 2;
      return (
        <Mesh
          geometry={geometry}
          position={position}
          rotation={[0, 0, 0]}
          scale={[thick, ys, 1]}
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
        <Camera isometric zoom={1} position={[1, 1, -1]}>
          {cubes}
        </Camera>
      </background>
    );
  };
}
