import Camera from "./Camera";
import { Mesh } from "./Mesh";
import { BoxGeometry } from "./Geometry";
import { math, random as DefaultRandom } from "yyz";
import { vec3, mat4, quat } from "gl-matrix";
import * as eases from "eases";

//506341 743489
const random = DefaultRandom.createRandom(
  "506341" || DefaultRandom.getRandomSeed()
);
console.log(random.getSeed());

export const settings = {
  animate: true,
  duration: 2,
  dimensions: [1080, 1080],
  fps: 15,
  playbackRate: "throttle",
};

export default function TestBox() {
  const geometry = BoxGeometry();
  const N = 2;
  const background = "white";
  const foreground = "black";

  return (props, { playhead }) => {
    const meshes = [];

    for (let z = 0, c = 0; z < N; z++) {
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++, c++) {
          const [u, v, w] = linearize([x, y, z], N);

          meshes.push(draw(u, v, w, playhead, x, y, z, c));
        }
      }
    }

    return (
      <background fill={background}>
        <Camera zoom={2 / 3} isometric>
          {meshes}
        </Camera>
      </background>
    );
  };

  function draw(u, v, w, playhead, x, y, z, c) {
    // const lines =
    // const mesh = (
    //   <Mesh
    //     position={}
    //     positions={geometry.positions}
    //     cells={geometry.cells.slice(0, 1)}
    //     lineWidth={5}
    //     lineJoin="round"
    //   />
    // );
    // meshes.push(mesh);
    return geometry.cells
      .map((edge, i) => {
        const position = [u * 2 - 1, v * 2 - 1, w * 2 - 1];
        const set = edge
          .map((i) => {
            return geometry.positions[i];
          })
          .map((p) => {
            p = p.slice();
            let t = sin(playhead * PI * 2 + u) * 0.5 + 0.5;
            t = eases.quadInOut(t);
            // p[0] *= t;
            return p;
            // return vec3.scale([], v, sin(playhead * PI * 2 + w));
          });
        // if (random.boolean()) set.reverse();
        if (x % 2 == 0) set.reverse();
        if (y % 3 == 0) set.reverse();
        if (z % 4 == 0) set.reverse();

        const [a, b] = set;
        const e = playhead;
        // const n = u + v + w;
        // const dir = position;

        // const up = [0, 1, 0];
        // vec3.rotateX(up, up, [0, 0, 0], playhead * PI);
        // const n = vec3.dot(up, vec3.normalize([], dir)) * 8;
        // const n = dir[0] + dir[1] + dir[2];

        // const n = sin(playhead);

        // const theta = playhead * 2 * PI;
        // const cx = cos(theta);
        // const cy = sin(theta);

        // const n = sin((u * 2 - 1) * PI * 2 * 0.5);
        // const n = sin(vec3.length(position)) * 4;
        const n = sin(position[0] * 2 + position[1] * 4 + position[2] * 2);
        // const n = sin(u + v + w) * sin(v);
        // const n = sin(v * 2);
        // const n = sin(v * 0.25);
        // const n = 1 * random.noise3D(u * 2 - 1, v * 2 - 1, w * 2 - 1, 0.5);
        // const n = 1 * random.noise3D(u, v, w, 1);
        // let t = 1;
        let t = sin(e * 2 * PI + n * PI * 2) * 0.5 + 0.5;
        // const t = random.noise3D(cx, cy, v);

        // position[0] += -0.1 * (t * 2 - 1);
        // t = eases.quintInOut(t);
        t = eases.sineInOut(t);

        const len = 2;
        // position[0] += abs(playhead * 2 - 1);
        // position[0] -= len;

        // const k = sin(position[0] + position[1] + playhead * PI * 2) * 0.1;
        // position[2] += k;

        const normal = vec3.sub([], b, a);
        const length = vec3.length(normal);

        // t = 1 - t;
        if (t * length <= 0.01) return null;

        vec3.normalize(normal, normal);

        const mid = vec3.lerp([], a, b, 0.5);
        // let line = [
        //   vec3.scaleAndAdd([], mid, normal, (-length / 2) * t),
        //   vec3.scaleAndAdd([], mid, normal, (length / 2) * t),
        // ];
        let line = [a.slice(), vec3.scaleAndAdd([], a, normal, length * t)];

        return (
          <Mesh
            position={position}
            rotation={[0, 0, 0]}
            positions={line}
            lineWidth={4}
            stroke={foreground}
            lineJoin="round"
            lineCap="round"
          />
        );
      })
      .filter(Boolean);
  }
}

function linearize(vtype, count, endpoint, out) {
  // if (count <= 0) return 0.5;
  // return index / count;
  if (Array.isArray(vtype)) {
    const result = out || new Array(vtype.length).fill(0);
    for (let i = 0; i < vtype.length; i++) {
      const v = vtype[i];
      let k;
      if (endpoint) k = count <= 1 ? 0.5 : v / (count - 1);
      else k = v / count;
      result[i] = k;
    }
    return result;
  } else {
    if (endpoint) return count <= 1 ? 0.5 : vtype / (count - 1);
    else return vtype / count;
  }
}
