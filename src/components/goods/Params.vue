<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cateprops"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="checkoutDisabled"
            @click="adddialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态表格 -->
          <el-table :data="manyTableDate" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialong(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeCateById(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="checkoutDisabled"
            @click="adddialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态表格 -->
          <el-table :data="onlyTableDate" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialong(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeCateById(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="adddialogVisible"
      width="50%"
      @close="addDialogColsed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editdialogVisible"
      width="50%"
      @close="editDialogColsed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      /* 商品分类的数据存放 */
      catelist: [],
      /* 级联选择框的配置对象 */
      cateprops: {
        children: "children",
        value: "cat_id",
        label: "cat_name",
      },
      /* 级联选择框双向绑定的数组 */
      selectedCateKeys: [],
      /*tab页区默认被激活的页面标签名 */
      activeName: "many",
      /* 动态参数数据 */
      manyTableDate: [],
      /* 静态表格数据 */
      onlyTableDate: [],
      /* 添加对话框的显示与隐藏 */
      adddialogVisible: false,
      /* 添加参数的表单数据对象 */
      addForm: {},
      /* 添加表单的验证规则对象 */
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      /* 编辑对话框的显示与隐藏 */
      editdialogVisible: false,
      /* 编辑表单的数据对象 */
      editForm: {},
      /* 编辑表单的验证规则 */
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
    };
  },

  created() {
    this.getCateList();
  },

  computed: {
    /* tab按钮是否被禁用 */
    checkoutDisabled() {
      let result = true;
      return (result = this.selectedCateKeys.length != 3 ? true : false);
    },
    /* 当期选中的三级分类的id */
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    titleText() {
      let result = "动态参数";
      return (result = this.activeName === "many" ? "动态参数" : "静态属性");
    },
  },

  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) {
        return this.$message.error("获取商品分类失败！");
      }
      this.catelist = res.data;
      //console.log("catelist", this.catelist);
    },

    /* 级联选择框变化触发 */
    async handleChange() {
      if (this.selectedCateKeys.length != 3) {
        this.selectedCateKeys = [];
        this.manyTableDate = [];
        this.onlyTableDate = [];
        return;
      }
      /* 根据所选分类的id和当前所处的面板，获取对应的参数 */
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      if (res.meta.status != 200) {
        return this.$message.error("获取数据失败");
      }
      //console.log(`res.data:`, res.data);
      if (this.activeName == "many") {
        res.data.forEach((item) => {
          /* 先判断item.attr_vals是否为空然后再进行赋值，
          若直接赋值空字符串用split也会被显示出来 */
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
          /* 控制文本框的显示与隐藏 */
          item.inputVisible = false;
          /* 文本框输入的数据 */
          item.inputValue = "";
        });
        this.manyTableDate = res.data;
        //console.log(`manyTableDate:`, this.manyTableDate);
      } else {
        this.onlyTableDate = res.data;
        //console.log(`onlyTableDate:`, this.onlyTableDate);
      }
    },

    /* tab页签点击事件函数 */
    handleTabClick() {
      this.handleChange();
      console.log(this.activeName);
    },
    /* 关闭添加对话框清空表单 */
    addDialogColsed() {
      this.$refs.addFormRef.resetFields();
    },
    /* 提交添加的数据 */
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );

        if (res.meta.status != 201) {
          return this.$message.error("添加数据失败");
        }

        this.$message.success("添加参数成功！");
        this.adddialogVisible = false;
        this.handleChange();
      });
    },
    /* 显示编辑对话框 */
    async showEditDialong(id) {
      /* 查询当前参数的信息 */
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          attr_sel: this.activeName,
        }
      );
      if (res.meta.status != 200) {
        return this.$message.error("获取数据失败");
      }
      this.editForm = res.data;
      console.log("this.editForm:", this.editForm);
      this.editdialogVisible = true;
    },
    /* 关闭编辑对话框清空表单 */
    editDialogColsed() {
      this.$refs.editFormRef.resetFields();
    },
    /* 点击按钮编辑提交*/
    async editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status != 200) {
          return this.$message.error("修改参数失败");
        }
        this.$message.success("修改参数成功！");
        this.adddialogVisible = false;
        this.handleChange();
      });
    },
    /* 删除对话框 */
    async removeCateById(id) {
      //console.log(id);
      //弹框提示
      const confirmResult = await this.$confirm(
        "此操作将永久删除该商品分类, 是否继续?",
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
      if (confirmResult === "cancel") return this.$message.info("已经取消删除");
      /* 删除操作 */
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status != 200)
        return this.$message.error("删除分类参数失败！");
      this.$message.success("删除分类参数成功！");
      this.handleChange();
    },
    /* 文本框失去焦点或按下enter键都会触发 */
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      /* 没有return则需要把数据上传 */
      //console.log("row", row);
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.cat_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status != 200) {
        return this.$message.error("上传数据失败！");
      }
      //console.log("res:", res);
      this.$message.success("修改数据成功！");
    },
    /* 显示文本输入框 */
    showInput(row) {
      row.inputVisible = true;
      /* 让文本框自动获得焦点 */
      /* $nextTick 方法的作用：
      当页面上的元素重新被渲染之后，才会指定回调函数中的代码 */
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
        /*
        如果不在nextTick中执行该代码，
        当获取焦点之后会产生一个input标签，
        需要页面重新加载才能获取焦点
        这时候需要等待页面加载完成，
        否则dom元素还没有会报错
        */
      });
    },
    /* 删除参数 */
    async handleClose(id, row) {
      //console.log(id);
      row.attr_vals.splice(id, 1);
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status != 200) {
        return this.$message.error("删除失败！");
      }
      this.$message.success("删除成功！");
    },
  },
};
</script>

<style lang="less" scoped>
.el-row {
  margin-top: 15px;
}
.el-tag {
  margin-left: 10px;
}

.input-new-tag {
  margin-left: 10px;
  margin-top: 10px;
  width: 200px;
}
.button-new-tag {
  margin-left: 10px;
}
</style>
