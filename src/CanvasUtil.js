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

  text(props, node) {
    const { context } = props;
    const { x = 0, y = 0, children = [], maxWidth = undefined } = node;
    if (node.stroke === false && node.fill === false) return;
    const text = children
      .filter((child) => child.type === "textnode")
      .map((child) => child.props.value)
      .join("");

    if (text.trim() === "") return;

    const fontFamily = node.fontFamily || "monospace";
    let fontSize = node.fontSize || "16px";
    if (typeof fontSize === "number") {
      fontSize = `${fontSize}px`;
    }
    const fontStyle = node.fontStyle || "normal";

    context.font = [fontStyle, fontSize, fontFamily].join(" ");
    context.textAlign = node.align || "center";
    context.textBaseline = node.baseline || "middle";

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
      context.fillText(text, x, y, maxWidth);
    }
    if (hasStroke) {
      context.strokeStyle =
        typeof stroke === "string" && stroke ? stroke : "black";
      const lineWidth = defined(node.lineWidth, 1);
      if (lineWidth > 0) {
        context.lineWidth = lineWidth;
        context.lineJoin = defined(node.lineJoin, "miter");
        context.lineCap = defined(node.lineCap, "butt");
        context.strokeText(text, x, y, maxWidth);
      }
    }
  },

  segment(props, node) {
    const { context } = props;
    const { x = 0, y = 0, length = 1, angle = 0 } = node;
    if (node.stroke === false && node.fill === false) return;
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
    if (node.stroke === false && node.fill === false) return;
    context.beginPath();
    context.rect(x, y, width, height);
    this.paint(props, node);
  },

  background(props, node) {
    const { context, width, height } = props;
    const { clear = true, fill = "white", x = 0, y = 0 } = node;
    const cwidth = node.width != null ? node.width : width;
    const cheight = node.height != null ? node.height : height;
    if (clear) {
      context.clearRect(0, 0, width, height);
    }
    if (fill) {
      context.beginPath();
      context.rect(x, y, cwidth, cheight);
      this.paint(props, {
        ...node,
        fill,
      });
    }
  },

  point(props, node) {
    const { context, width, height } = props;
    const { x = 0, y = 0, fill = true } = node;
    if (node.stroke === false && node.fill === false) return;
    let radius = node.radius;
    if (radius == null) {
      // what is a reasonable default? maybe point should not even exist...
      radius = (5 / 1024) * Math.min(width, height);
    }
    if (radius === 0) return;
    this.arc(props, { ...node, fill, stroke: false, x, y, radius });
  },

  points (props, node) {
    const { context, width, height } = props;
    const { data = [], x = 0, y = 0, fill = true } = node;
    if (data.length === 0) return;
    if (node.stroke === false && node.fill === false) return;
    let radius = node.radius;
    if (radius == null) {
      // what is a reasonable default? maybe point should not even exist...
      radius = (5 / 1024) * Math.min(width, height);
    }
    if (radius === 0) return;
    context.translate(x, y);
    context.beginPath();
    

    const angle = Math.PI;
    const needsFix = true; // could turn this off for fill-only ?
    const tx = needsFix ? Math.cos(angle) * radius : 0;
    const ty = needsFix ? Math.sin(angle) * radius : 0;

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      if (p) {
        context.moveTo(p[0], p[1]);
        context.arc(p[0]+tx, p[1]+ty, radius, 0, Math.PI * 2, false);
      }
    }

    this.paint(props, {
      ...node,
      fill
    });
    context.translate(-x, -y);
  },

  path(props, node) {
    const { context } = props;
    const { points = [], stroke = true, closed = false } = node;
    if (points.length === 0) return;
    if (stroke === false && node.fill === false) return;
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
    if (node.stroke === false && node.fill === false) return;
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
