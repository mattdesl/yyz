class Node {
  constructor(type, props, children) {
    this.type = type || "";
    this.props = props || {};
    this.children = children || [];
    this.name =
      typeof this.type === "function" ? this.type.name : String(this.type);
  }

  clone(props) {
    props = props || {};
    const children = this.children.slice();
    return new Node(this.type, { ...this.props, ...props, children }, children);
  }
}

export default function createNode(type, props, ...children) {
  type = type || "fragment";
  props = props || {};
  children = children || [];
  if (!Array.isArray(children)) children = [children].filter(Boolean);
  children = children.flat(Infinity);
  children = children.map((child) => {
    if (typeof child === "string" || typeof child === "number") {
      return createNode("textnode", { value: child });
    } else {
      return child;
    }
  });
  if (typeof type === "string") {
    type = type.toLowerCase();
  }

  // TODO: Handle default props for UI tweaking
  // let inputs;
  // if (
  //   typeof type === "function" &&
  //   typeof type.inputs === "object" &&
  //   type.inputs
  // ) {
  //   inputs = type.inputs || {};
  // }
  // inputs = inputs || {};
  // for (let k in inputs) {
  //   if (inputs.hasOwnProperty(k) && props[k] == null) {
  //     const c = inputs[k];
  //     if (c.hasOwnProperty("default")) {
  //       props[k] = c.default;
  //     }
  //   }
  // }

  props = { ...props, children };

  return new Node(type, props, children);
}
