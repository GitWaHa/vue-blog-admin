<template>
  <div>
    <a-card>
      <a-row :gutter="20">
        <a-col :span="7">
          <a-input-search
            placeholder="请输入要查找的文章"
            allow-clear
            enter-button
            v-model="queryParams.title"
            @search="onSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="onAddArticle">添加文章</a-button>
        </a-col>
      </a-row>

      <!-- 文章列表 -->
      <a-table
        row-key="ID"
        :columns="columns"
        :pagination="paginationOptions"
        :dataSource="TableList"
        @change="handleTableChange"
        bordered
      >
        <span slot="rank" slot-scope="text, record, index">
          {{
            paginationOptions.pageSize * (paginationOptions.current - 1) +
            index +
            1
          }}
        </span>

        <span slot="tags" slot-scope="text, record">
          <a-tag v-for="item in record.tags" :key="item" color="green">
            {{ item }}
          </a-tag>
          <a-tag v-if="record.tags == null" color="red"> null </a-tag>
        </span>

        <span slot="img" slot-scope="text">
          <!-- <a :href="text"></a> -->
          <div>
            <img
              v-if="text != ''"
              :src="text"
              style="max-height: 150px; max-width: 150px"
            />
          </div>
        </span>

        <template slot="action" slot-scope="text, record">
          <div class="actionSlot">
            <a-button
              type="primary"
              style="margin-right: 15px"
              @click="onEditArticle(record)"
              >编辑</a-button
            >
            <a-button type="danger" @click="deleteArticle(record.ID)"
              >删除
            </a-button>
          </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
const columns = [
  {
    title: "序号",
    dataIndex: "rank",
    width: "5%",
    key: "rank",
    align: "center",
    scopedSlots: { customRender: "rank" },
  },
  {
    title: "ID",
    dataIndex: "ID",
    width: "5%",
    key: "ID",
    align: "center",
  },
  {
    title: "文章名称",
    dataIndex: "title",
    width: "20%",
    key: "title",
    align: "center",
    scopedSlots: { customRender: "title" },
  },
  {
    title: "标签",
    dataIndex: "tags",
    width: "15%",
    key: "tags",
    align: "center",
    scopedSlots: { customRender: "tags" },
  },
  {
    title: "描述",
    dataIndex: "desc",
    width: "20%",
    key: "desc",
    align: "center",
    scopedSlots: { customRender: "desc" },
  },
  {
    title: "文章内容",
    dataIndex: "content",
    width: "30%",
    key: "content",
    align: "center",
    ellipsis: true,
    scopedSlots: { customRender: "content" },
  },
  {
    title: "图片",
    dataIndex: "img",
    width: "20%",
    key: "img",
    align: "center",
    scopedSlots: { customRender: "img" },
  },
  {
    title: "操作",
    dataIndex: "action",
    width: "30%",
    key: "action",
    align: "center",
    scopedSlots: { customRender: "action" },
  },
];
export default {
  data() {
    return {
      TableList: [],
      ArticleList: [],
      columns,
      paginationOptions: {
        defaultCurrent: 1,
        current: 1,

        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "50"],
        defaultPageSize: 5,
        pageSize: 5,

        total: 0,
        showTotal: (total) => `共${total}条`,
      },
      queryParams: {
        title: "",
        pagesize: 5,
        pagenum: 1,
      },
      articleInfo: {
        id: 0,
        title: "",
        desc: "",
        content: "",
        img: "",
      },
      // articleRules: {
      //   name: [
      //     {
      //       required: true,
      //       message: "请输入标签名!",
      //       trigger: "blur",
      //     },
      //     {
      //       pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_-]{1,50}$/,
      //       message: "请输入1-50位用户名,且只包含字母、数字、下划线和-字符",
      //       trigger: "blur",
      //     },
      //   ],
      // },
    };
  },
  created() {
    this.getArticleList();
  },
  computed: {},
  methods: {
    // 编辑标签
    async onEditArticle(record) {
      this.$router.push(`/addart/${record.ID}`);
    },

    // 新增标签
    onAddArticle() {
      this.$router.push("addart");
    },

    // 标签列表
    async getArticleList() {
      const { data: res } = await this.$http.get("articles", {
        params: this.queryParams,
      });
      if (res.status !== 200) {
        return this.message.error(res.message);
      }
      this.ArticleList = res.articles;
      this.paginationOptions.total = res.count;
      console.log("res", res);
      for (let index = 0; index < this.ArticleList.length; index++) {
        this.ArticleList[index].tags = res.tags[index];
      }
      this.TableList = this.ArticleList;
    },

    handleTableChange(pagination, filters, sorter) {
      const pager = { ...this.paginationOptions };
      pager.current = pagination.current;
      pager.pageSize = pagination.pageSize;

      this.queryParams.pagesize = pagination.pageSize;
      this.queryParams.pagenum = pagination.current;

      if (this.queryParams.pagesize !== this.paginationOptions.pageSize) {
        this.queryParams.pagenum = 1;
        pager.current = 1;
      }
      this.paginationOptions = pager;
      this.getArticleList();
    },

    // 搜索按钮
    onSearch(value) {
      this.getArticleList();
    },

    // 删除文章
    deleteArticle(id) {
      this.$confirm({
        title: "确定删除该文章吗?",
        content: "一旦删除，无法恢复！",
        onOk: async () => {
          const res = await this.$http.delete(`article/${id}`);
          const data = res.data;
          if (data.status !== 200) {
            this.$message.error(data.message);
          } else {
            this.$message.success("删除成功！");
            this.getArticleList();
          }
        },
        onCancel: () => {
          this.$message.success("已取消！");
        },
      });
    },
  },
};
</script>

<style scoped>
.actionSlot {
  display: flex;
  justify-content: center;
}
</style>