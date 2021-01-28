import { math } from "yyz";
import cameraProject from "camera-project";
import { mat4, quat, vec3 } from "gl-matrix";

export default function Camera(props, { width, height }) {
  return (props, { width, height }) => {
    let position = props.position || [1, 1, 1];
    const w = props.width != null ? props.width : width;
    const h = props.height != null ? props.height : height;
    const fov = props.fov != null ? props.fov : 50;
    const x = props.x || 0;
    const y = props.y || 0;
    const target = props.target || [0, 0, 0];
    const up = props.up || [0, 1, 0];
    const ortho = Boolean(props.ortho);
    const defaultNear = ortho ? -100 : 0.01;
    const defaultFar = ortho ? 100 : 1000;
    const near = props.near != null ? props.near : defaultNear;
    const far = props.far != null ? props.far : defaultFar;
    const filmGauge = props.filmGauge != null ? props.filmGauge : 35;
    const filmOffset = props.filmOffset != null ? props.filmOffset : 0;

    let zoom = props.zoom != null ? props.zoom : 1;
    const size = 2;
    const aspect = w / h;
    const H = size * aspect;
    const V = size;

    const left = props.left != null ? props.left : -1;
    const right = props.right != null ? props.right : 1;
    const bottom = props.bottom != null ? props.bottom : -1;
    const top = props.top != null ? props.top : 1;

    let projection;
    if (props.isometric) {
      const posLen = vec3.length(position);
      position = vec3.scale([], position, posLen !== 0 ? 1 / posLen : 1);
      zoom /= posLen / 2;
      projection = createOrthoFromView([], -H, H, -V, V, zoom, near, far);
    } else if (ortho) {
      projection = createOrthoFromView(
        [],
        left,
        right,
        bottom,
        top,
        zoom,
        near,
        far
      );
    } else {
      projection = createPerspectiveFromView(
        [],
        fov,
        aspect,
        near,
        far,
        zoom,
        filmGauge,
        filmOffset
      );
    }

    const targetMatrix = mat4.targetTo([], position, target, up);
    const cameraMatrix = mat4.fromTranslation([], position);
    mat4.multiply(cameraMatrix, cameraMatrix, targetMatrix);

    const view = mat4.invert([], cameraMatrix);
    const combinedProjView = mat4.multiply([], projection, view);
    const viewport = [x, y, w, h];

    const data = props.data;
    const context = {
      project(p) {
        const [x, y, w, h] = viewport;
        const pos = cameraProject([], p, viewport, combinedProjView);
        pos[1] = h - pos[1]; // invert Y coord
        return pos;
      },
    };
    data.set("camera", context);
    return props.children;
  };
}

function createOrthoFromView(out, left, right, bottom, top, zoom, near, far) {
  const dx = (right - left) / (2 * zoom);
  const dy = (top - bottom) / (2 * zoom);
  const cx = (right + left) / 2;
  const cy = (top + bottom) / 2;

  let L = cx - dx;
  let R = cx + dx;
  let T = cy + dy;
  let B = cy - dy;
  return mat4.ortho(out, L, R, B, T, near, far);
}

function createPerspectiveFromView(
  out,
  fov,
  aspect,
  near,
  far,
  zoom = 1,
  filmGauge = 35,
  filmOffset = 0
) {
  let top = (near * Math.tan(math.degToRad(0.5 * fov))) / zoom;
  let height = 2 * top;
  let width = aspect * height;
  let left = -0.5 * width;
  const skew = filmOffset;
  const filmWidth = filmGauge * Math.min(aspect, 1);
  if (skew !== 0) left += (near * skew) / filmWidth;
  return perspective(out, left, left + width, top - height, top, near, far);
}

function perspective(out, left, right, bottom, top, near, far) {
  if (!out) out = new Array(16).fill(0);

  const x = (2 * near) / (right - left);
  const y = (2 * near) / (top - bottom);

  const a = (right + left) / (right - left);
  const b = (top + bottom) / (top - bottom);
  const c = -(far + near) / (far - near);
  const d = (-2 * far * near) / (far - near);
  out[0] = x;
  out[4] = 0;
  out[8] = a;
  out[12] = 0;
  out[1] = 0;
  out[5] = y;
  out[9] = b;
  out[13] = 0;
  out[2] = 0;
  out[6] = 0;
  out[10] = c;
  out[14] = d;
  out[3] = 0;
  out[7] = 0;
  out[11] = -1;
  out[15] = 0;
  return out;
}
