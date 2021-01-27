import { math, random, color } from "yyz";
import createCamera from "perspective-camera";
import createPrimitiveCube from "primitive-cube";
import cameraProject from "camera-project";
import { mat4, quat, vec3 } from "gl-matrix";
import * as chromotome from "chromotome";

const palettes = chromotome.getAll().map((c) => c.colors);

export const settings = {
  animate: true,
  duration: 1.75,
  fps: 15,
  playbackRate: "throttle",
};

function IsometricCamera(props, { width, height }) {
  return (props, { width, height }) => {
    const w = props.width != null ? props.width : width;
    const h = props.height != null ? props.height : height;
    const fov = props.fov != null ? props.fov : 50;
    const x = props.x || 0;
    const y = props.y || 0;
    const position = props.position || [1, 1, 1];
    const target = props.target || [0, 0, 0];
    const up = props.up || [0, 1, 0];

    const zoom = props.zoom != null ? props.zoom : 2;
    const aspect = w / h;
    const H = zoom * aspect;
    const V = zoom;
    const projection = mat4.ortho([], -H, H, -V, V, -100, 100);
    const targetMatrix = mat4.targetTo([], position, target, up);
    const cameraMatrix = mat4.fromTranslation([], position);
    mat4.multiply(cameraMatrix, cameraMatrix, targetMatrix);

    const view = mat4.invert([], cameraMatrix);
    const combinedProjView = mat4.multiply([], projection, view);
    const viewport = [x, y, w, h];

    const data = props.data;
    data.set("project", (p) => {
      const [x, y, w, h] = viewport;
      const pos = cameraProject([], p, viewport, combinedProjView);
      pos[1] = h - pos[1]; // invert Y coord
      return pos;
    });
    return props.children;
  };
}

function Camera(props, { width, height }) {
  const camera = createCamera({
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
    camera.near = props.near != null ? props.near : 0.01;
    camera.far = props.far != null ? props.far : 1000;
    camera.fov = math.degToRad(fov);
    camera.viewport = [x, y, w, h];
    camera.identity();
    camera.translate(position);
    camera.lookAt(target);
    camera.update();

    const data = props.data;
    data.set("project", (p) => {
      const [x, y, w, h] = camera.viewport;
      const pos = camera.project(p);
      pos[1] = h - pos[1]; // invert Y coord
      return pos;
    });
    return props.children;
  };
}

function Mesh(props, {}) {
  const project = props.data.get("project");

  const position = props.position || [0, 0, 0];

  let quaternion = props.quaternion;
  if (!quaternion) {
    const euler = (props.rotation || [0, 0, 0]).map((n) => math.radToDeg(n));
    quaternion = quat.fromEuler([], ...euler);
  }

  const transform = mat4.fromRotationTranslationScaleOrigin(
    [],
    quaternion,
    position,
    props.scale || [1, 1, 1],
    props.origin || [0, 0, 0]
  );

  // transform 3D positions to 2D screen space with our camera
  const tmp3 = [];
  const positions = props.positions.map((p) => {
    vec3.transformMat4(tmp3, p, transform);
    return project(tmp3);
  });

  // turn each cell of the mesh into a triangle path
  const cells = props.cells.map((cell) => {
    const points = cell.map((i) => positions[i]);
    return <path {...props} closed points={points} />;
  });

  return cells;
}

export default function MovingCircle(props, { width, height, playhead }) {
  // a 3D camera utility
  const camera = createCamera({
    fov: Math.PI / 4,
    near: 0.01,
    far: 100,
    viewport: [0, 0, width, height],
  });

  // icosahedron geometry utility
  const scale = [1, 1, 1];
  const { cells: triangleCells, positions } = createPrimitiveCube(
    ...scale,
    1,
    1,
    1
  );

  const cells = getQuadCells(triangleCells);
  const background = "hsl(0, 0%, 95%)";
  const palette = random.pick(palettes);
  return (props, { width, height, playhead }) => {
    const k = pow(sin(playhead * PI), 0.85);
    const count = math.lerp(5, 20, k);
    const cubes = math.linspace(floor(count), true).map((u) => {
      let position = [u * 2 - 1, 0, 0];

      let cBlend = sin(PI / 2 + u * PI * 1 + playhead * PI * 2) * 0.5 + 0.5;
      const t = 0.25;
      cBlend = math.smoothstep(0.5 - t, 0.5 + t, cBlend);
      const stroke = color.blend(palette[0], palette[1], cBlend).hex;

      const ys = sin(playhead * PI * 2 + u * PI) * 0.5 + 0.5;
      position = position.slice();
      const yoff = 0.45;
      position[1] += ys / 2 - yoff;
      const xp = sin(playhead * PI * 2 + u * PI) * 0.5 + 0.5;
      position[0] -= (xp / 4) * (1 - u);

      const spacing = (1 / count) * 1;
      return (
        <Mesh
          position={position}
          scale={[0.0 + cBlend * spacing, ys, 1]}
          lineWidth={5}
          lineJoin="round"
          lineCap="round"
          stroke={stroke}
          cells={cells}
          positions={positions}
        />
      );
    });
    // layer up the final graphics
    return (
      <background fill={background}>
        <Camera fov={45} position={[3, 3, -3]}>
          {cubes}
        </Camera>
      </background>
    );
  };
}

function getQuadCells(faces) {
  const cells = [];
  for (let i = 0; i < faces.length - 1; i += 2) {
    const f0 = faces[i];
    const f1 = faces[i + 1];
    cells.push([f0[0], f0[1]]);
    cells.push([f0[1], f0[2]]);
    cells.push([f1[0], f1[2]]);
  }
  return cells;
}
