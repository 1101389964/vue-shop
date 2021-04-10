import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
/* 全局样式 */
import "./assets/css/global.css";
/* 字体图标 */
import "./assets/fonts/iconfont.css";
/* 配置数据请求路径 */
import axios from "axios";
import TreeTable from "vue-table-with-tree-grid";
import VueQuillEditor from "vue-quill-editor";

import "quill/dist/quill.core.css"; // import styles
import "quill/dist/quill.snow.css"; // for snow theme
import "quill/dist/quill.bubble.css"; // for bubble theme

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

Vue.component("tree-table", TreeTable);
Vue.use(VueQuillEditor);

/* 过滤器 */
Vue.filter("dateFormat", function(originVal) {
  const dt = new Date(originVal);
  const y = dt.getFullYear();
  const m =
    dt.getMonth() + 1 < 10 ? "0" + dt.getMonth() + 1 : dt.getMonth() + 1;
  const d = dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate();
  const h = dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours();
  const mm = dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes();
  const ss = dt.getSeconds() < 10 ? "0" + dt.getSeconds() : dt.getSeconds();
  return `${y}-${m}-${d} ${h}:${mm}:${ss}`;
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
