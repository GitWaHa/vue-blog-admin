<template>
  <div class="container">
    <div class="loginBox">
      <a-form-model
        ref="refLoginForm"
        :model="formdata"
        :rules="rules"
        class="loginForm"
      >
        <a-form-model-item prop="username">
          <a-input v-model="formdata.username" placeholder="Username"
            ><a-icon
              slot="prefix"
              type="user"
              style="color: rgba(0, 0, 0, 0.25)"
          /></a-input>
        </a-form-model-item>

        <a-form-model-item prop="password">
          <a-input
            v-model="formdata.password"
            placeholder="Password"
            type="password"
            @keyup.enter="login"
          >
            <a-icon
              slot="prefix"
              type="lock"
              style="color: rgba(0, 0, 0, 0.25)"
            />
          </a-input>
        </a-form-model-item>

        <a-form-model-item class="loginButton">
          <a-button type="primary" style="margin: 10px" @click="login"
            >登录</a-button
          >
          <a-button type="info" @click="resetForm">取消</a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <br />
    <!-- <a-button type="primary">Button</a-button> -->
    <!-- <button>登录</button> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      formdata: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          {
            required: true,
            message: "请输入有效用户名",
            trigger: "blur",
          },
          {
            min: 4,
            max: 12,
            message: "用户名长度必须为 4 到 12",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "请输入有效密码",
            trigger: "blur",
          },
          {
            min: 6,
            max: 12,
            message: "用户名长度必须为 6 到 12",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    resetForm() {
      this.$refs.refLoginForm.resetFields();
    },
    login() {
      this.$refs.refLoginForm.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http
            .post("login", this.formdata)
            .catch((err) => {
              this.$message.error("网络连接错误！");
            });

          if (res.status != 200) {
            this.$message.error(res.message);
            return false;
          }

          this.$message.success("登录成功");

          window.sessionStorage.setItem("token", res.token);
          this.$router.push("/index");
        } else {
          this.$message.error("用户或密码无效");
          return false;
        }
      });
    },
  },
};
</script>

<style scoped>
.container {
  background: url("https://waha-img.oss-cn-beijing.aliyuncs.com/blog/default.png")
    no-repeat;
  background-size: 100% 100%;
  height: 100vh;
}
.loginBox {
  width: 450px;
  height: 300px;
  background-color: rgb(168, 91, 91);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 9px;
}

.loginForm {
  width: 100%;
  position: absolute;
  bottom: 10%;
  padding: 0 20px;
  box-sizing: border-box;
}

.loginButton {
  display: flex;
  justify-content: flex-end;
}
</style>
