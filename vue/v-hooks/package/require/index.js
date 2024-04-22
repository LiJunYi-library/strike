import { stringUpperFirstCase } from "@rainbow_ljy/rainbow-js";

export function requireVueFilesCom(vueFiles, config = {}) {
  const props = {
    useDefault: true,
    useUnDefault: true,
    ...config,
  };
  const element = {};
  vueFiles.keys().forEach((vuePath) => {
    const fileName = vuePath.replace(/\.\/([^]*?)\.(vue|tsx|jsx)/g, "$1");
    const Keys = [config.name, ...fileName.split("/").filter((el) => el !== "index")]
      .filter(Boolean)
      .map((k) => stringUpperFirstCase(k));

    const Key = Keys.join("");
    const content = vueFiles(vuePath);
    for (const name in content) {
      if (Object.prototype.hasOwnProperty.call(content, name)) {
        if (name === "default" && props.useDefault) {
          element[Key] = content.default || {};
        }
        if (name !== "default" && props.useUnDefault) {
          const k = [config.name, name].filter(Boolean).join("");
          element[k] = content[name];
        }
      }
    }
  });

  return element;
}

export function requireInstallVueFilesCom(vueFiles, config = {}) {
  const element = requireVueFilesCom(vueFiles, config);

  element.install = function install(Vue) {
    for (const key in element) {
      if (Object.hasOwnProperty.call(element, key)) {
        Vue.component(`${key}`, element[key]);
      }
    }
  };

  return element;
}
