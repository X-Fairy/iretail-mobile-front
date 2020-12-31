<template>
	<view class="box">
		<view class="content">
			<view class="query-list">
				<view class="query-item" v-for="(item, index) in queryUnionList" :key="index" @tap="toDetail(item)">
					<view class="left">
						<view class="queryNo">{{item.orderNo}}</view>
						<view class="queryDate" v-if="item.deliveryDate">客户交期：{{item.deliveryDate | formatDate}}</view>
					</view>
					<view class="right">
						{{item.num}}<text class="iconfont icon-Arrow-right" :style="{opacity: item.orderType ? 1 : 0}"></text>
					</view>
				</view>
			</view>
			
			<view class="loading-text">{{loadingText}}</view>
		</view>
	</view>

</template>

<script>
	import utils from '@/common/js/utils.js'
	export default {
		components: {},
		data() {
			return {
				loadingText:'正在加载中...',
				title: '',
				queryUnionList: [],
				allList: [],
				pageNum: 1,
				totalPage: 0,
				indexList: 10,
				itemCode: '',
				itemType: ''
			};
		},
		onLoad(option) {
			this.title = option.title;
			this.itemCode = option.itemCode;
			this.itemType = option.itemType;
			uni.setNavigationBarTitle({
				title: option.title
			})
			if (option.title == '销售未发') {
				// this.queryOrderItemInfo()
				this.mergeList();
			} else {
				this.queryUnion();
			}
		},
		// 上啦加载
		onReachBottom() {
			this.pageNum++;
			if (this.pageNum <= this.totalPage) {
				this.loadingText = '正在加载中...';
				setTimeout(() => {
					this.queryUnionList = this.allList.slice(0, this.pageNum * this.indexList);
				}, 300)
			} else {
				this.loadingText = "到底了！";
			}
		},
		methods: {
			queryUnion() {
				this.$http({
					url: this.$api.queryUnion,
					data: {
						suitSerialNumLabelCode: this.itemType,
						itemCode: this.itemCode,
						functionType: '1001',
						pageNum: this.pageNum,
						pageSize: 1000
					},
					success: (res) => {
						if (res.code == "01") {
							let list = [];
							res.data.forEach(item => {
								item.num = Number(item.orderLineItemQty) - Number(item.unsubQty) - Number(item.outStockQty) - Number(item.unlockQty);
							
								let isAdd = true;
								list.forEach(ele => {
									if (ele.orderNo == item.orderNo && ele.itemCode == item.itemCode) {
										ele.num += item.num
										isAdd = false;
										return
									}
								})
								
								if (isAdd) {
									list.push(item);
								}
							})
							
							let page = list.length/10, rep = /[\.]/;
							this.totalPage = rep.test(page) ? (parseInt(page) + 1) : page;
							this.allList = this.allList.concat(list)
							this.queryUnionList = this.allList.slice(0, this.indexList);
							this.loadingText = this.totalPage > 1 ? '' : '到底了';
						} else {
							this.loadingText = res.msg;
						}
					}
				})
			},
			mergeList() {
				const promise1 = this.queryOrderItemInfo();
				const promise2 = this.querySaleUndeQty();
				Promise.all([promise1, promise2]).then((values) => {
					let list = []
					values.forEach((res, index) => {
						if (res.data.length > 0) {
							res.data.forEach(item => {
								item.orderType = item.orderTypeCode ? item.orderTypeCode : '';
								item.orderNo = item.orderNo ? item.orderNo : item.samApplicationNo;
								if (index == 0) {
									item.num = item.amount - item.deliveredAmount;
								} else {
									item.num = item.sampleQuantity - item.transferedQuantity;
								}
								item.deliveryDate = item.deliveryDate ? item.deliveryDate : item.customerDemandDate;
								
								let isAdd = true;
								list.forEach(ele => {
									if (ele.orderNo == item.orderNo && ele.itemCode == item.itemCode) {
										console.log(ele.orderNo)
										ele.num += item.num
										isAdd = false;
										return
									}
								})
								
								if (isAdd) {
									list.push(item);
								}
							})
						}
					})
					let page = list.length/10, rep = /[\.]/;
					this.totalPage = rep.test(page) ? (parseInt(page) + 1) : page;
					this.allList = this.allList.concat(list)
					this.queryUnionList = this.allList.slice(0, this.indexList);
					this.loadingText = this.totalPage > 1 ? '' : '到底了';
				});
			},
			queryOrderItemInfo() {
				return new Promise((resolve, reject) => {
					this.$http({
						url: this.$api.queryOrderItemInfo,
						data: {
							suitSerialNumLabelCode: this.itemType,
							itemCode: this.itemCode,
							functionType: "1010",
							pageNum: this.pageNum,
							pageSize: 1000
						},
						success: (res) => {
							resolve(res);
						}
					})
				})
			},
			querySaleUndeQty() {
				return new Promise((resolve, reject) => {
					this.$http({
						url: this.$api.querySaleUndeQty,
						data: {
							suitSerialNumLabelCode: this.itemType,
							warehouseStatusCode: this.itemType,
							itemCode: this.itemCode,
							page: 1,
							rows: 1000
						},
						success: (res) => {
							resolve(res);
						}
					})
				})
			},
			toDetail(item) {
				if (item.orderType) {
					uni.navigateTo({
						url: './queryNoDetail?orderNo=' + item.orderNo + '&orderType=' + item.orderType + '&title=' + this.title
					});
				}
			}
		},
		filters:{
			formatDate: function(value) {
				return utils.formatDate(new Date(value)).f1;
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #F7F7F7;
	}
	
	.box {
		.content {
			.query-list {
				background: #FFFFFF;
				padding-left: 32rpx;
				.query-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					height: 148rpx;
					border-bottom: 2rpx solid #F2F2F2;
					padding-right: 24rpx;
					
					.left {
						.queryNo {
							font-size: 28rpx;
							line-height: 44rpx;
							color: #272727;
						}
						.queryDate {
							font-size: 24rpx;
							line-height: 32rpx;
							color: #737373;
							margin-top: 8rpx;
						}
					}
					
					.right {
						font-weight: 500;
						font-size: 36rpx;
						line-height: 48rpx;
						color: #272727;
						
						.iconfont {
							font-size: 32rpx;
							color: #737373;
							margin-left: 8rpx;
						}
					}
				}
			}
		}
	}
</style>
