import Vue from "vue";
import VueRouter from "vue-router";
import login from "../components/login.vue";
import home from "../components/Home.vue";
import welcome from "../components/Welcome.vue";
import Users from "../components/user.vue";
import Rights from "../components/power/Rights.vue";
import Roles from "../components/power/Roles.vue";
import Cate from "../components/goods/Cate.vue";
import Params from "../components/goods/Params.vue";
import GoodsList from "../components/goods/GoodsList.vue";
import Add from "../components/goods/Add.vue";
import Order from "../components/order/Order.vue";
import Report from "../components/report/Report.vue";

const routes = [
  { path: "/login", component: login },
  {
    path: "/home",
    component: home,
    redirect: "/welcome",
    children: [
      { path: "/welcome", component: welcome },
      { path: "/users", component: Users },
      { path: "/rights", component: Rights },
      { path: "/roles", component: Roles },
      { path: "/categories", component: Cate },
      { path: "/params", component: Params },
      { path: "/goods", component: GoodsList },
      { path: "/goods/add", component: Add },
      { path: "/orders", component: Order },
      { path: "/reports", component: Report },
    ],
  },
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
