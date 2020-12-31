<template>
	<view class="container">
		<view class="left-box">
			<slot name="left"></slot>
		</view>
		<view class="center-box">
			<view class="select-box" v-if="stateList.length > 0">
				<view class="select-box-items" @tap="openHandle">
					<text>{{ stateList[currentIndex].label }}</text>
					<view class="icons">
						<text class="icon iconfont icon-Arrow-Down" :class="openState ? 'rotate' : ''"></text>
					</view>
					<view v-if="openState" class="select-box-open k-shadow box">
						<span class="top"></span>
						<view class="item" v-for="(item, i) in stateList" :key="i" :class="i == currentIndex ? 'active' : ''" @tap.stop="selectHandle(item)">
							{{ item.label }}
						</view>
					</view>
				</view>
			</view>
			<text class="icon iconfont icon-icon-search" style="font-size: 32rpx;padding-left: 20rpx;color:#B3B3B3;"></text>
			<input :placeholder="placeholder" :type="type"  @confirm="inputChange" confirm-type='search'
			 @input="inputText" :focus="focus" :value="inputValue" @focus="inputFocus"/>
			<text class="icon iconfont icon-filled-close" v-if="inputValue.length > 0"  @tap='del'></text>
		</view>
		<view class="right-box">
			<slot name="right">
				<!-- #ifndef H5 -->
				<text class="iconfont icon-scan" @tap='toScan' v-if="orderType == 'ztOrder'"></text>
				<!-- #endif -->
			</slot>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			placeholder: {
				type: String,
				default: '输入关键词'
			},
			focus:{
				type:Boolean,
				default:false
			},
			type: {
				type: String,
				default: 'text'
			},
			orderType: {
				type: String,
				default: 'order'
			},
			stateList: {
				type: Array,
				default: () => {
					return []
				}
			},
			currentIndex: {
				type: Number,
				default: 0
			},
			inputValue:{
				type: String,
				default: ''
			}
		},
		data() {
			return {
				openState: false,
				value: ''
			}
		},
		methods: {
			openHandle: function() {
				this.openState = !this.openState
			},
			selectHandle: function(item) {
				this.$emit('selectHandle', item)
				this.openState = !this.openState
			},
			inputChange: function(e) {
				// this.value=this.inputValue
				this.$emit('inputChange', e.detail.value)
			},
			del() {
				this.$emit('inputDel', '')
			},
			inputText(e) {
				this.$emit('inputText', e.detail.value)
			},
			inputFocus(){
				this.$emit('inputFocus','')
			},
			toScan() {
				this.$emit('scanCode');
			},
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		display: flex;
		font-size: $font-sm;

		.left-box {}

		.center-box {
			position: relative;
			flex: 1;
			display: flex;
			justify-content: space-between;
			align-items: center;
			background-color: $gray;
			border-radius: 8rpx;

			.select-box {
				height: 100%;
				padding-left: 20rpx;

				.select-box-items {
					height: 100%;
					display: flex;
					position: relative;
					align-items: center;
					justify-content: center;

					.icons {
						// height: 30rpx;
						width: 45rpx;
						border-right: 2rpx solid #ddd;
						margin: 0 10rpx;
						.icon-Arrow-Down {
							display: inline-block;
							font-size: 36rpx;
							transform: rotate(0);
							transition: all 0.1s ease-in-out;
							&.rotate {
								transform: rotate(180deg);
							}
						}

						image {
							height: 100%;
							width: 30rpx;
						}
					}

					.select-box-open {
						position: absolute;
						top: 105%;
						min-width: 120rpx;
						z-index: 10;
						background-color: #FFFFFF;

						.item {
							padding: 20rpx;
							width: 100%;
							text-align: center;

							&.active {
								color: $red;
							}
						}
					}
				}
			}

			.search-icon {}

			input {
				flex: 1;
				height: 80rpx;
				padding: 20rpx 10rpx 20rpx;
			}

			.icon-filled-close {
				margin-right: 20rpx;
				font-size: 32rpx;
				color: #999;
			}
		}

		.right-box {
			display: flex;
			justify-content: center;
			align-items: center;
			.icon-scan {
				font-size: 32rpx;
				margin-left: 20rpx;
			}
		}
	}

	// 箭头样式
	.box {
		position: relative;
		// border: 5px solid $gray;
	}

	.box span {
		width: 0;
		height: 0;
		position: absolute;
		overflow: hidden;
		font-size: 0;
	}

	.box .top {
		border-width: 20px;
		border-style: solid dashed dashed;
		border-color: transparent transparent #fff;
		left: 50%;
		transform: translate3d(-50%, 0, 0);
		top: -30px;
	}
</style>
