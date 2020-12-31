<template>
	<view class="matchPop" v-show="popupClass" @touchmove.stop.prevent="discard">
		<!-- 遮罩层 -->
		<view class="mask" @tap="hidepopup"></view>
		<view class="match-content">
			<scroll-view scroll-y="true" class="match-list" :style="{height: matchHeight}">
				<view class="match-item" v-for="(item, index) in matchList" :key="index">
					<view class="place"v-if="index != 0"></view>
					<view class="match-product">
						<view class="match-productNo">{{item.productNo}}</view>
						<view class="match-productLineNo">行号：{{item.lineNo}}</view>
					</view>
					<block v-for="(ele, eIndex) in item.strongList" :key="eIndex">
						<view class="match-ele">
							<view class="match-title" v-if="eIndex == 0">以下为强齐配料品，必选</view>
							<view class="match-chItem">
								<text class="iconfont icon-list-icon-littlechoose-sel disabled"></text>
								<view class="ele-productNo">{{ele.productNo}}</view>
								<view class="ele-itemSpecs">{{ele.itemSpecs}}</view>
							</view>
						</view>
					</block>
					
					<block v-for="(ele, eIndex) in item.weekList" :key="eIndex">
						<view class="match-ele">
							<view class="match-title" v-if="eIndex == 0">以下为弱齐配料品，非必选</view>
							<view class="match-chItem" @tap="changeCheck(index, eIndex)">
								<text class="iconfont icon-Circle" :class="ele.checked ? 'icon-list-icon-littlechoose-sel' : 'icon-Circle'"></text>
								<view class="ele-productNo">{{ele.productNo}}</view>
								<view class="ele-itemSpecs">{{ele.itemSpecs}}</view>
							</view>
						</view>
					</block>
				</view>
			</scroll-view>
			
			<view class="btns">
				<view class="" @tap="hidepopup">取消</view>
				<view class="" @tap="chooseMatch">确认</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'matchPop',
		data() {
			return {
				matchList: [],
				popupClass: false,
				matchHeight: ''
			};
		},
		methods: {
			//初始化已选中规格
			showPopup(list) {
				this.popupClass = true;
				
				let length = 0;
				list.forEach(item => {
					item.strongList = [];
					item.weekList = [];
					item.itemList.forEach(ele => {
						ele.isAdd = true
						ele.amount = ele.quantity ? ele.quantity : 1;
						ele.orderTypeCode = '1001'
						ele.itemType = '1001';
						if (ele.strongFlag == 1) {
							ele.checked = true;
							if (!ele.itemSpecsWithSmallSpec) {
								ele.itemSpecsWithSmallSpec = ele.itemSpecs;
							}
							item.strongList.push(ele)
							length++;
						} else {
							ele.strongFlag = 0;
							ele.checked = false;
							if (!ele.itemSpecsWithSmallSpec) {
								ele.itemSpecsWithSmallSpec = ele.itemSpecs;
							}
							item.weekList.push(ele)
							length++;
						}
					})
				})
				if (length > 4) {
					const { windowHeight } = uni.getSystemInfoSync();
					this.matchHeight = windowHeight * 0.8 + 'px';
				}
				this.matchList = list;
			},
			changeCheck(index, eIndex) {
				this.matchList[index].weekList[eIndex].checked = !this.matchList[index].weekList[eIndex].checked;
			},
			chooseMatch() {
				let orderItemLineNo = uni.getStorageSync('orderItemLineNo');
				this.matchList.forEach(item => {
					item.strongList.forEach(ele => {
						if (ele.checked) {
							orderItemLineNo += 10;
							ele.leadOrderItemLineNo = item.lineNo;
							ele.orderItemLineNo = orderItemLineNo;
						}
					})
					
					item.weekList.forEach(ele => {
						if (ele.checked) {
							orderItemLineNo += 10;
							ele.leadOrderItemLineNo = item.lineNo;
							ele.orderItemLineNo = orderItemLineNo;
						}
					})
				})
				uni.setStorageSync('orderItemLineNo', orderItemLineNo);
				this.$emit('chooseMatch', this.matchList)
				this.popupClass = false;
			},
			// 关闭商品弹窗
			hidepopup() {
				this.popupClass = false;
			},
			discard() {

			}
		},

	}
</script>
<style lang="scss">
	.matchPop {
		position: fixed;
		top: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		z-index: 99;
		.mask {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
			background: rgba(0, 0, 0, 0.6);
		}
		.match-content {
			width: 540rpx;
			// max-height: 80%;
			background: #FFFFFF;
			border-radius: 8rpx;
			z-index: 10;
			.match-list {
				max-height: 800rpx;
				border-bottom: 1rpx solid #D9D9D9;
				.match-item {
					&:first-child {
						margin-top: 0;
					}
					.place {
						width: 100%;
						height: 16rpx;
						background: #F7F7F7
					}
					.match-product {
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 24rpx 32rpx 16rpx;
						.match-productNo {
							font-weight: 500;
							font-size: 32rpx;
							line-height: 48rpx;
							color: #E42727;
						}
						.match-productLineNo {
							font-size: 24rpx;
							color: #737373;
						}
					}
					
					.match-ele {
						margin: 0 32rpx 24rpx;
						.match-title {
							font-size: 24rpx;
							line-height: 32rpx;
							color: #737373;
						}
						
						.match-chItem {
							position: relative;
							padding-left: 48rpx;
							margin-top: 12rpx;
							.iconfont {
								position: absolute;
								top: 6rpx;
								left: 0;
								font-size: 32rpx;
								color: #737373;
								z-index: 10;
								&.icon-list-icon-littlechoose-sel {
									color: #272727;
									&.disabled {
										color: #B2B2B2;
									}
								}
								&.icon-Circle {
									
								}
							}
							
							.ele-productNo {
								font-weight: 500;
								font-size: 28rpx;
								line-height: 44rpx;
								color: #272727;
							}
							.ele-itemSpecs {
								font-size: 24rpx;
								line-height: 24px;
								color: #272727;
							}
						}
					}
				}
			}
			
			.btns {
				display: flex;
				position: relative;
				z-index: 99;
				view {
					flex: 1;
					position: relative;
					font-size: 28rpx;
					line-height: 44rpx;
					text-align: center;
					color: #737373;
					background: #FFFFFF;
					padding: 26rpx 106rpx;
					&:first-child {
						border-bottom-left-radius: 8rpx;
					}
					&:last-child {
						border-bottom-right-radius: 8rpx;
						color: #272727;
						&::before {
							position: absolute;
							top: 0;
							left: -1rpx;
							content: '';
							display: block;
							width: 1rpx;
							height: 100%;
							background: #D9D9D9;
						}
					}
				}
			}
		}
	}
</style>
