export function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) list[index] = list[index + 1];
  list.pop();
}

export function spliceObject(list, object) {
  const idx = list.indexOf(object);
  if (idx >= 0) spliceOne(list, idx);
}
