import canvasSketch from "canvas-sketch";
import CanvasUtil from "./CanvasUtil";
import livereload from "yyz/livereload";
import createNode from "./yyz/node";
import { random } from "yyz";
import Sketch, * as config from "yyz/sketch";
import { GUI } from "dat.gui";
import * as Color from "canvas-sketch-util/color";

const GeneratorFunction = function* () {}.constructor;

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
  let { main, clear } = props.data;
  let didError = false;

  let reconciler;

  // if (USE_GIF) {
  //   const gif = new GIF({
  //     // width: props.width,
  //     // height: props.height,
  //     workerScript: "vendor/gif.worker.js",
  //     workers: 2,
  //     debug: true,
  //     background: "#000",
  //     quality: 50,
  //   });

  //   let fpsInterval = 1 / props.fps;
  //   for (let i = 0; i < props.totalFrames; i++) {
  //     draw({
  //       ...props,
  //       deltaTime: i === 0 ? 0 : fpsInterval,
  //       playhead: i / props.totalFrames,
  //       frame: i,
  //       time: i * fpsInterval,
  //     });
  //     gif.addFrame(props.canvas, { copy: true, delay: 1 / fpsInterval });
  //   }
  //   gif.on("finished", function (blob) {
  //     window.open(URL.createObjectURL(blob));
  //   });
  //   gif.render();
  // }

  return {
    begin() {
      dispose();
      reconciler = createTraverse(props);
    },
    unload: dispose,
    render: draw,
  };

  function dispose() {
    if (reconciler) reconciler.dispose();
    reconciler = null;
  }

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
    if (clear) {
      renderer.clear(state);
    }

    if (!didError) {
      if (tree) {
        try {
          reconciler.traverse(state, tree, renderer);
        } catch (err) {
          didError = true;
          console.error(err);
        }
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

  const clear = settings.clear !== false;
  const restart = settings.restart !== false;
  delete settings.clear;
  delete settings.restart;

  if (!("duration" in settings) && !("totalFrames" in settings)) {
    settings.duration = 5;
  }

  if (window.manager) {
    if (USE_GIF) window.location.reload();
    const manager = await window.manager;
    const newProps =
      settings.animate && settings.loop !== false && !restart
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
      data: {
        main: Sketch,
        restart,
        clear,
      },
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
    deltaTime: deltaTime || 0,
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
    clear(state) {
      CanvasUtil.background(state, { fill: "white", clear: true });
    },

    step(state) {},

    begin(state) {
      const { context, width, height } = state;
      context.save();
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

function createTraverse(props) {
  const cache = new Map();
  const configMap = new Map();
  const gui = new GUI();
  const symbolConfig = Symbol.for("yyz.config");
  const symbolNode = Symbol.for("yyz.node");
  const buttons = {
    restart() {
      props.stop();
      props.play();
    },
  };
  gui.add(buttons, "restart").name("Restart");

  return {
    dispose() {
      gui.destroy();
    },
    traverse(state, nodes, renderer) {
      return traverse(state, nodes, renderer, null);
    },
  };

  function execute(fn, props, state) {
    if (typeof fn === "function") return fn(props, state);
    else if (fn && fn.render) return fn.render(props, state);
    return null;
  }

  function traverse(state, nodes, visitor, parent = null) {
    if (!nodes) return;
    nodes = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean).flat();
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
        const pkey = parent ? `${parent.key}-` : "";
        k = `${pkey}${node.name}${count}`;
        ids.set(node.type, count + 1);
      }
      node.key = k;
      if (typeof node.type === "function") {
        let configProps = {};
        if (configMap.has(node.key)) {
          configProps = configMap.get(node.key).target;
        }
        const newProps = {
          ...node.props,
          ...configProps,
          defaults: node.defaults,
          data: node.data,
        };

        let instance;
        // if key is in cache, it's stateful
        if (cache.has(node.key)) {
          const fn = cache.get(node.key);
          instance = execute(fn, newProps, state);
        } else {
          if (node.type.config) {
            if (configMap.has(node.key)) {
            } else {
              const target = {};
              const folder = gui.addFolder(node.key);
              const fromStorageStr = window.localStorage.getItem(node.key);
              let fromStorage = {};
              if (fromStorageStr != null) {
                try {
                  fromStorage = JSON.parse(fromStorageStr);
                } catch (err) {
                  console.warn(err);
                }
              }

              for (let k in node.type.config) {
                const v = node.type.config[k];
                if (v.$$typeof === symbolConfig) {
                  target[k] =
                    k in fromStorage
                      ? fromStorage[k]
                      : node.type.config[k].default;

                  if (v.type === "color") {
                    const p = Color.parse(target[k]);
                    if (!p) console.warn(`Could not parse ${k} as a color`);
                    else target[k] = p.hex;
                  }

                  let ui;
                  if (v.type === "color") ui = folder.addColor(target, k);
                  else {
                    ui = folder
                      .add(target, k, v.min, v.max, v.step)
                      .step(v.step);
                  }
                  ui.onChange(() => {
                    window.localStorage.setItem(
                      node.key,
                      JSON.stringify(target)
                    );
                  });
                } else {
                  target[k] = v;
                }
              }
              folder.open();
              Object.assign(newProps, target);
              configMap.set(node.key, {
                target,
                folder,
                type: node.type,
                key: node.key,
              });
            }
          }

          let fn = node.type(newProps, state);

          const isNode =
            (fn &&
              typeof fn === "object" &&
              fn.$$typeof &&
              fn.$$typeof === symbolNode) ||
            Array.isArray(fn);

          if (!isNode && fn) {
            cache.set(node.key, fn);
            instance = execute(fn, newProps, state);
          } else if (fn) {
            // not stateful
            instance = fn;
          }

          if (node.type.once === true) {
            cache.set(node.key, ({ children }) =>
              createNode("fragment", {}, children)
            );
          }
        }
        traverse(state, instance, visitor, node);
      } else {
        let nodeWithProps = node;
        if (!isFragment) {
          visitor.enter(state, nodeWithProps);
        }
        if (
          nodeWithProps &&
          nodeWithProps.children &&
          nodeWithProps.children.length
        ) {
          traverse(state, nodeWithProps.children, visitor, nodeWithProps);
        }
        if (!isFragment) {
          visitor.exit(state, nodeWithProps);
        }
      }
    });
  }
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
