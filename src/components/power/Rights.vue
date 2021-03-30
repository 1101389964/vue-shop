<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-table :data="rightsList" :stripe="true" style="width: 100%" border>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="authName" label="权限名称"> </el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.level == '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level == '1'">二级</el-tag>
            <el-tag type="success" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightsList: [],
    };
  },
  created() {
    this.getRightsList();
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get("rights/list");
      //console.log(res);
      if (res.meta.status != 200)
        return this.$message.error("获取权限列表失败！");
      this.rightsList = res.data;
      //console.log(this.rightsList);
    },
  },
};
</script>

<style lang="less" scoped>
.el-breadcrumb {
  font-size: 15px;
}
el-table__body-wrapper {
  text-align: center;
}
</style>
