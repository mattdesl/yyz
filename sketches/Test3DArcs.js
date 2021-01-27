import { math, random } from "yyz";
import createPerspectiveCamera from "perspective-camera";
import REGL from "regl";

export const settings = {
  animate: true,
  fps: 20,
  playbackRate: "throttle",
  duration: 3,
  context: "webgl",
};

function Camera(props, { width, height }) {
  const camera = createPerspectiveCamera({
    fov: math.degToRad(45),
    near: 0.01,
    far: 100,
    viewport: [0, 0, width, height],
  });
  return (props, { width, height }) => {
    const w = props.width != null ? props.width : width;
    const h = props.height != null ? props.height : height;
    const fov = props.fov != null ? props.fov : 50;
    const x = props.x || 0;
    const y = props.y || 0;
    const position = props.position || [0, 0, 0];
    const target = props.target || [0, 0, 0];

    camera.fov = math.degToRad(fov);
    camera.viewport = [x, y, w, h];
    camera.identity();
    camera.translate(position);
    camera.lookAt(target);
    camera.update();

    const data = props.data;
    data.set("camera:projection", camera.projection);
    data.set("camera:view", camera.view);
    data.set("camera:position", camera.position);
    data.set("camera:direction", camera.direction);
    data.set("camera:up", camera.up);
  };
}

function Sphere() {}

export default function Test3DArcs(props, { width, height, playhead }) {
  // const regl = REGL(props.context);
  return (props, state) => {
    return (
      <background fill="hsl(0, 0%, 95%)">
        <Camera projection="perspective">
          <Sphere radius={1} x={0} y={0} z={0} fill="red" />
        </Camera>
      </background>
    );
  };
}
