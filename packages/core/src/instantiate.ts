import {
  Component,
  ComponentImplementation,
  ComponentFunction,
} from "./Component";
import HooksSystem from "./HooksSystem";
import { Entity } from "./Entity";

function gatherPropertyNames(obj: Object, soFar: Set<string> = new Set()) {
  const proto = Object.getPrototypeOf(obj);
  if (proto && proto !== Object.prototype) {
    gatherPropertyNames(proto, soFar);
  }

  Object.getOwnPropertyNames(obj).forEach((name) => soFar.add(name));
  return soFar;
}

function proxyProperties(original: Object, proxy: Object) {
  const names = gatherPropertyNames(original);
  for (const name of names) {
    Object.defineProperty(proxy, name, {
      configurable: true,
      get() {
        // @ts-ignore
        return original[name];
      },
      set(nextVal) {
        // @ts-ignore
        original[name] = nextVal;
      },
    });
  }
}

export default function instantiate<
  Props,
  API,
  ComponentFunc extends ComponentFunction<Props, API>
>(componentFunc: ComponentFunc, props: Props, entity: Entity): Component & API {
  const instance = new ComponentImplementation(componentFunc, entity);

  const ret: unknown = HooksSystem.withInstance(instance, () => {
    return componentFunc(props);
  });

  let api;
  if (typeof ret === "object" && ret != null) {
    api = {};
    proxyProperties(ret, api);
    proxyProperties(instance, api);
  } else {
    api = instance;
  }

  // @ts-ignore
  return api;
}