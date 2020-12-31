<template>
	<view class="btn-pop" :class="popupClass" @touchmove.stop.prevent="discard">
		<view class="btn-mask" @tap="closeShow"></view>
		<view class="pop-content" :class="[popupClass, isLeft ? 'left' : 'right']" :style="{bottom: bottom + 'rpx'}">
			<view class="pop-item" hover-class="hoverl" @tap.stop="moneyClick">
				<view class="item-icon">
					<text class="iconfont icon-Money"></text>
				</view>
				<view class="text-item">关联意向金</view>
			</view>
			<!-- <view class="pop-item" hover-class="hoverl" v-if="isModifyBtn" @tap.stop="shareClick">
				<view class="item-icon">
					<text class="icon iconfont icon-share"></text>
				</view>
				<view class="text-item">修改订单</view>
			</view> -->
			<view class="pop-item" hover-class="hoverl" @tap.stop="shareClick">
				<view class="item-icon">
					<text class="iconfont icon-share"></text>
				</view>
				<view class="text-item">分享订单</view>
			</view>
			<!-- #ifndef H5 -->
			<view class="pop-item" hover-class="hoverl" @tap.stop="orderPrint" v-if="printAuth">
				<view class="item-icon">
					<text class="iconfont icon-printer"></text>
				</view>
				<view class="text-item">打印订单</view>
			</view>
			<!-- #endif -->
			<view class="pop-item" hover-class="hoverl" v-if="isPatchBtn" @tap.stop="patchClick">
				<view class="item-icon">
					<text class="iconfont icon-Plus-Circle-Stroke"></text>
				</view>
				<view class="text-item">申请补丁</view>
			</view>
			<view class="pop-item" hover-class="hoverl" v-if="isDelBtn" @tap.stop="orderDel">
				<view class="item-icon">
					<text class="iconfont Trash"></text>
				</view>
				<view class="text-item">删除订单</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		isPrintAuth,
		goEasyModule,
		publishMsg
	} from '@/api/printAuth.js'
	export default {
		name: "btnPop",
		props: {
			orderForm: {
				type: Object,
				default: () => {
					return {};
				}
			},
			isPatchBtn: {
				type: Boolean,
				default: false
			},
			isDelBtn: {
				type: Boolean,
				default: false
			},
			isLeft: {
				type: Boolean,
				default: true
			},
			bottom: {
				type: Number,
				default: 160
			}
		},
		data() {
			return {
				printAuth: false,
				popupClass: '',
				tipObj: {
					// tip1001: "是否确定删除”，“是”“否”", //【开立】状态，未收款、未关联意向金的订单
					tip1002: "订单已提交，不能删除", //【提交】状态订单
					tip1003: "订单已审核，不能删除", ////【审核】状态订单
					tip1001: "订单已收款，不能删除" //【开立】状态订单，已收款或者已关联意向金
				}
			};
		},
		methods: {
			// 意向金
			moneyClick() {
				if (!this.orderForm.customerCellphoneNum) {
					this.$msg('请先填写手机号')
					return false
				}
				this.isorderOpen = false
				this.popupClass = '';

				this.$toPage('/pages/chooseReceiptList/chooseReceiptList?orderId=' + this.orderForm.orderId)
			},
			shareClick() {
				this.$emit("btnPopClose", "share");
			},
			patchClick() {
				this.$emit("btnPopClose", "patch");
			},
			popupShow() {
				this.popupClass = 'show';
			},
			closeShow() {
				this.popupClass = '';
			},
			orderDel() {
				if (this.orderForm.statusCode != '1001') {
					this.orderDelResult(1);
				} else {
					this.$http({
						url: this.$api.queryOrderReceipt,
						data: this.orderForm,
						success: res => {
							if (res.code == "01") {
								// 1,不能删除，0 代表能删除
								this.orderDelResult(res.data)
							} else {
								this.$msg(res.message);
								this.closeShow();
							}
						}
					});
				}
			},
			orderDelResult(result) {
				if (this.orderForm.statusCode == '1001' && result == 1) {
					//开立状态有意向金
					this.$msg(this.tipObj.tip1001);
					this.closeShow();
				} else if (this.orderForm.statusCode == '1002') {
					//提交
					this.$msg(this.tipObj.tip1002);
					this.closeShow();
				} else if (this.orderForm.statusCode == '1003') {
					//审核
					this.$msg(this.tipObj.tip1003);
					this.closeShow();
				} else {
					uni.showModal({
						title: "是否确定删除",
						cancelText: "否",
						confirmText: "是",
						success: res => {
							if (res.confirm) {
								this.$emit("btnPopClose", "success");
							} else if (res.cancel) {
								this.closeShow();
							}
						}
					});
				}
			},
			// 打印订单
			orderPrint() {
				if (!uni.getStorageSync('printCode')) {
					uni.showModal({
						title: '提示',
						content: '请先到【我的】页面配置打印机',
						cancelText: '取消',
						confirmText: '确定',
						success: res => {
							if (res.confirm) {
								uni.navigateTo({
									url: '../../pagesB/setPrint/setPrint'
								})
							}
						}
					});
					return
				}
				uni.showModal({
					title: "是否打印当前订单？",
					cancelText: "否",
					confirmText: "是",
					success: res => {
						if (res.confirm) {
							let timeStr = (new Date()).valueOf().toString().substr(-4, 4)
							let params = {
								printTemplateType: this.orderForm.printTemplateType,
								orgId: uni.getStorageSync('storeInfo').orgId, //组织id
								orderTypeCode: this.orderForm.orderTypeCode, //订单类型编码(必传)
								printUserCode: uni.getStorageSync('userInfo').personCode, //登录人账号
								printUserName: uni.getStorageSync('userInfo').personName, //登录人姓名
								phoneNumber: uni.getStorageSync('userInfo').personPhone, //电话(必传)
								storeId: uni.getStorageSync('storeInfo').storeId, //门店id(必传测试写死=0) uni.getStorageSync('storeInfo').storeId
								fileName: this.orderForm.orderNo + '-' + timeStr, //文件名
								orderId: this.orderForm.orderId, //单据id(必传)
							}
							// console.log(JSON.stringify(params))
							publishMsg({
								channel: uni.getStorageSync('printCode').code, //替换为您自己的channel
								content: JSON.stringify(params)
							})
							this.getPrintTimes()
							// goEasyModule.publish({
							// 	channel: uni.getStorageSync('printCode') ? uni.getStorageSync('printCode') : this.orderForm.storeId, //替换为您自己的channel
							// 	message: JSON.stringify(params) //替换为您想要发送的消息内容
							// })


							// this.$http({
							// 	url: this.$api.orderPrint,
							// 	data: {
							// 		orgId: uni.getStorageSync('storeInfo').orgId, //组织id
							// 		orderTypeCode: this.orderForm.orderTypeCode, //订单类型编码(必传)
							// 		printUserCode: uni.getStorageSync('userInfo').personCode, //登录人账号
							// 		printUserName: uni.getStorageSync('userInfo').personName, //登录人姓名
							// 		phoneNumber: uni.getStorageSync('userInfo').personPhone, //电话(必传)
							// 		storeId: 0, //门店id(必传测试写死=0) uni.getStorageSync('storeInfo').storeId
							// 		fileName: this.orderForm.orderNo, //文件名
							// 		orderId: this.orderForm.orderId, //单据id(必传)
							// 	},
							// 	success: res => {
							// 		if (res.code == '01') {
							// 			this.$msg('打印成功')
							// 		} else {
							// 			this.$msg(res.msg)
							// 		}
							// 		this.popupClass = "";
							// 	}
							// })
						}
					}
				});				
			},
			// 获取打印次数
			getPrintTimes() {
				this.$http({
					url: this.$api.modifyOrderPrintTimes,
					data: {
						orderId: this.orderForm.orderId
					},
					success: (res) => {
			
					}
				})
			},
			discard() {}
		},
		created() {
			this.printAuth = isPrintAuth(uni.getStorageSync('storeInfo').orgId, uni.getStorageSync('storeInfo').storeId)
			// console.log(this.printAuth)
		}
	};
</script>

<style lang="scss">
	.btn-pop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 999;
		visibility: hidden;

		&.show {
			visibility: visible;
		}

		.btn-mask {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}

		.pop-content {
			position: absolute;
			width: 320rpx;
			background: #5A5A5A;
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
			border-radius: 8rpx;
			transition: all 0.2s ease-in-out;
			z-index: 10;

			&.left {
				left: -350rpx;

				&.show {
					left: 24rpx;
				}
			}

			&.right {
				right: -350rpx;

				&.show {
					right: 24rpx;
				}
			}

			.pop-item {
				display: flex;
				width: 100%;
				height: 100rpx;
				align-items: center;
				font-weight: 500;
				font-size: 28rpx;
				color: #FFFFFF;
				border-bottom: 2rpx solid #737373;
				padding-left: 32rpx;

				&:first-child {
					border-radius: 8rpx 8rpx 0 0;
				}

				&:last-child {
					border-radius: 0 0 8rpx 8rpx;
				}

				&.hoverl {
					background: #7B7B7B;
				}

				&:last-child {
					border-bottom: 0;
				}

				.item-icon {
					margin-right: 16rpx;

					.icon {
						font-size: 32rpx;
					}
				}

				.text-item {
					font-weight: 500;
					font-size: 28rpx;
				}
			}
		}
	}
</style>
