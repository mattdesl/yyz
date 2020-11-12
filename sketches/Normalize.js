export default function Normalize(
  { children, data, defaults },
  { width, height }
) {
  const scale = Math.min(width, height) / 2;
  data.set(Normalize, { scale });
  defaults.set("lineWidth", 2 / scale);
  return (
    <g translate={[width / 2, height / 2]} scale={scale}>
      {children}
    </g>
  );
}
