import { math, color } from "yyz";
import Camera from "./Camera";
import { Mesh } from "./Mesh";
import { BoxGeometry } from "./Geometry";

export const settings = {
  animate: true,
  duration: 5,
  dimensions: [1080, 1080],
  fps: 30,
  playbackRate: "throttle",
};

export default function TestBox() {
  const geometry = BoxGeometry();

  return (props, { playhead }) => {
    const rx = sin(playhead * PI * 2);
    const ry = playhead * PI * 2;
    const lineWidth = math.mapRange(
      sin(PI / 2 + playhead * PI * 2),
      -1,
      1,
      4,
      20
    );
    return (
      <Camera isometric>
        <Mesh
          rotation={[rx, ry, 0]}
          lineWidth={lineWidth}
          lineJoin="round"
          geometry={geometry}
        />
      </Camera>
    );
  };
}
