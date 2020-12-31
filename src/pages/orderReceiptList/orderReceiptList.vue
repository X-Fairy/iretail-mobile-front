<template>
	<page>
		<view slot="body">
			<view class="receptList" v-if="orderReceptList.length>0">
				<view class="recept-item" v-for="(item,index) in orderReceptList" :key="index">
					<view class="top-status">
						<view class="price">
							<text style="font-size: 24rpx;">￥</text>
							{{(item.paymentTypeName == "转入" || item.paymentTypeName == "转出" ) ? item.transferSum : item.confirmedSum | formatNum}}
						</view>
						<view class="receiptNo" @tap="copyNo(item.receiptNo)">
							<view>
								<text class="copy">复制</text>
								{{item.receiptNo}}
							</view>
							<view class="status">
								<text class="status-common status-1" v-if="item.statusCode=='1003'">审核</text>
								<text class="status-common status-2" v-else-if="item.statusCode=='1002'">提交</text>
								<text class="status-common status-3" v-else>开立</text>
							</view>
						</view>
					</view>
					<view class="detail">
						<view class="pay">
							<text class='sub'>付款方式：</text>{{item.paymentTypeName}}
						</view>
						<view class="date">
							<text class='sub'>{{item.confirmedType == '0004' ? '确认时间' : '收款时间'}}：</text>
							{{(item.confirmedType == '0004' ? item.createTime : item.bizDate) | formatDate}}
						</view>
					</view>
				</view>
			</view>
			<view class="loading-text">{{loadingText}}</view>
		</view>
	</page>
</template>

<script>
	import utils from '@/common/js/utils.js'
	export default {
		data() {
			return {
				// 收款列表
				orderReceptList: [],
				orderNo: 1,
				loadingText: '正在加载中...',
			}
		},
		onLoad(option) {
			this.orderNo = option.orderNo
			this.getOrderReceiptList();
		},
		methods: {
			// 获取意向金列表
			getOrderReceiptList() {
				this.$http({
					url: this.$api.getOrderReceiptList,
					data: {
						orderId: this.orderNo
					},
					success: (res) => {
						if (res.code == '01') {
							if (res.data.length > 0) {
								this.orderReceptList = res.data;
								this.loadingText = ''
							} else {
								this.loadingText = '暂无收款！'
							}
						} else {
							this.loadingText = res.msg
						}
					}
				})
			},
			// 复制收款单号
			copyNo(e) {
				uni.setClipboardData({
					data: e,
					success: () => {
						this.$msg("订单号已复制");
					}
				});
			}
		},
		filters: {
			formatDate: function(value) {
				return utils.formatDate(value).f1;
			},
			formatNum: function(value) {
				return utils.formatNum(value);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.receptList {
		padding: 0 0 50rpx;

		.recept-item {
			padding: 30rpx;
			border-bottom: 1rpx solid #eee;
			text-align: left;

			.top-status {
				display: flex;
				justify-content: space-between;
				align-items: center;

				.price {
					font-size: 30rpx;
					color: $red;
					font-weight: 550;
				}

				.receiptNo {
					display: flex;
					align-items: center;
					font-size: 24rpx;
					color: #737373;

					.copy {
						margin-right: 16rpx;
						color: #737373;
						border: 3rpx solid #cccccc;
						font-size: 20rpx;
						padding: 3rpx 5rpx;
					}

					.status {
						display: flex;
						align-items: center;
						margin-left: 16rpx;

						.status-common {
							display: inline;
							padding: 3rpx 5rpx;
							vertical-align: middle;
							border-radius: 7rpx;
							font-size: 20rpx;
							font-weight: 500;

							&.status-1 {
								color: #ff650c;
								border: 3rpx solid #ff650c;
							}

							&.status-2 {
								color: #ac08be;
								border: 3rpx solid #ac08be;
							}

							&.status-3 {
								color: #00784e;
								border: 3rpx solid #00784e;
							}
						}
					}
				}
			}

			.detail {
				padding: 20rpx 0;
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 24rpx;

				.sub {
					color: $subTitle;
				}
			}
		}
	}
</style>
