<template>
	<view class="long-pop" @tap.stop="closeShow">
		<view class="pop-content">
			<view class="pop-out">
				<view class="pop-shark">
					<view class="item-shark" @tap.stop="shareClick">
						<text :class="'iconfont icon-share '+icon"></text>
					</view>
					<view class="del-text">分享订单</view>
				</view>
				<view class="pop-list">
					<view class="item-del" @tap.stop="delTipApi">
						<text :class="'iconfont  del-icon '+icon"></text>
					</view>
					<view class="del-text">{{text}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "longPop",
		props: {
			popData: {
				type: Object,
				default: () => {
					return {};
				}
			},
			text: {
				type: String,
				default: ""
			},
			icon: {
				type: String,
				default: ""
			}
		},
		data() {
			return {
				tipObj: {
					// tip1001: "是否确定删除”，“是”“否”", //【开立】状态，未收款、未关联意向金的订单
					tip1002: "订单已提交，不能删除", //【提交】状态订单
					tip1003: "订单已审核，不能删除", ////【审核】状态订单
					tip1001: "订单已收款，不能删除" //【开立】状态订单，已收款或者已关联意向金
				}
			};
		},
		methods: {
			shareClick() {
				this.$emit("longClose", "share");
			},
			closeShow() {
				this.$emit("longClose", "close");
			},
			delTipApi(){
				if(this.popData.statusCode!=1001) {
					this.orderDel();
				} else {
					this.$http({
						url: this.$api.queryOrderReceipt,
						data: {
							storeId: this.popData.storeId,
							orderId: this.popData.orderId, //订单ID
							orderTypeCode: this.popData.orderTypeCode, //订单类型编码
							versionStamp: this.popData.versionStamp, //时间戳
							deleteFlag: this.popData.deleteFlag, //是否删除
							statusCode: this.popData.statusCode, //状态编码
							distributionFlag: this.popData.distributionFlag, //是否有配销单
							bizSourceId: this.popData.bizSourceId //来源单ID（如果非配销单，可为空）
						},
						success: res => {
							if (res.code == "01") {
								// 1,不能删除，0 代表能删除
								this.orderDel(res.data)
							} else {
								this.closeShow();
								this.$msg(res.message);
							}
						}
					});
				}
			},
			orderDel(data) {
				if (this.popData.statusCode == 1001 && data == 1) {
					//开立状态有意向金
					this.$msg(this.tipObj.tip1001);
					this.closeShow();
				} else if (this.popData.statusCode == 1002) {
					//提交
					this.$msg(this.tipObj.tip1002);
					this.closeShow();
				} else if (this.popData.statusCode == 1003) {
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
								this.$emit("longClose", "success");
							} else if (res.cancel) {
								this.closeShow();
							}
						}
					});
				}
			}
		},
		created() {}
	};
</script>

<style lang="scss">
	.long-pop {
		position: absolute;
		z-index: 1;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		top: 0;
		left: 0;
		text-align: center;
		color: #ffffff;
		
		.pop-content {
			width: 100%;
			height: 100%;
			margin: 0 auto;
		}
		.pop-out {
			width: 70%;
			height: 100%;
			display: flex;
			margin: 0 auto;
		}
		.pop-shark {
			flex: 6;
			// width: 100%;
			height: 100%;
			text-align: center;
			-webkit-animation: move 0.5s ease both;
			.item-shark {
				width: 96rpx;
				height: 96rpx;
				margin: 0 auto 15rpx;
				border-radius: 50%;
				background: #ffffff;
				line-height: 96rpx;
				text-align: center;
				margin-top: 55rpx;
				display: inline-block;
				
				.icon-share {
					display: inline-block;
					vertical-align: middle;
					font-size: 36rpx;
					color: #089e65;
				}
			}
			.del-text {
				width: 100%;
				font-size: 28rpx;
			}
		}
		.pop-list {
			flex: 6;
			// width: 100%;
			height: 100%;
			// position: relative;
			// position: absolute;
			-webkit-animation: move 0.5s ease both;
			overflow: hidden;
			text-align: center;
			
			.item-del {
				width: 96rpx;
				height: 96rpx;
				margin: 0 auto 15rpx;
				border-radius: 50%;
				background: #ffffff;
				line-height: 96rpx;
				text-align: center;
				margin-top: 55rpx;
				display: inline-block;
				.del-icon {
					display: inline-block;
					vertical-align: middle;
					font-size: 36rpx;
					color: #ff3c3c;
				}
			}
			
			.del-text {
				width: 100%;
				font-size: 28rpx;
				// margin-top: 8rpx;
			}
		}
	}
	
	@-webkit-keyframes move {
		0% {
			opacity: 0;
			-webkit-transform: translateY(0);
		}
		
		100% {
			opacity: 1;
			-webkit-transform: translateY(-5px);
		}
	}
</style>
