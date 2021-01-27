import primitiveSphere from "primitive-sphere";
import REGL from "regl";
import Color from "canvas-sketch-util/color";

export default function createEmptyRenderer(state) {
  const warned = new Set();
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
    dispose() {},
    clear(state) {},
    step(state) {},
    begin(state) {
      const { context, width, height } = state;
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

    end({ context }) {},
  };
}
