<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      window.sessionStorage.clear(); //清除sessionStorage路面的token
      this.$router.push("./login"); //使页面跳转到./login
    },
  },
};
</script>

<style lang="less" scoped></style>
