<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 添加角色按钮 -->
      <el-row :gutter="80">
        <el-col :span="4">
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :stripe="true" style="width: 100%" border :data="roleList">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="slot">
            <el-row
              :class="['row-bottom', index1 == 0 ? 'row-top' : '']"
              v-for="(item1, index1) in slot.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeById(slot.row, item1.id)">{{
                  item1.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                  :class="index2 == 0 ? '' : 'row-top'"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeById(slot.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeById(slot.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" @click="editRole">
          <template slot-scope="scope" width="300px">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showRoleDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="success"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <!-- 内容主体区 -->
      <el-form gfd ref="editFormRef" :model="editForm" label-width="70px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="email">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 rightsList：所有权限的数据 treeProps：权限分配中树形的属性绑定对象-->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        ref="treeRef"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="alloRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色的列表数据
      roleList: [],
      /* 控制对话框的显示和隐藏 */
      editDialogVisible: false,
      setRightDialogVisible: false,
      /* 编辑操作的数据 */
      editForm: {},
      //所有权限的数据
      rightsList: [],
      /* 权限分配中树形的属性绑定对象 */
      treeProps: {
        children: "children",
        label: "authName",
      },
      /* 默认展开的树形控件的所选项 */
      defKeys: [],
      roleId: "",
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200) {
        return this.$message.error("获取角色信息失败");
      }
      this.roleList = res.data;
      console.log(this.roleList);
    },

    /* 展示编辑用户的对话框 */
    async showRoleDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status != 200)
        return this.$message.error("查询用户信息失败");
      //console.log(res);
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    /* 编辑提交角色 */
    editRole() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        );
        if (res.meta.status != 200) return this.$message.error("提交失败");
        /* 确认之后隐藏对话框 */
        this.editDialogVisible = false;
        /* 重新加载数据 */
        this.getRoleList();
        /* 显示编辑数据成功 */
        this.$message.success("编辑数据成功！");
      });
    },
    async removeRoleById(id) {
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
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status != 200) return this.$message.error("删除角色失败！");
      this.getUserList();
      this.$message.success("删除角色成功！");
    },
    /* 根据Id删除对应的权限 */
    async removeById(role, id) {
      //弹框提示是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult === "cancel")
        return this.$message.success("已经取消删除");
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${id}`
      );
      if (res.meta.status != 200) {
        return this.$message.error("删除失败！");
      }
      //this.getRoleList();
      /* 不能直接调用getRoleList函数，否则会直接刷新页面 */
      role.children = res.data;
      this.$message.success("删除成功！");
    },
    /* 展示权限分配对话框 */
    async showSetRightDialog(row) {
      /* 获取所有权限的数据 */
      this.roleId = row.id;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status != 200) {
        return this.$message.error("获取权限失败!");
      }
      //获取到的权限数据保存到rightList中
      this.rightsList = res.data;
      //console.log(this.rightsList);
      /* 把已有的结点渲染出来 */
      this.getLeafKeys(row, this.defKeys);
      //console.log(row);
      //console.log(this.defKeys);
      this.setRightDialogVisible = true;
    },
    //通过递归获取权限的id
    getLeafKeys(node, arry) {
      if (!node.children) {
        return arry.push(node.id);
      }
      node.children.forEach((value) => {
        /* if (typeof value == "object") */
        this.getLeafKeys(value, arry);
      });
    },
    //每次关闭对话框都需要清空存放id的数组
    setRightDialogClosed() {
      this.defKeys.length = 0;
    },
    async alloRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedNodes(),
      ];
      //console.log(keys);
      let idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status != 200) {
        return this.$message.error("权限分配失败！");
      }
      this.$message.success("权限分配成功！");
      console.log(this.rightsList);
      this.getRoleList();
      this.setRightDialogVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
.el-breadcrumb {
  font-size: 15px;
}
.el-tag {
  margin: 7px;
}
.row-bottom {
  border-bottom: 1px solid #eee;
}
.row-top {
  border-top: 1px solid #eee;
}
.el-row {
  display: flex;
  align-items: center;
}
</style>
