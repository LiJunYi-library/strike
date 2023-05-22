const vueFiles = require.context('../components', true, /\.vue$/);

const element = {};

vueFiles.keys().forEach(vuePath => {
  const fileName = vuePath.replace(/\.\/([^]*?)\.vue/g, '$1');
  const Keys = fileName.split('/').filter(el => el !== 'index');
  const Key = Keys.filter(Boolean).join('-');
  const content = vueFiles(vuePath);
  element[Key] = content.default || {};
});

export default element;



