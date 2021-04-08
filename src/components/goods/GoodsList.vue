<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 头部搜索栏 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4" class="card_right">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区 -->
      <el-table :data="goodsList" border stripe class="margin-top">
        <!-- border有边框  stripe隔行变色-->
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="商品名称" prop="goods_name"> </el-table-column>
        <el-table-column label="商品价格" prop="goods_price" width="80px">
        </el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="80px">
        </el-table-column>
        <el-table-column label="穿件时间" prop="add_time" width="170px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeGoodsById(scope.row.goods_id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 页码区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getGoodsList();
  },
  data() {
    return {
      /* 查询参数对象 */
      queryInfo: {
        query: "", //可以通过这个搜索关键字
        pagenum: 1, //当前的页码
        pagesize: 10, //当前页显示多少条数据
      },
      //总数据条数
      total: 0,
      //商品列表
      goodsList: [],
    };
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });

      if (res.meta.status != 200) {
        console.log(res);
        return this.$message.error("获取商品列表失败！");
      }
      //this.$message.success("获取商品列表成功！");
      this.total = res.data.total;
      this.goodsList = res.data.goods;
      /* console.log("getGoodsList=>res:", res);
      console.log("total:", this.total);
      console.log("goodsList:", this.goodsList); */
    },
    /* 页码区pagesize发生变化就会触发这个函数 */
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getGoodsList();
    },
    /*  页码区pagenum发生变化就会触发这个函数 */
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getGoodsList();
    },
    /* 显示编辑对话框 */
    showEditDialog() {},
    /* 删除操作 */
    async removeGoodsById(id) {
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
      const { data: res } = await this.$http.delete("goods/" + id);
      if (res.meta.status != 200)
        return this.$message.error("删除商品分类失败！");
      this.$message.success("删除商品分类成功！");
      this.getGoodsList();
    },
    /* 添加商品操作 */
    goAddPage() {
      this.$router.push("/goods/add");
    },
  },
};
</script>

<style lang="less" scoped>
.card_right {
  margin-left: 10px;
}
.margin-top {
  margin-top: 10px;
}
.el-pagination {
  margin-top: 10px;
  margin-left: 280px;
}
</style>
