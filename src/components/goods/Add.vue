<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon=""
        :colsable="false"
      ></el-alert>

      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="Number(activeIndex)"
        finish-status="success"
        align-center
      >
        <!-- active:默认激活的索引，align-center：居中对齐 -->
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addRuleForm"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="breforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 
      1.el-tab-pane 里面的label对应的是左侧边栏名，
      标签里面的内容对应的是对应侧边栏展示的模块 
      2.el-tab-pane的name属性对应的值会传入
      v-model="activeIndex"的activeIndex里面
      通过左侧边栏来切换步骤条区域
      -->

          <el-tab-pane label="基本信息" name="0">
            <!-- prop为对应参数的校验规则 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableDate"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="it"
                  v-for="(it, index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableDate"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片需要上传的API地址 -->
            <el-upload
              class="upload-demo"
              :action="URL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="butAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" width="100%" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCateList();
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      } else {
        return null;
      }
    },
  },
  data() {
    return {
      /* 步骤条显示的索引号 */
      activeIndex: "0",
      /* 添加商品的表单数据对象 */
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [], //商品所属的分类数组
        pics: [], //图片数组
        goods_introduce: "",
        attrs: [],
      },
      /* 商品的验证规则 */
      addFormRules: {
        goods_name: [
          {
            required: true, //为必填强
            message: "请输入商品名称", //提示信息
            trigger: "blur", //触发时机，失去焦点时触发
          },
        ],
        goods_price: [
          {
            required: true, //为必填强
            message: "请输入商品价格", //提示信息
            trigger: "blur", //触发时机，失去焦点时触发
          },
        ],
        goods_weight: [
          {
            required: true, //为必填强
            message: "请输入商品重量", //提示信息
            trigger: "blur", //触发时机，失去焦点时触发
          },
        ],
        goods_number: [
          {
            required: true, //为必填强
            message: "请输入商品数量", //提示信息
            trigger: "blur", //触发时机，失去焦点时触发
          },
        ],
        goods_cat: [
          {
            required: true, //为必填强
            message: "请选择商品分类", //提示信息
            trigger: "blur", //触发时机，失去焦点时触发
          },
        ],
      },
      cateList: [], //商品分类列表数组
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      /* 动态参数列表数组 */
      manyTableDate: [],
      /* 静态参数列表 */
      onlyTableDate: [],
      /* 上传图片的地址 */
      URL: "http://127.0.0.1:8888/api/private/v1/upload",
      /* 图片上传的headers请求 */
      headObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewPath: "",
      previewVisible: false,
    };
  },
  methods: {
    /* 获取商品分类列表 */
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) {
        return this.$message.error("获取商品分类数据失败");
      }
      this.cateList = res.data;
      //console.log(this.cateList);
    },
    /* 级联选择器变化触发该函数 */
    handleChange() {
      if (this.addForm.goods_cat.length != 3) {
        this.addForm.goods_cat = [];
      }
      console.log("this.addForm.goods_cat", this.addForm.goods_cat);
    },
    /* 标签页切换即发生该函数 */
    breforeTabLeave(activename, oldname) {
      /* console.log("离开", oldname);
      console.log("离开", activename); */
      if (oldname === "0" && this.addForm.goods_cat.length != 3) {
        this.$message.error("请选择三级的商品分类！");
        return false; //当处于第一个标签页时，且选中分类长度不等于三时不能切换
      }
    },
    /* 点击左侧标签是触发该函数 */
    async tabClicked() {
      /*  */
      if (this.activeIndex == "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many",
            },
          }
        );
        if (res.meta.status != 200) {
          console.log(res.data);
          return this.$message.error("获取商品分类数据失败");
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableDate = res.data;
        console.log("this.manyTableDate", this.manyTableDate);
      } else if (this.activeIndex == "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only",
            },
          }
        );
        if (res.meta.status != 200) {
          console.log(res.data);
          return this.$message.error("获取商品分类数据失败");
        }
        this.onlyTableDate = res.data;
        console.log("this.onlyTableDate", this.onlyTableDate);
      }
    },
    /* 处理图片预览函数 */
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    /* 处理图片移除 */
    handleRemove(file) {
      console.log(file);
      const filePath = file.response.data.tmp_path;
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    /* 监听图片上传成功的时间 */
    handleSuccess(response) {
      const picInfo = {
        pic: response.data.tmp_path,
      };
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    /* 深拷贝 */
    deepClone(target) {
      // 定义一个变量
      let result;
      // 如果当前需要深拷贝的是一个对象的话
      if (typeof target === "object") {
        // 如果是一个数组的话
        if (Array.isArray(target)) {
          result = []; // 将result赋值为一个数组，并且执行遍历
          for (let i in target) {
            // 递归克隆数组中的每一项
            result.push(this.deepClone(target[i]));
          }
          // 判断如果当前的值是null的话；直接赋值为null
        } else if (target === null) {
          result = null;
          // 判断如果当前的值是一个RegExp对象的话，直接赋值
        } else if (target.constructor === RegExp) {
          result = target;
        } else {
          // 否则是普通对象，直接for in循环，递归赋值对象的所有值
          result = {};
          for (let i in target) {
            result[i] = this.deepClone(target[i]);
          }
        }
        // 如果不是对象的话，就是基本数据类型，那么直接赋值
      } else {
        result = target;
      }
      // 返回最终结果
      return result;
    },
    add() {
      this.$refs.addRuleForm.validate(async (valid) => {
        if (!valid) return this.$message.error("添加表单");
        let form = this.deepClone(this.addForm);
        form.goods_cat = form.goods_cat.join(",");
        //console.log(form);
        //处理动态参数
        this.manyTableDate.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            arrt_value: item.attr_vals.join(" "),
          };
          this.addForm.attrs.push(newInfo);
        });
        //处理静态属性
        this.onlyTableDate.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        console.log(form);
        const { data: res } = await this.$http.post("goods", form);
        if (res.meta.status != 201) {
          return this.$message.error("添加失败");
        }
        this.$message.success("添加成功");
        this.$router.push("/goods");
      });
    },
  },
};
</script>
j

<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
  font-size: 13px;
}
.butAdd {
  margin-top: 10px;
}
</style>
