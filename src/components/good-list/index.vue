<template>
	<view>
		<!-- 首页 -->
		<template v-if="currentIndex == 0">
			<view class="imgList">
				<view class="img-item" v-for="(item,index) in list" :key="index" @tap="toDetail(item,type)">
					<image :src="item.CoverImage || coverImg" mode="scaleToFill"></image>
					<view class="title">
						{{item.Title ? item.Title : item.productNo}}
					</view>
				</view>
			</view>
		</template>
		<!-- 添加商品选择列表 -->
		<template v-else-if="currentIndex==1">
			<view class="goods-list">
				<view class="goods-item" v-for="(item,index) in list" :key="index">
					<view class="goods-pic" @tap="toDetail(item,type)">
						<image :src="item.itemImg || item.CoverImage || coverImg" mode="scaleToFill" @error="errorFunction" :data-index='index'></image>
						<view class="sign" v-if="item.suitSerialNumLabelCode=='1001'">
							样品
						</view>
						<view class="sign" v-if="item.stockFlag==1">
							库存
						</view>
					</view>
					<view class="goodsInfo">
						<view class="detail">
							<view class="box">
								<view class="code" v-if="item.productNo" :class="item.productType == '1003' ? 'text-red' : ''">{{item.itemBrief ? '【'+item.itemBrief+'】' : ''}}{{item.productNo != item.itemBrief ? item.productNo : ''}}</view>
							</view>
							<view class="title-one">{{item.itemCode}}</view>
							<view class="title-one" v-if="item.itemModel !== '0' && item.itemModel && item.productNo.indexOf('LZ.') == -1">
								{{item.itemModel}}
								<text v-if="item.colorDes">{{'('+item.colorDes+')'}}</text>
							</view>
							<view class="box">
								<view class="spec-count" v-if="!isStore">
									<view class="title-one" v-if="item.itemSpecs !== '0' && item.productNo.indexOf('LZ.') == -1 ">{{item.itemSpecs}}</view>
								</view>
								<view class="spec-count" v-else>
									<view class="title-one" v-if="item.itemSpecs !== '0'">{{item.itemSpecs}}</view>
								</view>
							</view>
							<view class="title-one" v-if="item.warehouseName">
								仓库：{{item.warehouseName}}
							</view>
							<view class="title-one" v-if="item.storageBinsName || item.storageLocationName">
								库位：{{item.storageBinsName || item.storageLocationName}}
							</view>
							<view class="title-one" v-if="item.suitSerialNum || item.itemIdentificationNo">
								套序列号：{{item.suitSerialNum || item.itemIdentificationNo}}
							</view>
							<view class="title-one text-red" v-if="item.productType == '1003'">
								总部可用量：{{item.stockQty}}
							</view>
							<!-- 自提商品 -->
							<view class="title-one" v-if="isZtAmount">
								数量：{{item.stockQty}}
							</view>
						</view>
					</view>
					<view class="addItem" v-if="type == 'choose'" @tap.stop="showPopup(item)">
						<text class="iconfont icon-icon-addcart"></text>
					</view>
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	export default {
		name: 'goodList',
		props: {
			list: {
				type: Array,
				default: () => {
					return []
				}
			},
			currentIndex: {
				type: Number,
				default: 0
			},
			type: {
				type: String,
				default: ''
			},
			isStore: {
				type: Boolean,
				default: true
			},
			isZtAmount: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				coverImg: require('@/static/img/icon/cover.png')
			};
		},
		onLoad() {

		},
		created() {

		},
		methods: {
			showPopup(e) {
				e.imageUrl = e.pictureUrl;
				this.$emit('showPopup', e)
			},
			// 跳转商品详情
			toDetail(e, type) {
				this.$emit('toDetail', e, type)
			},
			errorFunction(e) {
				// if (e.type == 'error') {
				// 	let i = e.currentTarget.dataset.index
				// 	this.list[i].itemImg = this.coverImg					
				// }
			}
		}
	}
</script>

<style lang="scss">
	.goods-list {
		padding: 0 0 20rpx;
		
		.goods-item {
			display: flex;
			padding: 20rpx 0;
			justify-content: left;
			border-bottom: 1rpx solid #eee;
			
			.goods-pic {
				position: relative;

				image {
					display: block;
					width: 180rpx;
					height: 180rpx;
					background-color: #eee;
				}
				
				.sign {
					position: absolute;
					top: 20rpx;
					left: 0;
					background-color: #FF8D4D;
					color: #fff;
					font-size: 20rpx;
					padding: 6rpx 10rpx;
				}
			}
			
			.goodsInfo {
				flex: 1;
				margin-left: 20rpx;
				
				.detail {
					font-size: 28rpx;
					word-break: break-all;
					.box {
						display: flex;
						align-items: center;
						justify-content: space-between;
					}
					
					.title-one {
						font-size: 26rpx;
						color: #999;
					}
					
					.text-red {
						color: #D31311 !important;
						padding-top: 4rpx;
					}
				}
				
				.bottom {
					padding-top: 10rpx;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}
			}
			
			.addItem {
				padding: 65rpx 32rpx 0 42rpx;
	
				.icon-icon-addcart {
					font-size: 50rpx;
					color: #D31311;
				}
			}
		}
	}
	
	.imgList {
		display: flex;
		justify-content: flex-start;
		flex-wrap: wrap;
		
		.img-item {
			width: 210rpx;
			margin-right: 28rpx;
			&:nth-child(n+4) {
				margin-top: 30rpx;
			}
			&:nth-child(3n+3) {
				margin-right: 0;
			}
			
			image {
				width: 210rpx;
				height: 210rpx;
			}
			
			.title {
				font-size: 24rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				text-align: center;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}
		}
	}
</style>
