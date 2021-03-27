<template>
  <el-container class="home_contaniner">
    <!-- 头部区 -->
    <el-header>
      <div>
        <div class="logo"></div>
        <span class="text">澳子哥的Vue项目页面</span>
      </div>
      <el-button type="info" @click="logout" class="exit">退出</el-button>
    </el-header>
    <!-- 主体区 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="wid">
        <div class="toggle-button" @click="toggleCollapse">
          <!--
            toggleCollapse函数改变侧边栏collapse的值实现收缩 
            并改变侧边栏的宽距
           -->
          {{ text }}
        </div>
        <!-- 侧边栏菜单区 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#e1251b"
          :unique-opened="true"
          :collapse="switchover"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
          ><!-- active-text-color可以改变对应dom的颜色 -->
          <!-- :collapse为true可以使侧边栏收缩，为false可以使侧边栏弹出 -->
          <!-- :router='true'为开启侧边栏路由 -->
          <!--  default-active="/users" 当里面的值为index的值时该模块高亮-->
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- <i></i>代表图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- <sapn></sapn>代表文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <!-- <i></i>代表图标 -->
                <i class="el-icon-menu"></i>
                <!-- <sapn></sapn>代表文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主题 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    /* 生命周期函数 */
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem("activePath");
    /* 当创建该项目时就会把this.activePath设置为当前URL */
  },
  data() {
    return {
      menulist: [],
      iconsObj: {
        "125": "iconfont icon-bussiness-man",
        "103": "iconfont icon-lock",
        "101": "iconfont icon-cart-full",
        "102": "iconfont icon-history-filling",
        "145": "iconfont icon-form",
      },
      switchover: false,
      wid: "200px",
      text: "",
      activePath: "",
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear(); //清除sessionStorage路面的token
      this.$router.push("./login"); //使页面跳转到./login
    },
    /* 获取所有的菜单 */
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
    },
    toggleCollapse() {
      if (this.switchover == true) {
        this.wid = "200px";
        this.switchover = false;
        this.text = "";
      } else {
        this.wid = "64px";
        this.switchover = true;
        this.text = "";
      }
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
      //console.log(this.activePath);
    }, //当点击该二级菜单时会产生高亮，通过改变default-active的值使眼色发生改变
  },
};
</script>

<style lang="less" scoped>
@font-face {
  font-family: "icomoon";
  src: url("../assets/font/icomoon.eot?7kkyc2");
  src: url("../assets/font/icomoon.eot?7kkyc2#iefix")
      format("embedded-opentype"),
    url("../assets/font/icomoon.ttf?7kkyc2") format("truetype"),
    url("../assets/font/icomoon.woff?7kkyc2") format("woff"),
    url("../assets/font/icomoon.svg?7kkyc2#icomoon ") format("svg");
  font-weight: normal;
  font-style: normal;
}
.el-menu {
  border-right: 0px solid #fff;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 30px;
  color: #eaedf1;
  div {
    display: flex;
    text-align: center;
    margin-top: -10px;
    .text {
      padding-left: 10px;
      margin-top: 10px;
    }
  }
}

.el-aside {
  background-color: #333744;
}

.el-main {
  background-color: #eaedf1;
}

.home_contaniner {
  width: 100%;
  height: 100%;
  .logo {
    margin-top: 10px;
    font-family: "icomoon";
    font-size: 48px;
    color: #e1251b;
    text-align: center;
  }
}

.exit {
  display: flex;
  justify-content: flex-end;
}

.iconfont {
  margin-right: 10px;
}
.toggle-button {
  font-family: "icomoon";
  font-size: 20px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
.toggle-button:hover {
  color: #e1251b;
}
</style>
