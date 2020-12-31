<template>
	<page :customHeader='true' headerBG='#fff'>
		<view slot="header" @tap="toStore" class="header-title">
			<view class="headerTitle">
				{{headerTitle}}
			</view>
		</view>
		<view slot="body" style="padding-top: 44rpx;">
			<!-- 功能区域 -->
			<view class="function-bar">
				<function-box :list="fnList"></function-box>
			</view>
			<view class="search-bar">
				<text class="search-bar-title">热销产品</text>
				<search-box style="flex: 1;" @inputText="inputText" @inputChange="inputChange" placeholder="货号" @inputDel='inputDel'></search-box>
			</view>
			<!-- <button type="default" @tap="toPage">H5跳转</button> -->
			<!-- 商品区域 -->
			<view class="prod-bar">
				<view class="prod-list">
					<good-list :list="prodList" @toDetail="toDetail" type="index"></good-list>
				</view>
			</view>
			
			<view class="loading-text">{{loadingText}}</view>
			<scroll-top :scrollTop="scrollTop"></scroll-top>
		</view>
	</page>
</template>

<script>
	import searchBox from '@/components/search-box/index.vue'
	import functionBox from '@/components/function-box/index.vue'
	import goodList from '@/components/good-list/index.vue'
	import {
		getTmpUrl
	} from '@/common/js/tools.js'
	getTmpUrl('https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/c2fd08ecff684d2e894275e49c2531ac.png')
	getTmpUrl("https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/ee37ea9e1eee4c929e9998e2ffb0ab8b.png");
	getTmpUrl("https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/eedfc2f9bd8846d2a3a72ae42637aee9.png");
	getTmpUrl("https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/b3aa2d609be243af90eab4b6fe7eedbe.png");

	export default {
		components: {
			searchBox,
			functionBox,
			goodList
		},
		data() {
			return {
				scrollTop: 0,
				// 功能列表
				fnList: [{
						bg: '#FED1CF',
						color: '#D05349',
						url: '/pages/mergeDraft/mergeDraft',
						bgImg: require('@/static/img/index/home_indent.png'),
						label: '开单',
						txt: '新的开立订单',
						type: 0
					},
					{
						bg: '#FFE0B7',
						color: '#B58536',
						url: '/pages/collectionDetail/collectionDetail',
						bgImg: require('@/static/img/index/home_draft.png'),
						label: '收款',
						txt: '意向客户定金收取',
						type: 0
					},
					{
						bg: '#D8E6F8',
						color: '#4C74A6',
						url: '/pages/indexOrder/indexOrder?selfTag=home',
						bgImg: require('@/static/img/index/home_inventory.png'),
						label: '查订单',
						txt: '订单信息查询',
						type: 0
					},
					{
						bg: '#EBEBEB',
						color: '#5C5D64',
						url: '/pagesA/stock/mergestock',
						bgImg: require('@/static/img/index/home_earnest.png'),
						label: '查商品',
						txt: '上下市、库存信息查询',
						type: 0
					}
				],

				// 商品列表
				prodList: [],
				// 商品列表参数storeId: uni.getStorageSync('storeInfo').storeId,
				prodParams: {
					keyWords: '',
					pageNum: 1,
					pageSize: 10,
					storeCode: uni.getStorageSync('storeInfo').storeCode
				},
				// 总页数
				totalPage: 1,
				loadingText: '正在加载中...',
				headerTitle: '',
				timer: 0
			}
		},
		onLoad(option) {
			if (!option.jumpLogin) {
				this.updateUser()
			}
			this.search()
		},
		//下拉刷新，需要自己在page.json文件中配置开启页面下拉刷新 "enablePullDownRefresh": true
		onPullDownRefresh() {
			if (this.prodParams.keyWords == "") {
				this.loadingText = '正在加载中...'
				this.prodList = [];
				this.prodParams = {
					keyWords: '',
					pageNum: 1,
					storeCode: uni.getStorageSync('storeInfo').storeCode
				};
				this.getProductNoList();

			}
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;

		},
		onShow() {
			if (this.headerTitle != uni.getStorageSync('storeInfo').storeName && this.headerTitle) {
				this.search()
			}
			this.headerTitle = uni.getStorageSync('storeInfo').storeName;
		},
		// 上啦加载
		onReachBottom() {
			this.prodParams.pageNum++;
			if (this.prodParams.pageNum <= this.totalPage) {
				this.getProductNoList()
			} else {
				this.loadingText = '到底了！'
			}
		},
		methods: {
			toPage() {
				this.$toPage('/pages/webViwe/webViwe?url=' + encodeURIComponent(
					'https://cschat.antcloud.com.cn/index.htm?tntInstId=4Ch_IQbR&scene=SCE00038833#/'))
			},
			// 订阅消息
			btnClick() {
				uni.requestSubscribeMessage({
					tmplIds: ['zo9IWk6_J5RgJSjncJ2fguT9Y7dSwXpRGaZoZ63UNB4'],
					success: (res) => {
						if (res['zo9IWk6_J5RgJSjncJ2fguT9Y7dSwXpRGaZoZ63UNB4'] == 'accept') { //accept--用户同意 reject--用户拒绝 ban--微信后台封禁,可不管
							// 获取access_token（仅为测试，正常需要在后台获取）
							wx.request({
								url: 'https://api.weixin.qq.com/cgi-bin/token', //获取access_token的地址，微信定义的
								data: {
									grant_type: 'client_credential', //写死的
									appid: 'wxb8f7cccf1854bee1', //小程序的appId(填写自己的)
									secret: '7d843def03908377594c4cfa5fd224f3' //小程序密钥,
								},
								success: (req) => {
									let access_token = req.data.access_token;
									wx.login({
										success: res => {
											if (res.code) {
												// 调用下发接口前需要得到用户的openid
												wx.request({
													url: 'https://api.weixin.qq.com/sns/jscode2session',
													data: {
														appid: 'wxb8f7cccf1854bee1',
														secret: '7d843def03908377594c4cfa5fd224f3',
														js_code: res.code, //登录时获取的code
														grant_type: "authorization_code", //授权类型，写死的
													},
													success: res => {
														let openid = res.data.openid;
														wx.request({
															url: 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' +
																access_token,
															method: "POST",
															data: JSON.stringify({
																touser: 'oZgS65S55VDr8wKQp25GGkPWFJps', //当前用户的openid
																template_id: "zo9IWk6_J5RgJSjncJ2fguT9Y7dSwXpRGaZoZ63UNB4", //需要下发的模板ID，如模板不多可让后台直接配置写死，多的话就通过微信获取模板列表接口查询模板
																page: "pages/index/index", //点击小程序订阅消息跳转的页面，可携带参数
																data: {
																	"thing5": {
																		"value": '资源上新通知'
																	},
																	"date4": {
																		"value": '2020-09-27 14:52'
																	}
																}
															}),
															success: res => {
																console.log(res)
															}
														})
													}
												})
											}
										}
									})
								}
							})
						} else {
							uni.showModal({
								title: '温馨提示',
								content: '您已拒绝授权，将无法在微信中收到版本通知！',
								showCancel: false,
								success: res => {
									if (res.confirm) {

									}
								}
							})
						}
					}
				})

			},
			inputText(key) {
				this.prodParams.keyWords = key;
			},
			// 搜索回调
			inputChange: function(key) {
				this.prodParams.keyWords = key;
				setTimeout(() => {
					if (key.length > 0) {
						this.search('all')
					} else {
						this.search()
					}
				}, 0)
			},
			// 清空input
			inputDel() {
				this.prodParams.keyWords = '';
				this.search()
			},
			// 搜索
			search(type) {
				this.loadingText = '正在加载中...'
				this.prodParams.pageNum = 1;
				this.prodList = [];
				if (type == 'all') {
					this.getCandidates()
				} else {
					this.getProductNoList()
				}
			},
			// 商品图库列表查询
			getCandidates() {
				this.prodParams.storeCode = ''
				this.$http({
					url: this.$api.getImageList,
					data: this.prodParams,
					success: (res) => {
						if (res.data.length > 0) {
							this.prodList = this.prodList.concat(res.data);
							if (res.totalPage == 1) {
								this.loadingText = '到底了！'
							}
						} else {
							this.loadingText = '暂无商品！'
						}
						this.totalPage = res.totalPage
						if (res.code == 'token011') {
							this.timer = this.timer + 1
							if (this.timer < 5) {
								this.$nextTick(() => {
									// this.getCandidates()
								})
							}
						}
					}
				})
			},
			// 门店货号列表
			getProductNoList() {
				this.prodParams.storeCode = uni.getStorageSync('storeInfo').storeCode
				this.$http({
					url: this.$api.getProductNoList,
					data: this.prodParams,
					success: (res) => {
						if (res.data) {
							this.prodList = this.prodList.concat(res.data);
						} else {
							this.loadingText = '暂无商品！'
						}
						if (this.prodList.length == 0) {
							this.loadingText = '暂无商品！'
						}
						this.totalPage = res.totalPage
					}
				})
			},

			// 跳转详情
			toDetail(e) {
				let content = ''
				let title = ''
				if (e.Title) {
					title = e.Title
				} else {
					title = e.productNo
				}
				if (e.Content) {
					content = e.Content
				}
				if (content) {
					uni.navigateTo({
						url: '../productDetail/productDetail?title=' + title + '&content=' + encodeURIComponent(JSON.stringify(e)) +
							'&type=index'
					})
				} else {
					e.tkImageId = e.Id
					e.itemCode = e.Num
					e.Title = e.Title
					uni.navigateTo({
						url: '../productDetail/productDetail?product=' + encodeURIComponent(JSON.stringify(e)) + '&type=index'
					})
				}
			},
			// 切换门店
			toStore() {
				uni.navigateTo({
					url: '../tabbar/user/store/store?fromIndex=true'
				})
			},
			// 更新用户信息
			updateUser() {
				if (uni.getStorageSync('userInfo')) {
					uni.request({
						url: this.$api.baseUrl + 'iretail/api/mobile/app/userAccountNoPassWdLogin',
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
							this.setSession()
						}
					})
				}
			},
			setSession() {
				const token = uni.getStorageSync('token')
				uni.request({
					url: this.$api.baseUrl + 'iretail/api/mobile/app/changeSessionDealer',
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
		}
	}
</script>

<style lang="scss" scoped>
	.page-footer {
		z-index: 1 !important;

		.footerPlace {
			height: 0 !important;
		}
	}

	page {
		background-color: $page-bgcolor;
	}

	.place {
		width: 100%;
		height: 20rpx;
		background-color: $page-bgcolor;
	}

	.headerTitle {
		line-height: 44px;
		font-size: 28rpx;
		padding-left: 30rpx;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	.function-bar {
		padding: 0 32rpx;
	}

	.search-bar {
		width: 100%;
		// width: 750rpx;
		padding: 22rpx 32rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.search-bar-title {
			font-size: 40rpx;
			font-weight: 500;
			color: #272727;
			margin-right: 32rpx;
		}


	}

	.prod-bar {
		.prod-list {
			padding: 0 32rpx;
		}
	}
</style>
