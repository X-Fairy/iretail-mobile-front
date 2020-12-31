<template>
	<view slot="body">
		<view class="header">
			<!-- <view class="left">
				<text>{{placeholder}}</text>
				<text class="icon iconfont icon-Arrow-Down"></text>
			</view> -->
			<search-box :placeholder="placeholder" :currentIndex="currentIndex" :stateList="stateList" @selectHandle='selectHandle'
			 @inputChange="inputChange" @inputDel='inputDel' @inputText='inputText' :inputValue="paramsSearch.keyWords"></search-box>
		</view>
		<view class="storeList" v-if="currentIndex==1">
			<view class="store-item" v-for="(item,index) in storeList" :key="index" :class="parseInt(storeIndex) == index ? 'on' : ''"
			 @tap="changeStore(item,index)">
				<text :style="{color:item.storeName=='门店全局'?'#FFAB07':'#bdc3c7'}">{{item.storeName}}</text>
				<text class="icon iconfont icon-success" v-if="parseInt(storeIndex) == index"></text>
			</view>
		</view>
		<view class="storeList" v-else>
			<view class="store-item" v-for="(item,index) in orgIdList" :key="index" :class="orgId == item.dealerId ? 'on' : ''"
			 @tap="changeOrgId(item)">
				<text>{{item.dealerName}}</text>
				<text class="icon iconfont icon-success" v-if="orgId == item.dealerId"></text>
			</view>
		</view>
		<view class="loading-text">
			{{loadText}}
		</view>
		<scroll-top :scrollTop="scrollTop"></scroll-top>
	</view>
</template>

<script>
	import searchBox from '@/components/search-box/index.vue'
	export default {
		components: {
			searchBox,
		},
		data() {
			return {
				scrollTop: 0,
				loadText: '正在加载中...',
				currentIndex: 0,
				stateList: [{
					id: 0,
					label: '组织'
				}, {
					id: 1,
					label: '门店'
				}],
				placeholder: '组织',
				// 门店列表
				storeList: [],
				// 当前选中门店索引
				storeIndex: '',
				fromIndex: '',
				paramsSearch: {
					keyWords: "",
					pageNum: 1,
					pageSize: 20
				},
				totalPage: 0,
				// 显示组织
				orgIdList: [],
				// 当前选择的组织
				orgId: '',
				// 组织关键词
				vagueDealerName: '',
			};
		},
		onLoad(option) {
			this.fromIndex = option.fromIndex
			this.getAuthDataDealerList()
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		// 上啦加载
		onReachBottom() {
			if (this.currentIndex == 1) {
				this.loadText = '正在加载中...'
				this.paramsSearch.pageNum++;
				if (this.paramsSearch.pageNum <= this.totalPage) {
					this.queryStoreApi(this.paramsSearch)
				} else {
					this.loadText = '到底了！'
				}
			}

		},
		methods: {
			initIndex() {
				this.storeIndex = '';
				this.storeList.forEach((item, index) => {
					if (uni.getStorageSync('storeInfo').storeName == item.storeName && uni.getStorageSync('storeInfo').orgId == item
						.orgId) {
						this.storeIndex = index;
					}
				})
			},
			// 获取组织列表
			getAuthDataDealerList() {
				this.$http({
					url: this.$api.getAuthDataDealerList,
					data: {
						vagueDealerName: this.paramsSearch.keyWords
					},
					success: (res) => {
						if (res.code == '02') {
							this.loadText = res.msg
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
							return
						}
						if (res.code == '01') {
							this.orgIdList = res.data;
							this.loadText = this.orgIdList.length > 0 ? '到底了' : '暂无组织'
						}
						if (this.paramsSearch.keyWords == '') {
							if (this.orgIdList.length > 1) {
								this.orgIdList.forEach(ele => {
									if (ele.dealerId == uni.getStorageSync('storeInfo').orgId) {
										this.orgId = ele.dealerId;
									}
								})
								this.placeholder = '组织'
								this.currentIndex = 0
							} else {
								this.placeholder = '门店'
								this.currentIndex = 1
								this.queryStoreApi(this.paramsSearch);
								// this.storeList = uni.getStorageSync('storeList');
								// if (this.storeList.length > 1) {
								// 	let ele = {
								// 		storeName: '门店全局',
								// 		type: 'all',
								// 		orgId: this.orgId
								// 	}
								// 	this.storeList.unshift(ele)
								// }
								// this.initIndex();
							}
						}
					}
				})
			},
			// 门店组织切换
			selectHandle(e) {
				this.currentIndex = e.id;
				this.placeholder = this.currentIndex == 0 ? '组织' : '门店'
				this.orgId = uni.getStorageSync('storeInfo').orgId
				this.inputDel()
			},
			// 关键词搜索
			inputChange(e) {
				this.loadText = '正在加载中...'
				this.paramsSearch.keyWords = e;
				this.paramsSearch.pageNum = 1;
				if (this.placeholder == '门店') {
					this.storeList = []
					this.queryStoreApi(this.paramsSearch);
				} else {
					this.getAuthDataDealerList()
				}
			},
			// 输入时
			inputText(e) {
				this.paramsSearch.keyWords = e;

			},
			// 清空input
			inputDel() {
				this.loadText = '正在加载中'
				this.paramsSearch.keyWords = '';
				this.paramsSearch.pageNum = 1;
				this.storeList = [];
				this.orgIdList = []
				this.paramsSearch.orgId = this.orgId
				if (this.placeholder == '门店') {
					this.queryStoreApi(this.paramsSearch);
				} else {
					this.getAuthDataDealerList()
				}

			},
			//门店搜索
			queryStoreApi(data) {
				this.$http({
					url: this.$api.queryStoreListByPage,
					data: data,
					success: (res) => {
						if (res.code == '01') {
							this.storeList = this.storeList.concat(res.data);
							if (res.totalPage == 0) {
								this.loadText = '暂无门店'
							} else if (res.totalPage == 1) {
								this.loadText = '到底了'
							}
							this.totalPage = res.totalPage
							if (this.storeList.length > 1 && this.storeList[0].storeName != '门店全局') {
								let ele = {
									storeName: '门店全局',
									type: 'all',
									orgId: data.orgId
								}
								this.storeList.unshift(ele)
							}
							this.initIndex();
						} else {
							this.loadText = res.msg
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
						}
					}
				})
			},
			// 切换门店
			changeStore(e, index) {
				if (e.type) {
					uni.showModal({
						title: '',
						content: '全选后可查看所有门店订单，但会影响开单、收款、查门店库存等功能！是否确定全选',
						cancelText: "否",
						confirmText: "是",
						success: res => {
							if (res.confirm) {
								this.changeSession(e, index)
							}
						}
					})
					return
				} else {
					this.changeSession(e, index)
				}

			},
			changeSession(e, index) {
				uni.showLoading({
					title: '切换中'
				})
				this.dealerId = e.orgId;
				this.$http({
					url: this.$api.changeSessionDealer,
					data: {
						'orgId': this.dealerId
					},
					success: (res) => {
						if (res.code == '01') {
							this.storeIndex = index;
							let storeInfo = {}
							if (e.type == 'all') {
								storeInfo = e
							} else {
								storeInfo = {
									'storeName': this.storeList[this.storeIndex].storeName,
									'storeCode': this.storeList[this.storeIndex].storeCode,
									'storeId': this.storeList[this.storeIndex].storeId,
									'orgId': this.storeList[this.storeIndex].orgId
								}
							}

							uni.removeStorageSync('addOrderData')
							uni.removeStorageSync('newOrderData')
							if (uni.getStorageSync('storeInfo').storeName != e.storeName) {
								this.getOrgParams();
							}
							uni.setStorageSync('storeInfo', storeInfo)
							if (this.fromIndex) {
								uni.switchTab({
									url: '../../../index/index'
								})
							} else {
								uni.switchTab({
									url: '../me'
								})
							}
						} else {
							uni.showToast({
								title: res.msg,
								icon: 'none'
							})
						}
					}
				})
			},
			// 切换组织
			changeOrgId(e) {
				this.orgId = e.dealerId;
				this.loadText = '正在加载中...'
				this.paramsSearch = {
					keyWords: "",
					pageNum: 1,
					pageSize: 20,
					orgId: this.orgId
				}
				this.currentIndex = 1
				this.placeholder = '门店'
				this.queryStoreApi(this.paramsSearch)

			},
			// 查询组织参数
			getOrgParams() {
				this.$http({
					url: this.$api.getOrgParams,
					success: res => {
						let orgParams = res.data;
						uni.setStorageSync('orgParams', orgParams)
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #F6F6F8;
	}

	.header {
		padding: 0 32rpx;
		background: #FFFFFF;
		// display: flex;
		position: fixed;
		width: 100%;

		.left {
			display: flex;
			justify-content: flex-end;
			background-color: $gray;
			align-items: center;
			padding: 0 16rpx;
			width: 20%;
			font-size: 24rpx;
			border-top-left-radius: 8rpx;

			.icon-Arrow-Down {
				padding: 0 10rpx;
				border-right: 2rpx solid #ddd;
				font-size: 32rpx;
			}
		}
	}

	.storeList {
		padding: 100rpx 20rpx 0;
		background-color: #FFFFFF;

		.store-item {
			padding: 30rpx;
			border-bottom: 1rpx solid #eee;
			color: $input-placeholder-color;
			font-size: 28rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;

			&.on {
				color: $red;
			}

			.icon-success {
				font-size: 40rpx;
				color: $red;
			}
		}
	}
</style>
