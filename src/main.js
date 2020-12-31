import Vue from 'vue'
import App from './App'

// 页面架构
import page from "@/common/page/index.vue";
Vue.component('page', page)

// 请求配置
import http from '@/utils/request.js'
Vue.prototype.$http = http

// api 配置
import api from '@/api/index.js'
Vue.prototype.$api = api

// vuex 配置
import store from './store'
Vue.prototype.$store = store

// 跳转路由
import { toPage, toTab, closedTo } from './utils/toPage.js'
Vue.prototype.$toPage = toPage
Vue.prototype.$toTab = toTab
Vue.prototype.$closedTo = closedTo

// 提示框
import msg from './utils/msg.js'
Vue.prototype.$msg = msg

// 校验方法
import validate from './utils/validate.js'
Vue.prototype.$validate = validate

// 校验规则
import rules from './common/rules/index.js'
Vue.prototype.$rules = rules

// 工具方法
import utils from './utils/utils.js'
Vue.prototype.$utils = utils


import scrollTop from "./components/scroll-top/scroll-top.vue"
Vue.component('scroll-top',scrollTop)

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
