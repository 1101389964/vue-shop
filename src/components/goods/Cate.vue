<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区 -->
      <el-row :gutter="80">
        <el-col :span="4">
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="true"
      >
        <template slot="iosk" slot-scope="slot">
          <i
            class="el-icon-success"
            v-if="slot.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="color:red" v-else></i>
        </template>
        <template slot="order" slot-scope="slot">
          <el-tag size="min" v-if="slot.row.cat_level == 0">一级</el-tag>
          <el-tag type="success" size="min" v-else-if="slot.row.cat_level == 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="min" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="slot">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="
              showEditCate(
                slot.row.cat_id,
                slot.row.cat_name,
                slot.row.cat_level
              )
            "
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(slot.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 7, 10]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            expand-trigger="hover"
            v-model="sekectKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
          <!--
             options 指定数据源
             props：保存选定的数据
             clearable:可以清空所选项
             @change:当选择完成后就会触发当前的函数
            change-on-select允许选择任意一项
           -->
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      title="修改分类信息"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <!-- 内容主体区 -->
      <el-form :model="editForm" gfd ref="editFormRef" label-width="70px">
        <el-form-item label="分类名称">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model="editForm.level" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      /* 查询条件 */
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      /* 商品分类的数据列表,默认为空 */
      cateList: [],
      total: 0,
      /* table指定列的定义 */
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          /*type: "templete"定义当前列为模板列  */
          type: "template",
          /* 表示当前模板名称 */
          template: "iosk",
        },
        {
          label: "排序",
          type: "template",
          /* 表示当前模板名称 */
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          /* 表示当前模板名称 */
          template: "opt",
        },
      ],
      addCateDialogVisible: false,
      /* 添加分类表单的数据对象 */
      // 将要添加分类的名称
      addCateForm: {
        cat_pid: 0,
        cat_name: "",
        cat_level: "",
      },
      /* 验证规则对象 */
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入类的名称",
            trigger: "blur",
          },
        ],
      },
      editDialogVisible: false,
      /* 父级分类的列表 */
      parentCateList: [],

      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      /* 选中的父级分类数组 */
      sekectKeys: [],
      /* 编辑对话框保存的数据 */
      editForm: {
        id: 1,
        name: "",
        level: 0,
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    /* 商品分类的数据获取 */
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo,
      });
      if (res.meta.status != 200) {
        console.log("error");
        return this.$message.error("获取数据失败！");
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
      // console.log("data", res.data);
      console.log("catelist", this.cateList);
      // console.log("total", this.total);

      /* 刷新数据列表 */
    },
    /* 监听pagesize改变 */
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    /* 监听pagenum改变 */
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
    /* 点击展示分类对话框 */
    async showAddCateDialog() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status != 200) {
        console.log("error");
        return this.$message.error("获取数据失败！");
      }
      this.addCateDialogVisible = true;
      //console.log("res.data:", res.data);
      this.parentCateList = res.data;
      console.log("this.parentCateList:", this.parentCateList);
    },
    /* 选择项变化触发这个函数 */
    parentCateChanged() {
      //console.log(this.sekectKeys);
      /*
      如果this.sekectKeys数组length大于0，证明有选中父级分类
      反之就说明没有选中任何父类分级
      */
      if (this.sekectKeys.length > 0) {
        this.addCateForm.cat_pid = this.sekectKeys[this.sekectKeys.length - 1];
        this.addCateForm.cat_level = this.sekectKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    /* 确认添加按钮 */
    async addCate() {
      this.$refs.addCateFormRef.validate((valid) => {
        if (!valid) return;
      });
      const { data: res } = await this.$http.post(
        "categories",
        this.addCateForm
      );
      if (res.meta.status != 201) {
        return this.$message.error("添加分类失败！");
      }
      this.$message.success("添加分类成功!");
      this.getCateList();
      this.addCateDialogVisible = false;
    },
    /* 关闭对话框后清空分类内容 */
    addCateDialogClosed() {
      this.addCateForm = {
        cat_pid: 0,
        cat_name: "",
        cat_level: 0,
      };
      this.sekectKeys = [];
    },
    /* 点击编辑事件 */
    showEditCate(id, name, level) {
      this.editForm.id = id;
      this.editForm.name = name;
      switch (level) {
        case 0:
          this.editForm.level = "一级";
        case 1:
          this.editForm.level = "二级";
        case 2:
          this.editForm.level = "三级";
      }
      this.editDialogVisible = true;
    },
    async submitEditData() {
      const { data: res } = await this.$http.put(
        "categories/" + this.editForm.id,
        { cat_name: this.editForm.name }
      );
      if (res.meta.status != 200) {
        console.log(res.data);
        return this.$message.error("编辑失败！");
      }
      this.getCateList();
      this.$message.success("编辑成功！");
      this.editDialogVisible = false;
    },
    /* 删除商品 */
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
      if (confirmResult === "cancel")
        return this.$message.success("已经取消删除");
      /* 删除操作 */
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status != 200)
        return this.$message.error("删除商品分类失败！");
      this.$message.success("删除商品分类成功！");
      //this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 10px;
}
.el-cascader {
  width: 100%;
}
</style>
