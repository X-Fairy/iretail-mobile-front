<template>
	<view class="box" v-if="orderForm">
		<view class="header">{{orderForm.orderNo}}</view>
		
		<view class="content">
			<view class="detail-form">
				<view class="detail-info" v-if="!orderForm.isTB">
					<view class="detail-title">门店名称</view>
					<view class="detail-msg">{{orderForm.storeName}}</view>
				</view>
				<view class="detail-info" v-if="orderForm.salesName && !orderForm.isTB">
					<view class="detail-title">销售人员</view>
					<view class="detail-msg">{{orderForm.salesName}}</view>
				</view>
				<view class="detail-info" v-if="orderForm.customerName">
					<view class="detail-title">客户名称</view>
					<view class="detail-msg">{{orderForm.customerName}}</view>
				</view>
				<view class="detail-info">
					<view class="detail-title">{{orderForm.note ? '备注' : '送货说明'}}</view>
					<view class="detail-msg">{{orderForm.consigneeNotes}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		components: {
		},
		data() {
			return {
				orderForm: null
			};
		},
		onLoad(option) {
			uni.setNavigationBarTitle({
				title: "订单详情"
			})
			this.queryIdByOrderNo(option.orderNo, option.orderType)
		},
		methods: {
			queryIdByOrderNo(orderNo, orderType) {
				this.$http({
					url: this.$api.queryIdByOrderNo,
					data: {
						orderNo: orderNo,
						orderType: orderType
					},
					success: (res) => {
						if (res.code == "01") {
							if (res.data.orderId) {
								if (orderNo.indexOf('YP') >= 0) {
									this.getQuerySingle(res.data.orderId);
								} else {
									this.getOrderDetail(res.data.orderId, orderNo);
								}
							}
						}
					}
				})
			},
			getQuerySingle(orderId) {
				this.$http({
					url: this.$api.getQuerySingle,
					data: {
						samApplicationId: orderId
					},
					success: res => {
						if (res.code == '02') {
							this.$msg(res.message)
							if (res.message == '单据不存在,有可能已被删除') {
								setTimeout(() => {
									uni.navigateBack()
								}, 2000)
							}
							return
						}
						this.orderForm = {
							note: true,
							orderNo: res.data.samApplicationNo,
							storeName: res.data.shopName,
							consigneeNotes: res.data.notes
						}
					}
				})
			},
			getOrderDetail(orderId, orderNo) {
				this.$http({
					url: this.$api.getOrderDetail,
					data: {
						orderId: orderId
					},
					success: res => {
						if (res.code == '02') {
							this.$msg(res.message)
							if (res.message == '单据不存在,有可能已被删除') {
								setTimeout(() => {
									uni.navigateBack()
								}, 2000)
							}
							return
						}
						this.orderForm = res.bizObject
						if (orderNo.indexOf('TB') >= 0) {
							this.orderForm.isTB = true;
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #FFFFFF;
	}
	
	.box {
		.header {
			font-size: 28rpx;
			line-height: 44rpx;
			color: #737373;
			padding: 48rpx 32rpx 32rpx;
		}
		.content {
			.detail-form {
				padding-left: 32rpx;
				
				.detail-info {
					border-bottom: 2rpx solid #F2F2F2;
					padding: 32rpx 32rpx 32rpx 0;
					
					.detail-title {
						font-size: 28rpx;
						line-height: 44rpx;
						color: #737373;
					}
					
					.detail-msg {
						font-size: 32rpx;
						line-height: 48rpx;
						color: #272727;
						margin-top: 8rpx;
					}
				}
			}
		}
	}
</style>
