<template>
  <div>
    <a-card>
      <a-row :gutter="20">
        <a-col :span="7">
          <a-input-search
            placeholder="请输入要查找的标签"
            allow-clear
            enter-button
            v-model="queryParams.name"
            @search="onSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="onAddTag">添加标签</a-button>
        </a-col>
      </a-row>

      <!-- 标签列表 -->
      <a-table
        row-key="ID"
        :columns="columns"
        :pagination="paginationOptions"
        :dataSource="tagList"
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

        <span slot="name" slot-scope="text">
          <a-tag color="#87d068">
            {{ text }}
          </a-tag>
        </span>
        <template slot="action" slot-scope="text, record">
          <div class="actionSlot">
            <a-button
              type="primary"
              style="margin-right: 15px"
              @click="onEditTag(record)"
              >编辑</a-button
            >
            <a-button type="danger" @click="deleteTag(record.ID)"
              >删除
            </a-button>
          </div>
        </template>
      </a-table>
    </a-card>

    <!-- 新增标签 -->
    <a-modal
      v-model="addTagVisible"
      title="添加用户"
      ok-text="确认"
      cancel-text="取消"
      @ok="addTagOk"
      @cancel="addTagCancel"
    >
      <a-form-model :model="tagInfo" :rules="tagRules" ref="addTagRef">
        <a-form-model-item label="标签名称" prop="name" has-feedback>
          <a-input v-model="tagInfo.name"></a-input>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <!-- 编辑标签 -->
    <a-modal
      v-model="editTagVisible"
      title="编辑标签"
      ok-text="确认"
      cancel-text="取消"
      @ok="editTagOk"
      @cancel="editTagCancel"
      closable
    >
      <a-form-model :model="tagInfo" :rules="tagRules" ref="editUserRef">
        <a-form-model-item label="标签名称" prop="name" has-feedback>
          <a-input v-model="tagInfo.name"></a-input>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
const columns = [
  {
    title: "序号",
    dataIndex: "rank",
    width: "10%",
    key: "rank",
    align: "center",
    scopedSlots: { customRender: "rank" },
  },
  {
    title: "ID",
    dataIndex: "ID",
    width: "10%",
    key: "ID",
    align: "center",
  },
  {
    title: "标签名",
    dataIndex: "name",
    width: "30%",
    key: "name",
    align: "center",
    scopedSlots: { customRender: "name" },
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
      tagList: [],
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
        name: "",
        pagesize: 5,
        pagenum: 1,
      },
      addTagVisible: false,
      editTagVisible: false,
      tagInfo: {
        id: 0,
        name: "",
      },
      tagRules: {
        name: [
          {
            required: true,
            message: "请输入标签名!",
            trigger: "blur",
          },
          {
            pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_+-]{1,50}$/,
            message: "请输入1-50位用户名,且只包含字母、数字、下划线和-字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getTagList();
  },
  computed: {
    isRoleSwitch: {
      get() {
        return this.userInfo.role == 1;
      },
      set(value) {
        this.userInfo.role = value ? 1 : 2;
      },
    },
  },
  methods: {
    // 编辑标签
    async onEditTag(record) {
      this.editTagVisible = true;
      this.tagInfo.name = record.name;
      this.tagInfo.id = record.ID;
      // console.log(res.data);
    },
    editTagOk() {
      this.$refs.editUserRef.validate(async (isValid) => {
        if (!isValid) {
          return this.$message.error("表单输入错误");
        }
        // console.log(this.userInfo);
        const { data: res } = await this.$http.put(`tag/${this.tagInfo.id}`, {
          name: this.tagInfo.name,
        });
        if (res.status !== 200) {
          return this.$message.error(res.message);
        }
        this.$message.success("标签编辑成功");
        this.editTagVisible = false;
        this.getTagList();
      });
    },
    editTagCancel() {
      this.$refs.editUserRef.resetFields();
      this.editTagVisible = false;
      this.$message.info("已取消");
    },
    // 新增标签
    onAddTag() {
      this.addTagVisible = true;
      this.tagInfo.name = "";
    },
    addTagOk() {
      this.$refs.addTagRef.validate(async (isValid) => {
        if (!isValid) {
          return this.$message.error("表单输入错误");
        }
        const { data: res } = await this.$http.post("tag/add", {
          name: this.tagInfo.name,
        });
        if (res.status !== 200) {
          return this.$message.error(res.message);
        }
        this.$message.success("标签添加成功");
        this.addTagVisible = false;
        this.getTagList();
      });
    },
    addTagCancel() {
      this.$refs.addTagRef.resetFields();
      this.addTagVisible = false;
      this.$message.info("已取消");
    },

    // 标签列表
    async getTagList() {
      const { data: res } = await this.$http.get("tags", {
        params: this.queryParams,
      });
      if (res.status !== 200) {
        return this.message.error(res.message);
      }
      this.tagList = res.data;
      this.paginationOptions.total = res.count;
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
      this.getTagList();
    },
    // 搜索按钮
    onSearch(value) {
      this.getTagList();
    },
    // 删除标签
    deleteTag(id) {
      this.$confirm({
        title: "确定删除该标签吗?",
        content: "一旦删除，无法恢复！",
        onOk: async () => {
          const res = await this.$http.delete(`tag/${id}`);
          const data = res.data;
          if (data.status !== 200) {
            this.$message.error(data.message);
          } else {
            this.$message.success("删除成功！");
            this.getTagList();
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