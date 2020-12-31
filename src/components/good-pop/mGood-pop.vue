<template>
	<view>
		<view class="popup" :class="popupClass" @touchmove.stop.prevent="discard" @tap="hidepopup">
			<!-- 遮罩层 -->
			<view class="mask" style="background-color: rgba(0,0,0,0);"></view>
			<view class="layer" @tap.stop="discard" :style="{height:height+'upx'}">
				<view class="content">
					<view class="main" v-if="goodInfo">
						<view class="goods box">
							<view class="goods-pic">
								<image @tap="imgBigClick" :src="goodInfo.pictureUrl || '../../static/img/icon/cover.png'" mode="" class="goods-Img"></image>
							</view>
							<view class="goods-detail">
								<view class="name">
									<text>{{goodInfo.productNo}}</text>
									<text class="icon iconfont icon-x" style="font-size: 40rpx;" @tap="hidepopup"></text>
								</view>
								<view class="specInfo">
									<text>{{goodInfo.itemModel}}{{goodInfo.itemBrief ? '（' + goodInfo.itemBrief + '）' : ''}}</text>
								</view>
							</view>
						</view>
					</view>
					<view class="center">
						<scroll-view scroll-y="true" class="scroll-view-box">
							<view class="set box" v-if="itemSetDtoList.length>0">
								<view class="title">齐套配件</view>
								<block v-for="(item, index) in itemSetDtoList" :key="index">
									<block v-for="(ele, eIndex) in item.strong" :key="eIndex">
										<view class="item-title" v-if="eIndex == 0">以下为强齐配料品，必选</view>
										<view class="info-box" >
											<view class="item specItem specOn">
												{{ele.productNo}} <text style="padding-left: 16rpx;font-weight: 300;">{{ele.itemSpecs}}</text>
											</view>
										</view>
									</block>
										
									<block v-for="(ele, eIndex) in item.weak" :key="eIndex">
										<view class="item-title" v-if="eIndex == 0">以下为弱齐配料品，非必选</view>
										<view class="info-box" >
											<view class="item specItem" @tap='chooseDto(index, eIndex)' :class="ele.checked ?'specOn':''">
												{{ele.productNo}} <text style="padding-left: 16rpx;font-weight: 300;">{{ele.itemSpecs}}</text>
											</view>
										</view>
									</block>
								</block>
							</view>
						</scroll-view>
					</view>
					<view class="bottom" :style="{paddingBottom:bottom+'rpx'}">
						<view class="removeBtn" @tap='removeDto'>重置</view>
						<view class="ok" @tap="submitDto">确认</view>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import utils from '@/utils/utils.js'
	import specData from './spec.js'
	export default {
		name: 'goodPop',
		props: {
			type: {
				type: String,
				default: 'cart'
			}
		},
		mixins: [specData],
		components: {},
		data() {
			return {
				itemSetDtoList: [],
				goodInfo: {}
			};
		},
		created() {
		},
		methods: {
			showPopup(params, info, data) {
				this.itemSetDtoList=[]
				this.pBottom = 300
				this.bottom = this.type == 'detail' ? 20 : this.getHeight()
				this.popupClass = params;
				this.itemSetDtoList.push(data);
				this.goodInfo = info;
				if (!info.itemSpecsWithSmallSpec) {
					this.goodInfo.itemSpecsWithSmallSpec = info.itemSpecs;
				}
				this.goodInfo.pictureUrl = info.itemImg
			},
			chooseDto(index, eIndex) {
				this.itemSetDtoList[index].weak[eIndex].checked = !this.itemSetDtoList[index].weak[eIndex].checked;
			},
			removeDto() {
				this.itemSetDtoList.forEach(item => {
					if (item.weak) {
						item.weak.forEach(ele => {
							ele.checked = false;
						})
					}
				})
			},
			submitDto() {
				// 防止重复点击
				if (!this.$utils.multipleClicks('加载中')) {
					return
				}
				// 赋值行号
				let orderItemLineNo = this.goodInfo.orderItemLineNo;
				let prodList = uni.getStorageSync('chooseGoods') || []
				prodList.push(this.goodInfo);
				
				this.itemSetDtoList.forEach(item => {
					if (item.strong) {
						item.strong.forEach(ele => {
							orderItemLineNo += 10;
							ele.leadOrderItemLineNo = this.goodInfo.orderItemLineNo;
							ele.orderItemLineNo = orderItemLineNo;
							if (!ele.itemSpecsWithSmallSpec) {
								ele.itemSpecsWithSmallSpec = ele.itemSpecs
							}
							prodList.push(ele);
						})
					}
					if (item.weak) {
						item.weak.forEach(ele => {
							if (ele.checked) {
								orderItemLineNo += 10;
								ele.leadOrderItemLineNo = this.goodInfo.orderItemLineNo;
								ele.orderItemLineNo = orderItemLineNo;
								if (!ele.itemSpecsWithSmallSpec) {
									ele.itemSpecsWithSmallSpec = ele.itemSpecs
								}
								prodList.push(ele);
							}
						})
					}
				})
				uni.setStorageSync('orderItemLineNo', orderItemLineNo);
				uni.setStorageSync('chooseGoods', prodList)
				uni.showToast({
					title: '添加成功'
				})
				setTimeout(() => {
					this.$utils.multipleRemoveClicks();
				}, 800);
				this.hidepopup()
				this.$emit('success', prodList)
			},
			// 关闭商品弹窗
			hidepopup() {
				this.popupClass = 'hide';
				this.itemSetDtoList = [];
				setTimeout(() => {
					this.popupClass = 'none';
					this.removeSpec();
				}, 300);
				this.$emit('close')
			},
			// 返回关闭弹窗
			back() {
				this.hidepopup()
			},
		}

	}
</script>
<style lang="scss" scoped>
	.goods-pic {
		width: 160rpx;
		height: 160rpx;
		border-radius: 16rpx;
		overflow: hidden;
		border: 2rpx solid #F2F2F2;
	}

	.goods-Img {
		display: block;
	}
	
	.item-title {
		font-size: 24rpx;
		line-height: 32rpx;
		color: #737373;
		padding: 20rpx 0;
	}
</style>
