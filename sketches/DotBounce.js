// Adapted from @the_ross_man r3f CodeSandbox demo
// (a re-creation of a @beesandbombs animation)
// https://codesandbox.io/s/62ocm

import { math, random, config } from "yyz";

// Only used here for Vector/Camera math
import * as THREE from "three";

export const settings = {
  duration: 3.8,
  animate: true,
};

const roundedSquareWave = (t, delta = 0.1, a = 1, f = 1 / 10) => {
  // Equation from https://dsp.stackexchange.com/a/56529
  // Visualized here https://www.desmos.com/calculator/uakymahh4u
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);
};

export default function DotBounce(props, { width, height }) {
  const origin = new THREE.Vector3(0, 0, 0);
  const right = new THREE.Vector3(1, 0, 0);
  const dim = min(width, height);

  const count = 2000;
  const sq = Math.sqrt(count);
  const data = math
    .range(count)
    .map((i) => {
      const position = new THREE.Vector3(
        Math.floor(i / sq) - sq / 2 + (i % 2) * 0.5,
        (i % sq) - sq / 2,
        0
      );

      let distance = position.distanceTo(origin);
      distance += Math.cos(position.angleTo(right) * 4) * 0.5;
      return {
        position,
        distance,
      };
    })
    .filter(Boolean);

  const vec = new THREE.Vector3();
  const camera = new THREE.OrthographicCamera(
    -width,
    width,
    -height,
    height,
    -100,
    100
  );
  camera.position.set(0, 0, 1);
  camera.zoom = 30;
  camera.updateProjectionMatrix();

  return ({ background, foreground }, { time, playhead, duration }) => {
    camera.updateMatrixWorld();

    const positions2D = data
      .map(({ position, distance }) => {
        const t = time - distance / (sq / 2); // wave is offset away from center
        const dist = distance * 0.025;
        const wave = roundedSquareWave(t, dist, 0.4, 1 / duration);
        vec.copy(position).multiplyScalar(wave + 1.3);

        // convert 3D to 2D screen space
        const ndc = vec.project(camera);

        // some dots will be out of frame, we can skip those
        if (ndc.x < -1 || ndc.x > 1) return false;
        if (ndc.y < -1 || ndc.y > 1) return false;

        // map these to 2D pixel space
        const x = math.mapRange(ndc.x, -1, 1, 0, width);
        const y = math.mapRange(ndc.y, -1, 1, 0, height);
        return [x, y];
      })
      .filter(Boolean);

    const points = (
      <points data={positions2D} radius={dim * 0.003} fill={foreground} />
    );
    return <background fill={background}>{points}</background>;
  };
}

DotBounce.config = {
  foreground: config.color("#ededed"),
  background: config.color("#020202"),
};
