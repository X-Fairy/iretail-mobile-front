import api from '../api/index.js'
import mock from '../mock/index.js'
import msg from './msg.js'

// 请求地址
const baseUrl = api.baseUrl

const http = (opt) => {
	const token = uni.getStorageSync('token') || null
	const orgId = uni.getStorageSync('storeInfo').orgId || '';
	opt = opt || {}
	opt.url = opt.url || ''
	opt.data = opt.data || {}
	opt.method = opt.method || 'POST'

	opt.header = opt.header || {
		"Content-Type": "application/json",
		// "Content-Type": "application/x-www-form-urlencoded",
		// "REQUEST_TYPE":"AJAX_REQUEST",
		// token 配置
		"auth_token": token ? token.auth_token : '',
		"user_code": token ? token.user_code : '',
		"x-auth-token": token ? token.xAuthToken : '',
		"auth_type": "1",
		"x-auth-mobile": "1",
		"DEALER_ID": orgId,
		"org_id": orgId
		// "token": token,
		// cookie 配置
		// "cookie": "JSESSIONID=" + cookie
	}
	opt.success = opt.success || function() {}
	// 本地测试
	if (api.mock) {
		opt.success(mock)
		return false
	}
	opt.data.orgId = opt.data.orgId ? opt.data.orgId : orgId,
		uni.request({
			url: baseUrl + opt.url,
			data: opt.data,
			method: opt.method,
			header: opt.header,
			dataType: 'json',
			success: function(res) {
				uni.hideLoading();
				if (res.statusCode == 500) {
					uni.reLaunch({
						url: '/pages/login/newlogin',
					})
				}
				if (res.data.code == '000X') {
					msg(res.data.msg)
					uni.removeStorageSync('addOrderData')
					uni.removeStorageSync('newOrderData');
					uni.removeStorageSync('storeInfo')
					uni.removeStorageSync('storeList')
					uni.removeStorageSync('token')
					uni.reLaunch({
						url: '/pages/login/newlogin',
					})
				}
				if (res.data.code == '02') {
					msg(res.data.msg)
				}
				if (res.data.code == 'token011') {
					msg('请求超时')
					if (uni.getStorageSync('userInfo')) {
						setUserInfo()
					} else {
						uni.reLaunch({
							url: '/pages/login/newlogin',
						})
					}
				}
				if (res.data.code == '04') {
					uni.reLaunch({
						url: '/pages/login/newlogin',
					})
				}
				opt.success(res.data)
			},
			fail: function(res) {
				msg("网络请求失败，请稍后重试")
			}
		})
}
const setUserInfo = () => {
	uni.request({
		url: baseUrl + 'iretail/api/mobile/app/userAccountNoPassWdLogin',
		data: {
			userCode: uni.getStorageSync('userInfo').userCode,
			reLoginFlag: '1'
		},
		header: {
			'auth_type': 1,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		method: 'POST',
		success: (res) => {
			let result = {
				"auth_token": res.data.authToken,
				"user_code": res.data.usercode,
				"xAuthToken": res.data.xAuthToken,
				"auth_type": '1',
				"x-auth-mobile": "1"
			}
			uni.setStorageSync('token', result)
			setSession()
		}
	})
}
// 获取账号名和生效门店权限列表
const setSession = () => {
	const token = uni.getStorageSync('token')
	uni.request({
		url: baseUrl + 'iretail/api/mobile/app/changeSessionDealer',
		data: {
			dealerId: uni.getStorageSync('storeInfo').orgId,
		},
		header: {
			"Content-Type": "application/json",
			"auth_token": token.auth_token,
			"user_code": token.user_code,
			"x-auth-token": token.xAuthToken,
			"auth_type": "1",
			"x-auth-mobile": "1"
		},
		method: 'POST',
		success: (res) => {

		}
	})
}

export default http
