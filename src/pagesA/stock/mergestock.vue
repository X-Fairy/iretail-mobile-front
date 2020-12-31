<template>
	<page>
		<view slot="body">
			<view class="header">
				<view class="searchBox">
					<text class="iconfont icon-icon-search"></text>
					<input placeholder="请输入货号" v-model="productNo" :focus="focusDisabled" @inputChange="inputChange" @confirm="inputChange"
					 confirm-type='search' @keyboardheightchange="inputFocus" />
					<text class="iconfont icon-filled-close" v-if="productNo.length > 0" @tap='inputDel'></text>
				</view>
			</view>

			<view class="listBox" v-if="typeShowNum == 1">
				<view class="listInfo" :class="{padList: !showHistory}">
					<view class="historyInfo" v-if="showHistory && showHistoryList.length > 0">
						<view class="title">
							<view class="left">
								<text class="iconfont Graph-PieChart"></text>
								<text>搜索记录</text>
							</view>

							<text class="iconfont Trash" @tap="alldel"></text>
						</view>
						<view class="infos">
							<view class="info" hover-class="hover" v-for="(item,index) in showHistoryList" :key="index" @tap='choossecode(item)'>
								{{item}}
							</view>
							<view class="info" hover-class="hover" @tap='showMore' v-if="historyList.length != showHistoryList.length">
								<text class="iconfont icon-arrow-down" style="font-size: 36rpx;"></text>
							</view>
						</view>
					</view>
					<view class="historyInfo" v-if="showHistory">
						<view class="title">
							<view class="left">
								<text class="iconfont icon-Fire"></text>
								<text>门店热销</text>
							</view>
						</view>
						<view class="infos">
							<view class="info" hover-class="hover" v-for="(item,index) in hotList" :key="index" @tap='choossecode(item.productNo)'>
								{{item.productNo}}
							</view>
						</view>
					</view>
					<view class="search-box" v-if="!showHistory">
						<view class="codeBox" hover-class='hover' v-for="(item,index) in productNoList" :key="index" @tap='choossecode(item.name)'>
							<text class="iconfont icon-icon-search"></text>
							<view class="code" v-if="item.sign">
								<block v-for="(ele, eIndex) in item.strList" :key="eIndex">
									<text class="fontWeight" v-if="ele == productNo.toUpperCase()">{{ele}}</text>
									<text v-else>{{ele}}</text>
								</block>
							</view>
							<view class="code" v-else>
								<text>{{item.name}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="loading-text" v-if="!showHistory">{{loadingText}}</view>
			</view>
			<view v-show="showHistory && typeShowNum == 1" class="sample-search" @tap="sampleTap" :style="{bottom:bottom+'rpx'}"
			 :class="className">
				门店样品查询
				<text class="iconfont icon-arrow-right"></text>
			</view>
			<scroll-top :scrollTop="scrollTop"></scroll-top>
			<!-- 内容 -->
			<view v-if="typeShowNum == 2" style="background-color: #F7F7F7;">
				<newStock ref="newStock" :selectItem="selectItem"></newStock>
			</view>
		</view>
	</page>
</template>

<script>
	import newStock from './newStock.vue'
	export default {
		components: {
			newStock
		},
		data() {
			return {
				focusDisabled: false,
				scrollTop: 0,
				selectItem: "", //选中商品
				typeShowNum: 1,
				focusShow: false,
				sampleStyle: '',
				// 货号
				productNo: '',
				page: 1,
				totalPage: 0,
				// 查询商品货号列表
				productNoList: [],
				// 是否显示历史记录
				showHistory: true,
				// 历史搜索数据
				historyList: [],
				// 展示的历史数据
				showHistoryList: [],
				loadingText: '',
				// 热门搜索
				hotList: [],
				bottom: 80,
				className: 'down'
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		onLoad() {
			this.getHotList()
			setTimeout(() => {
				this.focusDisabled = true;
			}, 150)
		},
		onShow() {
			this.historyList = uni.getStorageSync('productNoList') || []
			if (this.historyList.length > 7) {
				this.showHistoryList = this.historyList.slice(0, 7)
			} else {
				this.showHistoryList = this.historyList
			}
		},
		onHide() {
			uni.setStorageSync('productNoList', this.historyList)
		},
		onUnload() {
			uni.setStorageSync('productNoList', this.historyList)
		},
		// 上啦加载
		onReachBottom() {
			if (this.typeShowNum == 1) {
				if (this.productNo) {
					this.page++;
					if (this.page <= this.totalPage) {
						this.productNoPageList();
					} else {
						this.loadingText = '到底了！'
					}
				}
			} else {
				this.$refs.newStock.loadPage();
			}
		},
		methods: {
			// 获取热门搜索
			getHotList() {
				this.$http({
					url: this.$api.queryHotItemInfo,
					success: (res) => {
						this.hotList = res.data;
					}
				})
			},
			// 门店样品查询
			sampleTap() {
				if (uni.getStorageSync('storeInfo').storeName == '门店全局') {
					this.$msg('门店全局下不可查看门店样品')
					return
				}
				uni.navigateTo({
					url: '../stock/sampleInventory'
				});
			},
			// 键盘弹起
			inputFocus(e) {
				let statusBarHeigh = uni.getSystemInfoSync().statusBarHeight
				if (e.detail.height > 0) {
					this.typeShowNum = 1; //切换
					this.showHistory = true;
					this.page = 1;
					this.productNoList = [];
					this.bottom = e.detail.height * 2 - statusBarHeigh;
					// this.className='up'
				} else {
					this.sampleStyle = '';
					this.focusDisabled = false;
					this.bottom = 80
					// this.className='down'
				}
			},
			// 搜索
			inputChange(e) {
				this.typeShowNum = 1; //删除切换到1的状态
				this.productNoList = [];
				if (this.productNo) {
					this.page = 1;
					this.showHistory = false;
					this.productNoPageList();
				} else {
					this.showHistory = true;
				}
			},
			// 清除关键词
			inputDel() {
				this.typeShowNum = 1; //删除切换到1的状态
				this.productNo = ''
				this.showHistory = true
				this.productNoList = []
				this.focusDisabled = true;
			},
			// 查询货号列表
			productNoPageList() {
				this.loadingText = '正在加载中...'
				this.$http({
					url: this.$api.productNoPageList,
					data: {
						productNo: this.productNo,
						pageNum: this.page,
						pageSize: 20
					},
					success: (res) => {
						if (res.data) {
							let list = [];
							res.data.forEach(item => {
								let valItem = {};
								let indexOf = item.indexOf(this.productNo.toUpperCase());
								valItem.sign = false;
								valItem.name = item;
								if (indexOf >= 0) {
									valItem.sign = true;
									valItem.strList = [];
									if (indexOf == 0) {
										valItem.strList[0] = item.substring(0, this.productNo.length)
										valItem.strList[1] = item.substring(this.productNo.length, item.length)
									} else if (indexOf == (item.length - this.productNo.length)) {
										valItem.strList[0] = item.substring(0, indexOf)
										valItem.strList[1] = item.substring(indexOf, item.length)
									} else {
										valItem.strList[0] = item.substring(0, indexOf)
										valItem.strList[1] = this.productNo
										valItem.strList[2] = item.substring(indexOf + this.productNo.length, item.length)
									}
								}

								list.push(valItem);
							})
							this.productNoList = this.productNoList.concat(list)
						}

						this.totalPage = res.totalPage
						if (this.totalPage == 1) {
							this.loadingText = '到底了'
						} else if (this.totalPage == 0) {
							this.loadingText = '暂无货号！'
						}
					}
				})
			},
			// 跳转库存
			choossecode(e) {
				this.typeShowNum = 2; //点击切换内容
				this.scrollTop = 0;
				this.productNo = e;
				this.selectItem = e;
				if (!this.historyList.includes(e)) {
					this.historyList.unshift(e)
				} else {
					let index = this.historyList.indexOf(e)
					this.historyList.splice(index, 1)
					this.historyList.unshift(e)
				}
				if (this.historyList.length > 7) {
					this.showHistoryList = this.historyList.slice(0, 7)
				} else {
					this.showHistoryList = this.historyList
				}
			},
			// 显示全部历史数据
			showMore() {
				this.showHistoryList = this.historyList
			},
			// 删除历史数据
			alldel() {
				this.historyList = [];
				this.showHistoryList = [];
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background: #F7F7F7;
	}

	.sample-search {
		position: fixed;
		height: 80rpx;
		line-height: 80rpx;
		background: #FFFFFF;

		font-size: 28rpx;
		color: #272727;
		text-align: center;
		transition: bottom 0.2s linear;
		color: #737373;

		&.up {
			width: 100%;
		}

		&.down {
			width: 55%;
			left: 22.5%;
			border: 0.5px solid #DEDEDE;
			box-sizing: border-box;
			box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.03);
			border-radius: 100px;
		}
	}

	.header {
		position: fixed;
		display: flex;
		width: 100%;
		flex-direction: column;
		background: #F7F7F7;
		padding: 8rpx 24rpx 24rpx;
		z-index: 99;

		.searchBox {
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			font-size: 28rpx;
			background: #FFFFFF;
			border: 1rpx solid #DEDEDE;
			box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
			border-radius: 16rpx;

			.icon-icon-search {
				color: #B2B2B2;
				font-size: 32rpx;
				padding: 0 16rpx;
			}

			input {
				flex: 1;
				color: #272727;
				height: 80rpx;
				padding: 20rpx 0;
			}

			.icon-filled-close {
				color: #B2B2B2;
				font-size: 32rpx;
				padding: 20rpx 24rpx;
			}
		}
	}

	.listBox {
		margin: 0;
		min-height: 100vh;
		background-color: #F7F7F7;

		.listInfo {
			padding-top: 104rpx;

			&.padList {
				padding-top: 112rpx;
			}

			.historyInfo {
				padding: 16rpx 24rpx 0;

				.title {
					display: flex;
					justify-content: space-between;
					align-items: center;
					height: 44rpx;
					font-size: 28rpx;
					margin-bottom: 24rpx;
					color: #737373;

					.left {
						display: flex;
						align-items: center;
						font-size: 28rpx;
						height: 44rpx;
						color: #737373;

						.Graph-PieChart {
							color: #737373;
							font-size: 32rpx;
							margin: 0 8rpx;
						}

						.icon-Fire {
							color: #FF5C00;
							font-size: 32rpx;
							margin: 0 8rpx;
						}
					}

					.fire {
						width: 30rpx;
						height: 30rpx;
						margin-right: 10rpx;
					}

					.Trash {
						color: #737373;
						font-size: 32rpx;
					}
				}

				.infos {
					display: flex;
					justify-content: flex-start;
					align-items: center;
					flex-wrap: wrap;

					.info {
						line-height: 32rpx;
						font-size: 24rpx;
						color: $title;
						background-color: #F2F2F2;
						border: 1rpx solid #CCCCCC;
						border-radius: 40rpx;
						padding: 12rpx 18rpx;
						margin: 0 16rpx 24rpx 0;

						&.hover {
							background-color: #DEDEDE;
						}
					}
				}

				.iconfont {
					font-size: 30rpx;
				}
			}

			.search-box {
				background: #FFFFFF;
				border: 1rpx solid #DEDEDE;
				box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
				border-radius: 16rpx;
				margin: 0 24rpx;

				.codeBox {
					position: relative;
					display: flex;
					justify-content: flex-start;
					align-items: center;
					height: 96rpx;
					color: $title;
					font-size: 28rpx;
					border-bottom: 1rpx solid $bottom-line-color;
					background-color: #fff;
					padding-left: 32rpx;

					&.hover {
						background: #F2F2F2;
					}

					&::before {
						content: '';
						position: absolute;
						left: 0;
						bottom: -1rpx;
						display: block;
						width: 32rpx;
						height: 1rpx;
						background: #FFFFFF;
					}

					&:first-child {
						border-top-left-radius: 16rpx;
						border-top-right-radius: 16rpx;
					}

					&:last-child {
						border-bottom-left-radius: 16rpx;
						border-bottom-right-radius: 16rpx;
					}

					.icon-icon-search {
						color: #999999;
						font-size: 32rpx;
						margin-right: 16rpx;
					}

					.code {
						color: #272727;
						padding: 26rpx 0;

						.fontWeight {
							font-weight: 500;
						}
					}

					.remove {
						width: 10%;
						text-align: right;
						padding: 26rpx 0;

						.icon-x {
							color: #999999;
							font-size: 30rpx;
						}
					}
				}
			}
		}
	}
</style>
