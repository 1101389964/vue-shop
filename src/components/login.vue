<template>
  <div class="login_contanier">
    <div class="login_box">
      <!-- avatar_box头像 -->
      <div class="avatar_box">
        <img src="../assets/DI_8~7EFN9$R8G9H8J@B`IQ.png" alt="" />
      </div>
      <!-- 登录表单 -->
      <el-form
        ref="login_from_ref"
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="login_rules"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-lock"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="btns">
          <el-button type="success" round @click="check_login">登录</el-button>
          <el-button type="info" round @click="clearLoginFrom">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      /* 表单登录的数据对象 */
      loginForm: {
        username: "admin",
        password: "123456",
      },
      /* 表单数据验证规则对象 */
      login_rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
    };
  },
  methods: {
    clearLoginFrom() {
      this.$refs.login_from_ref.resetFields();
    },
    check_login() {
      this.$refs.login_from_ref.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("/login", this.loginForm);
        if (res.meta.status != 200) return this.$message.error("登录失败！");
        this.$message.success("登录成功！");
        window.sessionStorage.setItem("token", res.data.token);
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_contanier {
  //background-color: #2b4b6b;
  background-image: url(../assets/11.jpg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-image: url(../assets/02.jpg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 120%;
  border: 3px solid #eee;
  box-shadow: 0 0 10px #ddd;

  border-radius: 15%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  /* 头像区 */
  .avatar_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 130px;
    width: 120px;
    border: 1px solid #eee;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    border-radius: 50%;
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
  /*登录区_  */
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  /* 登录区_按钮 */
  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
