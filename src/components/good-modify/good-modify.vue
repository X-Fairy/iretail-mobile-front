<template>
	<view>
		<view class="productBox" @touchmove.stop.prevent="discard" :class="popupClass">
			<view class="product-mask" :class="popupClass ? popupClass : ''" @tap="hidePopup"></view>
			<view class="product-info" :class="popupClass ? popupClass : ''" :style="{top: popupTop + 'px'}">
				<view class="productNo-title">
					{{ modalProduct.productNo }}
				</view>
				<view class="list">
					<view class="title">单价：</view>
					<view class="scaleInput">
						<input type="digit" v-model="modalProduct.singlePrice" placeholder="请输入" :focus="inputFocus1" @focus="inputIn" @blur="inputOut(1)" @input="inputSinglePrice" />
						<view class="inputMask" @tap="inputOn(1)"></view>
					</view>
				</view>
				<view class="list">
					<view class="title">数量：</view>
					<view class="scaleInput">
						<input type="digit" v-model="modalProduct.amount" placeholder="请输入" :focus="inputFocus2" @focus="inputIn" @blur="inputOut(2)" @input="inputAmount" />
						<view class="inputMask" @tap="inputOn(2)"></view>
					</view>
				</view>
				<view class="list" v-if="false">
					<view class="title">配送方式：</view>
					<view class="action">
						<text v-if="modalProduct.orderTypeCode == '1001'">配送</text>
						<text v-if="modalProduct.orderTypeCode == '1003'">自提</text>
						<switch style="margin-left: 12rpx;" :checked="modalProduct.orderTypeCode == '1001'" @change="switchChangeZt" />
					</view>
				</view>
				<view class="list">
					<view class="title">折扣类型：</view>
					<view class="action">
						<picker @change="callbackName('bindDiscountChange', $event)" :value="discountIndex" range-key="discountName" :range="discountList" v-if="discountList.length > 0">
							<text>
								{{ modalProduct.discountTypeName != discountList[discountIndex].discountName ? modalProduct.discountTypeName : discountList[discountIndex].discountName }}
							</text>
							<text class="icon iconfont icon-arrow-right"></text>
						</picker>
						<view v-else @tap="this.$msg('折扣类型列表为空');" style="min-height: 45px;">
							{{ modalProduct.discountTypeName }}
						</view>
					</view>
				</view>
				<view class="list">
					<view class="title">是否免费：</view>
					<view class="action">
						<text v-if="modalProduct.singlePrice > 0">否</text>
						<text v-if="modalProduct.singlePrice <= 0">是</text>
						<switch :checked="modalProduct.singlePrice > 0" @change="switchChangeZp" style="margin-left: 12rpx;" />
					</view>
				</view>
				<view class="submitBtn" @tap="editSubmit">
					确定
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/js/utils.js'
	export default {
		name: 'goodModify',
		props: {
			discountList: {
				type: Array,
				default: () => {
					return []
				}
			},
			discountIndex: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				modalProduct: '',
				popupTop: 0,
				popupClass: '',
				inputFocus1: false,
				inputFocus2: false
			};
		},
		methods: {
			showPopup(item) {
				this.modalProduct = item;
				this.popupClass = 'show';
			},
			hidePopup() {
				this.popupClass = '';
				setTimeout(function() {
					this.popupClass = 'none';
				}, 300)
			},
			inputIn(e) {
				const { windowHeight } = uni.getSystemInfoSync();
				const query = uni.createSelectorQuery().in(this);
				query.select('.product-info').boundingClientRect(data => {
					if (Number((windowHeight - data.height)/2) - Number(e.detail.height) < 0) {
						this.popupTop = Number((windowHeight - data.height)/2) - Number(e.detail.height);
					}
				}).exec();
			},
			inputOn(index) {
				if (index == 1) {
					this.inputFocus1 = true;
				} else {
					this.inputFocus2 = true;
				}
			},
			inputOut(index) {
				if (index == 1) {
					this.inputFocus1 = false;
				} else {
					this.inputFocus2 = false;
				}
				setTimeout(() => {
					if (!this.inputFocus1 && !this.inputFocus2) {
						this.popupTop = 0
					}
				}, 600)
			},
			// 单价金额校验
			inputSinglePrice(e) {
				let val = this.$utils.inputNum(e.detail.value, 9)
				this.$nextTick(() => {
					this.modalProduct.singlePrice = val
					if (val != 0 && val != this.modalProduct.markedPrice) {
						this.modalProduct.newPrice = val;
					}
				})
			},
			// 单价金额
			changePrice(e) {
				// this.$nextTick(() => {
				// 	if (this.modalProduct.singlePrice != 0 && this.modalProduct.singlePrice != this.modalProduct.markedPrice) {
				// 		this.modalProduct.newPrice = this.modalProduct.singlePrice = e.detail.value;
				// 	}
				// })
			},
			// 数量校验
			inputAmount(e) {
				let val = this.$utils.inputNum(e.detail.value, 6)
				this.$nextTick(() => {
					this.modalProduct.amount = val
				})
			},
			// 自提
			switchChangeZt(e) {
				this.modalProduct.orderTypeCode = e.detail.value ? '1001' : '1003'
			},
			// 赠品
			switchChangeZp(e) {
				this.$nextTick(() => {
					if (e.detail.value) {
						this.modalProduct.singlePrice = this.modalProduct.markedPrice ? this.modalProduct.markedPrice : 1
					} else {
						this.modalProduct.singlePrice = 0
					}
					this.modalProduct.newPrice = null;
				})
			},
			// 回调函数
			callbackName(name, e) {
				this.$emit(name, e);
			},
			// 保存
			editSubmit() {
				this.$emit('editSubmit');
			},
			discard() {}
		}
	}
</script>

<style lang="scss" scoped>
	.productBox {
		position: fixed;
		top: 0;
		left: 0;
		display: flex;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
		transition: all 0.3s ease-in-out;
		visibility: hidden;
		opacity: 0;
		z-index: 99;
		&.show {
			visibility: visible;
			opacity: 1;
		}
		&.none {
			display: none;
		}
		.product-info {
			position: relative;
			border-radius: 20rpx;
			background: #FFF;
			transition: all 0.3s ease-in-out;
			transform: scale(0);
			padding: 20rpx 0 0;
			z-index: 10;
			&.show {
				transform: scale(1);
			}
			.productNo-title {
				height: 60rpx;
				line-height: 60rpx;
				font-size: 30rpx;
				font-weight: 550;
				text-align: center;
				color: #191A45;
				padding-bottom: 22rpx;
			}
			// 解决scale抖动 px为了配合公共组件样式
			.scaleInput {
				position: relative;
				display: flex;
				height: 45px;
				color: #272727;
				align-items: center;
				.inputMask {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					z-index: 10;
					background: transparent;
				}
			}
			.submitBtn {
				width: 100%;
				height: 90rpx;
				line-height: 90rpx;
				text-align: center;
				color: #fff;
				background-color: $red;
				border-radius: 0 0 20rpx 20rpx;
			}
		}
		
		.product-mask {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.6);
			transition: all .3s ease-in-out;
			visibility: hidden;
			opacity: 0;
			z-index: 5;
			&.show {
				visibility: visible;
				opacity: 1;
			}
		}
	}
</style>
