<template>
	<view>
		<view class="list" v-if="prodList.length > 0">
			<view class="price-box" v-if="priceState == 0">
				<view class="price-top">
					<view class="price-total">
						<text class="icon-cash">￥</text><text class="text-red">{{ orderForm.itemChargedTotal | formatNum }}</text>
						<text class="cost-cash" v-if="orderForm.costTotal && orderForm.costTotal != 0">{{ orderForm.costTotal > 0 ? '+' + orderForm.costTotal : orderForm.costTotal }}费用</text>
					</view>
					<view class="edit" v-if="!isDisabled" @tap="priceChange(1)">编辑</view>
				</view>
				<view class="price-bottom">
					<view class="price-info" v-if="!isDraft">
						<text>原价 {{ orderForm.discountBeforeTotal | formatNum }}</text>， <text>优惠 {{ Math.abs(orderForm.discountTotal) | formatNum }}</text>
					</view>
					<view class="price-info" v-else>
						<text>原价 {{ orderForm.beforeTotalPrice | formatNum }}</text>， <text>优惠 {{ Math.abs(orderForm.discountPrice) | formatNum }}</text>
					</view>
				</view>
			</view>
			<view class="price-box" v-else-if="priceState != 0">
				<view class="price-top">
					<view class="price-total">
						<view class="price-Title">为选中商品设置优惠</view>
					</view>
					<view class="edit" @tap="changeDealPriceNew">完成</view>
				</view>
				<view class="price-bottom">
					<view class="radioBox">
						<view class="radio" @tap="priceChange(1)" :class="priceState == 1 ? 'active' : ''">
							<text ref='uniIcons' v-if="priceState == 1" class="iconfont icon-list-icon-bigchoose-sel" style="color:#2B6962;"></text>
							<text ref='uniIcons' v-else class="iconfont icon-list-icon-littlechoose-nor" style="color: #999;"></text>
							<text>金额</text>
						</view>
						<view class="radio" @tap="priceChange(2)" :class="priceState == 2 ? 'active' : ''">
							<text ref='uniIcons' v-if="priceState == 2" class="iconfont icon-list-icon-bigchoose-sel" style="color:#2B6962;"></text>
							<text ref='uniIcons' v-else class="iconfont icon-list-icon-littlechoose-nor" style="color: #999;"></text>
							<text>折扣</text>
						</view>
					</view>
		
					<view class="discount-input" v-if="priceState == 1">
						<input class="flex-1" type="digit" v-model="totalPrice" :placeholder="orderForm.itemChargedTotal" :disabled="isDisabled"
						 @input="inputTotal" /><text>元</text>
					</view>
		
					<view class="discount-input" v-else-if="priceState == 2">
						<input class="flex-1" type="digit" v-model="discount" placeholder="请输入折扣" :disabled="isDisabled" @input="inputDiscount" /><text>折</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/js/utils.js'
	export default {
		name: 'changePrice',
		props: {
			orderForm: {
				type: Object,
				default: () => {
					return {};
				}
			},
			prodList: {
				type: Array,
				default: () => {
					return []
				}
			},
			priceState: {
				type: Number,
				default: 0
			},
			isDisabled: {
				type: Boolean,
				default: false
			},
			isDraft: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				discount: '', // 折扣
				totalPrice: '' // 总价
			};
		},
		created() {
			
		},
		methods: {
			// 编辑切换
			priceChange(type) {
				if (this.prodList.length == 0) {
					this.$msg('请先添加商品')
					return
				}
				if (type == 1) {
					this.prodList.forEach(ele => {
						ele.checked = true;
					})
				}
				this.$emit('switchState', this.prodList, type)
			},
			// 输入总价
			inputTotal() {
				let val = this.$utils.inputNum(this.totalPrice, 12);
				if (!val) {
					this.$nextTick(() => {
						this.totalPrice = this.totalPrice.substring(0, this.totalPrice.length - 1)
					})
				} else {
					this.$nextTick(() => {
						this.totalPrice = val
					})
				}
			},
			// 输入折扣
			inputDiscount() {
				if (!(/^([1-9](\.\d?)?|10)$/.test(this.discount))) {
					this.$msg('请输入1-10之间的数字')
					this.$nextTick(() => {
						this.discount = this.discount.substring(0, this.discount.length - 1)
					})
				}
			},
			changeDealPriceNew() {
				let isTrue = false;
				this.prodList.forEach(item => {
					if (item.checked) {
						isTrue = true;
					}
				})
				if (!isTrue) {
					this.$msg('请先选中商品')
					return
				}
			
				if (this.priceState == 2) {
					if (this.discount == '') {
						this.$emit('switchState', this.prodList, 0)
						return
					}
					if (!(/^([1-9](\.\d?)?|10)$/.test(this.discount))) {
						this.$msg('请输入1-10之间的数字')
						return
					}
			
					this.orderForm.itemChargedTotal = (parseFloat(this.discount) / 10).toFixed(2);
				} else {
					if (this.totalPrice == '') {
						this.$emit('switchState', this.prodList, 0)
						return
					} else {
						this.orderForm.itemChargedTotal = parseFloat(this.totalPrice).toFixed(2);
					}
			
					if (this.orderForm.itemChargedTotal == 0) {
						this.$msg('请输入正确的金额')
						return
					}
				}
				// 防止重复点击
				if (!this.$utils.multipleClicks()) {
					return
				}
				this.computeDealPrice(this.orderForm.itemChargedTotal)
			},
			// 每行成交价计算
			computeDealPrice(total) {
				let listArr = [];
				let listIndex = []
				this.prodList.forEach((ele, index) => {
					if (ele.freeTypeCode == '2' && ele.markedPrice == 0) {
						ele.markedPrice = ele.singlePrice
					}
					if (this.priceState) {
						if (ele.checked) {
							if (this.priceState == 2) {
								delete ele.totalDealPrice
							} else {
								delete ele.newDiscountRate
							}
							listArr.push(ele);
							listIndex.push(index)
						}
					} else {
						listArr.push(ele);
					}
				})
				
				if (this.priceState == 2) {
					this.$utils.setEachVal(listArr, 'newDiscountRate', total)
				} else {
					this.$utils.setEachVal(listArr, 'totalDealPrice', total)
					this.$utils.setTotal(listArr, 'deal'); //8/19
				}
			
				this.$http({
					url: this.$api.getDealPrice,
					data: listArr,
					success: res => {
						if (res.code == '01') {
							let result = JSON.parse(res.data)
							if (listIndex.length > 0) {
								listIndex.forEach((item, index) => {
									let prodItem = JSON.parse(JSON.stringify(this.prodList[item]));
									let newItem = result[index];
									
									prodItem.discountRate = newItem.discountRate;
									prodItem.minimumCollectionRate = newItem.minimumCollectionRate;
									prodItem.dealPrice = newItem.dealPrice;
									prodItem.singlePrice = newItem.singlePrice;
									prodItem.minimumCollectionPrice = newItem.minimumCollectionPrice;
									prodItem.totalDealPrice = newItem.totalDealPrice;
									this.prodList.splice(item, 1, prodItem)
								})
							}
			
							// this.oldList = result;
							// 订单页改价不走setTotalPrice
							let tmp = 0;
							this.prodList.forEach(item => {
								tmp = tmp + parseFloat(item.dealPrice)
							})
							this.orderForm.itemChargedTotal = tmp.toFixed(2);
							if (!this.isDraft) {
								this.orderForm.discountTotal = this.$utils.setDiscount(this.orderForm.discountBeforeTotal, this.orderForm.itemChargedTotal);
							} else {
								this.orderForm.discountPrice = this.$utils.setDiscount(this.orderForm.beforeTotalPrice, this.orderForm.itemChargedTotal);
							}
							//未收款计算
							if (this.orderForm.orderId) {
								if (this.orderForm.costTotal) {
									this.orderForm.notChargedTotal = this.$utils.subtraction(Number(this.orderForm.itemChargedTotal) + Number(this.orderForm.costTotal), this.orderForm.chargedTotal)
								} else {
									this.orderForm.notChargedTotal = this.$utils.subtraction(this.orderForm.itemChargedTotal, this.orderForm.chargedTotal)
								}
							} else {
								this.orderForm.notChargedTotal = this.orderForm.itemChargedTotal;
							}
							
							this.discount = '';
							this.totalPrice = '';
							
							this.$emit('switchState', this.prodList, 0);
							this.$emit('saveBatchPrice', this.orderForm, result);
						} else {
							this.$msg(res.msg)
						}
					}
				})
			}
		},
		filters: {
			formatNum: function(value) {
				return utils.formatNum(value);
			}
		}
	}
</script>

<style lang="scss">	
	.price-box {
		width: 100%;
		padding: 32rpx 0;
	
		.price-top {
			display: flex;
			justify-content: space-between;
	
			.price-total {
				display: flex;
				align-items: center;
	
				.icon-cash {
					font-weight: 500;
					font-size: 28rpx;
					line-height: 34rpx;
					color: #E42727;
				}
				
				.cost-cash {
					font-size: 28rpx;
					color: #E42727;
					margin-left: 8rpx;
				}
	
				.text-red {
					font-weight: 500;
					font-size: 44rpx;
					line-height: 52rpx;
					color: #E42727;
				}
	
				.price-Title {
					font-size: 30rpx;
					line-height: 44rpx;
					color: #737373;
				}
			}
	
			.edit {
				font-weight: 500;
				font-size: 32rpx;
				line-height: 44rpx;
				color: #E42727;
				padding: 26rpx 40rpx;
			}
		}
	
		.price-bottom {
			display: flex;
			height: 76rpx;
			justify-content: space-between;
			align-items: center;
	
			.price-info {
				display: flex;
				align-items: center;
				font-size: 24rpx;
				line-height: 32rpx;
				color: #FF8636;
				margin-top: 8rpx;
			}
	
			.radioBox {
				display: flex;
				align-items: center;
				padding: 16rpx 0;
				.radio {
					font-weight: 500;
					font-size: 28rpx;
					line-height: 44rpx;
					color: #999999;
					margin-right: 30rpx;
	
					&.active {
						color: #2B6962;
					}
	
					>text {
						margin-right: 12rpx;
					}
	
					.iconfont {
						font-size: 34rpx !important;
					}
				}
			}
	
			.discount-input {
				display: flex;
				align-items: center;
	
				.flex-1 {
					width: 120px;
					font-size: 28rpx;
					height: 72rpx;
					line-height: 48rpx;
					color: #B3B3B3;
					border-bottom: 1px solid #CCCCCC;
					padding: 12rpx 0;
				}
	
				text {
					font-size: 28rpx;
					color: #999999;
					margin-left: 8rpx;
				}
			}
		}
	}
</style>
