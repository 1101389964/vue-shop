<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部导航栏 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- table表格区 -->
      <el-table :data="orderList" border stripe class="margin-top">
        <!-- border有边框  stripe隔行变色-->
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column label="订单编号" prop="order_number">
        </el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px">
        </el-table-column>
        <el-table-column label="是否付款" prop="order_pay" width="100px">
          <template slot-scope="scope">
            <div>
              <el-tag type="success" v-if="Number(scope.row.order_pay)"
                >已付款</el-tag
              >
              <el-tag type="danger" v-else>未付款</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          width="100px"
        ></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="170px">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template></el-table-column
        >
        <el-table-column label="操作" width="170px">
          <template slot-scope="scope">
            <div>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-edit"
                @click="showEditDialong(scope.row)"
              ></el-button>
              <el-button
                type="success"
                size="mini"
                icon="el-icon-location-information"
                @click="showPrigress"
              ></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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

    <!-- 编辑对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form :model="editForm" gfd ref="editFormRef" label-width="50px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityDate"
            v-model="editForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input
            v-model="editForm.address2"
            class="form-item-width"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityDate from "./citydata.js";

export default {
  created() {
    this.getOrderList();
  },
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1, //当前页码
        pagesize: 10, //当前页显示的条数
      },
      total: 0,
      /* 订单列表的数据 */
      orderList: [],
      /* 编辑对话框的信息 */
      editForm: {
        address1: [],
        address2: "",
        //订单id
      },
      /* 编辑对话框是否显示 */
      editDialogVisible: false,
      /* 编辑商品使用的id */
      order_id: 0,
      /* 物流进度对话框的显示 */
      progressDialogVisible: false,
      /* 修改地址的信息 */
      progressInfo: [],
      cityDate,
    };
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status != 200) {
        return this.$message.error("获取数据失败！");
      }
      this.orderList = res.data.goods;
      this.total = res.data.total;
      console.log("getOrderList=>res:", res);
    },
    showEditDialong(row) {
      this.editForm.order_price = row.order_price;
      this.editForm.pay_status = row.pay_status;
      this.editForm.is_send = row.is_send;
      this.order_id = row.order_id;
      this.editDialogVisible = true;
    },
    async submitEditData() {
      const { data: res } = await this.$http.put(
        `orders/${this.order_id}`,
        this.editForm
      );
      if (res.meta.status != 201) {
        console.log(res);
        return this.$message.error("修改数据失败！");
      }
      console.log("res.data:", res.data);
      this.$message.success("修改数据成功！");
      this.editDialogVisible = false;
      this.getOrderList();
    },

    /* 当前页显示条数变化时触发该函数 */
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    /* 当前页页码数变化时触发该函数 */
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    /* 显示物流进度的对话框 */
    async showPrigress() {
      const { data: res } = await this.$http.get(`/kuaidi/1106975712662`);

      if (res.meta.status != 200) {
        console.log(res);
        return this.$message.error("获取数据失败！");
      }

      this.progressInfo = res.data;
      this.progressDialogVisible = true;
      console.log("progressInfo:", this.progressInfo);
    },
    /* 关闭编辑对话框清空内容 */
    addressDialogClosed() {
      this.editForm = {
        address1: [],
        address2: "",
      };
    },
  },
};
</script>

<style lang="less" scoped>
.margin-top {
  margin-top: 15px;
}
.el-pagination {
  margin-top: 10px;
  margin-left: 400px;
}
.el-cascader {
  width: 100%;
}
</style>
