const symbol = Symbol.for("yyz.config");

function withType(type, opts = {}) {
  return (value, props = {}) => ({
    ...opts,
    ...props,
    type,
    $$typeof: symbol,
    default: value,
  });
}

export const color = withType("color");
export const number = withType("number", { min: 0, max: 1, step: 0.01 });
