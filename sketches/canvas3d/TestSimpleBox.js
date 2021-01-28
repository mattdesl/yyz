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
    const ry = playhead * PI * 2;
    return (
      <Camera isometric>
        <Mesh
          rotation={[0, ry, 0]}
          lineWidth={5}
          lineJoin="round"
          geometry={geometry}
        />
      </Camera>
    );
  };
}
