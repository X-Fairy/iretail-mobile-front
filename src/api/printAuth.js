import msg from '@/utils/msg.js'
let goEasyModule = {}

const printOrgList = [
	'30494',  // 杭州
	// '31839', // 四川
	'32155' // 虚拟
]

const printStoreList = [
	'101559',
	'94210',
	'101514'
]

function isStoreList(storeId) {
	let tmp = printStoreList.filter(val => {
		return val == storeId
	})
	return tmp.length > 0 ? true : false
}

function isOrgList(orgId) {
	let tmp = printOrgList.filter(val => {
		return val == orgId
	})
	return tmp.length > 0 ? true : false
}

function isPrintAuth(orgId, storeId) {
	// && isStoreList(storeId)
	if (isOrgList(orgId) ) {
		// goEasyModule = new GoEasy({
		// 	// host: this.$api.goHost, 
		// 	// appkey: this.$api.appKey, 
		// 	host: "hangzhou.goeasy.io", //应用所在的区域地址: 【hangzhou.goeasy.io | singapore.goeasy.io】
		// 	appkey: "BC-49e11823135e446ebef2241bd67fc270", //替换为您的应用appkey
		// 	onConnected: () => {
		// 		console.log('连接成功！')
		// 	},
		// 	onDisconnected: () => {
		// 		console.log('连接断开！')
		// 	},
		// 	onConnectFailed: (error) => {
		// 		console.log('连接失败或错误！')
		// 	}
		// })
		return true
	} else {
		return false
	}
}

function publishMsg(data) {
	uni.request({
		url: 'https://rest-hangzhou.goeasy.io/publish',
		data: {
			appkey: 'BC-49e11823135e446ebef2241bd67fc270',
			channel: data.channel.toString(),
			content: data.content
		},
		headers: {
		  'Content-Type': 'application/x-www-form-urlencoded'
		},
		method: 'POST',
		success: (res) => {
			if(res.data.code==200){
				msg('打印请求已发送！')
			}else{
				msg('打印失败，请稍后重试！')
			}
			
		}
	})
}

export { isStoreList, isOrgList, isPrintAuth, goEasyModule, publishMsg }