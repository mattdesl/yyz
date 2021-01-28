import { math } from "yyz";
import { mat4, quat, vec3 } from "gl-matrix";

export function Mesh(props, {}) {
  if (!props.data.has("camera")) {
    throw new Error("Mesh must be present under a <Camera> component");
  }

  const { project } = props.data.get("camera");

  const geometry = props.geometry;
  let positions = [],
    cells = [];
  if (geometry) {
    positions = geometry.positions;
    cells = geometry.cells;
  }
  if (props.positions) positions = props.positions;
  if (props.cells) cells = props.cells;

  let quaternion = props.quaternion;
  if (!quaternion) {
    const euler = (props.rotation || [0, 0, 0]).map((n) => math.radToDeg(n));
    quaternion = quat.fromEuler([], ...euler);
  }

  const position = props.position || [0, 0, 0];

  // Create a TRS matrix from the inputs
  const transform = mat4.fromRotationTranslationScaleOrigin(
    [],
    quaternion,
    position,
    props.scale || [1, 1, 1],
    props.origin || [0, 0, 0]
  );

  // transform 3D positions to 2D screen space with our camera
  const tmp3 = [];
  const screenPositions = positions.map((p) => {
    const result = vec3.transformMat4(tmp3, p, transform);
    return project(result);
  });

  // turn each cell of the mesh into a triangle path
  if (cells && cells.length > 0) {
    return cells.map((cell) => {
      const points = cell.map((i) => screenPositions[i].slice(0, 2));
      return <path {...props} closed points={points} />;
    });
  } else {
    // TODO support unindexed meshes, right now this is more like a polyline
    const points = screenPositions.map((p) => p.slice(0, 2));
    return <path {...props} points={points} />;
  }
}
