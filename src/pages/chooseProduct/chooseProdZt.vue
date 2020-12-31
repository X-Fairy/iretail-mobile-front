<template>
	<page :customHeader='true' headerBG='#fff'>
		<view slot="header" class="header-title">
			<text class="iconfont icon-arrow-left" @tap="topage"></text>
			<view class="headerTitle">
				{{headerTitle}}
			</view>
		</view>
		<view slot="body">
			<!-- 功能区域 -->
			<view class="search-bar">
				<search-box :currentIndex="currentIndex" :stateList="stateList" @selectHandle='selectHandle'
				 @inputChange="inputChange" @inputText="inputText" placeholder="货号/规格" @inputDel='inputDel' :inputValue="inputValue" :orderType="type" @scanCode="scanCode"></search-box>
			</view>
			<view class="place"></view>
			<!-- 商品区域 -->
			<view class="stock" v-if="showStock">
				<text>库存</text>
				<view class="right" @tap="showDrawer('showRight')" v-if="conditionInfo.viewFlag==1">
					<text class="icon iconfont icon-setting"></text>
					<text>筛选</text>
				</view>
			</view>
			
			<view class="prod-list">
				<good-list :list="prodList" type='choose' :currentIndex="1" :isZtAmount="true" @showPopup="showPopup" @toDetail="toDetail"></good-list>
			</view>
			<!-- 库存筛选 -->
			<drawer-box ref="showRight" mode="right" :width="652" @confirm='chooseClick' :current="true" :conditionInfo='conditionInfo'
			 :top='top' @chooseSpec='chooseSpec' @chooseFabric='chooseFabric' @chooseSize='chooseSize' :specList="specList"
			 :sizeIndex="sizeIndex" :FabricIndex="FabricIndex">
			</drawer-box>
			<view class="loading-text">{{loadingText}}</view>
			<scroll-top :scrollTop="scrollTop" :isDisabled="isDisabled"></scroll-top>
			<!-- 选中商品弹窗 -->
			<modal :show="cartShow" @cancel="cartShow=false" :custom="true" class="modalBox" width="670rpx" padding="32rpx 0"
			 radius="16rpx">
				<view class="" v-if="count>0">
					<view class="title">
						<text>已添加{{count}}商品</text>
						<text class="del" @tap='delall'>清空</text>
					</view>
					<scroll-view scroll-y="true" class="scroll-box">
						<view class="productBox" v-for="(item,index) in chooseProduct" :key="index">
							<image class="product-Img" :src="item.imageUrl || item.pictureUrl || item.itemImg || '../../static/img/icon/cover.png'" mode=""></image>
							<view class="detail">
								<view class="productNo">
									<text>{{ item.productNo }}</text>
									<text class="iconfont Trash" @tap='remove(index)'></text>
								</view>
								<view class="itemModel">
									{{ item.itemModel }}
									<text v-if="item.colorDes">{{'('+item.colorDes+')'}}</text>
								</view>
								<view class="spec-count" v-if="item.itemSpecsWithSmallSpec || item.itemSpecs">
									<view class="spec">
										{{item.itemSpecsWithSmallSpec || item.itemSpecs}}
									</view>
								</view>
								<view class="itemModel" v-if="item.warehouseName">
									仓库：{{item.warehouseName}}
								</view>
								<view class="itemModel" v-if="item.storageBinsName">
									库位：{{item.storageBinsName}}
								</view>
								<view class="itemModel" v-if="item.suitSerialNum || item.itemIdentificationNo">
									套序列号：{{item.suitSerialNum || item.itemIdentificationNo}}
								</view>
							</view>
						</view>
					</scroll-view>
				</view>
				<view class="noData" v-else>
					<text>暂无商品</text>
				</view>
			</modal>
			<view class="footerBtn" v-if="showBtn" :style="{bottom:footerBottom+'rpx'}">
				<view class="Btn" @tap="handleClick">
					<text>已添加商品</text>
					<text class="badge" :class="count > 0 ? 'show' : ''">{{count}}</text>
					<text class="icon iconfont icon-Arrow-Down" :class="cartShow ? 'rotate' : ''"></text>
				</view>
				<view class="confirm" @tap='confirm'>
					完成
				</view>
			</view>
		</view>
	</page>
</template>

<script>
	import searchBox from '@/components/search-box/index.vue'
	import goodList from '@/components/good-list/index.vue'
	import modal from '@/components/modal/modal.vue'
	import drawerBox from '@/components/drawer/drawer.vue'
	import utils from '@/common/js/utils.js'
	export default {
		components: {
			searchBox,
			modal,
			goodList,
			drawerBox
		},
		data() {
			return {
				isDisabled: false,
				top: 120,
				headerTitle: '选择商品',
				type: '', // 订单类型
				scrollTop: 0,
				// 商品列表
				prodList: [],
				inputValue: '',
				// 商品列表参数
				prodParams: {
					keyWords: '',
					storeId: uni.getStorageSync('storeInfo').storeId,
					pageNum: 1,
					pageSize: 20
				},
				// 总页数
				totalPage: 1,
				popupClass: '', //商品选择弹窗css类，控制开关动画
				loadingText: '正在加载中...',
				// 是否显示弹窗
				cartShow: false,
				// 选择的商品
				chooseProduct: [],
				count: 0,
				// 底部悬浮按钮
				footerBottom: 0,
				showBtn: true,
				currentIndex: 0,
				stateList: [{
					id: 0,
					label: '门店库存'
				}, {
					id: 1,
					label: '全部库存'
				}],
				// 货号表列表
				// productNoList: [],
				// 是否显示库存
				showStock: false,
				// 筛选
				conditionInfo: {},
				// 选中的规格
				specList: [],
				// 选择的面料索引
				FabricIndex: -1,
				// 当前选择尺寸索引
				sizeIndex: -1,
				colorDes: '',
				size: '',
				isStock: false,
				// 是否是门店库存
				// isStore:false,
				searchSizeFlag:''//选配类型
			}
		},
		onLoad(e) {
			let system = uni.getSystemInfoSync();
			system.model = system.model.replace(' ', '');
			system.model = system.model.toLowerCase();
			if (system.model.indexOf('iphonex') != -1 || system.model.indexOf('iphone11') != -1) {
				this.footerBottom = 80;
			}
			this.type = e.type
			this.init()
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		onShow() {
			this.chooseProduct = uni.getStorageSync('chooseGoods') || []
			this.count = this.chooseProduct.length
		},
		// 上啦加载
		onReachBottom() {
			this.prodParams.pageNum++;
			if (this.prodParams.pageNum <= this.totalPage) {
				this.getStockInfo();
			} else {
				this.loadingText = '到底了！'
			}
		},
		methods: {
			init() {
				this.stockConditionInfo();
				this.getStockInfo();
				this.getOrderItemLine()
			},
			// 搜索回调
			inputChange(key) {
				this.prodParams.keyWords = key;
				this.search()
			},
			// 搜索输入回调
			inputText(key) {
				if (key.detail) {
					this.inputValue = key.detail.value;
				} else {
					this.inputValue = key;
				}
			},
			inputDel() {
				this.prodParams.keyWords = '';
				this.specList = []
				this.colorDes = ''
				this.size = ''
				this.inputValue = ''
				this.search()
			},
			// 搜索
			search() {
				this.loadingText = '正在加载中...'
				this.prodParams.pageNum = 1;
				this.prodList = [];
				this.specList = [];
				this.colorDes = ''
				this.stockConditionInfo();
				this.getStockInfo();
			},
			// 筛选
			selectHandle(e) {
				this.currentIndex = e.id;
				this.search()
			},
			scanCode() {
				uni.scanCode({
					success: res => {
						uni.showLoading({
							title: '加载中'
						});
						// 查询商品档案
						this.$http({
							url: this.$api.getScanItemDetail,
							data: {
								itemCode: res.result,
								storeId: uni.getStorageSync('storeInfo').storeId,
								type: this.currentIndex == 0 ? 1 : 0
							},
							success: (res) => {
								if (res.code == '01') {
									// 初始化Prod新增属性
									let item = res.data,
										orderItemLineNo = uni.getStorageSync('orderItemLineNo') ? uni.getStorageSync('orderItemLineNo') : 0;
									
									item.orderItemLineNo = orderItemLineNo + 10;
									item.amount = item.amount ? item.amount : 1;
									item.singlePrice = item.markedPrice;
									item.itemSpecsWithSmallSpec = item.itemSpecs;
									this.chooseProduct.push(JSON.parse(JSON.stringify(item)));
									uni.setStorageSync('chooseGoods', this.chooseProduct)
									uni.setStorageSync('orderItemLineNo', item.orderItemLineNo);
									this.$msg('添加成功')
									this.count++
								} else {
									this.$msg(res.msg)
								}
							}
						})
					}
				});
			},
			// 查询库存信息
			getStockInfo() {
				let params = {
					itemSpecs: this.specList.toString() || '',
					colorDes: this.colorDes,
					size: this.size,
					keyWords: this.prodParams.keyWords,
					storeId: this.currentIndex == 0 ? uni.getStorageSync('storeInfo').storeId : '',
					pageNum: this.prodParams.pageNum,
					searchSizeFlag:this.searchSizeFlag,
					pageSize: 20
				}
				this.loadingText = '正在加载中...'
				this.$http({
					url: this.$api.queryAllStockByCondition,
					data: params,
					success: (res) => {
						if (res.code == '01') {
							if (res.data) {
								// res.data.forEach(item => {
								// 	item.itemType = '1003'
								// })
								this.prodList = this.prodList.concat(res.data);
								this.totalPage = res.totalPage
								if (this.totalPage == 1) {
									this.loadingText = '到底了！'
								} else if (this.totalPage == 0) {
									this.loadingText = res.message
								}
							} else {
								this.loadingText = res.message
							}
						} else {
							this.loadingText = res.message
						}
					}
				})
			},
			// 序号重排
			getOrderItemLine() {
				let orderItemLineNo = this.$utils.getOrderItemLineNo(),
					chooseProduct = uni.getStorageSync('chooseGoods') ? uni.getStorageSync('chooseGoods') : [];
				
				chooseProduct.forEach(item => {
					orderItemLineNo += 10;
					let lineList = uni.getStorageSync('lineList') ? uni.getStorageSync('lineList') : [];
					
					if (!item.leadOrderItemLineNo) { // 主产品
						lineList.push({
							oldLineNo: JSON.parse(JSON.stringify(item.orderItemLineNo)),
							newLineNo: orderItemLineNo
						})
						uni.setStorageSync('lineList', lineList)
					}
					
					if (item.leadOrderItemLineNo) { //强弱配
						if (lineList.length > 0) {
							lineList.forEach(ele => {
								if (ele.oldLineNo == item.leadOrderItemLineNo) {
									item.leadOrderItemLineNo = ele.newLineNo;
								}
							})
						}
					}
					item.orderItemLineNo = orderItemLineNo;
				})
				uni.setStorageSync('orderItemLineNo', orderItemLineNo)
				uni.setStorageSync('chooseGoods', chooseProduct)
				uni.removeStorageSync('lineList')
			},
			// 显示商品规格弹窗
			showPopup(e) {
				// 防止重复点击
				if (!this.$utils.multipleClicks('加载中')) {
					return
				}
				e.amount = 1
				e.itemSpecsWithSmallSpec = e.itemSpecs
				this.$http({
					url: this.$api.getItemPrice,
					data: {
						itemCode: e.itemCode
					},
					success: res => {
						this.$utils.multipleRemoveClicks();
						let markedPrice = res.data.markedPrice;
						e.markedPrice = markedPrice;
						e.singlePrice = markedPrice;
						// 赋值行号
						let orderItemLineNo = uni.getStorageSync('orderItemLineNo') + 10;
						e.orderItemLineNo = orderItemLineNo;
						uni.setStorageSync('orderItemLineNo', orderItemLineNo);
						this.chooseProduct.push(JSON.parse(JSON.stringify(e)))
						uni.setStorageSync('chooseGoods', this.chooseProduct)
						this.$msg('添加成功')
						this.count++
					}
				})
			},
			// 返回上一页
			topage() {
				uni.navigateBack()
			},
			// 删除某一项
			remove(index) {
				this.count--;
				let item = this.chooseProduct[index];
				this.chooseProduct.forEach(prodItem => {
					if (prodItem.leadOrderItemLineNo == item.orderItemLineNo) {
						delete prodItem.leadOrderItemLineNo;
						delete prodItem.strongFlag
					}
				})
				
				this.chooseProduct.splice(index, 1)
				uni.setStorageSync('chooseGoods', this.chooseProduct)
			},
			// 清空
			delall() {
				this.chooseProduct = [];
				this.count = 0
				uni.setStorageSync('chooseGoods', this.chooseProduct)
			},
			handleClick() {
				this.cartShow = !this.cartShow
			},
			// 完成
			confirm() {
				if (this.chooseProduct.length > 0) {
					uni.setStorageSync('chooseProduct', this.chooseProduct)
				}
				uni.removeStorageSync('chooseGoods')
				uni.navigateBack()
			},
			// 跳转详情
			toDetail(e) {
				uni.navigateTo({
					url: '../productDetail/productDetail?product=' + encodeURIComponent(JSON.stringify(e)) + '&type=order'
				})
			},
			// 查询库存筛选条件
			stockConditionInfo() {
				this.$http({
					url: this.$api.queryStockConditionInfo,
					data: {
						productNo: this.prodParams.keyWords,
						selectSuitOrAvailableFlag:1
					},
					success: (res) => {
						if (res.code == '01') {
							if (res.data && res.data.viewFlag == 1) {
								this.searchSizeFlag = res.data.searchSizeFlag ? res.data.searchSizeFlag : ''
								this.showStock = true
								this.conditionInfo = res.data
								if (this.conditionInfo.colorDes) {
									let arr = []
									for (let key in this.conditionInfo.colorDes) {
										arr.push(key)
									}
									this.conditionInfo.fabricList = arr
								}
							} else {
								this.showStock = false
							}
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
			chooseSpec(e) {
				this.specList = e
			},
			// 筛选确定
			chooseClick(e) {
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
					this.prodList = []
					this.prodParams.pageNum = 1
					this.$refs['showRight'].close()
					this.getStockInfo()
				}
			},
		}
	}
</script>

<style lang="scss" scoped>
	.page-footer {
		background: none !important;
	}

	page {
		background-color: $page-bgcolor;
	}

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
			top: 0;
			left: 12rpx;
			font-size: 50rpx;
		}
	}

	.place {
		width: 100%;
		height: 120rpx;
		background-color: $page-bgcolor;
	}

	.search-bar {
		width: 100%;
		padding: 20rpx 3%;
		background-color: #fff;
		position: fixed;
		box-shadow: 0 15rpx 25rpx #eee;
		z-index: 1;
	}


	.prod-no {
		padding: 32rpx;

		.codeBox {
			display: flex;
			justify-content: space-between;
			align-items: center;
			color: $title;
			font-size: 28rpx;
			border-bottom: 1rpx solid $bottom-line-color;
			background-color: #fff;

			.icon-icon-search {
				color: #999999;
				margin-right: 15rpx;
			}

			.code {
				padding: 26rpx 0;
			}
		}
	}

	.stock {
		padding: 26rpx 32rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 28rpx;
		border-bottom: 1rpx solid $bottom-line-color;
		color: #737373;
		background-color: #f7f7f7;

		.right {
			display: flex;
			color: $title;
			align-items: center;

			.icon {
				margin-right: 10rpx;
			}
		}
	}

	.prod-list {
		padding: 20rpx 0 32rpx 32rpx;

	}

	.footerBtn {
		z-index: 9999999;
		width: 466rpx;
		height: 96rpx;
		color: #FFFFFF;
		line-height: 96rpx;
		box-shadow: 0px 4rpx 16rpx rgba(0, 0, 0, 0.14);
		border-radius: 200rpx;
		font-size: 28rpx;
		display: flex;
		justify-content: center;
		margin: 48rpx auto;
		position: fixed;
		bottom: 0;
		left: 50%;
		margin-left: -223rpx;

		.Btn {
			width: 330rpx;
			height: 96rpx;
			background: #272727;
			text-align: left;
			align-items: center;
			border-radius: 200rpx 0 0 200rpx;
			padding-left: 40rpx;
			display: flex;

			.badge {
				width: 0;
				height: 32rpx;
				text-align: center;
				line-height: 32rpx;
				background: #E42727;
				border-radius: 20rpx;
				font-size: 24rpx;
				padding: 0;
				margin: 0;
				visibility: hidden;
				transition: all 0.1s ease-in-out;

				&.show {
					width: 32rpx;
					visibility: visible;
					padding: 4rpx;
					margin: 0 10rpx;
				}
			}

			.icon-Arrow-Down {
				font-size: 36rpx;
				color: #fff;
				transform: rotate(0);
				transition: all 0.1s ease-in-out;

				&.rotate {
					transform: rotate(180deg);
				}
			}
		}

		.confirm {
			width: 136rpx;
			text-align: center;
			background: $bgred;
			border-radius: 0 200rpx 200rpx 0;
		}
	}

	.modalBox {
		.noData {
			text-align: center;
			display: flex;
			justify-content: center;
			flex-direction: column;
			overflow: hidden;
			display: flex;
			flex-wrap: wrap;

			.noData-img {
				width: 100%;
				display: inline-block;
			}

			.tip {
				font-size: 24rpx;
			}
		}

		.title {
			font-size: 32rpx;
			color: $title;
			margin-bottom: 48rpx;
			text-align: center;

			.del {
				float: right;
				color: $subTitle;
				font-size: 28rpx;
				padding-right: 32rpx;
			}
		}

		.scroll-box {
			max-height: 800rpx;
		}

		.productBox {
			margin: 32rpx;
			margin-right: 0;
			padding: 0 32rpx 32rpx 0;
			border-bottom: 1rpx solid $bottom-line-color;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.product-Img {
				width: 144rpx;
				height: 144rpx;
				border-radius: 4rpx;
			}

			.detail {
				width: 438rpx;

				.productNo {
					width: 100%;
					display: flex;
					justify-content: space-between;

					text {
						color: $title;
						font-size: 28rpx;
						&.Trash {
							color: #737373;
							font-size: 32rpx;
						}
					}
				}

				.itemModel {
					color: $subTitle;
					font-size: 24rpx;
					padding: 8rpx 0;
					word-break: break-all;
				}

				.spec-count {
					width: 100%;
					display: flex;
					justify-content: space-between;
					align-items: center;

					.spec {
						padding: 12rpx 16rpx;
						font-size: 24rpx;
						background-color: $bottom-line-color;
						color: $subTitle;
						word-break: break-all;
					}
				}
			}
		}
	}
</style>
