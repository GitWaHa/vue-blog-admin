<template>
  <a-layout-sider breakpoint="lg" v-model="collapsed">
    <div>
      <div class="log">
        <span>{{ collapsed ? `Blog` : `WaHaoo Blog` }}</span>
      </div>

      <a-button
        type="primary"
        style="margin-bottom: 16px"
        @click="toggleCollapsed"
      >
        <a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'" />
      </a-button>

      <!-- :default-open-keys="['art']" -->
      <a-menu
        :default-selected-keys="['index']"
        v-model="selectedKeys"
        mode="inline"
        theme="dark"
        :inline-collapsed="collapsed"
        @click="goPage"
      >
        <a-menu-item key="index">
          <a-icon type="dashboard" /><span>仪表盘</span>
        </a-menu-item>

        <a-sub-menu key="art">
          <span slot="title"><a-icon type="book" /><span>文章管理</span></span>

          <a-menu-item key="addart"
            ><a-icon type="file-add" /><span>写文章</span>
          </a-menu-item>

          <a-menu-item key="artlist">
            <a-icon type="database" /><span>文章列表</span>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="user">
          <span slot="title"><a-icon type="user" /><span>用户管理</span></span>

          <a-menu-item key="userlist">
            <a-icon type="team" /><span>用户列表</span>
          </a-menu-item>
        </a-sub-menu>

        <!-- <a-sub-menu key="cate">
          <span slot="title"><a-icon type="tag" /><span>分类管理</span></span>
          <a-menu-item key="catelist"
            ><a-icon type="tags" /><span>分类列表</span>
          </a-menu-item>
        </a-sub-menu> -->

        <a-sub-menu key="tag">
          <span slot="title"><a-icon type="tag" /><span>标签管理</span></span>
          <a-menu-item key="taglist"
            ><a-icon type="tags" /><span>标签列表</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </div>
  </a-layout-sider>
</template>

<script>
export default {
  data() {
    return {
      collapsed: false,
      selectedKeys: [],
    };
  },
  methods: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    goPage(item) {
      // console.log("this.selectedKeys", this.selectedKeys);
      this.selectedKeys = ["index"];
      this.$router.push("/" + item.key).catch((err) => err);
    },
  },
};
</script>

<style scoped>
.log {
  height: 32px;
  margin: 16px;
  color: aliceblue;
  background-color: rgb(66, 202, 111);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 17px;
}
</style>