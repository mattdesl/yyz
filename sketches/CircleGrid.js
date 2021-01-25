import { math, random } from "yyz";
import Normalize from "./Normalize";
import Grid from "./Grid";
import palettes from "nice-color-palettes";

export default (props, { width, height }) => {
  const gridDivisions = 10;
  const gridSize = 1;
  const lineWidth = 0.005;
  const gridColor = "hsl(0, 0%, 75%)";
  const foreground = "hsl(0, 0%, 25%)";
  const background = "hsl(0, 0%, 95%)";
  const colors = random.pick(palettes);

  // Create some data points on the grid
  const data = createRandomGridData(10, {
    colors,
    gridSize,
    gridDivisions,
  });

  // Now find a set of connections between circles of matching colors
  // We use a set and string keys to avoid duplicate edges (A->B, B->A)
  const connections = new Set();
  for (let i = 0; i < data.length; i++) {
    for (let c = 0; c < data.length; c++) {
      if (i === c) continue;
      const a = data[i];
      const b = data[c];
      if (a.color === b.color) {
        // Sorted string key (A->B)
        const key = [i, c].sort((a, b) => a - b).join(":");
        connections.add(key);
      }
    }
  }

  // Turn the data points into shapes
  const circles = data.map(({ x, y, radius, color }) => {
    return (
      <circle
        compositeOperation="multiply"
        alpha={1}
        x={x}
        y={y}
        fill={color}
        radius={radius}
      />
    );
  });

  // Turn the connections into lines
  const lines = [...connections].map((key) => {
    const [ia, ib] = key.split(":").map((n) => parseInt(n, 10));
    const a = data[ia];
    const b = data[ib];
    return (
      <line
        compositeOperation="multiply"
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={a.color}
        lineWidth={lineWidth}
      />
    );
  });

  return (
    <background fill={background}>
      <Normalize>
        <Grid
          width={gridSize}
          height={gridSize}
          rows={gridDivisions}
          columns={gridDivisions}
          lineWidth={lineWidth}
          stroke={gridColor}
        />
        {circles}
        {lines}
      </Normalize>
    </background>
  );
};

function createRandomGridData(N, { colors, gridSize, gridDivisions }) {
  // transform origin of circle within cell
  const origin = [0, 0];

  // If you use a different origin you might want to change the
  // bounds at which circles can be placed
  const lowerBound = 0;
  const upperBound = gridDivisions + 1;

  // Get a list of random grid points
  const gridPoints = math.range(N).map(() => {
    const column = random.rangeFloor(lowerBound, upperBound);
    const row = random.rangeFloor(lowerBound, upperBound);
    return [column, row];
  });

  // Remove any duplicate points
  const uniquePoints = [
    ...new Set(gridPoints.map((g) => g.join(":"))),
  ].map((str) => str.split(":"));

  // Convert to a data structure that has color, radius, position ...
  return uniquePoints.map(([column, row]) => {
    const color = random.pick(colors);
    const radius = gridSize / gridDivisions / 2;

    // convert [column,row] to [x,y] (normalized)
    let x = math.mapRange(
      column,
      0,
      gridDivisions,
      -gridSize / 2,
      gridSize / 2
    );
    let y = math.mapRange(row, 0, gridDivisions, -gridSize / 2, gridSize / 2);

    // offset by transform origin
    x += origin[0] * radius * 2;
    y += origin[1] * radius * 2;

    return { row, column, radius, color, x, y };
  });
}
