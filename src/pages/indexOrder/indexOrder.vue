<template>
	<page>
		<view slot="body" @tap.stop="longClose()">
			<view class="top">
				<!-- 头部搜索 -->
				<view class="header">
					<search-box style="width: 85%;" :inputValue="keyWords" placeholder="客户姓名/手机号/订单编号" @inputChange="inputChange"
					 @inputDel="inputDel" @inputText="inputText"></search-box>
					<view class="right" @tap="showDrawer('showRight')">
						<text class="icon iconfont icon-setting"></text>
						<text>筛选</text>
					</view>
				</view>
				<!-- 订单类别切换 -->
				<view class="tab">
					<v-tabs v-model="current" :tabs="items" @change="onClickItem"></v-tabs>
				</view>
			</view>
			<view class="place"></view>
			<!-- 订单列表 -->
			<view class="order-list" v-if="orderList.length>0">
				<view class="list-content" v-for="(item,index) in orderList" :key="index" @longpress="longtap(item,index)">
					<view class="order-item">
						<view class="right">
							<view class="right-status">
								<text class="status-common status-1" v-if="item.statusCode=='1003'">审核</text>
								<text class="status-common status-2" v-else-if="item.statusCode=='1002'">提交</text>
								<text class="status-common status-3" v-else>开立</text>
								{{item.orderNo}}
								<text class="status-common status-4" style="margin-right:0rpx;" @tap.stop="copyList(item)">复制</text>

								<view class="time">创建于：{{item.contractDate}}</view>
							</view>
							<view @tap="toDetail(item)">
								<view style="width:100%;margin-top: 20rpx; align-items: center;">
									<view class="userInfo">
										<text>{{item.customerName}}</text>
										<text class="tel" style="">{{item.customerCellphoneNum}}</text>
										<view class="price">
											<text>¥</text>
											{{item.totalPrice | formatNum}}
										</view>
									</view>
								</view>
								<view class="bottom">
									<view class="dateInfo">
										<text class="icon iconfont Cube collection-icon"></text>
										共{{item.itemCount}}件商品
										<text class="icon iconfont Graph-PieChart time-icon"></text>
										交期：{{item.deliveryDate}}
										<text class="icon iconfont More-Horizon more-icon" @tap.stop="longtap(item,index)"></text>
									</view>
								</view>
							</view>

							<long-pop v-if="longIndex==index" :popData="popData" :icon="'Trash'" @longClose="longClose" :text="'删除订单'"></long-pop>
						</view>
					</view>
					<view class="null"></view>
				</view>
			</view>
			<view class="loading-text">{{loadingText}}</view>
			<scroll-top :scrollTop="scrollTop"></scroll-top>
			<drawer-box ref="showRight" mode="right" :width="652" @confirm='handleClick'>
				<view class="">
					<view style="padding: 32rpx 32rpx 0 32rpx;">
						<search-box :inputValue="text" placeholder="备注/地址/纸质单号"  @inputDel="textDel" @inputText="textText"></search-box>
					</view>
					<view class="timeBox">
						<view class="title">
							订单创建时间
						</view>
						<view class="action">
							<view class="start date">
								<datetime-picker class="datePicker" :dateStr="startDate" :defaultValue="startDate" placeholder="开始时间" fields="day"
								 @change="changeStartDatePicker">
								</datetime-picker>
							</view>
							<view class=""> — </view>
							<view class="end date">
								<datetime-picker class="datePicker" :dateStr="endDate" :defaultValue="endDate" placeholder="结束时间" fields="day"
								 @change="changeEndDatePicker">
								</datetime-picker>
							</view>
						</view>
					</view>
					<view class="personBox" style="padding-top: 0;" v-if="personList">
						<view class="title">
							关联导购
						</view>
						<view class="action" style="flex-wrap: wrap;justify-content: flex-start;">
							<view class="item" v-for="(ele,index) in personList" :key='index' @tap='choosePerson(ele,index)' :class="chooseIndex==index?'on':''">
								{{ele.personName}}
							</view>
							<view class="item" @tap='showMore' v-if="isMore">
								更多
								<text class="iconfont icon-Arrow-Down"></text>
							</view>
						</view>
					</view>
				</view>
			</drawer-box>
		</view>
	</page>
</template>

<script>
	import searchBox from "@/components/search-box/index.vue";
	import vTab from "@/components/v-tabs/v-tabs.vue";
	import utils from "@/common/js/utils.js";
	import mixinWxAna from "@/mixins/wxAna";
	import drawerBox from '@/components/drawer/drawer.vue'
	import datetimePicker from '@/components/datetime-picker/datetime-picker.vue'
	import h5Copy from '@/pages/tabbar/order/junyi-h5-copy.js'
	
	export default {
		mixins: [mixinWxAna],
		components: {
			searchBox,
			vTab,
			drawerBox,
			datetimePicker
		},
		data() {
			return {
				scrollTop: 0,
				// 导航切换列表
				items: ["全部", "未审核", "未款清", "未送货", "已发货"],
				// 订单列表
				orderList: [],
				// 订单搜索关键词
				keyWords: "",
				// 当前页
				page: 1,
				// 总页数
				totalPage: 1,
				loadingText: "正在加载中...",
				current: 0,
				// 当前订单分类
				orderStatus: "",
				loadend: false,
				longIndex: null,
				popData: {},
				selfTag: "",
				// 开始时间
				startDate: '',
				// 结束时间
				endDate: '',
				// 当前显示的销售人员列表
				personList: null,
				// 所有的销售人员
				allpersonList: [],
				isMore: false,
				// 选中的导购索引
				chooseIndex: null,
				// 当前导购
				salesNo: '',
				// 小区，备注
				text:''
			};
		},

		onLoad(option) {
			this.setWxAna();
			if (option && option.selfTag) {
				this.selfTag = option.selfTag;
			}
		},
		onShow() {
			if (uni.getStorageSync("tabbarOrder")) {
				let tabBack = uni.getStorageSync("tabbarOrder");
				uni.removeStorageSync("tabbarOrder");
				this.init();
			} else {
				if (this.selfTag == "home") {
					this.init();
				}
			}
		},
		onPageScroll(e) {
			this.longIndex = null;
		},
		//下拉刷新，需要自己在page.json文件中配置开启页面下拉刷新 "enablePullDownRefresh": true
		onPullDownRefresh() {
			this.loadingText = "正在加载中...";
			this.page = 1;
			this.orderList = [];
			this.getOrderList();
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		// 上啦加载
		onReachBottom() {
			this.page++;
			if (this.page <= this.totalPage) {
				this.getOrderList();
			} else {
				this.loadingText = "到底了！";
			}
		},
		methods: {
			//复制
			copyList(item) {
				// #ifndef H5
				uni.setClipboardData({
					data: item.orderNo,
					success: () => {
						this.$msg("订单号已复制");
					}
				});
				// #endif
				// #ifdef H5
				const result = h5Copy(item.orderNo)
				if (result === false) {
					this.$msg("此浏览器不支持此功能");
				} else {
					this.$msg("订单号已复制");
				}
				// #endif
			},
			//删除订单
			delApi() {
				this.$http({
					url: this.$api.removeOrder,
					data: {
						storeId: this.popData.storeId,
						orderId: this.popData.orderId, //订单ID
						orderTypeCode: this.popData.orderTypeCode, //订单类型编码
						versionStamp: this.popData.versionStamp, //时间戳
						deleteFlag: this.popData.deleteFlag, //是否删除
						statusCode: this.popData.statusCode, //状态编码
						distributionFlag: this.popData.distributionFlag, //是否有配销单
						bizSourceId: this.popData.distributionFlag //来源单ID（如果非配销单，可为空）
					},
					success: res => {
						if (res.code == "01") {
							this.$msg("删除成功");
							this.orderList.forEach((item, index) => {
								if (item == this.popData) {
									this.orderList.splice(index, 1);
								}
							});
							this.popData = {};
						} else if (res.code == "02") {
							this.popData = {};
							this.init();
							this.$msg(res.message);
						} else {
							this.$msg(res.message);
						}
					}
				});
			},
			longClose(type) {
				this.longIndex = null;
				if (type == "success") {
					this.delApi();
				} else if (type == "share") {
					let data = this.popData;
					let userInfo = uni.getStorageSync('userInfo');
					// if (data.salesId) {
					// 	let salesIdData = data.salesId.split(",");
					// 	salesIdData.forEach(el => {
					// 		if (el == userInfo.personId) {
					// 			data.salesId = el;
					// 		}
					// 	})
					// }
					// if (data.salesId == userInfo.personId) {
					uni.navigateTo({
						url: "../../pages/posters/posters?orderId=" + this.popData.orderId
					});
					// } else {
					// 	uni.showToast({
					// 		title: '不属于当前销售人员的订单无法分享',
					// 		icon: 'none',
					// 		duration: 2000
					// 	})
					// }
				}
			},
			longtap(item, index) {
				if(uni.getStorageSync('storeInfo').storeName!=='门店全局'){
					this.popData = item;
					this.longIndex = index;
				}
			},
			init() {
				this.loadingText = "正在加载中...";
				this.page = 1;
				this.chooseIndex = null;
				this.salesNo = '';
				this.startDate = '';
				this.endDate = '';
				this.orderList = [];
				this.getOrderList();
				this.getPersonList()
				this.longIndex = null;
			},
			// 获取订单列表
			getOrderList(index) {
				this.$http({
					url: this.$api.getOrderList,
					data: {
						storeId: uni.getStorageSync("storeInfo").storeId,
						keyWords: this.keyWords,
						queryType: this.orderStatus,
						pageNum: this.page,
						pageSize: 10,
						salesNo: this.salesNo,
						startCreateTime: this.startDate,
						endCreateTime: this.endDate,
						keyWordAreaOrDocsNo:this.text
					},
					success: res => {
						if (!isNaN(index)) {
							if (index !== this.orderStatus) {
								return false;
							}
						}
						if (res.code == "01") {
							if (res.data.length > 0) {
								this.orderList = this.orderList.concat(res.data);
								this.orderList.forEach(ele => {
									ele.deliveryDate = utils.changeDay(new Date(ele.deliveryDate));
									ele.contractDate = utils.changeDay(new Date(ele.contractDate));
								});
								this.totalPage = res.totalPage;
								if (this.totalPage <= 1) {
									this.loadingText = "到底了！";
								}
							} else {
								this.loadingText = "暂无订单！";
							}
						} else {
							this.loadingText = res.msg;
						}
					}
				});
			},
			// 切换订单类型
			onClickItem(e) {
				this.longIndex = null;
				this.orderList = [];
				this.page = 1;
				this.loadingText = "正在加载中...";
				this.orderStatus = e;
				this.getOrderList(e);
			},
			// 关键词搜索
			inputChange(e) {
				this.keyWords = e;
				this.search();
			},
			// 输入时
			inputText(e) {
				if (e.detail) {
					this.keyWords = e.detail.value;
				} else {
					this.keyWords = e;
				}
				this.longIndex = null;
			},
			// 清空input
			inputDel() {
				this.keyWords = '';
				this.search();
			},		
			// 小区备注输入时
			textText(e) {				
				this.text = e;
			},
			// 清空input
			textDel() {
				this.text = '';
			},
			// 搜索
			search() {
				this.page = 1;
				this.orderList = [];
				this.loadingText = "正在加载中...";
				this.getOrderList();
			},
			// 去订单详情
			toDetail(e) {
				if (e.statusCode == '1003' || e.statusCode == '1002') {
					uni.navigateTo({
						url: "../addOrder/orderDetailRo?orderId=" +
							e.orderId +
							"&statusCode=" +
							e.statusCode +
							"&type=orderDetail&orderTypeCode=" +
							e.orderTypeCode +
							"&itemCount=" +
							e.itemCount
					});
				} else {
					// 自提订单
					if (e.orderTypeCode == '1003') {
						uni.navigateTo({
							url: "../addOrder/addZtOrder?orderId=" +
								e.orderId +
								"&statusCode=" +
								e.statusCode +
								"&type=orderDetail&orderTypeCode=" +
								e.orderTypeCode
						});
					} else {
						uni.navigateTo({
							url: "../addOrder/addOrder?orderId=" +
								e.orderId +
								"&statusCode=" +
								e.statusCode +
								"&type=orderDetail&orderTypeCode=" +
								e.orderTypeCode
						});
					}
				}
			},
			// 获取销售人员
			getPersonList() {
				this.personList = []
				this.$http({
					url: this.$api.personList,
					data: {
						storeId: uni.getStorageSync('storeInfo').storeId,
						pageNum: 1,
						pageSize: 1000
						// guideFlag:'1'
					},
					success: (res) => {
						if (res.code == '01') {
							this.allpersonList = res.data
							let userInfo = uni.getStorageSync('userInfo')
							this.allpersonList.forEach(ele => {
								if (ele.storeId == uni.getStorageSync('storeInfo').storeId) {
									this.personList.push(ele)
								} else {
									this.isMore = true
								}
							})
							let tmp = {
								personCode: userInfo.personCode,
								personName: userInfo.personName,
								personId: userInfo.personId
							}
							this.personList.unshift(tmp)
						} else {
							this.$msg(res.message)
						}
					}
				})
			},
			// 更多销售人员
			showMore() {
				this.isMore = false
				this.personList = this.personList.concat(this.allpersonList.splice(this.personList.length - 1, this.allpersonList.length))
			},
			// 打开筛选窗口
			showDrawer(e) {
				this.$refs[e].open()
			},
			// 选择时间
			changeStartDatePicker(e) {
				this.startDate = e.f1
			},
			changeEndDatePicker(e) {
				this.endDate = e.f1
			},
			// 选择导购
			choosePerson(e, index) {
				if (this.chooseIndex == index) {
					this.chooseIndex = null
				} else {
					this.chooseIndex = index
				}

			},
			// 确定
			handleClick(e) {
				if (e == 'del') {
					this.startDate = ''
					this.endDate = ''
					this.chooseIndex = null
					this.salesNo = ''
					this.text = ''
				} else {
					if (!this.startDate && this.endDate) {
						this.$msg('请填写开始时间')
						return
					}
					if (!this.endDate && this.startDate) {
						this.endDate = utils.changeDay(new Date())
					}
					if (this.chooseIndex != null) {
						this.salesNo = this.personList[this.chooseIndex].personCode
					} else {
						this.salesNo = ''
					}
					this.orderList = [];
					this.page = 1;
					console.log(this.text)
					this.getOrderList();
					this.$refs['showRight'].close()
				}

			}
		},
		filters: {
			formatNum: function(value) {
				return utils.formatNum(value);
			}
		}
	};
</script>

<style lang="scss">
	page {
		background-color: $page-bgcolor;
	}

	.top {
		position: fixed;
		width: 100%;
		background-color: #fff;
		box-shadow: 0 15rpx 20rpx #f6f6f8;
		height: 180rpx;
		z-index: 777;

		.header {
			padding: 0 3%;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.right {
				width: 15%;
				display: flex;
				color: $title;
				justify-content: flex-end;
				align-items: center;
				font-size: 28rpx;
				padding: 20rpx 0;

				.icon {
					margin-right: 6rpx;
				}
			}
		}

		.tab {
			padding: 0rpx 3% 0rpx;
			height: 100rpx;
		}
	}

	.place {
		width: 100%;
		height: 180rpx;
		background-color: #ffffff;
	}

	.order-list {
		// background-color: #fff;
		// padding: 0 0 0 30rpx;
		width: 100%;
		box-sizing: border-box;
		margin-top: 16rpx;
		background-color: #ffffff;

		.order-item {
			width: 100%;
			box-sizing: border-box;
			background-color: #ffffff;

			.right {
				width: 100%;
				text-align: left;
				position: relative;
				padding: 0rpx 30rpx;

				.right-status {
					font-size: 24rpx;
					color: #737373;
					border-bottom: 1rpx solid #f2f2f2;
					// margin-bottom: 20rpx;
					height: 84rpx;
					line-height: 84rpx;
					font-weight: 500;

					.status-common {
						display: inline;
						padding: 3rpx 5rpx;
						vertical-align: middle;
						margin-right: 20rpx;
						border-radius: 7rpx;
						font-size: 20rpx;
					}

					.status-1 {
						color: #ff650c;
						border: 3rpx solid #ff650c;
					}

					.status-2 {
						color: #ac08be;
						border: 3rpx solid #ac08be;
					}

					.status-3 {
						color: #00784e;
						border: 3rpx solid #00784e;
					}

					.status-4 {
						margin-left: 16rpx;
						color: #737373;
						border: 3rpx solid #cccccc;
					}

					.time {
						display: inline-block;
						float: right;
						color: #999999;
						// margin-right: 20rpx;
					}
				}

				.arrow {
					width: 0;
					height: 0;
					border-top: 15rpx solid transparent;
					border-bottom: 15rpx solid transparent;
					border-left: 15rpx solid $subTitle;
					border-radius: 6rpx;
				}

				.bottom {
					// display: flex;
					// justify-content: space-between;
					// align-items: center;
					padding-bottom: 10rpx;
					padding-top: 6rpx;

					.status {
						padding: 8rpx 18rpx;
						font-size: 22rpx;

						color: #ffffff;
					}

					.status1 {
						background-color: $brown;
					}

					.status2 {
						background-color: $red;
					}

					.status3 {
						background-color: $subTitle;
					}
				}

				.info {
					font-size: 24rpx;
					color: $input-placeholder-color;
					display: flex;
					justify-content: left;
					align-items: center;
				}

				.userInfo {
					font-size: 30rpx;
					font-weight: 550;
					color: #191a45;

					.tel {
						padding-left: 20rpx;
						// font-weight: normal;
						// color: #737373;
					}

					.price {
						font-size: 18px;
						color: #e42727;
						display: inline-block;
						float: right;

						// margin-right: 20rpx;
						text {
							// font-size: 14px;
							margin-right: 10rpx;
						}
					}
				}

				.orderInfo {
					font-size: 22rpx;
					padding: 8rpx 0;
					color: $subTitle;
				}

				.dateInfo {
					font-size: 24rpx;
					color: #737373;
					padding: 20rpx 0rpx;

					.collection-icon {
						display: inline-block;
						// width: 24rpx;
						// height: 24rpx;
						// vertical-align: middle;
						margin-right: 10rpx;
					}

					.time-icon {
						// display: inline-block;
						// width: 24rpx;
						// height: 24rpx;
						// vertical-align: middle;
						margin-right: 10rpx;
						margin-left: 24rpx;
					}

					.more-icon {
						font-size: 36rpx;
						display: inline-block;
						float: right;
						color: #999999;
						// margin-right: 20rpx;
						width: 160rpx;
						text-align: right;
						line-height: 30rpx;
					}

					.date {
						color: $brown;
					}
				}
			}
		}

		.null {
			width: 100%;
			height: 16rpx;
			background: #f7f7f7;
		}
	}

	.timeBox,
	.personBox {
		padding: 32rpx;

		.title {
			font-size: 28rpx;
			color: $title;
			font-weight: 600;
		}

		.action {
			padding: 24rpx 0;
			display: flex;
			justify-content: space-between;
			align-items: center;
			color: #B3B3B3;

			.date,
			.item {
				background: #F2F2F2;
				border-radius: 200rpx;
				padding: 10rpx 0;
				text-align: center;
				font-size: 28rpx;

			}

			.date {
				width: 240rpx;
				color: $title;
			}

			.item {
				color: $title;
				margin: 0 24rpx 24rpx 0;
				width: 180rpx;
				border: 2rpx solid #F2F2F2;

				&:nth-child(3n) {
					margin-right: 0;
				}

				&.on {
					color: #E42727;
					border: 2rpx solid #E42727;
					background-color: #FCEBEB;
					font-weight: 600;
				}
			}

		}

	}
</style>
