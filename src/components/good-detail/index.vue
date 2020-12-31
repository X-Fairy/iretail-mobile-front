<template>
	<view>
		<view class="strongFlag" v-if="item.strongFlag == 0 || item.strongFlag == 1">
			<view class="item-checkbox" @tap="goodCallback('checkedChange')" v-if="priceState != 0">
				<text v-if="item.checked" class="iconfont icon-list-icon-littlechoose-sel" style="color: #E42727;font-size: 36rpx;"></text>
				<text v-else class="iconfont icon-list-icon-littlechoose-nor" style="color:#999 ;font-size: 36rpx;"></text>
			</view>
			
			<view class="info-bar">
				<view class="item-title-box">
					<view class="item-title">
						{{ item.productNo }}<text class="forceSign" :class="item.strongFlag == 0 ? 'grey' : ''">{{item.strongFlag == 1 ? '强配' : '弱配'}}</text>
					</view>
					<text class="item-xp-text">
						{{item.itemSpecsWithSmallSpec || item.itemSpecs}}
					</text>
					<view class="item-xp-text" v-if="item.orderItemLineNo">
						行号：{{item.orderItemLineNo}}
					</view>
				</view>
				
				<view class="item-price-bar">
					<view class="change-num">
						<numberBoxList :min='1' :index='index' :eidititem='item' :disabled="isDisabled" :value='item.amount' @numberBoxChange="prodlistNumber"
						 :styleCSS="styleCSS"></numberBoxList>
					</view>
					 
					<view class="item-price-info" v-if='item.itemSpecs'>
						<view class="moneyBox" @tap="goodCallback('editHandle')">
							<view class="moneyStyle">
								<text class="large-text">
									<text class="markPice" v-if="item.singlePrice != item.markedPrice">原价 {{ item.markedPrice }}</text>
									<text style="font-size: 32rpx; letter-spacing: -1rpx; line-height: 44rpx;">￥</text>
									{{ item.singlePrice }}
								</text>
							</view>
							<text v-if="statusCode=='1001' || !statusCode" class="icon iconfont icon-tab-icon-draft" style="font-size: 15px;"></text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<view class="prod-list-item" v-else>
			<view class="item-checkbox" @tap="goodCallback('checkedChange')" v-if="priceState != 0">
				<text v-if="item.checked" class="icon iconfont icon-list-icon-littlechoose-sel" style="color: #E42727;font-size: 36rpx;"></text>
				<text v-else class="icon iconfont icon-list-icon-littlechoose-nor" style="color:#999 ;font-size: 36rpx;"></text>
			</view>
			
			<view class="cover-bar">
				<image class="cover" :src="item.pictureUrl || item.imageUrl || item.itemImg || coverImg" mode=""></image>
				<view class="tag-bar">
					<view class="tag-1 bg-brown" v-if="item.orderTypeCode == '1003'">
						自提
					</view>
					<view class="tag-2 bg-orange" v-if="item.singlePrice == 0">
						赠品
					</view>
				</view>
				
				<numberBoxList :min='1' :index='index' :eidititem='item' :disabled="isDisabled" :value='item.amount' @numberBoxChange="prodlistNumber"
				 :styleCSS="styleCSS"></numberBoxList>
			</view>
			
			<view class="info-bar">
				<view class="item-title-box">
					<view class="item-title">
						<text>{{ item.productNo }}</text>
					</view>
					<view class="item-sub-title" v-if="item.itemModel" @tap="goodCallback('xpHandle')">
						{{ item.itemModel }}
						<text v-if="item.colorDes">{{'(' + item.colorDes + ')'}}</text>
					</view>
					<view class="item-xp-bar" @tap="goodCallback('xpHandle')">
						<view class="item-xp-info">
							<text class="item-xp-text">
								{{item.itemSpecsWithSmallSpec || item.itemSpecs}}
							</text>
						</view>
					</view>
					<view class="item-sub-title" v-if="item.orderItemLineNo">
						行号：{{item.orderItemLineNo}}
					</view>
					<view class="item-sub-title" v-if="item.warehouseName">
						仓库：{{item.warehouseName}}
					</view>
					<view class="item-sub-title" v-if="item.storageBinsName || item.storageLocationName">
						库位：{{item.storageBinsName || item.storageLocationName}}
					</view>
					<view class="item-sub-title" v-if="item.suitSerialNum || item.itemIdentificationNo">
						套序列号：{{item.suitSerialNum || item.itemIdentificationNo}}
					</view>
				</view>
				
				<view class="item-price-bar">
					<view class="item-price-info" v-if='item.itemSpecs'>
						<view class="moneyBox" @tap="goodCallback('editHandle')">
							<view class="moneyStyle">
								<text class="large-text">
									<text class="markPice" v-if="item.singlePrice != item.markedPrice">原价 {{ item.markedPrice }}</text>
									<text style="font-size: 32rpx; letter-spacing: -1rpx; line-height: 44rpx;">￥</text>
									{{ item.singlePrice }}
								</text>
							</view>
							<text v-if="statusCode=='1001' || !statusCode" class="icon iconfont icon-tab-icon-draft" style="font-size: 15px;"></text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import numberBoxList from '@/components/number-box-list/number-box-list.vue'
	export default {
		name: 'goodDeatil',
		components: {
			numberBoxList
		},
		props: {
			item: {
				type: Object,
				default: () => {
					return {};
				}
			},
			index: {
				type: Number,
				default: 0
			},
			statusCode: {
				type: String,
				default: ''
			},
			priceState: {
				type: Number,
				default: 0
			},
			currentIndex: {
				type: Number,
				default: 0
			},
			isDisabled: {
				type: Boolean,
				default: false
			},
		},
		data() {
			return {
				coverImg: require('@/static/img/icon/cover.png'),
				styleCSS: {
					boxWidth: '40rpx',
					height: '40rpx',
					fontSize: '24rpx',
					iconSize: '36rpx',
					iconWeight: 'bold',
					marginTop: '-8rpx'
				}
			};
		},
		created() {
			
		},
		methods: {
			prodlistNumber(item) {
				this.$emit('goodCallback', 'prodlistAmount', item)
			},
			goodCallback(callbackName) {
				if (this.isDisabled) {
					return
				}
				this.item.index = this.index;
				this.$emit('goodCallback', callbackName, this.item)
			},
		}
	}
</script>

<style lang="scss">
	.prod-list-item {
		position: relative;
		display: flex;
		justify-content: space-between;
		width: 750rpx;
		background: #FFFFFF;
		border-bottom: 1px solid $bottom-line-color;
		padding: 40rpx 32rpx;
		
		.item-checkbox {
			position: absolute;
			top: 25rpx;
			right: 33rpx;
			width: 36rpx;
			height: 36rpx;
		}

		.cover-bar {
			position: relative;

			.cover {
				width: 160rpx;
				height: 160rpx;
				border-radius: 4rpx;
				margin-bottom: 36rpx;
			}

			.tag-bar {
				position: absolute;
				top: 18rpx;
				left: 0;
				text-align: center;
				
				.tag-1 {
					width: 68rpx;
					height: 28rpx;
					line-height: 28rpx;
					font-size: 18rpx;
					margin-bottom: 20rpx;
				}

				.tag-2 {
					width: 68rpx;
					height: 28rpx;
					line-height: 28rpx;
					font-size: 18rpx;
				}
			}
		}

		.info-bar {
			flex: 1;
			margin-left: 24rpx;

			.item-title-box {
				min-height: 156rpx;
				margin-bottom: 26rpx;

				.item-title {
					text {
						font-weight: 500;
						font-size: 28rpx;
						line-height: 44rpx;
					}

					image {
						position: absolute;
						top: 24rpx;
						right: 29rpx;
						width: 45rpx;
						height: 45rpx;
					}
				}

				.item-sub-title {
					max-height: 64rpx;
					font-size: 24rpx;
					line-height: 32rpx;
					color: #737373;
					margin-bottom: 8rpx;
					word-break: break-all;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
				}

				.item-xp-bar {
					margin-bottom: 8rpx;
					.item-xp-info {
						.item-xp-text {
							max-height: 96rpx;
							font-size: 24rpx;
							line-height: 32rpx;
							color: #737373;
							word-break: break-all;
							overflow: hidden;
							text-overflow: ellipsis;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 3;
						}
					}
				}
			}

			.item-price-bar {
				
				.item-price-info {
					display: flex;
					height: 44rpx;
					justify-content: flex-end;
					align-items: center;

					.item-price-discount {
						font-size: 28rpx;
						line-height: 44rpx;
						color: #FF650C;
						margin-right: 38rpx;
					}

					.moneyBox {
						font-weight: 500;
						font-size: 36rpx;
						display: flex;
						align-items: center;
						text-align: right;
						color: #272727;

						.moneyStyle {
							.large-text {
								font-weight: 500;
								font-size: 36rpx;
								line-height: 42px;
								letter-spacing: -1rpx;
								color: #E42727;

								.markPice {
									font-size: 24rpx;
									line-height: 32rpx;
									color: #999999;
									text-decoration: line-through;
									font-style: italic;
									margin-right: 20rpx;
								}
							}
						}

						.icon-tab-icon-draft {
							margin-left: 6rpx;
						}
					}
				}
			}
		}
	}
	
	.strongFlag {
		position: relative;
		display: flex;
		justify-content: space-between;
		width: 750rpx;
		background: #FFF8ED;
		border-bottom: 1px solid $bottom-line-color;
		padding: 16rpx 32rpx 18rpx;
		.item-checkbox {
			position: absolute;
			top: 25rpx;
			right: 33rpx;
			width: 36rpx;
			height: 36rpx;
		}
		
		.info-bar {
			width: 100%;
			.item-title-box {
				.item-title {
					display: flex;
					align-items: center;
					height: 44rpx;
					font-weight: 500;
					font-size: 28rpx;
					color: #272727;
					.forceSign {
						font-size: 20rpx;
						line-height: 30rpx;
						color: #FC5151;
						border: 1rpx solid #FC5151;
						border-radius: 4rpx;
						padding: 0 5rpx;
						margin-left: 24rpx;
						&.grey {
							color: #737373;
							border: 1rpx solid #737373;
						}
					}
				}
				.item-xp-text {
					font-size: 24rpx;
					line-height: 32rpx;
					color: #737373;
					margin-top: 2rpx;
				}
			}
			.item-price-bar {
				display: flex;
				align-items: center;
				margin-top: 8rpx;
				.change-num {
					width: 160rpx;
				}
				.item-price-info {
					flex: 1;
					display: flex;
					justify-content: flex-end;
					.moneyBox {
						font-weight: 500;
						font-size: 36rpx;
						display: flex;
						align-items: center;
						text-align: right;
						color: #272727;
					
						.moneyStyle {
							.large-text {
								font-weight: 500;
								font-size: 36rpx;
								line-height: 42px;
								letter-spacing: -1rpx;
								color: #E42727;
					
								.markPice {
									font-size: 24rpx;
									line-height: 32rpx;
									color: #999999;
									text-decoration: line-through;
									font-style: italic;
									margin-right: 20rpx;
								}
							}
						}
					
						.icon-tab-icon-draft {
							margin-left: 6rpx;
						}
					}
				}
			}
		}
	}
</style>
