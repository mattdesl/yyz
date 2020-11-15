import canvasSketch from "canvas-sketch";
import CanvasUtil from "./CanvasUtil";
import livereload from "yyz/livereload";
import createNode from "./yyz/node";
import { random } from "yyz";
import Sketch, * as config from "yyz/sketch";

// Will have to work on this a bit more...
const USE_GIF = false;

const defaultSettings = {
  dimensions: [1024, 1024],
  scaleToView: false,
};

if (USE_GIF) {
  Object.assign(defaultSettings, {
    fps: 25,
    playbackRate: "throttle",
  });
}

function get_config(key) {
  return typeof config[key] === "undefined" ? undefined : config[key];
}

const sketch = (props) => {
  const state = getProps(props);
  const renderer = createCanvasRenderer(state);
  let main = props.data;
  const visitor = {
    enter(state, node, key) {
      renderer.enter(state, node);
    },
    exit(state, node) {
      renderer.exit(state, node);
    },
  };

  const cache = new Map();

  if (USE_GIF) {
    const gif = new GIF({
      // width: props.width,
      // height: props.height,
      workerScript: "vendor/gif.worker.js",
      workers: 2,
      debug: true,
      background: "#000",
      quality: 50,
    });

    let fpsInterval = 1 / props.fps;
    for (let i = 0; i < props.totalFrames; i++) {
      draw({
        ...props,
        deltaTime: i === 0 ? 0 : fpsInterval,
        playhead: i / props.totalFrames,
        frame: i,
        time: i * fpsInterval,
      });
      gif.addFrame(props.canvas, { copy: true, delay: 1 / fpsInterval });
    }
    gif.on("finished", function (blob) {
      window.open(URL.createObjectURL(blob));
    });
    gif.render();
  }

  return {
    render: draw,
  };

  function draw(props) {
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
        traverse(state, tree, visitor, cache);
      } catch (err) {
        console.error(err);
      }
    }

    renderer.end(state);
  }
};

livereload();

(async () => {
  const settings = {
    ...defaultSettings,
    ...(get_config("settings") || {}),
  };

  if (!("duration" in settings) && !("totalFrames" in settings)) {
    settings.duration = 5;
  }

  if (window.manager) {
    if (USE_GIF) window.location.reload();
    const manager = await window.manager;
    const newProps =
      settings.animate && settings.loop !== false
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
  map.set("text", (state, props) => CanvasUtil.text(state, props));

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

function traverse(state, nodes, visitor, cache, parent = null) {
  if (!nodes) return;
  nodes = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  const ids = new Map();
  nodes.forEach((node) => {
    // what to do with text nodes?
    // should handle them with a function/symbol rather than string..
    if (node.type === "textnode") return;

    const isFragment = node.type === "fragment";
    node.data = node.data || new Map(parent ? parent.data : []);
    node.defaults = node.defaults || new Map(parent ? parent.defaults : []);
    let k = node.key;
    if (!k) {
      let count = 0;
      if (ids.has(node.type)) {
        count = ids.get(node.type);
      }
      const pkey = parent ? `${parent.key}-` : "~";
      k = `${pkey}${node.name}${count}`;
      ids.set(node.type, count + 1);
    }
    node.key = k;
    if (typeof node.type === "function") {
      const newProps = {
        ...node.props,
        defaults: node.defaults,
        data: node.data,
      };

      let instance;
      // if key is in cache, it's stateful
      if (cache.has(node.key)) {
        const fn = cache.get(node.key);
        instance = fn(newProps, state);
      } else {
        const fn = node.type(newProps, state);
        if (typeof fn === "function") {
          // stateful
          cache.set(node.key, fn);
          instance = fn(newProps, state);
        } else {
          // not stateful
          instance = fn;
        }
      }
      traverse(state, instance, visitor, cache, node);
    } else {
      if (!isFragment) visitor.enter(state, node);
      if (node && node.children && node.children.length) {
        traverse(state, node.children, visitor, cache, node);
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
