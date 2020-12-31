<template>
	<page>
		<view slot="body">
			<view class="order-header" hover-class="hover1">
				<text class="text">
					{{orderForm.statusCode==1002?'提交':orderForm.statusCode==1003?'审核':''}}订单
					<text v-if="orderForm.orderNo">{{orderForm.orderNo}}</text>
				</text>
				<view class="to" @tap='toTrack' v-if="orderForm.orderNo && orderForm.orderTypeCode!=='1003'">
					订单跟踪
					<text class="icon iconfont icon-arrow-right"></text>
				</view>
			</view>
			<view class="order-body">
				<!-- 客户信息 -->
				<view class="order-user">
					<view class="store" v-if="storeName=='门店全局'">
						{{orderForm.storeName}}
					</view>
					<view class="user-info">
						<text class="user-name">{{ orderForm.customerName }}</text>
						<text class="user-phone" @tap="callPhone">{{ orderForm.customerCellphoneNum }}</text>
					</view>
					<view class="user-address" v-if="orderForm.consigneeAddressDetail && orderForm.orderTypeCode != '1003'">
						{{ orderForm.provinceName ? orderForm.provinceName : '' }}{{ orderForm.countyName ? orderForm.countyName : '' }}{{ orderForm.consigneeAddressDetail ? orderForm.consigneeAddressDetail : '' }}
					</view>
				</view>
				<!-- 日期 -->
				<view class="order-date">
					<view class="date-info">
						<view class="date-title">合同日期</view>
						<view class="date-time">{{ orderForm.contractDate | formatDate}}</view>
					</view>
					<view class="date-info">
						<view class="date-title">客户交期</view>
						<view class="date-time" v-if="orderForm.orderTypeCode != '1003'">{{ orderForm.deliveryDate | formatDate }}</view>
						<view class="date-time" v-else>该订单为自提单</view>
					</view>
				</view>
				<!-- 收款记录 -->
				<view class="collection-records">
					<view class="small-title">
						<text>收款记录</text>
						<text class="bold">待收：{{ orderForm.notChargedTotal | formatNum }}元</text>
					</view>
					<view class="records-info">
						<view class="records-info-top">
							<view class="due-on">
								已收款
								<text class="collection-price">
									<text class="color-red">{{ orderForm.chargedTotal | formatNum }}</text><text class="icon-slant">/</text> {{ orderForm.totalPrice | formatNum }}
								</text>
							</view>
							<button type="default" class="addBtn" hover-class="hover2" v-if="!isDisabled && storeName!='门店全局'" @tap="toOrderCollection">新增收款</button>
						</view>
						<view class="records-list" v-if="orderReceptList.length > 0">
							<view class="list-item" hover-class="hover1" v-for="(item, indexs) in orderReceptList" :key="indexs" @tap="toDetail(item)">
								<view class="list-item-time">
									<text class="status">{{item.statusCode=='1003' ? '审核' : item.statusCode=='1002' ? '提交' : '开立'}}</text>
									<text class="list-item-str">
										{{(item.confirmedType == '0004' ? item.createTime : item.bizDate) | formatDate }}：{{ item.paymentTypeName }}{{(item.paymentTypeName == "转入" || item.paymentTypeName == "转出") ? '金额 ' : '收款 '}}{{(item.paymentTypeName == "转入" || item.paymentTypeName == "转出") ? item.transferSum : item.confirmedSum | formatNum}}元
									</text>
								</view>
								<text class="icon iconfont icon-arrow-right"></text>
							</view>
						</view>
					</view>
				</view>
				<!-- 商品列表 -->
				<view class="prod-box" v-if="prodList.length > 0">
					<view class="small-title">
						{{ itemCount }}件商品
					</view>
					<view class="prod-list">
						<view class="prod-list-item" v-for="(item, index) in prodList" :key="index">
							<view class="prod-img">
								<image class="cover" :src="item.imageUrl || item.itemImg || coverImg" mode=""></image>
							</view>
							<view class="prod-info">
								<view class="prod-item">
									<view class="color-black">{{ item.productNo }}</view>
									<view class="color-orange">￥<text>{{ item.singlePrice | formatNum }}</text></view>
								</view>
								<view class="prod-item">
									<view style="width: 90%;">{{ item.itemSpecsWithSmallSpec || item.itemSpecs}}</view>
									<view style="width: 10%;text-align: right;" class="color-gray">{{ item.amount }}件</view>
								</view>
								<view class="prod-item">
									{{ item.itemModel }}{{item.colorDes?'('+item.colorDes+')':''}}
								</view>
								<view class="prod-item" v-if="item.warehouseName">
									仓库：{{item.warehouseName}}
								</view>
								<view class="prod-item" v-if="item.storageBinsName || item.storageLocationName">
									库位：{{item.storageBinsName || item.storageLocationName}}
								</view>
								<view class="prod-item" v-if="item.suitSerialNum || item.itemIdentificationNo">
									套序列号：{{item.suitSerialNum || item.itemIdentificationNo}}
								</view>
							</view>
						</view>
					</view>
				</view>
				<!-- 附加信息 -->
				<view class="append-news">
					<view class="small-title">附加信息</view>
					<view class="append-info">
						<view class="append-item">
							<view class="item-title">销售政策：</view>
							<view class="item-cont">{{ orderForm.marketingPolicyName }}</view>
						</view>
						<view class="append-item">
							<view class="item-title">销售人员：</view>
							<view class="item-cont">{{ orderForm.salesName }}</view>
						</view>
						<view class="append-item">
							<view class="item-title">纸质单号：</view>
							<view class="item-cont">{{ orderForm.orderDocsNo }}</view>
						</view>
						<view class="append-item">
							<view class="item-title">备注信息：</view>
							<view class="item-cont">{{ orderForm.notes ? orderForm.notes : '暂无备注' }}</view>
						</view>
						<view class="append-item" v-if="orderForm.orderTypeCode!='1003'">
							<view class="item-title">送货说明：</view>
							<view class="item-cont" style="width: 78%;">{{ orderForm.consigneeNotes ? orderForm.consigneeNotes : '暂无送货说明' }}</view>
						</view>
						<view class="append-item">
							<view class="item-title">附&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;件：</view>
							<view class="item-cont">
								<tui-upload :value="picList" :params="uploadParams" :forbidDel="true"  @complete="uploadSuccess"></tui-upload>
							</view>
							<!-- <view class="item-cont" :class="picList.length > 0 ? 'attachment' : ''">
								<tui-upload :value="picList" :params="uploadParams" :forbidDel="true" :forbidAdd="true"></tui-upload>
								<view v-if="picList.length == 0">暂无附件</view>
							</view> -->
						</view>
					</view>
				</view>
			</view>
			<view class="btnMore" v-if="storeName!='门店全局'" hover-class="hover" @tap="moreBtn">
				<text class="icon iconfont More-Horizon"></text>
			</view>
			<view class="place"></view>
			<!-- 按钮弹窗 -->
			<btn-Pop ref='btnPop' :orderForm="orderForm" :isLeft="false" :isPatchBtn="isPatchBtn" :isMoneyBtn="true" :bottom="200"
			 @btnPopClose="btnPopClose"></btn-Pop>
		</view>
	</page>
</template>

<script>
	import mixinOrder from '@/mixins/order'
	import tuiUpload from '@/components/tui-upload/tui-upload.vue'
	import utils from '@/common/js/utils.js'
	import btnPop from '@/components/btn-pop/btn-pop.vue'
	import parmasData from '@/pages/addOrder/parmas.js'
	const paramsOrder = JSON.stringify(parmasData.orderParamsData);
	export default {
		mixins: [mixinOrder],
		components: {
			tuiUpload,
			btnPop
		},

		data() {
			return {
				storeName: uni.getStorageSync('storeInfo').storeName,
				coverImg: require('@/static/img/icon/cover.png'),
				isPatchBtn: true,
				// 收款列表
				orderReceptList: [],
				orderForm: {},
				// 是否禁用
				isDisabled: false,
				itemCount: 0,
				// 上传图片参数
				uploadParams: {
					mainType: 'salorder',
					subType: ''
				},
				// 附件列表
				picList:[]
			};
		},
		onLoad(option) {
			if (option.orderId) {
				this.orderForm.orderId = option.orderId;
				this.orderForm.statusCode = option.statusCode;
				this.orderForm.orderTypeCode = option.orderTypeCode;
				this.itemCount = option.itemCount ? option.itemCount : 0;

				this.isPatchBtn = option.orderTypeCode != '1003' ? true : false;
				this.isDisabled = option.type == 'collection' ? true : false;
				if (option.orderTypeCode == '1003', uni.getStorageSync('addOrderZtList')) {
					let addOrderZtList = uni.getStorageSync('addOrderZtList') ? uni.getStorageSync('addOrderZtList') : [], rIndex = -1;
					addOrderZtList.forEach((order, index) => {
						if (order.orderId == option.orderId) {
							this.$msg(order.message, 3000);
							rIndex = index;
						}
					})
					if (rIndex != -1) {
						addOrderZtList.splice(rIndex, 1)
					}
					uni.setStorageSync('addOrderZtList', addOrderZtList)
				}
			}
			//获取订单详情
			this.getOrderDetail()
		},
		onShow() {
			// 获取意向金列表
			if (this.orderForm.orderId) {
				this.getOrderReceiptList();
			}
		},
		methods: {
			callPhone() {
				if (this.orderForm.customerCellphoneNum) {
					uni.makePhoneCall({
						phoneNumber: this.orderForm.customerCellphoneNum
					})
				}
			},
			// 获取订单详情
			getOrderDetail() {
				this.$http({
					url: this.$api.getOrderDetail,
					data: {
						orderId: this.orderForm.orderId
					},
					success: res => {
						if (res.code == '02') {
							this.$msg(res.message)
							if (res.message == '单据不存在,有可能已被删除') {
								setTimeout(() => {
									uni.navigateBack()
								}, 2000)
							}
							return
						}
						this.orderForm = res.bizObject
						if (res.bizObject.selectListItem) {
							this.prodList = res.bizObject.selectListItem
						}
						// 查询附件列表
						if (this.orderForm.attachmentId) {
							this.getAttachmentList();
						}
					}
				})
			},
			// 查询附件列表
			getAttachmentList() {
				if (!this.orderForm.attachmentId) {
					return false
				}
				this.$http({
					url: this.$api.getAttachmentList,
					data: {
						fileId: this.orderForm.attachmentId
					},
					success: res => {
						this.picList = res.data
					}
				})
			},
			// 上传图片
			uploadSuccess(e) {
				let tmp = e.imageId
				this.orderForm.attachmentId = tmp.join(',')
				if (!this.orderForm.orderId) {
					return
				}
				this.uploadSave(this.orderForm.attachmentId);
			},
			// 上传直接保存
			uploadSave(attachmentId) {
				this.$http({
					url: this.$api.uploadSave,
					data: {
						orderId: this.orderForm.orderId, // 订单号
						attachmentId: attachmentId, // 附件
					},
					success: (res) => {
					}
				})
			},
			// 获取意向金列表
			getOrderReceiptList() {
				this.$http({
					url: this.$api.getOrderReceiptList,
					data: {
						orderId: this.orderForm.orderId
					},
					success: (res) => {
						if (res.code == '01' && res.data.length > 0) {
							this.orderReceptList = res.data;
						}
					}
				})
			},
			// 去收款单详情
			toDetail(item) {
				uni.navigateTo({
					url: '../orderReceiptDetail/orderReceiptDetail?receiptId=' +
						item.receiptId +
						'&confirmedType=' +
						item.confirmedType +
						'&paymentTypeName=' +
						item.paymentTypeName +
						'&receiptNo=' +
						item.receiptNo +
						'&outOrdSalNo=' +
						item.outOrdSalNo +
						'&inOrdSalNo=' +
						item.inOrdSalNo
				})
			},
			moreBtn() {
				this.$refs.btnPop.popupShow();
			},
			//删除订单
			delApi() {
				this.$http({
					url: this.$api.removeOrder,
					data: this.orderForm,
					success: res => {
						if (res.code == "01") {
							this.$msg("删除成功");
							uni.setStorageSync('removeOrderId', this.orderForm.orderId)
							// 跳转回列表
							this.$toTab('/pages/tabbar/order/order');
						} else {
							this.$msg(res.message);
						}
					}
				});
			},
			// 补订
			createdForm() {
				//补订
				var data = {};
				let initData = JSON.parse(paramsOrder);

				function isEq(a, b, data) {
					var aKeys = Object.keys(b);
					aKeys.forEach(key => {
						if (a.hasOwnProperty(key)) {
							data[key] = a[key];
						}
					})
					return data
				}

				let userInfo = uni.getStorageSync("userInfo");
				isEq(this.orderForm, initData, data); //数据转换
				data.createListSales = {
					personCode: userInfo.personCode,
					personId: userInfo.personId + '',
					personName: userInfo.personName,
					userCode: userInfo.userCode,
					checked: true,
					salesNo: userInfo.personCode,
					salesName: userInfo.personName,
					salesPhone: userInfo.personPhone,
					salesId: userInfo.personId + '',
				}

				delete data.orderId; //9-8
				if (this.orderForm.orderNo) {
					let orderNo = this.orderForm.orderNo.split('-');
					data.orderNo = orderNo[0];
				}
				data.patchFlag = 1; //  补丁标示
				data.statusCode = 1001;
				data.notChargedTotal = 0;
				data.discountBeforeTotal = 0, //总金额
				data.discountTotal = 0, // 折扣金额
				data.totalPrice = 0, //成交金额
				data.itemChargedTotal = 0, //货品总金额
				data.confirmedSum = 0, //收款金额
				data.dealPrice = 0, // 成交总价 
				data.money = 0, //意向金金额
				data.chargedTotal = 0, // 已收款
				data.notChargedTotal = 0, // 未收款金额

				data.contractDate = this.$utils.getCurrentDate();
				data.patchOrderTypeCode = this.orderForm.orderTypeCode;
				data.patchOrderDocsNo = this.orderForm.orderDocsNo;
				data.orderDocsNo = "";
				uni.showLoading()
				this.$http({
					url: this.$api.patchSalOrder,
					data: this.$utils.addLsOrder(data, [], {}, []),
					success: res => {
						this.$msg(res.msg)
						if (res.code == '01') {
							let data = res.data[0]
							this.orderForm.orderId = data.orderId
							uni.removeStorageSync('flagData')
							let arr = uni.getStorageSync('newOrderData') || []
							if (arr.length > 1) {
								for (let i in arr) {
									if (arr[i].orderId == this.orderForm.orderId) {
										arr.splice(i, 1)
									}
								}
								uni.setStorageSync('newOrderData', arr)
							} else {
								uni.removeStorageSync('newOrderData')
							}
							let pages = getCurrentPages(); // 当前页面
							let beforePage = pages[pages.length - 2]; // 前一个页面
							if (beforePage.route == "pages/tabbar/order/order" || beforePage.route == "pages/indexOrder/indexOrder") {
								uni.setStorageSync("tabbarOrder", "success");
							}
							this.$refs.btnPop.closeShow();
							this.$closedTo('/pages/addOrder/addOrder?orderId=' + data.orderId + "&statusCode=" + data.statusCode +
								"&type=orderDetail&orderTypeCode=" + data.orderTypeCode);
						}
					}
				})
			},
			btnPopClose(type) {
				if (type == "success") {
					this.delApi();
				} else if (type == "share") {
					this.$refs.btnPop.closeShow();
					this.$toPage("/pages/posters/posters?orderId=" + this.orderForm.orderId);
				} else if (type == "patch") {
					this.createdForm();
				}
			},
		},
		filters: {
			formatDate: function(value) {
				return utils.formatDate(value).f1;
			},
			formatNum: function(value) {
				return utils.formatNum(value);
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: $page-bgcolor;
	}

	.boxShadow {
		border: 1rpx solid #DEDEDE;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
		border-radius: 16rpx;
	}

	.small-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 44rpx;
		font-size: 28rpx;
		color: #737373;
		margin: 40rpx 8rpx 0;

		.bold {
			font-weight: 500;
		}
	}

	.btnMore {
		position: fixed;
		right: 48rpx;
		bottom: 64rpx;
		width: 96rpx;
		height: 96rpx;
		line-height: 96rpx;
		background: #FFFFFF;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.14);
		border-radius: 100%;
		text-align: center;

		.iconfont {
			font-size: 48rpx;
			color: #737373;
		}

		&.hover {
			background: #F2F2F2;
		}
	}

	.hover1 {
		background: #DEDEDE !important;
	}

	.hover2 {
		background: #B40808 !important;
	}

	.order-header {
		@extend .boxShadow;
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: relative;
		height: 80rpx;
		font-size: 28rpx;
		color: #272727;
		background: #F7F7F7;
		box-shadow: initial;
		padding: 0 24rpx;
		margin: 0 24rpx;

		.to {
			color: #999999;

			.icon-arrow-right {
				font-size: 28rpx;
			}

			.icon-arrow-circlefilled {
				position: absolute;
				top: 18rpx;
				right: 20rpx;
				font-size: 12rpx;
				color: #FB5353;
			}
		}
	}

	.order-body {
		padding: 32rpx 24rpx 0;

		.order-user {
			padding: 0 8rpx;
			
			.store{
				font-size: 28rpx;
				text-align: right;
			}
			.user-info {
				display: flex;
				align-items: flex-end;

				.user-name {
					font-weight: 500;
					font-size: 40rpx;
					line-height: 56rpx;
					color: #272727;
				}

				.user-phone {
					font-size: 28rpx;
					line-height: 44rpx;
					color: #2380E5;
					margin-left: 16rpx;
				}
			}

			.user-address {
				font-size: 28rpx;
				line-height: 44rpx;
				color: #737373;
				margin-top: 4rpx;
			}
		}

		.order-date {
			display: flex;
			justify-content: space-between;
			margin: 32rpx 0 0;

			.date-info {
				@extend .boxShadow;
				width: 340rpx;
				height: 128rpx;
				background: #FFFFFF;
				padding: 24rpx 0 0 32rpx;

				.date-title {
					font-size: 24rpx;
					line-height: 32rpx;
					color: #737373;
				}

				.date-time {
					font-weight: 500;
					font-size: 28rpx;
					line-height: 44rpx;
					color: #272727;
					margin-top: 4rpx;
				}
			}
		}

		.collection-records {
			margin-top: 40rpx;

			.records-info {
				@extend .boxShadow;
				margin-top: 16rpx;

				.records-info-top {
					display: flex;
					justify-content: space-between;
					align-items: center;
					height: 64rpx;
					margin: 20rpx 20rpx 32rpx 24rpx;

					.due-on {
						display: flex;
						align-items: center;
						font-size: 28rpx;
						color: #737373;

						.collection-price {
							font-weight: 500;
							font-size: 36rpx;
							color: #272727;
							margin-left: 20rpx;

							.color-red {
								color: #E42727;
							}

							.icon-slant {
								margin: 0 8rpx;
							}
						}
					}

					.addBtn {
						font-weight: 500;
						font-size: 24rpx;
						line-height: 32rpx;
						color: #FFFFFF;
						background: #E42727;
						border-radius: 16rpx;
						padding: 16rpx 26rpx;
						margin: 0;
					}
				}

				.records-list {
					padding: 0 24rpx 16rpx;

					.list-item {
						display: flex;
						justify-content: space-between;
						align-items: center;
						height: 80rpx;
						font-size: 24rpx;
						color: #737373;
						background: #F7F7F7;
						border: 1rpx solid #DEDEDE;
						border-radius: 16rpx;
						padding: 0 16rpx 0 22rpx;
						margin-bottom: 16rpx;

						.iconfont {
							font-size: 32rpx;
							color: #999999;
						}

						.list-item-time {
							display: flex;
							align-items: center;

							.status {
								width: 48rpx;
								height: 32rpx;
								line-height: 32rpx;
								font-size: 20rpx;
								color: #737373;
								text-align: center;
								border: 1rpx solid #B2B2B2;
								border-radius: 4rpx;
								margin-right: 16rpx;
							}

							.list-item-str {
								display: inline-block;
								height: 34rpx;
								width: 514rpx;
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
							}
						}
					}
				}
			}
		}

		.prod-box {
			.prod-list {
				margin-top: 16rpx;

				.prod-list-item {
					@extend .boxShadow;
					display: flex;
					justify-content: space-between;
					background: #FFFFFF;
					padding: 32rpx;
					margin-top: 24rpx;

					.prod-img {
						margin-right: 16rpx;

						image {
							display: block;
							width: 160rpx;
							height: 124rpx;
							border-radius: 8rpx;
						}
					}

					.prod-info {
						flex: 1;

						.prod-item {
							display: flex;
							justify-content: space-between;
							align-items: center;
							font-size: 24rpx;
							line-height: 32rpx;
							color: #737373;
							margin-top: 8rpx;
							word-break: break-all;

							.color-black {
								font-size: 28rpx;
								font-weight: 500;
								line-height: 44rpx;
								color: #272727;
							}

							.color-orange {
								font-size: 28rpx;
								font-weight: 500;
								color: #FF5C00;

								text {
									position: relative;
									top: 2rpx;
									font-size: 36rpx;
									line-height: 48rpx;
								}
							}

							.color-gray {
								color: #B2B2B2;
							}

							&:first-child {
								margin-top: 0;
							}
						}
					}

					&:first-child {
						margin-top: 0;
					}
				}
			}
		}

		.append-news {
			.append-info {
				@extend .boxShadow;
				background: #FFFFFF;
				padding: 32rpx 24rpx;
				margin-top: 24rpx;

				.append-item {
					display: flex;
					font-size: 28rpx;
					line-height: 44rpx;
					color: #272727;
					margin-top: 24rpx;

					.item-title {
						width: 140rpx;
					}

					.item-cont {}

					&:first-child {
						margin-top: 0;
					}
				}
			}
		}
	}
</style>
