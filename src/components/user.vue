<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区 -->
      <el-row :gutter="80">
        <el-col :span="12">
          <el-input
            placeholder="请输入内容"
            v-model="querInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button> </el-input
        ></el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户列表区 -->
    <el-table :data="userList" :stripe="true" style="width: 100%" border>
      <el-table-column type="index"> </el-table-column>
      <el-table-column prop="username" label="用户名"> </el-table-column>
      <el-table-column prop="role_name" label="身份"> </el-table-column>
      <el-table-column prop="mobile" label="电话"> </el-table-column>
      <el-table-column prop="email" label="邮箱" width="180"> </el-table-column>
      <el-table-column label="状态" width="180">
        <template slot-scope="scope">
          <!-- scope.row可以获取当前行的数据及属性 -->
          <el-switch
            v-model="scope.row.mg_state"
            active-color="#00a1d6"
            inactive-color="#e3e4e5"
            @change="userStateChanged(scope.row)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showIdDialog(scope.row.id)"
          ></el-button>
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeUserById(scope.row.id)"
          ></el-button>
          <!-- 分配角色按钮 -->
          <el-tooltip
            class="item"
            effect="dark"
            content="分配角色"
            placement="top"
            :enterable="false"
          >
            <el-button
              type="info"
              icon="el-icon-setting"
              size="mini"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 页码区 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querInfo.pagenum"
      :page-sizes="[1, 2, 3, 4, 5]"
      :page-size="querInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>

    <!-- 添加对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        gfd
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        gfd
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 删除对话框 -->
  </div>
</template>

<script>
import loginVue from "./login.vue";
export default {
  data() {
    /* 验证邮箱的校验规则 */
    var checkEmail = (rule, value, cb) => {
      /* 验证邮箱的正则表达式 */
      const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("邮箱格式错误"));
    };
    /* 验证手机号的校验规则 */
    var checkMobile = (rule, value, cb) => {
      const regMoible = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
      if (regMoible.test(value)) {
        return cb();
      }
      cb(new Error("手机格式错误"));
    };
    return {
      /* 用户列表对象 */
      querInfo: {
        query: "",
        /* pagenum: 当前的页数*/
        pagenum: 1,
        /* pagesize当前每页显示多少条数据 */
        pagesize: 2,
      },
      userList: [], //存放用户的信息
      total: 0, //total为所有用户数量
      /* 控制添加对话框的显示与隐藏 */
      addDialogVisible: false,
      editDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //添加表达的验证规则对象
      addFormRules: {
        userName: [
          { require: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "用户名字长在3~10之间", trigger: "blur" },
        ],
        password: [{ require: true, message: "请输入密码", trigger: "blur" }],
        email: [
          { require: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { require: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      //修改用户的表单数据
      editForm: {},
      //修改用户验证规则对象
      editFormRules: {
        email: [
          { require: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { require: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      let { data: res } = await this.$http("users", { params: this.querInfo });
      if (res.meta.status != 200)
        //res.meta.status不等于200，用户列表获取失败
        return this.$message.error("获取用户列表失败！");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    /* 监听pagesize改变的事件 */
    handleSizeChange(newSzie) {
      this.querInfo.pagesize = newSzie; //更新挡前显示多少条数据
      this.getUserList(); //重新获取页面的数据
      //console.log(newSzie);
    },
    /* 监听页码值改变的事件 */
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getUserList();
    },
    /* 切换用户状态改变数据库里面对应的值 */
    async userStateChanged(num) {
      let { data: res } = await this.$http.put(
        `users/${num.id}/state/${num.mg_state}`
      );
      if (res.meta.status != 200) {
        num.mg_state = !num.mg_state;
        //res.meta.status不等于200，用户列表获取失败
        return this.$message.error("更新用户列表失败！");
      }
      this.$message.success("更新用户状态成功");
    },
    /* 监听对话框关闭事件 */
    addDialogClosed() {
      this.$refs.addFormRef.resetFields(); //清空对话框里的数据
      /* this.addForm = {
        username: "",
        password: "",
        email: "",
        mobile: "",
      }; */
    },
    /* 点击添加新用户 */
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status != 201) {
          return this.$message.error("添加用户失败！");
        }
        this.$message.success("添加用户成功！");
        //隐藏添加用户的对话框
        this.addDialogVisible = false;
        //重新获取用户列表
        this.getUserList();
      });
    },
    /* 展示编辑用户的对话框 */
    async showIdDialog(id) {
      //console.log(id);
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status != 200)
        return this.$message.error("查询用户信息失败");
      this.editForm = res.data;
      console.log(this.editForm);
      this.editDialogVisible = true;
    },
    /* 修改用户信息并提交 */
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        //console.log(valid);
        if (!valid) return;
        /* 发起数据请求 */
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        if (res.meta.status != 200) {
          return this.$message.error("添加用户失败！");
        }
        /* 关闭对话框 */
        this.editDialogVisible = false;
        /* 刷新数据列表 */
        this.getUserList();
        /* 提示修改成功 */
        this.$message.success("修改数据成功！");
      });
    },
    /* 展示用户的对话框 */
    deleteDialogVisible() {},
    /* 根据用户id删除 */
    async removeUserById(id) {
      console.log(id);
      //弹框提示
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err); //catch((err) => err)用于捕获取消的错误消息
      /*
      如果用户确认删除返回字符串confirm
      如果用户取消删除返回字符串cancel
      */
      //console.log(confirmResult);
      if (confirmResult === "cancel")
        return this.$message.success("已经取消删除");
      /* 删除操作 */
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status != 200) return this.$message.error("删除用户失败！");
      this.$message.success("删除用户成功！");
      this.getUserList();
    },
  },
};
</script>

<style lang="less" scoped>
.el-button--danger {
  background-color: #e1251b;
  border: 0px;
}
.el-table {
  margin-top: 15px;
  font-size: 15px;
}
.el-pagination {
  margin-top: 15px;
  position: absolute;
  left: 50%;
  margin-left: -150px;
}
</style>
