<script>
	export default {
		onLaunch: function() {
			//判断微信版本是否 兼容小程序更新机制API的使用
			if (uni.canIUse('getUpdateManager')) {
				//创建 UpdateManager 实例
				const updateManager = uni.getUpdateManager();
				//检测版本更新
				updateManager.onCheckForUpdate(function(res) {
					// 请求完新版本信息的回调
					if (res.hasUpdate) {
						//监听小程序有版本更新事件
						updateManager.onUpdateReady(function() {
							//TODO 新的版本已经下载好，调用 applyUpdate 应用新版本并重启 
							uni.showModal({
								title: '更新提示',
								content: '发现新版本，是否重启应用?',
								showCancel: false,
								confirmColor: '#FF0000',
								success(res2) {
									if (res2.confirm) {
										// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
										updateManager.applyUpdate();
									}
								}
							});
						})
						updateManager.onUpdateFailed(function() {
							// 新版本下载失败
							uni.showModal({
								title: '已经有新版本喽~',
								content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开哦~',
							})
						})
					}
				})
			} else {
				//TODO 此时微信版本太低（一般而言版本都是支持的）
				uni.showModal({
					title: '溫馨提示',
					content: '当前微信版本过低，无法使用更新版本功能，请升级到最新微信版本后重试。'
				})
			}
		},
		onShow: function() {
			console.log('App Show')

		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 加载样式 */
	@import "style/index.scss";
	@import "style/icon.css";
	
	
	.loading-text {
		width: 100%;
		text-align: center;
		color: #979797;
		font-size: 24upx;
		padding: 40rpx 0;
	}
</style>
