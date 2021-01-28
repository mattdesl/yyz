import { math } from "yyz";
import { mat4, quat, vec3 } from "gl-matrix";
import createPrimitiveCube from "primitive-cube";
import createPrimitiveIcosphere from "primitive-icosphere";
import createPrimitiveSphere from "primitive-sphere";

export function BoxGeometry(opts = {}) {
  const { scale = [1, 1, 1], subdivisions = [1, 1, 1] } = opts;
  const geometry = createPrimitiveCube(...scale, ...subdivisions);
  return { ...geometry, cells: getQuadCells(geometry.cells, 0) };
}

export function IcosphereGeometry(opts = {}) {
  const { radius = 1, subdivisions = 1 } = opts;
  return createPrimitiveIcosphere(radius, {
    subdivisions,
  });
}

export function SphereGeometry(opts = {}) {
  const { radius = 1, segments = 16 } = opts;
  const geometry = createPrimitiveSphere(radius, {
    segments,
  });
  return { ...geometry, cells: getQuadCells(geometry.cells, 1) };
}

export function ParametricGeometry(fn, xSubdivisions = 2, ySubdivisions = 2) {
  const positions = [];
  const uvs = [];
  const normals = [];
  const tangents = [];
  const binormals = [];

  for (let y = 0; y < ySubdivisions; y++) {
    let v = ySubdivisions <= 1 ? 0.5 : y / (ySubdivisions - 1);
    for (let x = 0; x < xSubdivisions; x++) {
      let u = xSubdivisions <= 1 ? 0.5 : x / (xSubdivisions - 1);
      const { position, binormal, normal, tangent } = geometric(fn, u, v);
      uvs.push([u, v]);
      normals.push(normal);
      tangents.push(tangent);
      binormals.push(binormal);
      positions.push(position);
    }
  }

  const xEdges = math.range(ySubdivisions).map((_, y) => {
    return math
      .range(xSubdivisions)
      .map((_, x) => toIndex(x, y, xSubdivisions));
  });

  const yEdges = math.range(xSubdivisions).map((_, x) => {
    return math
      .range(ySubdivisions)
      .map((_, y) => toIndex(x, y, xSubdivisions));
  });

  let edges = xEdges.concat(yEdges);

  return {
    positions,
    normals,
    tangents,
    binormals,
    uvs,
    cells: edges,
  };
}

function toIndex(x, y, xCount) {
  return x + y * xCount;
}

function fromIndex(i, xCount) {
  return [Math.floor(i % xCount), Math.floor(i / xCount)];
}

function geometric(fn, u, v, ...args) {
  const EPS = 0.00001;
  const pu = [0, 0, 0];
  const pv = [0, 0, 0];
  const p0 = fn(u, v, ...args);
  if (u - EPS >= 0) {
    const p1 = fn(u - EPS, v, ...args);
    vec3.sub(pu, p0, p1);
  } else {
    const p1 = fn(u + EPS, v, ...args);
    vec3.sub(pu, p1, p0);
  }

  if (v - EPS >= 0) {
    const p1 = fn(u, v - EPS, ...args);
    vec3.sub(pv, p0, p1);
  } else {
    const p1 = fn(u, v + EPS, ...args);
    vec3.sub(pv, p1, p0);
  }

  // cross product of tangent vectors returns surface normal
  const normal = vec3.cross([], pu, pv);
  vec3.normalize(normal, normal);
  vec3.normalize(pu, pu);
  vec3.normalize(pv, pv);
  return {
    position: p0,
    normal,
    binormal: pu,
    tangent: pv,
  };
}

function getQuadCells(faces, mode = 0) {
  const cells = [];
  for (let i = 0; i < faces.length - 1; i += 2) {
    const f0 = faces[i];
    const f1 = faces[i + 1];
    if (mode === 0) {
      cells.push([f0[0], f0[1]]);
      cells.push([f0[1], f0[2]]);
      cells.push([f1[0], f1[2]]);
    } else if (mode === 1) {
      cells.push([f0[0], f0[2]]);
      cells.push([f0[0], f0[1]]);
    } else {
      cells.push(f0, f1);
    }
  }
  return cells;
}
