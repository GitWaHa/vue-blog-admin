<template>
  <div>
    <a-card>
      <a-row :gutter="20">
        <a-col :span="10">
          <a-input-search
            placeholder="请输入要查找的用户名"
            allow-clear
            enter-button
            v-model="queryParams.username"
            @search="onSearch"
          />
        </a-col>
        <a-col :span="4">
          <a-button type="primary" @click="onAddUser"> 增加用户</a-button>
        </a-col>
      </a-row>
      <!-- {{ this.userInfo }} -->
      <!-- 用户列表 -->
      <a-table
        row-key="ID"
        :columns="columns"
        :pagination="paginationOptions"
        :dataSource="userlist"
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

        <span slot="role" slot-scope="text">
          <a-tag :color="text == 1 ? 'volcano' : 'green'">
            {{ text === 1 ? "管理员" : "订阅者" }}
          </a-tag>
        </span>
        <template slot="action" slot-scope="text, record">
          <div class="actionSlot">
            <a-button
              type="primary"
              style="margin-right: 15px"
              @click="onEditUser(record)"
              >编辑</a-button
            >
            <a-button
              type="danger"
              style="margin-right: 15px"
              @click="onResetPassword(record)"
              >重置密码</a-button
            >
            <a-button type="danger" @click="deleteUser(record.ID)"
              >删除
            </a-button>
          </div>
        </template>
      </a-table>
    </a-card>

    <!-- 新增用户 -->
    <a-modal
      v-model="visible"
      title="添加用户"
      ok-text="确认"
      cancel-text="取消"
      @ok="addUserOk"
      @cancel="addUserCancel"
    >
      <a-form-model :model="userInfo" :rules="userRules" ref="addUserRef">
        <a-form-model-item label="用户名" prop="username" has-feedback>
          <a-input v-model="userInfo.username"></a-input>
        </a-form-model-item>
        <a-form-model-item label="密码" prop="password" has-feedback>
          <a-input-password v-model="userInfo.password"></a-input-password>
        </a-form-model-item>
        <a-form-model-item label="确认密码" prop="checkpass" has-feedback>
          <a-input-password v-model="userInfo.checkpass"></a-input-password>
        </a-form-model-item>
        <a-form-model-item label="是否管理员">
          <a-switch
            v-model="isRoleSwitch"
            checked-children="是"
            un-checked-children="否"
            @change="onRoleSelect"
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <!-- 编辑用户 -->
    <a-modal
      v-model="editUserVisible"
      title="编辑用户"
      ok-text="确认"
      cancel-text="取消"
      @ok="editUserOk"
      @cancel="editUserCancel"
      closable
    >
      <a-form-model :model="userInfo" :rules="userRules" ref="editUserRef">
        <a-form-model-item label="用户名" prop="username" has-feedback>
          <a-input v-model="userInfo.username"></a-input>
        </a-form-model-item>

        <a-form-model-item label="是否管理员">
          <a-switch
            v-model="isRoleSwitch"
            checked-children="是"
            un-checked-children="否"
            @change="onRoleSelect"
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <!-- 重置密码 -->
    <a-modal
      v-model="resetPasswordVisible"
      title="重置密码"
      ok-text="确认"
      cancel-text="取消"
      @ok="resetPasswordOk"
      @cancel="resetPasswordCancel"
      closable
    >
      <a-form-model :model="userInfo" :rules="userRules" ref="resetUserRef">
        <a-form-model-item label="用户名" prop="username">
          <a-input v-model="userInfo.username" :disabled="true"></a-input>
        </a-form-model-item>

        <!-- <a-form-model-item label="旧密码" prop="oldpassword" has-feedback>
          <a-input-password v-model="userInfo.oldpassword"></a-input-password>
        </a-form-model-item> -->
        <a-form-model-item label="新密码" prop="password" has-feedback>
          <a-input-password v-model="userInfo.password"></a-input-password>
        </a-form-model-item>
        <a-form-model-item label="确认密码" prop="checkpass" has-feedback>
          <a-input-password v-model="userInfo.checkpass"></a-input-password>
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
    title: "用户名",
    dataIndex: "username",
    width: "30%",
    key: "username",
    align: "center",
  },
  {
    title: "用户权限",
    dataIndex: "role",
    width: "30%",
    key: "role",
    align: "center",
    scopedSlots: { customRender: "role" },
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
      userlist: [],
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
        username: "",
        pagesize: 5,
        pagenum: 1,
      },
      visible: false,
      editUserVisible: false,
      resetPasswordVisible: false,
      userInfo: {
        id: 0,
        username: "",
        // oldpassword: "",
        password: "",
        checkpass: "",
        role: 2,
      },
      userRules: {
        username: [
          {
            required: true,
            message: "请输入用户名!",
            trigger: "change",
          },
          {
            pattern: /^[a-zA-Z0-9_-]{4,16}$/,
            message: "请输入4-16位用户名,且只包含字母、数字、下划线和-字符",
            trigger: "change",
          },
        ],
        // oldpassword: [
        //   {
        //     required: true,
        //     message: "请输入密码!",
        //     trigger: "blur",
        //   },
        //   {
        //     min: 6,
        //     max: 20,
        //     message: "请输入6-20位密码",
        //     trigger: "blur",
        //   },
        // ],
        password: [
          {
            required: true,
            message: "请输入密码!",
            trigger: "blur",
          },
          {
            min: 6,
            max: 20,
            message: "请输入6-20位密码",
            trigger: "blur",
          },
        ],
        checkpass: [
          {
            required: true,
            message: "请输入密码!",
            trigger: "blur",
          },
          {
            validator: (rule, value, callback) => {
              if (value && value !== this.userInfo.password) {
                callback("两次密码输入不一致!");
              } else {
                callback();
              }
            },
          },
        ],
      },
    };
  },
  created() {
    this.getUserList();
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
    // 重置密码
    onResetPassword(record) {
      this.resetPasswordVisible = true;
      this.userInfo.username = record.username;
      this.userInfo.password = "";
      this.userInfo.checkpass = "";
    },
    async resetPasswordOk() {
      const { data: res } = await this.$http.post(`user/resetpassword`, {
        username: this.userInfo.username,
        password: this.userInfo.password,
      });

      if (res.status != 200) {
        this.$message.error(res.message);
        return false;
      }
      this.$message.success("重置密码成功！");
      this.resetPasswordVisible = false;
      this.$refs.resetUserRef.resetFields();
    },
    resetPasswordCancel() {
      this.resetPasswordVisible = false;
      this.$refs.resetUserRef.resetFields();
    },
    // 编辑用户
    async onEditUser(record) {
      this.editUserVisible = true;
      this.userInfo.username = record.username;
      this.userInfo.role = record.role;
      this.userInfo.id = record.ID;
      // console.log(res.data);
    },
    editUserOk() {
      this.$refs.editUserRef.validate(async (isValid) => {
        if (!isValid) {
          return this.$message.error("表单输入错误");
        }
        // console.log(this.userInfo);
        const { data: res } = await this.$http.put(`user/${this.userInfo.id}`, {
          username: this.userInfo.username,
          role: this.userInfo.role,
        });
        if (res.status !== 200) {
          return this.$message.error(res.message);
        }
        this.$message.success("用户编辑成功");
        this.editUserVisible = false;
        this.getUserList();
      });
    },
    editUserCancel() {
      this.$refs.editUserRef.resetFields();
      this.editUserVisible = false;
      this.$message.info("已取消");
    },
    // 新增用户
    onAddUser() {
      this.userInfo.username = "";
      this.userInfo.password = "";
      this.userInfo.checkpass = "";
      this.visible = true;
    },
    addUserOk() {
      this.$refs.addUserRef.validate(async (isValid) => {
        if (!isValid) {
          return this.$message.error("表单输入错误");
        }
        const { data: res } = await this.$http.post("user/add", {
          username: this.userInfo.username,
          password: this.userInfo.password,
          role: this.userInfo.role,
        });
        if (res.status !== 200) {
          return this.$message.error(res.message);
        }
        this.$message.success("用户添加成功");
        this.visible = false;
        this.getUserList();
      });
    },
    addUserCancel() {
      this.$refs.addUserRef.resetFields();
      this.visible = false;
      this.$message.info("已取消");
    },
    onRoleSelect(value) {
      if (value == true) {
        this.userInfo.role = 1;
      } else {
        this.userInfo.role = 2;
      }
    },

    // 用户列表
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryParams,
      });
      if (res.status !== 200) {
        return this.message.error(res.message);
      }
      this.userlist = res.data;
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
      this.getUserList();
    },
    // 搜索按钮
    onSearch(value) {
      // this.queryParams.username = value;
      this.getUserList();
    },
    // 删除用户
    deleteUser(id) {
      this.$confirm({
        title: "确定删除该用户吗?",
        content: "一旦删除，无法恢复！",
        onOk: async () => {
          const res = await this.$http.delete(`user/${id}`);
          const data = res.data;
          if (data.status !== 200) {
            this.$message.error(data.message);
          } else {
            this.$message.success("删除成功！");
            this.getUserList();
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