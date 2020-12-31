<template>
	<page>
		<view slot="body">
			<view class="stock-list">
				<view class="header">
					<view @tap="showDrawer">
						<text class="iconfont icon-setting"></text>
						<text>筛选</text>
					</view>
				</view>
				
				<view class="content">
					<view class="warehouse" v-if="warehouseList.length > 0">
						<view class="item" v-for="(item, index) in warehouseList" :key="index">
							<view class="item-title">{{item.warehouseName}}</view>
							<view class="item-info">
								<view class="num" v-if="item.stockQty > 0">
									<view class="name">数量</view>
									<text>{{item.stockQty}}</text>
								</view>
								<view class="location" v-if="item.storageBinsName">
									<view class="name">库位</view>
									<text>{{item.storageBinsName}}</text>
								</view>
								<view class="orderNo" v-if="item.suitSerialNum">
									<view class="name">套序列号</view>
									<text>{{item.suitSerialNum}}</text>
								</view>
							</view>
						</view>
					</view>
					
					<view class="loading-text">{{loadingText}}</view>
				</view>
				<drawer-box ref="showRight" mode="right" :width="652" :scrollDis="scrollDis" @confirm='handleClick'>
					<view class="stock-search">
						<view class="search-title">筛选仓库</view>
						
						<view class="searchBox">
							<text class="iconfont icon-icon-search"></text>
							<input placeholder="请输入仓库名称" v-model="inputValue" @input="inputChange" @confirm="inputChange" placeholder-style="color: #B2B2B2;"
							 confirm-type='search' />
							<text class="iconfont icon-filled-close" v-if="inputValue.length > 0" @tap='inputDel'></text>
						</view>
						
						<view class="search-content">
							<block v-for="(item, nameIndex) in wareNameList" :key="nameIndex">
								<view class="stock-item" :class="nameIndex == activeIndex ? 'active' : ''" @tap="chooseName(item, nameIndex)">
									{{item}}
								</view>
							</block>
							<view class="loading-text" v-if="loadingName">{{loadingName}}</view>
						</view>
					</view>
				</drawer-box>
			</view>
		</view>
	</page>
</template>
<script>
	import drawerBox from '@/components/drawer/drawer.vue'
	export default {
		components: {
			drawerBox
		},
		data() {
			return {
				scrollDis: true,
				localList: [],
				warehouseList: [],
				wareNameList: [],
				loadingText: '正在加载中...',
				loadingName: '正在加载中...',
				inputValue: "",
				activeIndex: -1,
				activeName: "",
				itemCode: '',
				itemType: '1001',
				pageNum: 0,
				total: 0
			};
		},
		created() {
		},
		onLoad(option) {
			this.itemCode = option.itemCode;
			this.itemType = option.itemType;
			this.queryItemSuitStk('', this.activeName);
		},
		// 上啦加载
		onReachBottom() {
			this.pageNum++;
			if (this.pageNum*10 <= this.total) {
				this.loadingText = '正在加载中...';
				setTimeout(() => {
					this.warehouseList = this.warehouseList.concat(this.localList.slice(this.pageNum*10, this.pageNum*10 + 10));
				}, 800)
			} else {
				this.loadingText = "到底了！";
			}
		},
		methods: {
			chooseName(name, index) {
				this.activeName = name;
				this.activeIndex = index;
			},
			queryItemSuitStk(type, keyName) {
				if (!type || type == 'search') {
					this.loadingText = "正在加载中...";
					this.warehouseList = [];
					this.localList = [];
					this.pageNum = 0;
				}
				if (!type || type == 'nameList') {
					this.loadingName = "正在加载中...";
					this.wareNameList = [];
				}
				this.$http({
					url: this.$api.queryItemSuitStk,
					data: {
						itemCode: this.itemCode,
						suitSerialNumLabelCode: this.itemType,
						warehouseName: keyName,
						page: 1,
						pageSize: 1000
					},
					success: (res) => {
						if (res.code == "01") {
							if (!type || type == 'search') {
								this.localList = res.data;
								this.warehouseList = this.localList.slice(0, 10);
								this.total = res.total;
								if (res.total == 0) {
									this.loadingText = '没有查询到相关结果';
								} else if(res.total <= 10) {
									this.loadingText = '到底了';
								} else {
									this.loadingText = '';
								}
							}
							if (!type || type == 'nameList') {
								let nameList = [];
								res.data.forEach(item => {
									nameList.push(item.warehouseName)
								})
								this.wareNameList = [...new Set(nameList)];
								
								this.scrollDis = true;
								this.loadingName = '';
								if (this.wareNameList.length > 8) {
									this.scrollDis = false;
								} else if (this.wareNameList.length == 0) {
									this.loadingName = '没有查询到相关结果';
								}
							}
							
						} else {
							this.loadingText = res.msg;
						}
					}
				})
			},
			showDrawer() {
				this.$refs['showRight'].open()
			},
			handleClick(name) {
				if (name == 'ok') {
					if (this.activeName) {
						this.queryItemSuitStk('search', this.activeName);
					} else {
						this.queryItemSuitStk('', this.activeName);
					}
					this.$refs['showRight'].close()
				} else {
					this.activeIndex = -1;
					this.activeName = "";
					this.inputValue = "";
					this.queryItemSuitStk('nameList', this.inputValue);
				}
			},
			// 搜索
			inputChange(e) {
				this.activeIndex = -1;
				this.activeName = "";
				this.queryItemSuitStk('nameList', this.inputValue);
			},
			inputDel() {
				this.inputValue = "";
				this.queryItemSuitStk('nameList', this.inputValue);
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #F7F7F7;
	}
	
	.stock-list {
		.header {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			height: 76rpx;
			font-weight: 500;
			font-size: 28rpx;
			color: #737373;
			padding-right: 24rpx;
			.iconfont {
				font-size: 32rpx;
				color: #737373;
				margin-right: 8rpx;
			}
		}
		
		.content {
			.warehouse {
				.item {
					background: #FFFFFF;
					padding-left: 32rpx;
					margin-bottom: 16rpx;
					.item-title {
						font-weight: 500;
						font-size: 32rpx;
						line-height: 48rpx;
						color: #272727;
						border-bottom: 1rpx solid #DEDEDE;
						padding: 32rpx 0 24rpx;
					}
					
					.item-info {
						display: flex;
						align-items: center;
						text-align: left;
						height: 140rpx;
						view {
							font-size: 28rpx;
							line-height: 44rpx;
							color: #272727;
							&.num {
								width: 164rpx;
							}
							&.location {
								width: 202rpx;
							}
							.name {
								font-size: 24rpx;
								line-height: 32rpx;
								color: #737373;
								margin-bottom: 8rpx;
							}
						}
					}
				}
			}
		}
	}
	
	.stock-search {
		padding: 48rpx 32rpx 0;
		.search-title {
			font-weight: 500;
			font-size: 28rpx;
			line-height: 44rpx;
			color: #272727;
			margin-bottom: 24rpx;
		}
		
		.searchBox {
			display: flex;
			align-items: center;
			background: #F2F2F2;
			border-radius: 16rpx;
			margin-bottom: 40rpx;
			
			input {
				flex: 1;
				font-size: 28rpx;
			}
			
			.iconfont {
				font-size: 32rpx;
				color: #B2B2B2;
				padding: 24rpx 16rpx;
			}
		}
		
		.search-content {
			height: 100vh;
			.stock-item {
				line-height: 80rpx;
				font-size: 28rpx;
				color: #272727;
				text-align: center;
				background: #F2F2F2;
				border-radius: 200rpx;
				border: 2rpx solid #F2F2F2;
				margin-bottom: 24rpx;
				&.active {
					background: #FCEBEB;
					border: 2rpx solid #E42727;
				}
			}
		}
	}
</style>
