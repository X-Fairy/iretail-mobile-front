<template>
	<page>
		<view slot="body" class="h5Bg">
			<view class="listBox" v-if="infos">
				<view class="newStock-box" v-if="infos.type==2">
					<view class="main" @tap='toDetail'>
						<view class="left">
							<view class="title">
								{{infos.itemBrief ? infos.itemBrief + ' | ' : ''}}{{infos.productNo ? infos.productNo : ''}}
							</view>
							<text class="sign">{{infos.productLineName}}</text>
						</view>
					</view>
					<view class="modalList">
						<view class="">
							<view class="modalBox" v-for="(ele,index) in fabricInfo" :key="index">
								<view class="item">
									<view class="item-left">
										<text class="code">{{ele.itemCode}}</text>
										<text class="sign" :class="{down: ele.productStateName != '常规在售'}" v-if="ele.productStateName">{{ele.productStateName}}</text>
									</view>
								</view>
								<view class="content">
									<view class="itemSpec" v-if="!ele.itemSpecs">
										{{ele.itemModel}}
									</view>
									<view class="itemSpec" v-else>
										{{ele.itemSpecs}}<text v-if="ele.itemModel">{{'（'+ele.itemModel+'）'}}</text>
									</view>
									<view class="itemDate">
										<text style="margin-right: 24rpx;" v-if="ele.productTime">{{ele.productTimeTitle}}：{{ele.productTime}}</text>
										<text v-if="ele.factoryDeliveryDateLatest">交期：{{ele.factoryDeliveryDateLatest+'天'}}</text>
									</view>
								</view>
							</view>
						</view>
						<view class="more" @tap='showMore' v-if="fabricInfo.length>1 && !isMore">
							<text>展示更多</text>
							<text class="iconfont icon-arrow-down"></text>
						</view>
					</view>
					<view class="pageList" v-if="fabrictotalPage>1">
						<view class="page" v-for="index of fabrictotalPage" :key='index' :class="FabricPage==index+1?'on':''" @tap='changePage(index+1)'>
							{{index+1}}
						</view>
					</view>
				</view>
				<view v-else>
					<fabric-box :infos="infos" @toDetail='toDetail'></fabric-box>
				</view>
			</view>

			<!-- 商品列表 -->
			<view class="pro-list">
				<view class="title">
					<text>库存</text>
					<view class="right" @tap="showDrawer('showRight')" v-if="conditionInfo && conditionInfo.viewFlag == 1">
						<text class="iconfont icon-setting"></text>
						<text>筛选</text>
					</view>
				</view>
				<view class="goodBox" v-if="goodsdata.length > 0">
					<view class="goodItem" v-for="(item,index) in goodsdata" :key="index">
						<view class="top">
							<image class="img" :src="item.pictureUrl ? item.pictureUrl : '../../static/img/icon/cover.png'" mode="scaleToFill"></image>
							<view class="detail">
								<view class="code">
									<text>料号：</text>
									{{item.itemCode}}
								</view>
								<view class="spec" v-if="item.itemSpecs!=='0'">
									<text>规格：</text>
									{{item.itemSpecs}}
								</view>
								<view class="model" v-if="item.itemModel!=='0'">
									<text>面料：</text>
									{{item.itemModel}}
									<text v-if="item.colorDes">{{'('+item.colorDes+')'}}</text>
								</view>
							</view>
						</view>
						<view class="bottom">
							<view class="switch">
								<view class="switch-item" :class="{noActive: item.showModal == 'sample'}" @tap="switchState('normal', index)">
									<text>普通</text>
									<text>{{item.normal.stockQty}}</text>
									<text class="iconfont icon-Arrow-Down" :class="{rotate: item.showModal == 'normal'}"></text>
								</view>
								<view class="switch-line" v-show="!item.showModal"></view>
								<view class="switch-item" :class="{noActive: item.showModal == 'normal'}" @tap="switchState('sample', index)">
									<text>样品</text>
									<text>{{item.sample.stockQty}}</text>
									<text class="iconfont icon-Arrow-Down" :class="{rotate: item.showModal == 'sample'}"></text>
								</view>
							</view>
							<view class="switch-info" v-if="item.showModal == 'normal'">
								<view class="box">
									<view class="count">{{item.normal.availableSaleQty}}</view>
									<view>可售</view>
								</view>
								<view class="box">
									<view class="count">{{item.normal.excludeAvailableQty}}</view>
									<view>不可售</view>
								</view>
								<!-- 穿透暂不开放 -->
								<!-- <view class="box" @tap="toQuery(item, item.normal.lockQty, '1004', '锁定数量')">
									<view class="count">{{item.normal.lockQty}}</view>
									<view>锁定<text class="iconfont icon-Arrow-right" v-if="item.normal.lockQty > 0"></text></view>
								</view> -->
								<view class="box">
									<view class="count">{{item.normal.lockQty}}</view>
									<view>锁定</view>
								</view>
								<!-- 穿透暂不开放 -->
								<!-- <view class="box" @tap="toQuery(item, item.normal.saleUndeliveryQty, '1004', '销售未发')">
									<view class="count">{{item.normal.saleUndeliveryQty}}</view>
									<view>销售未发<text class="iconfont icon-Arrow-right" v-if="item.normal.saleUndeliveryQty > 0"></text></view>
								</view> -->
								<view class="box">
									<view class="count">{{item.normal.saleUndeliveryQty}}</view>
									<view>销售未发</view>
								</view>
								<view class="box">
									<view class="count">{{item.normal.inTransitQty}}</view>
									<view>入库在途</view>
								</view>
								<view class="box">
									<view class="count">{{item.normal.outOfStkQty}}</view>
									<view>常规缺货</view>
								</view>
								<view class="bottomBox" @tap="toStock(item, '1004')" v-if="item.normal.stockQty > 0">即时库存<text class="iconfont icon-Arrow-right"></text></view>
							</view>

							<view class="switch-info" v-if="item.showModal == 'sample'">
								<view class="box">
									<view class="count">{{item.sample.availableSaleQty}}</view>
									<view>可售</view>
								</view>
								<view class="box">
									<view class="count">{{item.sample.excludeAvailableQty}}</view>
									<view>不可售</view>
								</view>
								<!-- 穿透暂不开放 -->
								<!-- <view class="box" @tap="toQuery(item, item.sample.lockQty, '1001', '锁定数量')">
									<view class="count">{{item.sample.lockQty}}</view>
									<view>锁定<text class="iconfont icon-Arrow-right" v-if="item.sample.lockQty > 0"></text></view>
								</view> -->
								<view class="box">
									<view class="count">{{item.sample.lockQty}}</view>
									<view>锁定</view>
								</view>
								<!-- 穿透暂不开放 -->
								<!-- <view class="box" @tap="toQuery(item, item.sample.saleUndeliveryQty, '1001', '销售未发')">
									<view class="count">{{item.sample.saleUndeliveryQty}}</view>
									<view>销售未发<text class="iconfont icon-Arrow-right" v-if="item.sample.saleUndeliveryQty > 0"></text></view>
								</view> -->
								<view class="box">
									<view class="count">{{item.sample.saleUndeliveryQty}}</view>
									<view>销售未发</view>
								</view>
								<view class="box">
									<view class="count">{{item.sample.inTransitQty}}</view>
									<view>入库在途</view>
								</view>
								<view class="box">
									<view class="count">{{item.sample.outOfStkQty}}</view>
									<view>常规缺货</view>
								</view>
								<view class="bottomBox" @tap="toStock(item, '1001')" v-if="item.sample.stockQty > 0">即时库存<text class="iconfont icon-Arrow-right"></text></view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="loading-text">{{loadingText}}</view>
			<scroll-top :scrollTop="scrollTop"></scroll-top>
			<drawer-box ref="showRight" mode="right" :width="652" @confirm='handleClick' :current="true" :conditionInfo='conditionInfo'
			 @chooseSpec='chooseSpec' @chooseFabric='chooseFabric' @chooseSize='chooseSize' :specList="specList" :sizeIndex="sizeIndex"
			 :FabricIndex="FabricIndex">
			</drawer-box>
		</view>
	</page>
</template>
<script>
	import fabricBox from './fabricInfo.vue'
	import drawerBox from '@/components/drawer/drawer.vue'
	export default {
		props: {
			selectItem: {
				type: String,
				default: ""
			}
		},
		components: {
			fabricBox,
			drawerBox
		},
		data() {
			return {
				// 类型
				newItem: {
					stockQty: 0, // 数量
					availableSaleQty: 0, // 可售
					excludeAvailableQty: 0, // 不可售
					lockQty: 0, // 锁定
					saleUndeliveryQty: 0, // 销售未发
					inTransitQty: 0, // 入库在途
					outOfStkQty: 0, // 常规缺货
				},
				prodList: [],
				scrollTop: 0,
				infos: null,
				// 商品列表数据
				goodsdata: [],
				goodsList: [],
				indexList: 10,
				// 关键词搜索
				keyWords: '',
				// 查询库存当前页
				page: 1,
				// 查询面料当前页
				FabricPage: 1,
				// 库存总页数
				totalPage: 1,
				// 面料总页数
				fabrictotalPage: 1,
				loadingText: '正在加载中...',
				// 面料
				fabricInfo: [],
				isMore: false,
				// 筛选
				conditionInfo: null,
				// 选中的规格
				specList: [],
				// 当前选择尺寸索引
				sizeIndex: -1,
				// 选择的面料索引
				FabricIndex: -1,
				colorDes: '',
				size: '',
				searchSizeFlag:''//选配类型
			};
		},
		created() {
			this.keyWords = this.selectItem;
			this.getMarketInfo();
			this.goodsList = [];
			this.goodsdata = [];
			this.getProductList();
			this.stockConditionInfo();

		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		methods: {
			switchState(name, index) {
				if (this.goodsdata[index].showModal == name) {
					this.goodsdata[index].showModal = ''
				} else {
					this.goodsdata[index].showModal = name;
				}
				this.$forceUpdate();
			},
			loadPage() {
				this.page++;
				if (this.page <= this.totalPage) {
					this.loadingText = '正在加载中...';
					setTimeout(() => {
						this.goodsdata = this.goodsList.slice(0, this.page * this.indexList);
					}, 300)
					// this.getProductList();
				} else {
					this.loadingText = '到底了！'
				}
			},
			// 查询面料列表
			getFabricPageList() {
				this.$http({
					url: this.$api.queryFabricPageList,
					data: {
						productNo: this.keyWords,
						pageNum: this.FabricPage
					},
					success: (res) => {
						if (res.data) {
							this.fabricInfo = res.data
							this.fabrictotalPage = res.totalPage
						}
					}
				})
			},
			// 查询上下市信息
			getMarketInfo() {
				this.$http({
					url: this.$api.queryOnDownMarketInfo,
					data: {
						productNo: this.keyWords
					},
					success: (res) => {
						if (res.code === '02') {
							this.$msg(res.msg)
							this.loadingText = res.msg
							return false
						}
						this.infos = res.data
						this.fabricInfo = res.data.fabricInfo
					}
				})
			},
			setItem(item, ele) {
				if (!item.normal) {
					item.normal = JSON.parse(JSON.stringify(this.newItem))
				}
				if (!item.sample) {
					item.sample = JSON.parse(JSON.stringify(this.newItem))
				}
				if (ele.suitSerialNumLabelCode == '1004') {
					item.normal.stockQty += ele.stockQty;
					item.normal.availableSaleQty += ele.availableSaleQty;
					item.normal.excludeAvailableQty += ele.excludeAvailableQty;
					item.normal.lockQty += ele.lockQty;
					item.normal.saleUndeliveryQty += ele.saleUndeliveryQty;
					item.normal.inTransitQty += ele.inTransitQty;
					item.normal.outOfStkQty += ele.outOfStkQty;
				} else {
					item.sample.stockQty += ele.stockQty;
					item.sample.availableSaleQty += ele.availableSaleQty;
					item.sample.excludeAvailableQty += ele.excludeAvailableQty;
					item.sample.lockQty += ele.lockQty;
					item.sample.saleUndeliveryQty += ele.saleUndeliveryQty;
					item.sample.inTransitQty += ele.inTransitQty;
					item.sample.outOfStkQty += ele.outOfStkQty;
				}
				return item
			},
			// 查询库存信息
			getProductList() {
				this.$http({
					url: this.$api.productList,
					data: {
						accurateProductNo: this.keyWords,
						itemSpecs: this.specList.toString() || '',
						colorDes: this.colorDes,
						pageNum: this.page,
						pageSize: 1000,
						size: this.size,
						warehoserOperWay: "1003",
						searchSizeFlag:this.searchSizeFlag
					},
					success: (res) => {
						if (res.code === '02') {
							this.$msg(res.msg)
							this.loadingText = res.msg
							return false
						}
						if (res.data && res.data.length > 0) {
							let list = [];
							res.data.forEach(ele => {
								let isAdd = true;
								list.forEach((item, index) => {
									if (ele.itemCode == item.itemCode) {
										this.setItem(item, ele)
										isAdd = false;
										return
									}
								})

								if (isAdd) {
									let newProd = {
										itemCode: ele.itemCode,
										itemSpecs: ele.itemSpecs,
										imageUrl: ele.imageUrl,
										itemModel: ele.itemModel,
										colorDes: ele.colorDes,
										showModal: ''
									};
									this.setItem(newProd, ele)

									list.push(newProd);
								}
							})
							this.goodsList = this.goodsList.concat(list)
							this.goodsdata = this.goodsList.slice(0, this.indexList);
							let page = list.length / 10,
								rep = /[\.]/;
							this.totalPage = rep.test(page) ? (parseInt(page) + 1) : page;
							this.loadingText = this.totalPage == 1 ? '到底了' : '';
						} else {
							this.loadingText = '抱歉，没有找到符合条件的产品'
						}
					}
				})
			},
			//分页查询面料
			changePage(e) {
				this.FabricPage = e;
				this.getFabricPageList()
			},
			// 查看更多
			showMore() {
				this.isMore = true
				this.getFabricPageList()
			},
			// 跳转详情
			toDetail() {
				uni.navigateTo({
					url: '../../pages/productDetail/productDetail?tkImageId=' + this.infos.imageId + '&type=stock'
				})
			},
			toQuery(item, num, itemType, title) {
				if (num > 0) {
					uni.navigateTo({
						url: './queryNoList?itemCode=' + item.itemCode + '&title=' + title + '&itemType=' + itemType
					})
				}
			},
			// 即时库存
			toStock(item, itemType) {
				uni.navigateTo({
					url: './stockList?itemCode=' + item.itemCode + '&itemType=' + itemType
				})
			},
			// 查询库存筛选条件
			stockConditionInfo() {
				this.$http({
					url: this.$api.queryStockConditionInfo,
					data: {
						productNo: this.keyWords,
						selectSuitOrAvailableFlag:2
					},
					success: (res) => {
						this.conditionInfo = res.data;
						this.searchSizeFlag = res.data.searchSizeFlag ? res.data.searchSizeFlag : ''
						if (this.conditionInfo.colorDes) {
							let arr = []
							for (let key in this.conditionInfo.colorDes) {
								arr.push(key)
							}
							this.conditionInfo.fabricList = arr
						}
					}
				})
			},
			// 打开筛选窗口
			showDrawer(e) {
				this.$refs[e].open()
			},
			// 选择尺寸
			chooseSize(e) {
				if (this.sizeIndex == e) {
					this.sizeIndex = -1
				} else {
					this.sizeIndex = e
				}
			},
			// 面料
			chooseFabric(e) {
				if (this.FabricIndex == e) {
					this.FabricIndex = -1
				} else {
					this.FabricIndex = e
				}
			},
			// 选择规格，
			chooseSpec(e) {
				this.specList = e
			},
			// 筛选确定
			handleClick(e) {
				if (e == 'del') {
					this.specList = [];
					this.sizeIndex = -1
					this.FabricIndex = -1
				} else {
					if (this.sizeIndex != -1) {
						this.size = this.conditionInfo.size[this.sizeIndex]
					} else {
						this.size = ''
					}
					if (this.FabricIndex != -1) {
						let color = this.conditionInfo.fabricList[this.FabricIndex]
						this.colorDes = this.conditionInfo.colorDes[color].toString()
					} else {
						this.colorDes = ''
					}
					this.loadingText = '正在加载中...'
					this.goodsList = []
					this.goodsdata = []
					this.page = 1
					this.$refs['showRight'].close()
					this.getProductList()
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	/* #ifdef H5 */
	.h5Bg {
		background: #F7F7F7;
	}
	/* #endif */
	.page-body {
		box-shadow: none !important;
		padding-top: 0 !important;
	}
	
	.place {
		background: #f7f7f7;
		height: 120rpx;
	}

	.listBox {
		padding-top: 120rpx;

		.newStock-box {
			background: #FFFFFF;
			border: 1rpx solid #DEDEDE;
			box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
			border-radius: 16rpx;
			padding-bottom: 16rpx;
			margin: 0 24rpx;
		}

		.main {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 28rpx;
			border-bottom: 1rpx solid #F2F2F2;
			padding: 14rpx 24rpx 12rpx;

			.left {
				display: flex;
				justify-content: left;
				align-items: center;
				color: $title;

				.sign {
					font-weight: 500;
					font-size: 20rpx;
					color: #999999;
					border: 1rpx solid #999999;
					border-radius: 4rpx;
					padding: 0 5rpx;
					margin-left: 16rpx;
				}

				.title {
					font-size: 28rpx;
					color: $title;
					font-weight: 500;
				}
			}

			.right {
				color: #737373;
			}
		}

		.time {
			padding: 16rpx 32rpx;
			padding-bottom: 0;
			color: #737373;
			font-size: 24rpx;
		}

		.modalList {
			padding: 24rpx 24rpx 0;

			.modalBox {
				border-radius: 16rpx;
				background-color: #F7F7F7;
				padding: 20rpx 24rpx 24rpx;
				margin-top: 16rpx;

				&:first-child {
					margin-top: 0;
				}

				.item {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding-bottom: 16rpx;
					font-size: 28rpx;

					.item-left {
						display: flex;
						align-items: center;

						.code {
							color: #737373;
							font-size: 24rpx;
							line-height: 36rpx;
						}

						.sign {
							color: #15784E;
							font-size: 20rpx;
							line-height: 28rpx;
							background: #DFF1E9;
							border-radius: 4rpx;
							padding: 4rpx 8rpx;
							margin-left: 16rpx;

							&.down {
								color: #DA2323;
								background: #F5E0E0;
							}
						}
					}

					.item-right {
						color: #8C5200;
						font-size: 20rpx;
					}
				}

				.content {
					.itemSpec {
						font-size: 28rpx;
						color: $title;
						word-break: break-all;
						line-height: 44rpx;
						margin-bottom: 4rpx;
					}

					.itemDate {
						color: #737373;
						font-size: 24rpx;
						line-height: 32rpx;
					}
				}
			}

			.more {
				color: #737373;
				font-size: 28rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 22rpx 0 22rpx;

				.icon-arrow-down {
					margin-left: 10rpx;
				}
			}
		}

		.pageList {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			padding: 16rpx 20rpx 16rpx 0;

			.page {
				font-size: 28rpx;
				color: #737373;
				margin-right: 15rpx;
				width: 40rpx;
				height: 40rpx;
				line-height: 40rpx;
				border-radius: 50%;
				text-align: center;
				background-color: #f7f7f7;
			}

			.on {
				color: #fff;
				background-color: #70B1AA;
			}
		}
	}

	.pro-list {
		.title {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 44rpx;
			font-weight: 500;
			font-size: 28rpx;
			color: #737373;
			margin: 40rpx 32rpx 24rpx;

			.right {
				display: flex;
				color: $title;
				align-items: center;

				.icon-setting {
					font-size: 32rpx;
					color: #737373;
					margin-right: 10rpx;
				}
			}
		}

		.goodBox {
			padding: 0 24rpx;

			.goodItem {
				background: #FFFFFF;
				border: 1rpx solid #DEDEDE;
				box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
				border-radius: 16rpx;
				margin-bottom: 24rpx;

				.top {
					display: flex;
					justify-content: left;
					border-bottom: 1rpx solid #DEDEDE;
					padding: 40rpx 32rpx 32rpx;

					.img {
						width: 96rpx;
						height: 96rpx;
						border-radius: 8rpx;
						margin-right: 16rpx;
					}

					.detail {
						font-size: 24rpx;
						line-height: 32rpx;
						color: #737373;

						>view:nth-of-type(n+2) {
							margin-top: 4rpx;
						}

						.model {
							word-break: break-all;
						}
					}
				}

				.bottom {
					width: 100%;

					.switch {
						display: flex;
						justify-content: space-between;
						align-items: center;
						height: 96rpx;

						.switch-item {
							flex: 1;
							display: flex;
							justify-content: center;
							align-items: center;
							height: 100%;
							font-size: 28rpx;
							color: #272727;

							&.noActive {
								background: #F2F2F2;
							}

							>text:nth-of-type(n+2) {
								margin-left: 8rpx;
							}

							.icon-Arrow-Down {
								font-size: 24rpx;
								color: #737373;
								transform: rotate(0);
								transition: all 0.1s ease-in-out;

								&.rotate {
									transform: rotate(180deg);
								}
							}
						}

						.switch-line {
							width: 1rpx;
							height: 100%;
							background: #DEDEDE;
						}
					}

					.switch-info {
						display: flex;
						justify-content: flex-start;
						align-items: center;
						flex-wrap: wrap;
						background: #FFFFFF;
						border-bottom-left-radius: 16rpx;
						border-bottom-right-radius: 16rpx;
						padding: 16rpx 0 0;

						.box {
							width: 33.33%;
							height: 120rpx;
							text-align: center;
							color: #737373;
							font-size: 24rpx;
							line-height: 32rpx;
							padding-top: 16rpx;

							.icon-Arrow-right {
								font-size: 24rpx;
								color: #737373;
							}

							.count {
								font-weight: 500;
								font-size: 36rpx;
								line-height: 48rpx;
								color: #272727;
								margin-bottom: 8rpx;
							}
						}

						.bottomBox {
							display: flex;
							justify-content: center;
							align-items: center;
							width: 100%;
							height: 108rpx;
							font-size: 28rpx;
							color: #272727;
							border-top: 1rpx solid #DEDEDE;
							border-radius: 0 0 16rpx 16rpx;
							margin-top: 32rpx;

							.iconfont {
								font-size: 24rpx;
								color: #000000;
							}
						}
					}
				}
			}
		}
	}
</style>
