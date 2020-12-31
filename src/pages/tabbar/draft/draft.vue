<template>
	<page>
		<view slot="body">
			<!-- 顶部搜索 -->
			<view class="header">
				<view class="action" @click="setOpened">
					{{isStop?'完成':'编辑'}}
				</view>
				<search-box style="width: 90%;" @selectHandle="selectHandle" @inputChange="inputChange" placeholder="客户手机号/姓名/备注"
				 @inputDel='inputDel' @inputText='inputText'></search-box>
			</view>
			<view class="place"></view>
			<!-- 草稿列表 -->
			<view class="draft-list">
				<!-- 选择按钮 -->
				<radio-group>
					<label class="uni-list-cell uni-list-cell-pd draft-box" v-for="(ele, index) in draftdata" :key="index">
						<view class="menu" :animation="animation1">
							<!-- checkbox -->
							<view class="checkbox-box" @tap.stop="selected(index)">
								<view class="checkbox">
									<text v-if="ele.selected" class="icon iconfont icon-list-icon-littlechoose-sel"></text>
									<text v-else class="icon iconfont icon-list-icon-littlechoose-nor"></text>
								</view>
							</view>
						</view>
						<view class="carrier" :animation="animation2" :style="{width:width}" @tap="$toPage('/pages/addDraft/addDraft?ordFusionShoppingCartId=' + ele.ordFusionShoppingCartId)">
							<view class="pics">
								<view class="pics-box" v-for="(pro,i) in ele.productNoMap" :key="i">
									<image v-if="pro.imageUrl" :src="pro.imageUrl" mode="" class="proimg"></image>
									<view v-else class="proimg">
										<text style="width: 90%;margin: auto;font-size: 24rpx;">{{pro.productNo}}</text>
									</view>
								</view>
							</view>
							<view class="customerInfo">
								<view class="customer">
									<text style="margin-right: 20rpx;">{{ele.customerName ? ele.customerName : '-'}}</text>
									<text>{{ele.customerCellphoneNum ? ele.customerCellphoneNum : '-'}}</text>
								</view>
								<view class="date">
									{{ele.createTime}}
									<text class="arrow"></text>
								</view>
							</view>
							<view class="notes">
								<text style="color: #191A45;">备注：</text>
								{{ ele.notes ? ele.notes : '-' }}
							</view>
						</view>
					</label>
				</radio-group>
			</view>

			<view class="loading-text">{{loadingText}}</view>
		</view>
		<!-- 底部操作 -->
		<view slot='footer' class="footer" v-show="isStop">
			<view class="checkbox-box">
				<view class="checkbox" @tap="allSelect">
					<text v-if="isAllselected" class="icon iconfont icon-list-icon-littlechoose-sel" style="margin-right: 15rpx;"></text>
					<text v-else class="icon iconfont icon-list-icon-littlechoose-nor" style="margin-right: 15rpx;"></text>
				</view>
				<view class="text">全选</view>
			</view>

			<view class="delBtn" @tap="deleteList">
				删除
			</view>
		</view>
	</page>
</template>

<script>
	import searchBox from '@/components/search-box/index.vue'
	import untils from '@/common/js/utils.js'
	export default {
		components: {
			searchBox
		},
		data() {
			return {
				// 添加的商品列表
				draftdata: [],
				// 选中的商品列表
				selectedList: [],
				//动画样式
				width: '100%',
				isStop: false,
				animation1: null,
				animation2: null,
				// 是否全选
				isAllselected: false,
				// 草稿列表参数
				draftParams: {
					storeNo: '',
					salesNo: '',
					keyWords: '',
					customerName: '',
					customerCellphoneNum: '',
					notes: '',
					pageNum: 1,
					pageSize: 10
				},
				// 总页数
				totalPage: 1,
				loadingText: '正在加载中'
			};
		},
		onShow() {
			if (uni.getStorageSync('storeInfo').storeName == '门店全局') {
				this.draftdata = []
				this.$msg('门店全局下不能查询草稿列表')
				this.loadingText = '门店全局下不能查询草稿列表'
				return
			}
			this.init()
		},
		onLoad() {

		},
		//下拉刷新，需要自己在page.json文件中配置开启页面下拉刷新 "enablePullDownRefresh": true
		onPullDownRefresh() {
			if (uni.getStorageSync('storeInfo').storeName == '门店全局') {
				return
			}
			this.loadingText = '正在加载中...'
			this.draftParams.pageNum = 1
			this.draftdata = [];
			this.getDraftList();
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		// 上啦加载
		onReachBottom() {
			this.draftParams.pageNum++;
			if (this.draftParams.pageNum <= this.totalPage) {
				this.getDraftList();
			} else {
				this.loadingText = '到底了！'
			}
		},
		methods: {
			// 初始化
			init() {
				this.loadingText = '正在加载中...'
				this.draftParams.pageNum = 1;
				this.draftdata = [];
				this.setSaleInfo()
				this.getDraftList()
			},
			// 设置销售人员信息
			setSaleInfo() {
				let userInfo = uni.getStorageSync('userInfo')
				this.draftParams.salesNo = userInfo.personCode
				this.draftParams.storeNo = uni.getStorageSync('storeInfo').storeCode
			},
			// 关键词搜索
			inputChange(e) {
				this.draftParams.keyWords = e;
				this.search()
			},
			// 清空input
			inputDel() {
				this.draftParams.keyWords = '';
				this.search()
			},
			// 输入时
			inputText(e) {
				this.draftParams.keyWords = e
			},
			// 搜索
			search() {
				if (uni.getStorageSync('storeInfo').storeName == '门店全局') {
					this.$msg('门店全局下不能查询草稿列表')
					return
				}
				this.loadingText = '正在加载中...'
				this.draftParams.pageNum = 1;
				this.draftdata = [];
				this.getDraftList();
			},
			// 获取列表
			getDraftList() {
				this.$http({
					url: this.$api.getDraftList,
					data: this.draftParams,
					success: res => {
						if (res.code == '01') {
							this.draftdata = this.draftdata.concat(res.data)
							if (this.draftdata.length > 0) {
								this.draftdata.forEach(ele => {
									ele.createTime = untils.changeDay(new Date(ele.createTime));
									ele.selected = false
									if (ele.productNoMap && ele.productNoMap.length > 4) {
										ele.productNoMap.splice(4, ele.productNoMap.length)
									}
								})
								this.loadingText = ''
							} else {
								this.loadingText = '暂无草稿列表'
							}
							this.totalPage = res.totalPage
						} else {
							this.$msg(res.message)
							this.loadingText = res.message
						}
					}
				})
			},
			// 管理
			setOpened() {
				this.isStop = !this.isStop
				this.animation1 = wx.createAnimation({
					duration: 200,
					timingFunction: 'linear',
				});
				this.animation2 = this.animation1;
				if (this.isStop) {
					this.animation1.translate(50).step()
				} else {
					this.animation1.translate(-1).step()
				}

			},
			// 选中商品
			selected(index) {
				this.draftdata[index].selected = this.draftdata[index].selected ? false : true;
				let i = this.selectedList.indexOf(this.draftdata[index].ordFusionShoppingCartId);
				i > -1 ? this.selectedList.splice(i, 1) : this.selectedList.push(this.draftdata[index].ordFusionShoppingCartId);
				this.isAllselected = this.selectedList.length == this.draftdata.length;
			},
			//全选
			allSelect() {
				let len = this.draftdata.length;
				let arr = [];
				for (let i = 0; i < len; i++) {
					this.draftdata[i].selected = this.isAllselected ? false : true;
					arr.push(this.draftdata[i].ordFusionShoppingCartId);
				}
				this.selectedList = this.isAllselected ? [] : arr;
				this.isAllselected = this.isAllselected || this.draftdata.length == 0 ? false : true;
			},
			// 删除
			deleteList() {
				if (this.selectedList.length == 0) {
					this.$msg('请选择要删除的草稿单')
					return false
				}
				let newArr = []
				this.selectedList.forEach(ele => {
					let item = {
						ordFusionShoppingCartId: ele
					}
					newArr.push(item)
				})
				this.$http({
					url: this.$api.delDraft,
					data: newArr,
					success: (res) => {
						if (res.code == '01') {
							uni.showToast({
								title: '删除成功'
							})
							this.isStop = false
							this.animation1 = wx.createAnimation({
								duration: 200,
								timingFunction: 'linear',
							});
							this.animation2 = this.animation1;
							this.animation1.translate(-1).step()
							this.selectedList.forEach(item => {
								for (let i in this.draftdata) {
									if (this.draftdata[i].ordFusionShoppingCartId == item) {
										this.draftdata.splice(i, 1)
									}
								}
							})
							this.selectedList = []
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: $page-bgcolor;
	}

	.page-body {
		box-shadow: none !important;
		padding-top: 0 !important;
	}

	.checkbox-box {
		display: flex;
		align-items: center;

		.icon {
			margin-right: 15rpx;
			color: #D31311;
			font-size: 40rpx;
		}
	}

	.header {
		width: 100%;
		position: fixed;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 3% 20rpx;
		font-size: 28upx;
		z-index: 3;
		box-shadow: 0 15rpx 20rpx #F8F8F8;
		background-color: #FFFFFF;

		.action {
			// width: 10%;
			text-align: center;
		}
	}

	.place {
		width: 100%;
		height: 110rpx;
		background-color: #FFFFFF;
	}

	.draft-list {
		width: 100%;
		margin: auto;
		margin-bottom: 120rpx;
		background-color: #FFFFFF;
		overflow: hidden;

		.draft-box {
			position: relative;
			padding: 20upx 3%;
			border-bottom: 1upx solid #EEEEEE;
			// font-size: 26upx;
			display: flex;
			justify-content: left;
			align-items: center;

			.menu {
				position: absolute;
				left: -10%;
				display: flex;
				justify-content: center;
				align-items: center;
				width: 10%;
			}

			.carrier {
				.customerInfo {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 10rpx 0;

					.customer {
						font-size: 30rpx;
						color: #191A45;
					}

					.date {
						font-size: 22rpx;
						color: $subTitle;
						display: flex;

						.arrow {
							display: inline-block;
							margin-left: 10rpx;
							width: 0;
							height: 0;
							border-top: 15rpx solid transparent;
							border-bottom: 15rpx solid transparent;
							border-left: 15rpx solid $subTitle;
							border-radius: 10rpx;
						}
					}
				}

				.notes {
					font-size: 22rpx;
					color: $brown;
				}

				.pics {
					display: flex;
					justify-content: left;

					.pics-box {
						width: 23%;
						margin-right: 25rpx;
					}

					.proimg {
						width: 100%;
						height: 160rpx;
						text-align: center;
						background-color: #F6F6F8;
						word-wrap: break-word;
						display: flex;
						justify-content: space-between;
						align-items: center;
					}
				}
			}
		}
	}

	.footer {
		width: 100%;
		padding-left: 3%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 90rpx;
		position: fixed;
		bottom: 0;
		background-color: #FFFFFF;

		.delBtn {
			background-color: $red;
			color: #FFFFFF;
			width: 160rpx;
			height: 90rpx;
			line-height: 90rpx;
			text-align: center;
		}
	}
</style>
