<template>
	<page>
		<view slot="body" style="padding-bottom: 100rpx;">
			<view class="content">
				<!-- 头部搜索 -->
				<view class="header">
					<view class="box">
						<search-box :style="{width:inputValue.length>0?'88%':'100%'}" placeholder="销售人员" :inputValue="inputValue"
						 @inputChange="inputChange" @inputDel="inputDel" @inputFocus="focus"></search-box>
						<view v-if="inputFocus" @tap="inputDel" class="del">
							<text>取消</text>
						</view>
					</view>
					<view class="" v-if="showHeader">
						<view class="uni-list-cell" style="padding: 0 34rpx" v-for="(item, index) in choosePerson" :key="index"
						 hover-class="hover" hover-stay-time="0.2" @tap="chooseChange(item)">
							<view class="left">
								<view class="checkbox">
									<text class="iconfont" :class="item.checked?'icon-Check-Circle-Filled':'icon-Circle'"></text>
								</view>
								<view style="">{{item.personName}}
									<text v-if="item.personPhone" style="color: #737373; padding-left: 16rpx;">{{item.personPhone}}</text>
								</view>
								<view class="sign" v-if="item.personId==userInfo.personId">
									我
								</view>
							</view>
							<view class="right" v-if="item.achieveRate">
								<text>{{item.achieveRate}}</text>
								<text>%</text>
							</view>
						</view>
					</view>

				</view>
				<view class="uni-list" :style="{paddingTop:top+'rpx'}">
					<!-- 销售人员列表 -->
					<view class="uni-list-cell" v-for="(item, index) in personList" :key="index" hover-class="hover" hover-stay-time="0.2"
					 @tap="chooseChange(item)">
						<view class="left">
							<view class="checkbox">
								<text class="iconfont icon-Circle"></text>
							</view>
							<view>{{item.personName}}
								<text v-if="item.personPhone" style="color: #737373; padding-left: 16rpx;">{{item.personPhone}}</text>
							</view>
							<view class="sign" v-if="item.personId==userInfo.personId">
								我
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="more " @tap='showMore' v-if="isMore">
				查看更多
				<text class="iconfont icon-Arrow-Down"></text>
			</view>
			<view class="loading-text" v-if="!isMore">{{loadingText}}</view>
			<scroll-top :scrollTop="scrollTop" :bottom="140"></scroll-top>
		</view>
		<view slot="footer" v-if="type=='order'">
			<view class="footer" :style="{bottom:className=='up'? iphoneXButtomHeight+'rpx':'-160rpx'}">
				<view class="" style="display: flex;justify-content: space-between;">
					<view class="btn" @tap='toPage' style="width: 248rpx" hover-class="btnHover">
						设置分账比例
					</view>
					<view class="subBtn" @tap='submit' style="width: 414rpx;" hover-class="subBtnHover">
						保存
					</view>
				</view>
			</view>
			<view class="footer" :style="{bottom:className=='down'? iphoneXButtomHeight+'rpx':'-160rpx'}">
				<view class="subBtn" @tap='submit' hover-class="subBtnHover">
					保存
				</view>
			</view>
		</view>
		<view v-else slot="footer" class="footer" style="bottom: 0;">
			<view class="subBtn" @tap='submit' hover-class="subBtnHover">
				保存
			</view>
		</view>
	</page>
</template>

<script>
	import searchBox from "@/components/search-box/index.vue";
	export default {
		components: {
			searchBox
		},
		data() {
			return {
				type: '',
				orderId: null,
				userInfo: null,
				scrollTop: 0,
				// 销售人员列表
				allList: [],
				// 选择的销售人员
				choosePerson: [],
				// 当前页面显示的销售人员
				personList: [],
				loadingText: '正在加载中...',
				inputValue: '',
				inputFocus: false,
				className: 'down',
				iphoneXButtomHeight: '0',
				top: 230,
				totalPage: 1,
				pageNum: 1,
				isMore: false,
				showHeader: true
			};
		},
		onLoad(option) {
			this.setDefaultUser();
			this.getpersonList();
			this.type = option.type;
			this.orderId = option.orderId ? option.orderId : null
			var system = uni.getSystemInfoSync();
			system.model = system.model.replace(' ', '');
			system.model = system.model.toLowerCase();
			if (system.model.indexOf('iphonex') != -1 || system.model.indexOf('iphone11') != -1) {
				this.iphoneXButtomHeight = uni.upx2px(68);
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		onReachBottom() {
			this.pageNum++
			this.loadingText = '正在加载中...'
			if (this.pageNum <= this.totalPage) {
				this.setPage()
			} else {
				this.loadingText = '到底了！'
			}
		},
		onShow() {
			if (uni.getStorageSync('choosePerson')) {
				this.choosePerson = uni.getStorageSync('choosePerson')
			} else {
				if (this.orderId) {
					this.getOrderSales(this.orderId)
				}
			}
			this.className = this.choosePerson.length > 1 ? 'up' : 'down'
			this.top = (50 * this.choosePerson.length + 60) * 2
		},
		methods: {
			// 获取销售人员分账比例
			getOrderSales(e) {
				this.$http({
					url: this.$api.queryOrderSalesById,
					data: {
						orderId: e,
						page: 1,
						rows: 10000
					},
					success: (res) => {
						this.choosePerson = res.data
						this.userInfo.checked = false
						this.choosePerson.forEach(ele => {
							ele.checked = true
							ele.personName = ele.salesName
							ele.personId = ele.salesId
							ele.personCode = ele.salesNo
						})
						this.className = this.choosePerson.length > 1 ? 'up' : 'down'
						this.top = (50 * this.choosePerson.length + 60) * 2
					}
				})
			},
			// 销售人员查询
			inputChange(e) {
				this.showHeader = false
				this.top = 120
				this.loadingText = '正在加载中...'
				this.pageNum = 1
				this.personList = [];
				this.inputValue = e;
				this.isMore = false;
				this.getpersonList('all');
			},
			focus() {
				this.inputFocus = true
				this.showHeader = false
				this.isMore = false
				this.loadingText = ''
				this.personList = [];
			},
			// 清空关键字
			inputDel() {
				this.showHeader = true
				this.top = (50 * this.choosePerson.length + 60) * 2
				this.inputFocus = false
				this.loadingText = '正在加载中...'
				this.pageNum = 1;
				this.isMore = false;
				this.personList = [];
				this.inputValue = "";
				this.getpersonList('all');
			},
			// 默认销售人员
			setDefaultUser() {
				let user = uni.getStorageSync('userInfo')
				this.userInfo = {
					personCode: user.personCode,
					personName: user.personName,
					personId: user.personId,
					salesName: user.personName,
					salesId: user.personId,
					salesNo: user.personCode,
					checked: false,
					storeId: uni.getStorageSync('storeInfo').storeId
				}

			},
			// 获取销售列表
			getpersonList(e) {
				let data = {
					storeId: uni.getStorageSync('storeInfo').storeId,
					personName: this.inputValue,
				}
				this.$http({
					url: this.$api.personList,
					data: data,
					success: (res) => {
						if (res.code == '02') {
							this.$msg(res.msg)
							this.loadingText = res.msg
							return
						}
						if (res.data.length == 0) {
							this.loadingText = '暂无销售!'
							return
						}
						if (res.data.length > 0) {
							this.allList = res.data
							this.allList.unshift(this.userInfo)
							if (e == 'all') {
								this.setPage()
							} else {
								this.allList.forEach((ele, i) => {
									if (ele.storeId == uni.getStorageSync('storeInfo').storeId) {
										this.personList.push(ele)
									} else {
										this.isMore = true
									}
								})
								this.choosePerson.forEach(ele => {
									for (let i in this.personList) {
										if (ele.personId == this.personList[i].personId) {
											this.personList.splice(i, 1)
										}
									}
								})
								if (this.personList.length == 0) {
									this.isMore = false
									this.setPage()
								}
							}
							this.totalPage = Math.ceil((this.allList.length) / 20)
							if (this.totalPage == 1) {
								this.loadingText = '到底了!'
							}
						}
					}
				})
			},
			// 查看更多
			showMore() {
				this.isMore = false;
				this.pageNum = 1
				this.setPage(this.personList.length + 1)
			},
			// 设置分页
			setPage(e) {
				let begin = e ? e : (this.pageNum - 1) * 20;
				let end = this.pageNum * 20;
				this.personList = this.personList.concat(this.allList.slice(begin, end))
				this.choosePerson.forEach(ele => {
					for (let i in this.personList) {
						if (ele.personId == this.personList[i].personId) {
							this.personList.splice(i, 1)
						}
					}
				})
				// 销售人员去重
				if (e) {
					for (var r = 0; r < this.personList.length; r++) {
						for (var j = r + 1; j < this.personList.length; j++) {
							if (this.personList[r].personId == this.personList[j].personId) {
								this.personList.splice(j, 1)
							}
						}
					}
				}
			},
			// 选择销售人员
			chooseChange(e) {
				this.showHeader = true
				this.top = (50 * this.choosePerson.length + 60) * 2
				if (this.choosePerson.length == 1 && e.checked) {
					this.$msg('请至少选中一位销售人员！')
					return
				}
				e.checked = !e.checked
				if (this.inputValue != '') {
					this.loadingText = '正在加载中...'
					this.pageNum = 1
					this.inputValue = ''
					this.personList = [];
					this.getpersonList('all')
				}
				if (e.checked) {
					this.choosePerson.push(e)
					this.personList.forEach((ele, i) => {
						if (ele.personId == e.personId) {
							this.personList.splice(i, 1)
						}
					})
				} else {
					for (let i in this.choosePerson) {
						if (this.choosePerson[i].personId == e.personId) {
							this.choosePerson.splice(i, 1)
						}
					}
					this.personList.unshift(e)
				}
				this.className = this.choosePerson.length > 1 ? 'up' : 'down'
				this.top = (50 * this.choosePerson.length + 60) * 2
				this.choosePerson=this.getAchieveRate(this.choosePerson)
			},
			// 计算分账比例
			getAchieveRate(data) {
				let num = 100 % data.length
				if (num == 0) {
					data.forEach(ele => {
						ele.achieveRate = 100 / data.length
					})
				} else {
					data.forEach(ele => {
						ele.achieveRate = Math.floor(100 / data.length)
						if(!uni.getStorageSync('userInfo').checked){
							data[0].achieveRate=ele.achieveRate + num							
						}else{
							if (ele.personId == uni.getStorageSync('userInfo').personId) {
								ele.achieveRate = ele.achieveRate + num
							}
						}
						
					})
				}
				return data
			},
			// 排序
			personSort() {
				this.personList = this.personList.sort((a, b) => {
					var x = 'checked' //要排序字段
					if (a[x] > b[x]) {
						return -1
					}
					if (a[x] < b[x]) {
						return 1
					}
					return 0;
				});

			},
			// 跳转设置分账页面
			toPage() {
				uni.setStorageSync('choosePerson', this.choosePerson)
				uni.navigateTo({
					url: './setSeparate?data=' + JSON.stringify(this.choosePerson) + '&orderId=' + this.orderId
				})
			},
			// 保存销售人员
			submit() {
				if (this.choosePerson.length == 0) {
					this.$msg('请至少选中一位销售人员！')
					return
				}
				this.choosePerson.forEach(ele => {
					if (!ele.personName) {
						ele.personName = ele.salesName
						ele.personId = ele.salesId
						ele.personCode = ele.salesNo
					}
				})
				uni.setStorageSync('choosePerson', this.choosePerson)
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #F7F7F7;
	}

	.content {
		background-color: #F7F7F7;
		display: flex;
		flex-wrap: wrap;
		flex-direction: column;
	}

	.more {
		height: 50px;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		color: #737373;
	}

	.header {
		position: fixed;
		width: 100%;
		background: #FFFFFF;
		z-index: 10;

		.box {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 32rpx;

			.del {
				width: 12%;
				text-align: right;
				color: #737373;
				font-size: 28rpx;
				padding-bottom: 20rpx;
			}
		}

		.container {
			margin-bottom: 20rpx;
		}
	}

	.uni-list {
		width: 100%;
	}

	.uni-list-cell {
		height: 100rpx;
		padding: 0 34rpx;
		border-bottom: 1rpx solid #F0F0F3;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #FFFFFF;
		font-size: 28rpx;

		.left {
			display: flex;
			justify-content: flex-start;
			align-items: center;
		}

		.right {
			display: flex;
			align-items: center;
			color: #737373;
			font-size: 32rpx;
			.rate{
				text-align: right;
			}
			
		}

		.checkbox {
			margin-right: 16rpx;

			.icon-Check-Circle-Filled {
				color: $red;
				font-size: 36rpx;
			}

			.icon-Circle {
				color: #999999;
				font-size: 36rpx;

			}
		}

		.sign {
			padding: 4rpx 16rpx;
			background: #FFF5F5;
			font-size: 20rpx;
			color: #E42727;
			margin-left: 16rpx;
		}

	}

	.hover {
		background: #F2F2F2;
	}

	.footer1 {
		padding: 24rpx 32rpx;
		background: #FFFFFF;
	}

	.btn,
	.subBtn {
		font-size: 28rpx;
		font-weight: 500;
		padding: 18rpx 0;
		text-align: center;
		border-radius: 8px;

	}

	.subBtn {
		background: #E42727;
		border: 1px solid #E42727;
		color: #FFFFFF;
	}

	.subBtnHover {
		background: #B40808;
	}

	.footer {
		position: fixed;
		width: 100%;
		padding: 24rpx 32rpx;
		background: #FFFFFF;
		transition: bottom 0.3s linear;



		&.down {
			bottom: -160rpx;
		}


		.btn {
			color: $title;
			border: 1px solid #CCCCCC;
			box-sizing: border-box;
		}

		.btnHover {
			background-color: #F7F7F7;
		}

	}
</style>
