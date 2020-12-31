<template>
	<page>
		<view slot="body" >
			<view class="recept-detail" v-if="paymentTypeName != '转入' && paymentTypeName != '转出'">
				<view class="recept-detail-header">
					<view class="recept-detail-price">{{orderDetail.realSum | formatNum}}<text>元</text></view>
					<view class="recept-detail-date">{{confirmedType == '0004' ? '确认日期' : '收款日期'}}：<text v-if="paymentValue">{{(paymentValue == "意向金" ? orderDetail.createTime : orderDetail.bizDate) | formatDate}}</text></view>
				</view>
				
				<view class="recept-detail-list">
					<view class="detail-item">
						<view class="item-title">{{confirmedType == '0004' ? '确认' : '收款'}}单号：</view>
						<view class="item-cont" @tap="copyNo">{{receiptNo}}
						<text class="copy">复制</text>
						</view>
					</view>
					<view class="detail-item">
						<view class="item-title">收款类型：</view>
						<view class="item-cont">{{dealerSettle}}</view>
					</view>
					<view class="detail-item">
						<view class="item-title">收款性质：</view>
						<view class="item-cont">{{paymentValue}}</view>
					</view>
					<view class="detail-item">
						<view class="item-title">收款方式：</view>
						<view class="item-cont">{{orderDetail.paymentTypeName}}</view>
					</view>
					<view class="detail-item" v-if="orderDetail.paymentNo">
						<view class="item-title">缴款单号：</view>
						<view class="item-cont">{{orderDetail.paymentNo}}</view>
					</view>
					<view class="detail-item">
						<view class="item-title">客户卡号：</view>
						<view class="item-cont">{{orderDetail.customerBankAccountNo}}</view>
					</view>
					<view class="detail-item">
						<view class="item-title">备注信息：</view>
						<view class="item-cont">{{orderDetail.notes ? orderDetail.notes : '暂无备注'}}</view>
					</view>
					<view class="detail-item">
						<view class="item-title">附<text style="opacity: 0;">空白</text>件：</view>
						<view class="item-cont" :class="picList.length > 0 ? 'attachment' : ''">
							<tui-upload :value="picList" :params="uploadParams" :forbidDel="true" :forbidAdd="true"></tui-upload>
							<view v-if="picList.length == 0">暂无附件</view>
						</view>
					</view>
				</view>
			</view>
			
			<view class="recept-detail" v-else>
				<view class="recept-detail-header">
					<view class="recept-detail-price">{{orderDetail.realSum | formatNum}}<text>元</text><text class="recept-detail-name">{{paymentTypeName}}</text></view>
					<view class="recept-detail-date">转移日期：<text>{{orderDetail.bizDate | formatDate}}</text></view>
				</view>
				
				<view class="recept-detail-list width186">
					<view class="detail-item">
						<view class="item-title">转移单号：</view>
						<view class="item-cont" @tap="copyNo">{{receiptNo}}
						<text class="copy">复制</text>						
						</view>
					</view>
					<view class="detail-item">
						<view class="item-title">{{paymentTypeName == '转入' ? '转出' : paymentTypeName == '转出' ? '转入' : ''}}订单号：</view>
						<view class="item-cont">{{paymentTypeName == '转入' ? outOrdSalNo : paymentTypeName == '转出' ? inOrdSalNo : ''}}</view>
					</view>
					<view class="detail-item">
						<view class="item-title">{{paymentTypeName == '转入' ? '转出' : paymentTypeName == '转出' ? '转入' : ''}}订单顾客：</view>
						<view class="item-cont">{{orderDetail.customerName}}</view>
					</view>
					<view class="detail-item">
						<view class="item-title">备注信息：</view>
						<view class="item-cont">{{orderDetail.notes ? orderDetail.notes : '暂无备注'}}</view>
					</view>
				</view>
			</view>
		</view>	
	</page>
</template>

<script>
	import utils from '@/common/js/utils.js'
	import h5Copy from '@/pages/tabbar/order/junyi-h5-copy.js'
	export default {
		components: {},
		data() {
			return {
				// 上传图片参数
				uploadParams: {
					mainType: 'salorder',
					subType: ''
				},
				// 附件列表
				picList: [],
				// 收款单详情
				orderDetail: {},
				// 收款类型
				dealerSettle: '',
				// 收款性质
				paymentValue: '',
				// 收款性质id
				confirmedType: '',
				// 收款方式
				paymentTypeName: '',
				// 收款单号
				receiptNo: '',
				// 转出单号
				outOrdSalNo: '',
				// 转入单号
				inOrdSalNo: '',
			};
		},
		onLoad(option) {
			// 收款单详情
			if (option.receiptId) {
				this.paymentTypeName = option.paymentTypeName ? option.paymentTypeName : '';
				this.receiptNo = option.receiptNo ? option.receiptNo : '';
				this.outOrdSalNo = option.outOrdSalNo ? option.outOrdSalNo : '';
				this.inOrdSalNo = option.inOrdSalNo ? option.inOrdSalNo : '';
				this.confirmedType = option.confirmedType ? option.confirmedType : '';
				this.getReceiptAsDetail(option.receiptId, option.confirmedType);
			}
		},
		methods: {
			// 查询收款详情
			getReceiptAsDetail(id, confirmedType) {
				this.$http({
					url: this.$api.receiptAsDetail,
					data: {
						receiptId: id,
						confirmTypeCode: confirmedType
					},
					success: (res) => {
						if (res.code == '01') {
							this.orderDetail = res.bizObject;
							// 查询附件列表
							if (this.orderDetail.attachmentId) {
								this.picList = [];
								this.getAttachmentList(this.orderDetail.attachmentId);
							}
							this.getreceiptTypeList();
							this.paymentNature();
						} else {
							this.$msg(res.message)
						}
					}
				})
			},
			// 查询附件列表
			getAttachmentList(id) {
				this.$http({
					url: this.$api.getAttachmentList,
					data: {
						fileId: id
					},
					success: res => {
						this.picList = res.data
					}
				})
			},
			// 收款类型列表
			getreceiptTypeList() {
				this.$http({
					url: this.$api.receiptTypeList,
					success: (res) => {
						if (res.data) {
							res.data.forEach(item => {
								if (item.code == this.orderDetail.typeCode) {
									this.dealerSettle = item.value
								}
							})
						}
					}
				})
			},
			// 获取收款性质
			paymentNature() {
				this.$http({
					url: this.$api.paymentNature,
					success: (res) => {
						if (res.data) {
							res.data.forEach(item => {
								if (item.value == this.orderDetail.paymentNature) {
									this.paymentValue = item.label
								}
							})
						}
					}
				})
			},
			// 复制收款单号
			copyNo() {
				// #ifndef H5
				uni.setClipboardData({
					data: this.receiptNo,
					success: () => {
						this.$msg("订单号已复制");
					}
				});
				// #endif
				// #ifdef H5
				const result = h5Copy(this.receiptNo)
				if (result === false) {
					this.$msg("此浏览器不支持此功能");
				} else {
					this.$msg("订单号已复制");
				}
				// #endif
			},
		},
		filters:{
			formatDate: function(value) {
				return utils.formatDate(value).f1;
			},
			formatNum: function(value) {
				return utils.formatNum(value);
			}
		}
	}
</script>

<style lang="scss">
	.recept-detail {
		padding: 40rpx 32rpx 0;
		.recept-detail-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;
			border-bottom: 1rpx solid #F2F2F2;
			padding-bottom: 48rpx;
			margin-bottom: 48rpx;
			.recept-detail-price {
				font-weight: 500;
				font-size: 64rpx;
				line-height: 76rpx;
				color: #FF5C00;
				text {
					font-size: 28rpx;
					line-height: 22px;
				}
				.recept-detail-name {
					display: inline-block;
					width: 48rpx;
					height: 32rpx;
					line-height: 32rpx;
					font-size: 20rpx;
					color: #737373;
					text-align: center;
					border: 1rpx solid #B2B2B2;
					border-radius: 4rpx;
					margin-left: 16rpx;
				}
			}
			.recept-detail-date {
				font-size: 28rpx;
				line-height: 44rpx;
				color: #737373;
			}
		}
		
		.recept-detail-list {
			&.width186 {
				.item-title {
					width: 196rpx !important;
				}
			}
			.detail-item {
				display: flex;
				font-size: 28rpx;
				line-height: 44rpx;
				color: #272727;
				margin-top: 32rpx;
				.item-title {
					width: 140rpx;
				}
				.item-cont {
					flex: 1;
					word-break: break-all;
					.copy{
						margin-left: 16rpx;
						color: #737373;
						border: 3rpx solid #cccccc;
						font-size: 20rpx;
						padding: 3rpx 5rpx;

					}
				}
				&:first-child {
					margin-top: 0;
				}
			}
		}
	}
	
	.place {
		width: 100%;
		height: 100rpx;
		background-color: $page-bgcolor;
	}

	.place {
		height: 120rpx;
		background-color: #fff;
	}
</style>
