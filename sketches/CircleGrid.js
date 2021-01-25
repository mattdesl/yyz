import { math, color as Color, random } from "yyz";
import Normalize from "./Normalize";
import Grid from "./Grid";
import palettes from "nice-color-palettes/500.json";

export default (props, { width, height }) => {
  const gridDivisions = 4;
  const gridSize = 1;
  const lineWidth = 0.005;
  const gridColor = "hsl(0, 0%, 75%)";
  const foreground = "hsl(0, 0%, 25%)";
  const background = "hsl(0, 0%, 95%)";
  const nColors = random.rangeFloor(3, 6);
  const colors = random.shuffle(random.pick(palettes)).slice(0, nColors);

  // Create some data points on the grid
  const N = random.rangeFloor(10, 20);
  const data = createRandomGridData(N, {
    colors,
    gridSize,
    gridDivisions,
    // Can play with this a bit...
    origin: [0.0, 0.0],
    upperBound: gridDivisions + 1,
  });

  // Turn the data points into shapes
  const circles = data.map(({ x, y, radius, color }) => {
    return (
      <circle
        compositeOperation="multiply"
        alpha={0.85}
        x={x}
        y={y}
        fill={color}
        radius={radius * 0.5}
      />
    );
  });

  // Create connections from the points
  // Could be e.g. delaunay, minimum spanning tree, etc...
  const connections = createConnections(data);

  // Now form lines from those connections
  const lines = connections.map(([a, b]) => {
    return (
      <line
        compositeOperation="multiply"
        alpha={0.85}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={Color.blend(a.color, b.color, 0.5).hex}
        lineJoin="round"
        lineWidth={lineWidth * 2}
      />
    );
  });

  // Draw full graph
  return (
    <background fill={background}>
      <Normalize>
        <Grid
          width={gridSize}
          height={gridSize}
          rows={gridDivisions}
          columns={gridDivisions}
          lineWidth={lineWidth}
          lineJoin="round"
          stroke={gridColor}
        />
        {lines}
        {circles}
      </Normalize>
    </background>
  );
};

// Function that produces random cells on a grid
function createRandomGridData(
  N,
  {
    colors,
    gridSize,
    gridDivisions,
    // transform origin of circle within cell
    origin = [0.5, 0.5],
    // If you use a different origin you might want to change the
    // bounds at which circles can be placed
    lowerBound = 0,
    upperBound = gridDivisions,
  }
) {
  // Get a list of random grid points
  const gridPoints = math.range(N).map(() => {
    const column = random.rangeFloor(lowerBound, upperBound);
    const row = random.rangeFloor(lowerBound, upperBound);
    return [column, row];
  });

  // Remove any duplicate points
  const uniquePoints = [
    ...new Set(gridPoints.map((g) => g.join(":"))),
  ].map((str) => str.split(":").map((n) => parseInt(n, 10)));

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

// Function that turns data points into some connected graph
function createConnections(data) {
  // This is a pretty simple algorithm, it connects
  // grid neighbours that are within 1 cell distance,
  // or lie on the same row or column as each other
  const set = new Set();
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      if (i === j) continue;
      const a = data[i];
      const b = data[j];

      const collinear = a.row === b.row || a.column === b.column;
      const neighbour =
        Math.abs(a.row - b.row) <= 1 && Math.abs(a.column - b.column) <= 1;

      if (neighbour || collinear) {
        const key = [i, j].sort((a, b) => a - b).join(":");
        set.add(key);
      }
    }
  }

  // Return actual objects, not indices
  return [...set].map((n) => {
    return n
      .split(":")
      .map((n) => parseInt(n, 10))
      .map((i) => data[i]);
  });

  return connections;
}
