<template>
	<view>
		<view class="popup" :class="popupClass" @touchmove.stop.prevent="discard" @tap="hidepopup">
			<!-- 遮罩层 -->
			<view class="mask"></view>
			<view class="layer" @tap.stop="discard">
				<view class="wx">
					<view class="title">
						<image src="../../static/weixin.png" mode="" class="img"></image>
						<text>需要获取微信授权</text>
						<text>以开始使用零售分销小程序</text>
					</view>
					<view class="btn">
						<button class="btn1" open-type="getUserInfo" @getuserinfo="getAuth">
							同意授权
						</button>
						<button class="btn2" @tap="hide">取消</button>
					</view>

				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'authPop',
		props: {

		},

		data() {
			return {
				popupClass: '',
				// 微信参数
				wxParams: {
					code: '',
					encryptedData: '',
					iv: ''
				}
			}
		},
		created() {

		},
		methods: {
			discard() {

			},
			showPopup(params, info, count) {
				this.popupClass = params;
			},
			// 关闭商品弹窗
			hidepopup() {
				this.popupClass = 'hide';
				setTimeout(() => {
					this.popupClass = 'none';
				}, 200);
			},
			hide() {
				this.hidepopup()
				this.$msg('请先完成微信授权')
			},
			// 获取授权
			getAuth() {
				uni.login({
					success: (res) => {
						this.wxParams.code = res.code
						uni.getUserInfo({
							success: res => {
								this.wxParams.encryptedData = res.encryptedData
								this.wxParams.iv = res.iv
								uni.setStorageSync('weixinInfo', res.userInfo)
								this.hidepopup()
								this.$emit('handleClick', this.wxParams)
							},
							fail: () => {
								this.$msg('获取微信params失败')
							}
						})
					},
					fail: () => {
						this.$msg('获取微信code失败')
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.popup {
		position: fixed;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: 100;
		display: none;

		.mask {
			position: fixed;
			top: 0;
			width: 100%;
			height: 100%;
			z-index: 101;
			background-color: rgba(0, 0, 0, 0.6);
		}

		.layer {
			position: fixed;
			z-index: 102;
			bottom: -100%;
			width: 100%;
			height: 100%;
			background-color: #fff;
			display: flex;
			flex-wrap: wrap;
			align-content: space-between;

			.wx {
				width: 100%;
				padding-top: 180rpx;

				.title {
					padding: 20px;
					text-align: center;
					color: $black;
					font-size: 32rpx;
					color: #272727;

					.img {
						width: 132rpx;
						height: 132rpx;
						margin-bottom: 50rpx;
					}

					text {
						display: block;
					}
				}


				.btn {
					position: absolute;
					bottom: 200rpx;
					text-align: center;
					width: 100%;

					button {
						width: 368rpx;
						height: 80rpx;
						font-size: 28rpx;
						line-height: 80rpx;
						font-weight: 600;
					}

					button::after {
						border: 0 !important;
					}

					.btn1 {
						background-color: #3DB875;
						color: #fff;
						margin-bottom: 40rpx;
					}

					.btn2 {
						background-color: #F4F4F4;
						color: #3DB875;
					}
				}

			}

		}


		&.show {
			display: block;

			.mask {
				animation: showPopup 0.2s linear both;
			}

			.layer {
				animation: showLayer 0.2s linear both;
			}
		}

		&.hide {
			display: block;

			.mask {
				animation: hidePopup 0.2s linear both;
			}

			.layer {
				animation: hideLayer 0.2s linear both;
			}
		}

		&.none {
			display: none;
		}


	}
</style>
