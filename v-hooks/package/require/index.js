export function requireInstallVueFilesCom(vueFiles) {
  const element = {};

  vueFiles.keys().forEach((vuePath) => {
    const fileName = vuePath.replace(/\.\/([^]*?)\.(vue|tsx|jsx)/g, "$1");
    const Keys = fileName.split("/").filter((el) => el !== "index");
    const Key = Keys.filter(Boolean).join("-");
    const content = vueFiles(vuePath);
    for (const name in content) {
      if (Object.prototype.hasOwnProperty.call(content, name)) {
        if (name === "default") element[Key] = content.default || {};
        else element[name] = content[name];
      }
    }
  });

  element.install = function install(Vue) {
    for (const key in element) {
      if (Object.hasOwnProperty.call(element, key)) {
        Vue.component(`${key}`, element[key]);
      }
    }
  };

  return element;
}
