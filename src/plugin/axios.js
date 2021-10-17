import Vue from 'vue'
import axios from 'axios'

axios.defaults.baseURL = 'http://172.81.210.52:3000/api/v1/'
// axios.defaults.baseURL = 'http://10.21.225.213:3000/api/v1/' //本地调试


axios.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${window.sessionStorage.getItem("token")}`
    return config
})
// ERROR_TOKEN_NOT_EXIST  = 1004
// ERROR_TOKEN_RUNTIME    = 1005
// ERROR_TOKEN_WRONG      = 1006
// ERROR_TOKEN_TYPE_WRONG = 1007
axios.interceptors.response.use((response) => {
    if (response.data.status >= 1004 && response.data.status <= 1007) {
        Vue.prototype.$message.error("请先登录账号");
        router.push("/login");
    }
    return response;
})
Vue.prototype.$http = axios