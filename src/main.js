import Vue from 'vue'
import './plugin/antui'
import './plugin/axios'
import './plugin/vue-mavon-editor'
import './assets/css/style.css'

import App from './App.vue'
import router from './router'


Vue.config.productionTip = false
Vue.prototype.$isDebug = true

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
