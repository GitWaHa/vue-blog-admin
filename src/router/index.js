import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Admin from '../views/Admin.vue'

import Index from '../components/admin/Index.vue'
import AddArt from '../components/admin/article/AddArt.vue'
import ArtList from '../components/admin/article/ArtList.vue'
import TagList from '../components/admin/tag/TagList.vue'
import UserList from '../components/admin/user/UserList.vue'

const path = require('path');

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    name: 'admin',
    component: Admin,
    children: [
      { path: 'index', component: Index },
      { path: 'addart', component: AddArt },
      { path: 'addart/:id', component: AddArt, props: true },
      { path: 'artlist', component: ArtList },
      { path: 'taglist', component: TagList },
      { path: 'userlist', component: UserList },
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const token = window.sessionStorage.getItem("token");

  if (!token && to.path != "/login") {
    Vue.prototype.$message.error("请先登录账号");
    return next("/login");
  }

  next();
})


export default router
