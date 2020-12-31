<template>
	<page>
		<view slot="body">
			<view class="order-header">
				<text class="text">{{orderForm.statusCode==1001?'开立':orderForm.statusCode==1002?'提交':orderForm.statusCode==1003?'审核':''}}订单<text
					 v-if="orderForm.orderNo">{{orderForm.orderNo}}</text></text>
				<view class="to" v-if="orderForm.orderNo && orderForm.orderTypeCode!=='1003'" @tap='toTrack'>
					订单跟踪
				</view>
			</view>
			<view class="order-body">
				<!-- 客户信息 -->
				<view class="list list-title" style="justify-content: space-between;">
					<view class="title bold">
						客户信息
					</view>
					<view class="title bold" v-if="storeName=='门店全局'">
						{{orderForm.storeName}}
					</view>
				</view>
				<view class="list">
					<view class="title"><text class="sign">*</text>客户手机：</view>
					<view class="action">
						<input type="number" v-model="orderForm.customerCellphoneNum" placeholder="11位手机号码" @input='getCustomer' />
					</view>
				</view>
				<view class="list">
					<view class="title"><text class="sign">*</text>客户姓名：</view>
					<view class="action">
						<input type="text" style="width: 100%;" placeholder-class="input-calss-form" v-model="orderForm.customerName"
						 placeholder="请输入" />
					</view>
				</view>
				<view class="list" :hover-class="!disabled ? 'hover' : ''">
					<view class="title"><text class="sign">*</text>合同日期：</view>
					<view class="action">
						<datetime-picker class="datePicker" :dateStr="orderForm.contractDate" :defaultValue="orderForm.contractDate" :isDisabled="disabled"
						 fields="day" @change="changeContractDate">
						</datetime-picker>
						<text class="icon iconfont icon-arrow-right" v-if="!disabled"></text>
					</view>
				</view>
				<!-- 商品信息 -->
				<view class="list list-title">
					<view class="title bold">商品信息</view>
				</view>
				<view v-if="prodList.length > 0">
					<uniLeftAction :prodList="prodList" :isDisabled="isDisabled" :priceState="priceState" :statusCode='orderForm.statusCode'
					 @xpHandle="xpHandle" @editHandle="editHandle" @removeHandle="removeHandle" @prodlistAmount='prodlistAmount'
					 @checkedChange="checkedChange"></uniLeftAction>
				</view>
				<view class="list list-title-goods" v-if="!isDisabled">
					<view class="list-goods">
						<!-- #ifndef H5 -->
						<view class="list-goods-add" @tap="toScan">
							<text class="iconfont icon-scan goods-form-icon"></text>
							扫描商品
						</view>
						<!-- #endif -->
						<view class="list-goods-add" @tap="toChooseGood">
							<text class="iconfont icon-icon-addcart goods-form-icon"></text>
							添加商品
						</view>
					</view>
				</view>
				<!-- 批量改价 -->
				<change-price :orderForm="orderForm" :prodList="prodList" :priceState="priceState" :isDisabled="isDisabled"
				 @switchState="switchState" @saveBatchPrice="saveBatchPrice"></change-price>
				<!-- 收款信息 -->
				<view class="list" v-if="confirmSum.realSum">
					<view class="title">收款金额：</view>
					<view class="action">
						<text class="text-red">￥ {{ confirmSum.realSum }}</text>
						<!-- <text class="icon iconfont icon-arrow-right"></text> -->
					</view>
				</view>
				<view class="list" hover-class='hover'>
					<view class="title">已收款：</view>
					<view class="action" @tap="$toPage('/pages/orderReceiptList/orderReceiptList?orderNo='+orderForm.orderId)">
						<text class="text-red">￥ {{ orderForm.chargedTotal }}</text>
						<text class="icon iconfont icon-arrow-right"></text>
					</view>
				</view>
				<view class="list">
					<view class="title">未收款：</view>
					<view class="action">
						<text class="text-red">￥ {{ orderForm.notChargedTotal }}</text>
					</view>
				</view>
				
				<!-- 附加信息 -->
				<view class="list list-title">
					<view class="title bold">附加信息</view>
				</view>
				<view class="list" hover-class='hover' @tap="showSearch">
					<view class="title">销售政策：</view>
					<view class="action">
						<text class="text-black">
							{{ orderForm.marketingPolicyName }}
						</text>
						<text class="icon iconfont icon-arrow-right"></text>
					</view>
				</view>
				<view class="list" hover-class='hover'>
					<view class="title">销售人员</view>
					<view class="action">
						<text class="text-black" style="white-space: pre-wrap;">{{ orderForm.salesShowName }}</text>
					</view>
				</view>
				<view class="list">
					<view class="title">纸质单号：</view>
					<view class="action">
						<input type="text" placeholder-class="input-calss-form" v-model="orderForm.orderDocsNo" placeholder="请输入"/>
					</view>
				</view>
				<view class="list">
					<view class="title">备注信息：</view>
					<view class="action">
						<input type="text" placeholder-class="input-calss-form" v-model="orderForm.notes" placeholder="请输入"/>
					</view>
				</view>
				<view class="list">
					<view class="title">上传附件</view>
					<view class="action attachment">
						<tui-upload :value="picList" :params="uploadParams" @complete="uploadSuccess" @remove="uploadRemove"></tui-upload>
					</view>
				</view>
			</view>
			<view class="place"></view>
			<!-- 编辑弹窗 -->
			<good-Modify ref='productPop' :discountIndex="discountIndex" :discountList="discountList" @bindDiscountChange="bindDiscountChange"
			 @editSubmit="editSubmit"></good-Modify>
			<!-- 齐配弹窗 -->
			<match-pop ref='matchPop' @chooseMatch='chooseMatch'></match-pop>
			<!-- 选配弹窗 -->
			<prod-pop ref='prodPop' type="current" :class="popupClass" @changeSpec='changeSpec'></prod-pop>
			<!-- 按钮弹窗 -->
			<btn-Pop ref='btnPop' :orderForm="orderForm" @btnPopClose="btnPopClose" :isDelBtn="true"></btn-Pop>
			<!-- 不限长度提示 -->
			<long-msg ref='alertShow'></long-msg>
		</view>

		<view slot="footer" v-if="orderForm.statusCode && storeName!='门店全局'">
			<template v-if="!isDisabled && orderForm.statusCode != '1003' && orderForm.statusCode != '1002'">
				<view class="btnBox">
					<view class="btnMore" @tap="moreBtn">
						<text class="icon iconfont More-Horizon more-icon"></text>
					</view>
					<button v-if="orderForm.orderId" class="btn" hover-class="hover1" @tap='toOrderCollection'>收款</button>
					<button class="btn" hover-class="hover1" @tap="submitForm">保存</button>
					<button class="btn bg_red" hover-class="hover2" @tap="needSubmit">提交</button>
				</view>
			</template>

			<!-- 补丁状态 -->
			<template v-if="orderForm.statusCode != '1001'">
				<view class="btnBox">
					<button class="btn" hover-class="hover1" @tap='createdForm' v-if="orderForm.orderTypeCode == '1001'">补订</button>
					<button class="btn" hover-class="hover1" @tap="btnPopClose('share')">分享</button>
					<button class="btn bg_red" hover-class="hover2" @tap='toOrderCollection'>收款</button>
				</view>
			</template>
		</view>
	</page>
</template>

<script>
	import mixinOrder from '@/mixins/order'
	import utils from '@/common/js/utils.js'
	import md5 from "@/common/js/md5.js"
	import uniLeftAction from '@/components/uni-left-action/uni-left-action.vue'
	import orderInfo from '@/components/order-info/order-info.vue'
	import changePrice from '@/components/change-price/change-price.vue'
	import longMsg from "@/components/long-msg/long-msg.vue"
	import prodPop from '@/components/prod-pop/prod-pop.vue'
	import matchPop from '@/components/match-pop/match-pop.vue'
	import goodModify from "@/components/good-modify/good-modify.vue"
	import btnPop from '@/components/btn-pop/btn-pop.vue'
	import parmasData from './parmas.js'
	const paramsOrder = JSON.stringify(parmasData.orderParamsData);
	export default {
		mixins: [mixinOrder],
		components: {
			uniLeftAction,
			orderInfo,
			changePrice,
			longMsg,
			prodPop,
			matchPop,
			goodModify,
			btnPop
		},

		data() {
			return {
				storeName: uni.getStorageSync('storeInfo').storeName,
				showFlag: false, //补订
				initMd5Str: '',
				orderForm: parmasData.orderForm,
				confirmSum: {
					realSum: 0
				}, // 收款信息
				receiptList: [],
				// 改价list
				oldList: [],
				confirmReceiptPrice: 0,
				// 是否禁用
				isDisabled: false,
				disabled: false, //合同
				// 组织
				orgParams: null,
				// 0编辑商品 1优惠 2折扣
				priceState: 0,
				// 是否更新数据
				isSubmit: true,
				// 上传图片参数
				uploadParams: {
					mainType: 'salorder',
					subType: ''
				},
				picList: [], // 图片列表
			};
		},
		onLoad(option) {
			if (option.orderId) {
				this.orderForm.orderId = option.orderId;
				this.orderForm.statusCode = option.statusCode;
				this.orderForm.orderTypeCode = option.orderTypeCode;

				this.isDisabled = option.type == 'collection' ? true : false;
			}
			//草稿单回填方法结束
			this.init()

			if (uni.getStorageSync('newOrderData')) {
				let historyData = uni.getStorageSync('newOrderData')
				historyData.forEach((ele, hIndex) => {
					if (ele.orderId == this.orderForm.orderId) {
						uni.showModal({
							title: '提示',
							content: '是否需显示上次未保存的信息',
							cancelText: '否',
							confirmText: '是',
							success: (res) => {
								if (res.confirm) {
									this.orderForm = ele
									this.receiptList = this.orderForm.receiptList ? this.orderForm.receiptList : [];
									if (this.receiptList.length > 0) {
										this.receiptList.forEach(ele => {
											this.confirmReceiptPrice += ele.confirmSum
										})
									}
									let orderItemLineNo = uni.getStorageSync('orderItemLineNo');
									this.prodList = this.orderForm.newprodList
									this.prodList.forEach(item => {
										if(item.orderItemLineNo > orderItemLineNo) {
											orderItemLineNo = item.orderItemLineNo;
										}
									})
									this.deleteListItem = this.orderForm.deleteListItem
									this.deleteListItem.forEach(item => {
										if(item.orderItemLineNo > orderItemLineNo) {
											orderItemLineNo = item.orderItemLineNo;
										}
									})
									uni.setStorageSync('orderItemLineNo', orderItemLineNo);
									this.orderForm.addressDetails = this.orderForm.cityName ? this.orderForm.cityName + this.orderForm.countyName :
										'';
									this.oldList = this.prodList;
									this.getAttachmentList(this.orderForm.attachmentId);

								} else if (res.cancel) {
									historyData.splice(hIndex, 1)
									uni.setStorageSync('newOrderData', historyData)
								}
							}
						})
					}
				})
			}
		},
		onShow() {
			this.orgParams = uni.getStorageSync('orgParams')
			this.handleData()
		},
		onUnload() {
			if (this.isSubmit && this.orderForm.statusCode == '1001' && this.initMd5Str != md5.hex_md5(JSON.stringify(this.orderForm))) {
				let orderArr = uni.getStorageSync('newOrderData') ? uni.getStorageSync('newOrderData') : [],
					orderIndex = -1;

				orderArr.forEach((ele, index) => {
					if (ele.orderId == this.orderForm.orderId) {
						orderIndex = index;
					}
				})
				this.orderForm.newprodList = this.prodList;
				this.orderForm.receiptList = this.receiptList;
				this.orderForm.deleteListItem = this.deleteListItem;

				if (orderIndex >= 0) {
					orderArr.splice(orderIndex, 1, this.orderForm)
				} else {
					orderArr.push(this.orderForm)
				}
				uni.setStorageSync('newOrderData', orderArr)
			}
		},
		methods: {
			// 合同日期
			changeContractDate(e) {
				this.orderForm.contractDate = e.f1;
			},
			// 客户信息
			updateOrderInfo(orderInfo, isDisabled) {
				this.orderForm = orderInfo;
				this.isDisabled = isDisabled;
			},
			// 批量改价 切换
			switchState(list, priceState) {
				this.prodList = list;
				this.priceState = priceState;
			},
			// 批量改价 提交
			saveBatchPrice(orderForm, oldList) {
				this.orderForm = orderForm;
				this.oldList = oldList;
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
			btnPopClose(type) {
				if (type == "success") {
					this.delApi();
				} else if (type == "share") {
					this.$refs.btnPop.closeShow();
					this.$toPage("/pages/posters/posters?orderId=" + this.orderForm.orderId);
				}
			},
			// 选中状态
			checkedChange(item) {
				this.prodList[item.index].checked = !item.checked;
				this.$forceUpdate()
			},
			init() {
				// 新增时设置默认销售人员
				this.setDefaultSale()
				// 获取折扣类型列表
				this.getDealerDiscount()
				// if (this.orderForm.orderId) {
				// 	this.getOrderDetail()
				// }
				this.confirmReceiptPrice = 0
				this.confirmSum = {
					realSum: 0
				}
				this.receiptList = []
				
				if (this.isDisabled || (uni.getStorageSync('orgParams') && uni.getStorageSync('orgParams').contractDateModifyFlag ==
						0)) {
					this.disabled = true;
				}
			},
			// 返回页面更新数据
			handleData() {
				this.setSalesList()
				this.setprodList()
				this.setReceptList()
				this.setConfirmedSum()
			},
			// 跳转选择商品页
			toChooseGood() {
				uni.setStorageSync('prodList', this.prodList)
				uni.setStorageSync('delList', this.deleteListItem)
				this.$toPage('/pages/chooseProduct/chooseProdZt?type=ztOrder')
			},
			// 销售政策选择弹窗
			showSearch() {
				this.placeholder = "";
				this.$refs.searchPop.showPopup('policy');
			},
			// 上传图片
			uploadSuccess(e) {
				let tmp = e.imageId
				this.orderForm.attachmentId = tmp.join(',');
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
						if (res.code == '01') {
							this.getOrderDetail();
						}
					}
				})
			},
			// 删除图片
			uploadRemove(e) {
				let tmp = e.imageId
				this.orderForm.attachmentId = tmp.join(',');
			},
			toScan() {
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
								type: 1
							},
							success: (res) => {
								if (res.code == '01') {
									// 初始化Prod新增属性
									let item = res.data, orderItemLineNo = uni.getStorageSync('orderItemLineNo') ? uni.getStorageSync('orderItemLineNo') : 0; 
									item.orderItemLineNo = orderItemLineNo + 10;
									item.amount = item.amount ? item.amount : 1;
									item.orderTypeCode = '1003';
									item.singlePrice = item.singlePrice ? item.singlePrice : item.markedPrice;
									item.itemSpecsWithSmallSpec = item.itemSpecs;
									this.$utils.setInitProd(item, {
										discountDeatilList: this.discountDeatilList,
										discountList:this.discountList
									})
									this.prodList.push(item);
									this.setTotalPrice()
									uni.setStorageSync('orderItemLineNo', item.orderItemLineNo);
									this.$msg('添加成功')
								} else {
									this.$msg(res.msg)
								}
							}
						})
					}
				});
			},
			// 回填商品数据
			setprodList() {
				let curProdList = uni.getStorageSync('chooseProduct')
				if (!curProdList) {
					return false
				}
				this.$utils.setEachVal(curProdList, 'amount', 1)
				this.$utils.setEachVal(curProdList, 'isAdd', true)
				this.$utils.setEachVal(curProdList, 'orderTypeCode', '1003') // 默认自提

				curProdList.forEach(item => {
					// 齐配数量后台传递
					if (item.strongFlag == 0 || item.strongFlag == 1) {
						item.amount = item.quantity ? item.quantity : 1;
					}
					// 初始化Prod新增属性
					this.$utils.setInitProd(item, {
						discountDeatilList: this.discountDeatilList,
						discountList: this.discountList
					})
				})
				this.createListItem = curProdList
				this.prodList = this.prodList.concat(curProdList);
				//计算金额
				this.setTotalPrice()
				uni.removeStorageSync('chooseProduct')
			},
			// 回填意向金
			setReceptList() {
				let list = uni.getStorageSync('chooseRecept');
				if (!list) {
					return false
				}
				this.confirmReceiptPrice = 0
				list.forEach(item => {
					this.confirmReceiptPrice = this.confirmReceiptPrice + Number(item.confirmSum)
				})
				this.receiptList = list
				uni.removeStorageSync('chooseRecept')
			},
			// 回填收款金额
			setConfirmedSum() {
				let confirmSum = uni.getStorageSync('confirmSum')
				if (!confirmSum) {
					return false
				}
				this.confirmSum = confirmSum
				this.orderForm.chargedTotal = this.confirmSum.realSum
				this.setTotalPrice()
				uni.removeStorageSync('confirmSum')
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
						uni.setStorageSync("orderItemLineNo", 0)
						uni.setStorageSync("matchList", [])
						this.orderForm = res.bizObject
						// #ifdef H5
						if (this.orderForm.deliveryDate == '' || this.orderForm.deliveryDate == ' null' || this.orderForm.deliveryDate ==
							undefined) {
							this.orderForm.deliveryDate = this.$utils.getCurrentDate(true)
						} else {
							this.orderForm.deliveryDate = utils.changeDay(new Date(this.orderForm.deliveryDate))
						}
						this.orderForm.contractDate = this.$utils.getCurrentDate()
						// #endif
						// 初始化一次
						if (!this.orderForm.phoneUserInfo) {
							this.orderForm.phoneUserInfo = {
								customerMobilePhone: this.orderForm.customerCellphoneNum,
								customerName: this.orderForm.customerName,
								addressDetail: this.orderForm.consigneeAddressDetail
							}
						}

						if (res.bizObject.selectListItem) {
							this.prodList = res.bizObject.selectListItem
						}

						let md5ProdList = []; // 加密判断更新
						this.prodList.forEach((item, index) => {
							item.md5No = index;
							// 初始化Prod新增属性
							this.$utils.setInitProd(item, {
								discountDeatilList: this.discountDeatilList,
								discountList: this.discountList
							})

							md5ProdList.push({
								md5Id: item.md5No,
								md5Str: md5.hex_md5(JSON.stringify(item))
							})
						})
						uni.setStorageSync("md5ProdList", md5ProdList);

						if (this.prodList.length > 0) {
							for (let i in this.prodList) {
								if (this.prodList[i].flag) {
									res.bizObject.selectListItem[i].flag = true
								}
							}
						}
						// 记录改价后台返回
						if (this.oldList.length == 0) {
							this.oldList = this.prodList;
						}
						this.orderForm.detailAddress = res.bizObject.consigneeAddressDetail
						this.orderForm.addressDetails = res.bizObject.cityName ?
							res.bizObject.cityName + res.bizObject.countyName :
							res.bizObject.countyName
						this.createListItem = [] //添加商品
						this.deleteListItem = [] // 删除商品
						this.updateListItem = [] // 更新商品
						this.receiptList = []
						this.confirmReceiptPrice = 0 // 重置意向金额
						this.confirmSum = {
							realSum: 0
						} // 重置收款金额
						this.getAttachmentList(this.orderForm.attachmentId);
						this.initSales()
						if (this.orderForm.statusCode != '1001') {
							this.showFlag = true; //
						}
						this.$nextTick(() => {
							this.initMd5Str = md5.hex_md5(JSON.stringify(this.orderForm))
						})
					}
				})
			},
			// 获取折扣类型列表
			getDealerDiscount() {
				this.$http({
					url: this.$api.getDealerDiscount,
					success: res => {
						if (res.code == '01') {
							if (res.data.length > 0) {
								res.data.forEach((item, index) => {
									if (index > 1) {
										this.discountList.push(item)
									} else {
										this.discountDeatilList.push(item)
									}
								})
							}
						}

						if (this.orderForm.orderId) {
							this.getOrderDetail()
						}
					}
				})
			},
			// 手机号模糊查询
			getCustomer() {
				if (this.orderForm.customerCellphoneNum.toString().length < 8 || this.orderForm.customerCellphoneNum.toString().length >
					11) {
					return
				} else if (this.orderForm.customerCellphoneNum.toString().length == 11) {
					uni.showLoading({
						title: "加载中..."
					})
				}
				this.$http({
					url: this.$api.getCustomerListByPhone,
					data: {
						customerCellphoneNum: this.orderForm.customerCellphoneNum,
						pageNum: 1,
						pageSize: 10
					},
					success: (res) => {
						if (res.code == '01') {
							if (res.data.length > 0) {
								for (let i = 0; i < res.data.length; i++) {
									if (this.orderForm.customerCellphoneNum == res.data[i].customerMobilePhone) {
										this.orderForm.customerName = res.data[i].customerName;
									}
								}
							}
						}
					}
				})
			},
			// 查询附件列表
			getAttachmentList(attachmentId) {
				this.picList = [];
				if (!attachmentId) {
					return false
				}
				this.$http({
					url: this.$api.getAttachmentList,
					data: {
						fileId: attachmentId
					},
					success: res => {
						this.picList = res.data
					}
				})
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
				this.prodList = []; //清空明细
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

				if (this.showFlag) {
					delete data.orderId; //9-8
					if (this.orderForm.orderNo) {
						let orderNo = this.orderForm.orderNo.split('-');
						data.orderNo = orderNo[0];
					}
					data.patchFlag = 1; //  补丁标示
				}

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
				this.confirmSum = {};
				this.receiptList = [];
				uni.showLoading()
				this.$http({
					url: this.$api.patchSalOrder,
					data: this.$utils.addLsOrder(data, this.prodList, this.confirmSum, this.receiptList),
					success: res => {
						this.$msg(res.msg)
						if (res.code == '01') {
							let data = res.data[0]
							this.orderForm.orderId = data.orderId
							this.isDisabled = this.orderForm.statusCode == '1001' ? false : true;
							uni.removeStorageSync('flagData', )
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
							this.getOrderDetail()
						} else if (res.code == '000X') {
							this.isSubmit = false
						}
					}
				})
			},
			// 保存表单
			submitForm() {
				// 校验是否有未选配行
				// let xpflag = this.$utils.limitSpec(this.prodList)
				// if (xpflag) {
				// 	return false
				// }
				// var pricereg = /^\d+(\.\d+)?$/
				// if (!pricereg.test(this.orderForm.itemChargedTotal)) {
				// 	this.$msg('请输入正确的金额')
				// 	return false
				// }
				// 校验纸质单号是否必填
				// if (this.orgParams.paperBillNoIsRequired == 1 && this.orderForm.orderDocsNo == '') {
				// 	this.$msg('纸质单号不能为空！')
				// 	return false
				// }
				// 校验自提单是否上传
				// if (this.orgParams.selfAttachmentMustUploadLs == 1 && this.orderForm.attachmentId == '') {
				// 	this.$msg('请上传附件')
				// 	return false
				// }
				if (this.prodList.length == 0) {
					this.$msg('请先添加商品')
					return
				}
				//未收款计算
				if (this.orderForm.costTotal) {
					this.orderForm.totalPrice = (Number(this.orderForm.itemChargedTotal) + Number(this.orderForm.costTotal)).toFixed(
						2);
				} else {
					this.orderForm.totalPrice = this.orderForm.itemChargedTotal;
				}
				
				let userInfo = uni.getStorageSync('userInfo')
				if (!this.orderForm.customerCellphoneNum) {
					this.orderForm.customerCellphoneNum = userInfo.personPhone
				}
				if (!this.orderForm.customerName) {
					this.orderForm.customerName = userInfo.personName
				}
				
				if (!this.$utils.multipleClicks('更新中')) {
					return
				}
				
				this.$http({
					url: this.$api.updateLsOrder,
					data: this.$utils.setLsOrder(this.orderForm, this.prodList, this.createListItem, this.deleteListItem, this.updateListItem,
						this.receiptList),
					success: res => {
						this.$utils.multipleRemoveClicks()
						if (res.code == '01') {
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
							this.isSubmit = false
							this.$msg('更新成功')
							let pages = getCurrentPages(); // 当前页面
							let beforePage = pages[pages.length - 2]; // 前一个页面
							if (beforePage.route == "pages/tabbar/order/order" || beforePage.route == "pages/indexOrder/indexOrder") {
								uni.setStorageSync("tabbarOrder", "success");
							}
							this.getOrderDetail()
						} else if (res.code == '000X') {
							this.isSubmit = false
						} else {
							if (res.msg.length > 25) {
								this.$refs['alertShow'].openShow(res.msg)
							} else {
								this.$msg(res.msg)
							}
						}
				
					}
				})
			},
			// 提交表单
			needSubmit() {
				// 表单校验
				let reg = /^1[3-9]\d{9}$/;
				if (this.orderForm.customerCellphoneNum != '' && !reg.test(this.orderForm.customerCellphoneNum)) {
					this.$msg('请输入正确的手机号')
					return false
				}
				
				if (this.prodList.length == 0) {
					this.$msg('请先添加商品')
					return
				}
				// 校验是否有未选配行
				// let xpflag = this.$utils.limitSpec(this.prodList)
				// if (xpflag) {
				// 	return false
				// }
				// var pricereg = /^\d+(\.\d+)?$/
				// if (!pricereg.test(this.orderForm.itemChargedTotal)) {
				// 	this.$msg('请输入正确的金额')
				// 	return false
				// }
				// 校验纸质单号是否必填
				if (this.orgParams.paperBillNoIsRequired == 1 && this.orderForm.orderDocsNo == '') {
					this.$msg('纸质单号不能为空！')
					return false
				}
				
				// 校验自提单是否上传
				if (this.orgParams.selfAttachmentMustUploadLs == 1 && this.orderForm.attachmentId == '') {
					this.$msg('请上传附件')
					return false
				}
				
				//未收款计算
				if (this.orderForm.costTotal) {
					this.orderForm.totalPrice = (Number(this.orderForm.itemChargedTotal) + Number(this.orderForm.costTotal)).toFixed(
						2);
				} else {
					this.orderForm.totalPrice = this.orderForm.itemChargedTotal;
				}
				if (this.orderForm.orderId) {
					uni.showLoading({
						title: '提交中'
					});
					let params = this.$utils.setLsOrder(this.orderForm, this.prodList, this.createListItem, this.deleteListItem, this
						.updateListItem,
						this.receiptList);
					params.needSubmit = 1;
					this.$http({
						url: this.$api.submitSalOrder,
						data: params,
						success: res => {
							if (res.code == '01') {
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
								this.isSubmit = false
								let data = res.data[0],
								addOrderZtList = uni.getStorageSync('addOrderZtList') ? uni.getStorageSync('addOrderZtList') : [];
								if (res.message != '') {
									addOrderZtList.push({
										orderId: data.orderId,
										message: res.message
									});
									uni.setStorageSync('addOrderZtList', addOrderZtList)
								}
								this.$closedTo('/pages/addOrder/orderDetailRo?orderId=' + data.orderId + '&statusCode=' + data.statusCode +
									'&type=orderDetail&orderTypeCode=' + data.orderTypeCode);
							} else if (res.code == '000X') {
								this.isSubmit = false
							} else if (res.code == 'QP0002') {
								let matchList = JSON.parse(res.msg)
								this.$refs.matchPop.showPopup(matchList);
							} else if (res.code == 'QP0001') {
								uni.showModal({
									title: '齐配倍量校验失败',
									content: res.msg,
									showCancel: false,
									confirmText: '确定',
									success: (res) => {}
								})
							} else {
								if (res.msg.length > 25) {
									this.$refs['alertShow'].openShow(res.msg)
								} else {
									this.$msg(res.msg)
								}
							}
				
						}
					})
				}
			},
			// 齐配
			chooseMatch(list) {
				let matchList = [];
				this.prodList.forEach((pItem, index) => {
					matchList.push(pItem)
					list.forEach(item => {
						if (pItem.orderItemLineNo == item.lineNo) {
							item.strongList.forEach(ele => {
								if (ele.checked) {
									let index = ele.singlePrice == 0 ? 0 : 1
									// 初始化折扣类型
									if (!ele.discountTypeId && this.discountDeatilList) {
										ele.discountTypeId = this.discountDeatilList[index] ? this.discountDeatilList[index].dealerDiscountId :
											'';
										ele.discountTypeName = this.discountDeatilList[index] ? this.discountDeatilList[index].discountName :
											'';
										ele.discountTypeCode = this.discountDeatilList[index] ? this.discountDeatilList[index].discountCode :
											'';
									}
									matchList.push(ele)
								}
							})

							item.weekList.forEach(ele => {
								if (ele.checked) {
									let index = ele.singlePrice == 0 ? 0 : 1
									// 初始化折扣类型
									if (!ele.discountTypeId && this.discountDeatilList) {
										ele.discountTypeId = this.discountDeatilList[index] ? this.discountDeatilList[index].dealerDiscountId :
											'';
										ele.discountTypeName = this.discountDeatilList[index] ? this.discountDeatilList[index].discountName :
											'';
										ele.discountTypeCode = this.discountDeatilList[index] ? this.discountDeatilList[index].discountCode :
											'';
									}
									matchList.push(ele)
								}
							})
						}
					})
				})

				this.prodList = matchList;
			},
			// 编辑成功
			changeSpec(e, id) {
				let index = e.index
				e.amount = e.amount > 1 ? e.amount : 1;
				e.orderTypeCode = '1001'
				this.$utils.setInitProd(e, {
					discountDeatilList: this.discountDeatilList,
					discountList: this.discountList
				})

				let removeLineNo = uni.getStorageSync('removeLineNo')
				this.prodList.forEach((item, pIndex) => {
					if (index == pIndex && item.isAdd) {
						e.isAdd = true
					}
					// 去除齐配关联
					if (removeLineNo == item.leadOrderItemLineNo) {
						item.leadOrderItemLineNo = null;
						item.strongFlag = null
					}
				})
				uni.removeStorageSync('removeLineNo')

				this.prodList.splice(index, 1, e)
				let length = index;
				if (e.selectedItemSetList.length > 0) {
					e.selectedItemSetList.forEach(ele => {
						length++;
						ele.isAdd = true
						ele.amount = ele.quantity ? ele.quantity : 1;
						ele.orderTypeCode = '1001'
						this.$utils.setInitProd(ele, {
							discountDeatilList: this.discountDeatilList,
							discountList: this.discountList
						})
						this.prodList.splice(length, 0, ele)
					})
				}
				this.setTotalPrice()
			}
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: $page-bgcolor;
	}

	.order-header {
		width: 100%;
		height: 45px;
		line-height: 45px;
		padding: 0 16px;
		background: rgba(173, 148, 107, 1);
		color: #FFFFFF;
		font-size: 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.to {
			background: #fff;
			color: #AD946B;
			height: 50rpx;
			line-height: 50rpx;
			padding: 0 20rpx;

		}

		.text {
			margin-right: 5px;
		}
	}
	
	.action {
		display: flex;
		justify-content: space-between;
		align-items: center;
	
		.datePicker, input{
			flex: 1;
		}
	}
	
	.list-title-goods {
		.list-goods {
			display: flex;
			align-items: center;
			justify-content: center;
			.list-goods-add {
				flex: 1;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
	
	.btnBox {
		display: flex;
		justify-content: right;
		align-items: center;
		background: #FFF;
		padding: 28rpx 24rpx 28rpx 32rpx;

		.btnMore {
			width: 72rpx;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;

			.more-icon {
				font-size: 48rpx;
				color: #737373;
			}
		}

		.btn {
			flex: 1;
			height: 80rpx;
			line-height: 80rpx;
			font-weight: 500;
			font-size: 28rpx;
			text-align: center;
			color: #272727;
			background: #FFFFFF;
			border: 2rpx solid #CCCCCC;
			border-radius: 8rpx;
			padding: 0;
			margin-left: 16rpx;

			&:nth-last-child(3) {
				margin-left: 62rpx
			}

			&.bg_red {
				color: #FFFFFF;
				background: #E42727;
				border: 2rpx solid #E42727;
			}

			&::after {
				border: 0;
				border-radius: 0;
			}
		}

		.hover1 {
			background: #F2F2F2;
		}

		.hover2 {
			background: #B40808 !important;
			border: 2rpx solid #B40808 !important;
		}
	}

	.order-body {
		.text-black {
			color: #272727;
		}
	}
</style>
