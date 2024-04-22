export * from "./ref";

export function renderSlot(slots, name, props, defNode) {
  const vNode = slots?.[name];
  if (vNode instanceof Function) return vNode(props);
  if (vNode) return vNode;
  if (defNode instanceof Function) return defNode(props);
  return defNode;
}

