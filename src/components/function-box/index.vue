<template>
	<view class="container">
		<view class="fn-list">
			<view class="fn-list-item" v-for="(item, i) in list" :key="i" @tap="toPage(item)">
				<image :src="item.bgImg" mode=""></image>
				<view class="item-label" :style="{color:item.color}">
					<view class="title">
						{{item.label}}
					</view>
					<view class="txt">
						{{item.txt}}
					</view>
				</view>
			</view>
		</view>
		
		<view class="chooseOrder" v-if="chooseShow">
			<view class="mask" @tap="chooseShow = false"></view>
			<view class="toBtns">
				<view class="ztBtn" @tap="goPage('zt')">
					自提
					<text class="iconfont icon-ziti"></text>
				</view>
				<view class="psBtn" @tap="goPage('ps')">
					配送
					<text class="iconfont icon-peisong"></text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			list: {
				type: Array,
				default: () => {
					return []
				}
			}
		},
		data() {
			return {
				chooseShow: false
			}
		},
		methods: {
			goPage(type) {
				if (type == 'zt') {
					this.$toPage('/pages/mergeDraft/mergeZtDraft')
				} else {
					this.$toPage('/pages/mergeDraft/mergeDraft')
				}
				this.chooseShow = false;
			},
			toPage(item) {
				let storeInfo = uni.getStorageSync('storeInfo')
				if (uni.getStorageSync('storeInfo').storeName == '门店全局') {
					if (item.url == '/pages/mergeDraft/mergeDraft') {
						this.$msg('门店全局下不可下单')
						return
					}
					if (item.url == '/pages/collectionDetail/collectionDetail') {
						this.$msg('门店全局下不可收款')
						return
					}
				}
				if (item.label == '开单') {
					let personTypeList = uni.getStorageSync('userInfo').personTypeList ? uni.getStorageSync('userInfo').personTypeList : [],
						typeList = [];
					personTypeList.forEach(ele => {
						if (ele == '1007' || ele == '1008') {
							typeList.push(ele)
						}
					})
					if (typeList.length == 2) {
						this.chooseShow = true;
					} else if (typeList.length == 1 && typeList[0] == '1007') {
						this.$toPage('/pages/mergeDraft/mergeZtDraft')
					} else {
						this.$toPage(item.url)
					}
					return
				}
				if (item.type) {
					this.$toTab(item.url)
				} else {
					this.$toPage(item.url)
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		.fn-list {
			width: 100%;
			display: flex;
			justify-content: space-between;

			flex-wrap: wrap;

			.fn-list-item {
				width: 330rpx;
				height: 200rpx;
				box-shadow: 0px, 2px rgba(0, 0, 0, 0.14);
				margin-bottom: 26rpx;
				position: relative;

				image {
					width: 100%;
					height: 100%;
				}

				.item-label {
					position: absolute;
					top: 24rpx;
					left: 26rpx;
					color: #FFF;

					.title {
						font-size: 40rpx;
						line-height: 56rpx;
						margin-bottom: 10rpx;
					}

					.txt {
						font-size: 26rpx;
					}

				}
			}
		}
		
		.chooseOrder {
			position: fixed;
			top: 0;
			left: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 100%;
			z-index: 10;
			.mask {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 1;
				background: rgba(0, 0, 0, 0.6);
			}
			.toBtns {
				background: #FFFFFF;
				border-radius: 16rpx;
				padding: 24rpx 24rpx 0;
				z-index: 9;
				view {
					position: relative;
					width: 574rpx;
					font-weight: 500;
					font-size: 40rpx;
					color: #FFFFFF;
					border-radius: 16rpx;
					padding: 60rpx 0 60rpx 64rpx;
					margin-bottom: 24rpx;
					overflow: hidden;
					&.ztBtn {
						background: #E24949;
						box-shadow: 0 4rpx 8rpx rgba(255, 0, 0, 0.25);
					}
					&.psBtn {
						background: #FDA624;
						box-shadow: 0 4rpx 8rpx rgba(255, 138, 0, 0.25);
					}
				}
				.iconfont {
					position: absolute;
					top: 0;
					right: 8rpx;
					font-size: 208rpx;
					&.icon-ziti {
						color: #CF2F2F;
					}
					&.icon-peisong {
						color: #EF8F00;
					}
				}
			}
		}
	}
</style>
