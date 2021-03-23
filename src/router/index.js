import Vue from "vue";
import VueRouter from "vue-router";
import login from "../components/login.vue";
import home from "../components/Home.vue";

const routes = [
  { path: "/login", component: login },
  { path: "/home", component: home },
  { path: "/", redirect: "/login" },
];

const router = new VueRouter({
  routes,
});

//挂在路由导航首位
router.beforeEach((to, from, next) => {
  /* 
  to:将要访问的路径
  from：代表从哪个路径跳转来
  next：是个函数代表放行
  next()代表放行； next('/login')代表强制条状到登录界面
  */
  if (to.path === "/login") return next();
  const token = window.sessionStorage.getItem("token");
  if (!token) return next("./login");
  next();
});
Vue.use(VueRouter);
export default router;
