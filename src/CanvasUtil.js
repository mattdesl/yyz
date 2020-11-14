import defined from "defined";
import MathUtil from "canvas-sketch-util/math";

export default {
  paint(props, node) {
    const { context } = props;
    let hasFill = false,
      hasStroke = false;
    const fill = node.fill === "none" ? false : node.fill;
    const stroke = node.stroke === "none" ? false : node.stroke;
    if (fill == null && stroke == null) {
      hasFill = true;
    } else {
      hasFill = fill && fill != null;
      hasStroke = stroke && stroke != null;
    }
    if (
      node.alpha != null &&
      isFinite(node.alpha) &&
      typeof node.alpha === "number"
    ) {
      context.globalAlpha = node.alpha;
    } else {
      context.globalAlpha = 1;
    }
    if (hasFill) {
      context.fillStyle = typeof fill === "string" && fill ? fill : "black";
      context.fill();
    }
    if (hasStroke) {
      context.strokeStyle =
        typeof stroke === "string" && stroke ? stroke : "black";
      const lineWidth = defined(node.lineWidth, 1);
      if (lineWidth > 0) {
        context.lineWidth = lineWidth;
        context.lineJoin = defined(node.lineJoin, "miter");
        context.lineCap = defined(node.lineCap, "butt");
        context.stroke();
      }
    }
  },

  segment(props, node) {
    const { context } = props;
    const { x = 0, y = 0, length = 1, angle = 0 } = node;
    const len = length / 2;
    const u = Math.cos(angle) * len;
    const v = Math.sin(angle) * len;
    context.beginPath();
    context.moveTo(x - u, y - v);
    context.lineTo(x + u, y + v);
    let stroke = node.stroke;
    if (stroke !== false && stroke == null) {
      stroke = "black";
    }
    this.paint(props, {
      ...node,
      fill: false,
      stroke,
    });
  },

  rect(props, node) {
    const { context } = props;
    const { x = 0, y = 0, width = 1, height = 1 } = node;
    context.beginPath();
    context.rect(x, y, width, height);
    this.paint(props, node);
  },

  background(props, node) {
    const { context, width, height } = props;
    const { fill = "white" } = node;
    this.rect(props, {
      width,
      height,
    });
    this.paint(props, { ...node, fill });
  },

  point(props, node) {
    const { context } = props;
    const { x = 0, y = 0, radius = 5, fill = true } = node;
    if (radius === 0) return;
    this.arc(props, { ...node, fill, stroke: false, x, y, radius });
  },

  path(props, node) {
    const { context } = props;
    const { points = [], stroke = true, closed = false } = node;
    if (points.length === 0) return;
    context.beginPath();
    points.forEach((p) => context.lineTo(p[0], p[1]));
    if (closed) context.closePath();
    this.paint(props, { fill: false, stroke: true, ...node });
  },

  arc(props, node) {
    const { context } = props;
    const {
      x = 0,
      y = 0,
      radius = 1,
      start = 0,
      end = Math.PI * 2,
      counterClockwise = false,
    } = node;
    context.beginPath();
    context.arc(x, y, radius, start, end, counterClockwise);
    this.paint(props, node);
  },

  arcpath(props, node) {
    const { steps = 9, radius = 1, closed = true, x = 0, y = 0 } = node;
    const { context } = props;
    const path = [];
    for (let i = 0; i < steps; i++) {
      const t = closed ? (steps <= 1 ? 0 : i / (steps - 1)) : i / steps;
      const angle = t * Math.PI * 2;
      const u = Math.cos(angle) * radius;
      const v = Math.sin(angle) * radius;
      path.push([u + x, v + y]);
    }
    context.beginPath();
    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      if (i === 0) context.moveTo(p[0], p[1]);
      else context.lineTo(p[0], p[1]);
    }
    if (closed) context.closePath();
    this.paint(props, node);
  },
};
