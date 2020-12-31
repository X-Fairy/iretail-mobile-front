<template>
    <page :customHeader='true' headerBG='#fff'>
		<view slot="header" class="header-title">
			<text class="iconfont icon-arrow-left" @tap="topage"></text>
			<view class="headerTitle">门店样品</view>
		</view>
		<view slot="body">
			<view class="header">
				<view class="searchBox">
					<text class="iconfont icon-icon-search"></text>
					<input placeholder="请输入货号" v-model="productNo" @inputChange="inputChange" @confirm="inputChange" confirm-type="search">
					<text class="iconfont icon-filled-close" v-if="productNo.length > 0" @tap="inputDel"></text>
				</view>
			</view>
			<view style="margin-top: 112rpx;">
				<view v-if="productNoList.length > 0">
					<view class="imgList" v-for="(item,index) in productNoList" :key="index">
						<view class="img-item">
							<image class="img-class" :src="item.pictureUrl ? item.pictureUrl : coverImg" mode="aspectFill">
						</view>
						<view class="describe-infor">
							<view class="title">
								货号：{{item.productNo}}
								<text class="num">{{item.stockQty}}</text>
							</view>
							<view class="title">规格：{{item.itemSpecs}}</view>
							<view class="title" v-if="item.itemModel != 0">面料：{{item.itemModel}}
								<text v-if="item.colorDes">{{'('+item.colorDes+')'}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="loading-text" >{{loadingText}}</view>
			</view>
			<scroll-top :scrollTop="scrollTop"></scroll-top>
		</view>
	</page>
</template>

<script>
	export default {
		components: {},
		data() {
			return {
				coverImg: require("@/static/img/icon/cover.png"),
				scrollTop: 0,
				// 货号
				productNo: "",
				page: 1,
				totalPage: 0,
				// 列表
				productNoList: [],
				loadingText: ""
			};
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		onLoad() {
			this.productNoPageList();
		},
		// 上啦加载
		onReachBottom() {
			// if (this.productNo) {
				this.page++;
				if (this.page <= this.totalPage) {
					this.productNoPageList();
				} else {
					this.loadingText = "到底了！";
				}
			// }
		},
		methods: {
			topage() {
				uni.navigateBack({ delta: 2})
			},
			// 搜索
			inputChange(e) {
				this.page = 1;
				this.productNoList = [];
				// this.productNo = e;
				this.productNoPageList();
			},
			// 清除关键词
			inputDel() {
				this.productNo = "";
				this.productNoList = [];
				this.productNoPageList();
			},
			
			// 查询货号列表
			productNoPageList() {
				this.loadingText = "正在加载中...";
				let storeInfo = uni.getStorageSync("storeInfo");
				
				this.$http({
					url: this.$api.appqueryStoreStockConditionInfo,
					data: {
						storeId: storeInfo.storeId,
						productNo: this.productNo,
						pageNum: this.page,
						pageSize: 20
					},
					success: res => {
						if (res.data) {
							this.productNoList = this.productNoList.concat(res.data);
						}
				
						this.totalPage = res.totalPage;
						if (this.totalPage == 1) {
							this.loadingText = "到底了";
						} else if (this.totalPage == 0) {
							this.loadingText = "暂无样品！";
						}
					}
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.header-title {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 88rpx;
		padding: 0 12rpx;

		.headerTitle {
			font-size: 28rpx;
			font-weight: bold;
		}
		
		.iconfont {
			position: absolute;
			left: 12rpx;
			font-size: 50rpx;
		}
	}
	.header {
		position: fixed;
		width: 100%;
		background-color: #fff;
		padding: 16rpx 32rpx;
		z-index: 10;
		
		.searchBox {
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			font-size: 28rpx;
			background-color: $gray;
			border-radius: 8rpx;
			padding-left: 20rpx;
			
			.icon-icon-search {
				color: #999999;
				font-size: 28rpx;
			}
			
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
	}
	.imgList {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		width: 100%;
		border-bottom: 2rpx solid #F7F7F7;
		padding: 20rpx 32rpx;
		.img-item {
			// width: 210rpx;
			flex: 2;
			.img-class {
				width: 80rpx;
				height: 80rpx;
			}
		}
		.describe-infor {
			flex: 10;
			// padding: 20rpx 10rpx 20rpx 20rpx;
			.title {
				line-height: 40rpx;
				font-size: 24rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				// text-align: center;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				.num {
					margin-right: 20rpx;
					display: inline-block;
					float: right;
				}
			}
		}
	}
</style>
