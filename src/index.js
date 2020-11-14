import canvasSketch from "canvas-sketch";
import CanvasUtil from "./CanvasUtil";
import livereload from "yyz/livereload";
import createNode from "./yyz/node";
import { random } from "yyz";
import Sketch, * as config from "yyz/sketch";

const defaultSettings = {
  dimensions: [1024, 1024],
  scaleToView: true,
  duration: 5,
};

function get_config(key) {
  return typeof config[key] === "undefined" ? undefined : config[key];
}

const sketch = (props) => {
  const state = getProps(props);
  const renderer = createCanvasRenderer(state);
  let main = props.data;
  const visitor = {
    enter(state, node) {
      renderer.enter(state, node);
    },
    exit(state, node) {
      renderer.exit(state, node);
    },
  };

  return {
    render(props) {
      const state = getProps(props);
      random.setSeed(window.seed);

      let tree;
      let curMain = get_config("main") || main;
      if (typeof curMain === "function") {
        tree = createNode(curMain, {});
      } else {
        tree = curMain;
      }

      renderer.step(state);
      renderer.begin(state);

      if (tree) {
        try {
          traverse(state, tree, visitor);
        } catch (err) {
          console.error(err);
        }
      }

      renderer.end(state);
    },
  };
};

livereload();

(async () => {
  const settings = {
    ...defaultSettings,
    ...(get_config("settings") || {}),
  };

  if (window.manager) {
    const manager = await window.manager;
    const newProps = settings.animate
      ? { time: manager.props.time }
      : undefined;
    manager.destroy();
    create(newProps);
  } else {
    window.seed = random.getRandomSeed();
    create();
  }

  function create(newProps = {}) {
    window.manager = canvasSketch(sketch, {
      ...settings,
      ...newProps,
      data: Sketch,
    });
    return window.manager;
  }
})();

function getProps(props) {
  const {
    context,
    width,
    height,
    time,
    playhead,
    duration,
    frame,
    totalFrames,
    deltaTime,
  } = props;
  return {
    context,
    width,
    height,
    time,
    playhead,
    duration,
    frame,
    totalFrames,
    deltaTime,
  };
}

function createCanvasRenderer(state) {
  const warned = new Set();

  const map = new Map();
  map.set("g", {
    enter: ({ context }, props) => {
      context.save();
      if (props.translate) context.translate(...props.translate);
      if (props.scale) {
        if (typeof props.scale === "number") {
          context.scale(props.scale, props.scale);
        } else context.scale(...props.scale);
      }
    },
    exit: ({ context }) => context.restore(),
  });
  map.set("rect", (state, props) => CanvasUtil.rect(state, props));
  map.set("background", (state, props) => CanvasUtil.background(state, props));
  map.set("point", (state, props) => CanvasUtil.point(state, props));
  map.set("arc", (state, props) => CanvasUtil.arc(state, props));
  map.set("circle", (state, props) => CanvasUtil.arc(state, props));
  map.set("segment", (state, props) => CanvasUtil.segment(state, props));
  map.set("arcpath", (state, props) => CanvasUtil.arcpath(state, props));
  map.set("path", (state, props) => CanvasUtil.path(state, props));

  const resolveProps = (node) => {
    const defaults = Object.fromEntries(node.defaults);
    const props = { ...node.props };
    Object.keys(defaults).forEach((key) => {
      if (typeof props[key] === "undefined") {
        props[key] = defaults[key];
      }
    });
    return props;
  };

  return {
    step(state) {},

    begin({ context, width, height }) {
      context.save();
      context.clearRect(0, 0, width, height);
      context.fillStyle = "white";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "black";
    },

    enter(state, node) {
      if (map.has(node.type)) {
        const r = map.get(node.type);
        if (r) {
          const props = resolveProps(node);
          if (typeof r === "function") {
            r(state, props);
          } else if (typeof r.enter === "function") {
            r.enter(state, props);
          }
        }
      } else {
        if (!warned.has(node.name)) {
          console.warn(`No render type for tag "${node.name}"`);
          warned.add(node.name);
        }
      }
    },

    exit(state, node) {
      if (map.has(node.type)) {
        const props = resolveProps(node);
        const r = map.get(node.type);
        if (r && typeof r.exit === "function") r.exit(state, props);
      }
    },

    end({ context }) {
      context.restore();
    },
  };
}

function traverse(state, nodes, visitor, parent = null) {
  if (!nodes) return;
  nodes = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  nodes.forEach((node) => {
    const isFragment = node.type === "fragment";
    node.data = node.data || new Map(parent ? parent.data : []);
    node.defaults = node.defaults || new Map(parent ? parent.defaults : []);

    if (typeof node.type === "function") {
      const instance = node.type(
        { ...node.props, defaults: node.defaults, data: node.data },
        state
      );
      traverse(state, instance, visitor, node);
    } else {
      if (!isFragment) visitor.enter(state, node);
      if (node && node.children && node.children.length) {
        traverse(state, node.children, visitor, node);
      }
      if (!isFragment) visitor.exit(state, node);
    }
  });
}

// function Line({ position = [0, 0], length = 1, angle = 0 } = {}) {
//   return ({ context }) => {
//     const len = length / 2;
//     const u = Math.cos(angle) * len;
//     const v = Math.sin(angle) * len;
//     context.beginPath();
//     context.moveTo(position[0] - u, position[1] - v);
//     context.lineTo(position[0] + u, position[1] + v);
//     context.stroke();
//   };
// }

// function Circle({ position = [0, 0], radius = 1 } = {}) {
//   return ({ context }) => {
//     context.beginPath();
//     context.arc(position[0], position[1], radius, 0, Math.PI * 2, false);
//     context.stroke();
//   };
// }

// function Path(path, { closed = false } = {}) {
//   return ({ context }) => {
//     context.beginPath();
//     for (let i = 0; i < path.length; i++) {
//       const p = path[i];
//       if (i === 0) context.moveTo(p[0], p[1]);
//       else context.lineTo(p[0], p[1]);
//     }
//     if (closed) context.closePath();
//     context.stroke();
//   };
// }
