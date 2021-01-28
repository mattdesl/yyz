import { math } from "yyz";

import Camera from "./Camera";
import { Mesh } from "./Mesh";

import { ParametricGeometry } from "./Geometry";

export const settings = {
  animate: true,
  duration: 2,
  dimensions: [1080, 1080],
  fps: 15,
  playbackRate: "throttle",
};

export default function MobiusBand(props, { width, height, playhead }) {
  const background = "black";
  const foreground = "white";

  // make some number that goes from A...B for the subdivisions
  const k = pow(sin(playhead * PI), 4);
  const subdivs = floor(math.lerp(4, 20, k));

  // Construct a parametric geometry based on time
  const geometry = ParametricGeometry(
    (u, v) => {
      const time = playhead * PI * 2;
      return mobius(u, v, 1, time, 0.75);
    },
    subdivs,
    floor(subdivs * PI)
  );

  // layer up the final graphics
  return (
    <background fill={background}>
      <Camera isometric zoom={1.15}>
        <Mesh geometry={geometry} stroke={foreground} lineWidth={4} />
      </Camera>
    </background>
  );
}

// A parametric function that accepts [u,v] in range 0..1
// And return as 3D point
function mobius(u, t, radius = 1, time = 0, k = 0.5, thickness = 1) {
  const scale = radius;
  const toff = time;
  const v = 2 * Math.PI * t;
  var x, y, z;

  u = u - 0.5;
  u *= thickness;

  const rot = time;
  x = cos(v + toff) * (k + u * cos(v / 2 + rot)) * scale;
  y = sin(v + toff) * (k + u * cos(v / 2 + rot)) * scale;
  z = u * sin(v / 2) * scale;
  return [x, y, z];
}
