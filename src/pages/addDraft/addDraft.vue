<template>
	<page>
		<view slot="body">
			<view class="order-header">
				<text class="text">草稿</text>
				<text>{{draftForm.deliveryDate | formatDate}}</text>
			</view>
			<view class="order-body">
				<!-- 客户信息 -->
				<order-info :orderForm="draftForm" :isDisabled="isDisabled" @updateOrderInfo="updateOrderInfo"></order-info>
				<!-- 商品信息 -->
				<view class="list list-title">
					<view class="title bold">商品信息</view>
				</view>
				<view v-if="prodList.length > 0">
					<uniLeftAction :prodList="prodList" :isDisabled="isDisabled" :priceState="priceState" :statusCode='orderForm.statusCode'
					 @xpHandle="xpHandle" @editHandle="editHandle" @removeHandle="removeHandle" @prodlistAmount='prodlistAmount'
					 @checkedChange="checkedChange"></uniLeftAction>
				</view>
				<view class="list list-title-goods" @tap="toChooseGood">
					<view class="list-goods ">
						<text class="icon iconfont icon-icon-addcart goods-form-icon"></text>
						添加商品
					</view>
				</view>
				<!-- 批量改价 -->
				<change-price :orderForm="draftForm" :prodList="prodList" :priceState="priceState" :isDisabled="isDisabled"
				 :isDraft="true" @switchState="switchState" @saveBatchPrice="saveBatchPrice"></change-price>
				<!-- 附加信息 -->
				<order-info v-if="hackReset" ref='orderPop' :orderForm="draftForm" :isDisabled="isDisabled" :currentIndex="1" @updateOrderInfo="updateOrderInfo"></order-info>
			</view>
			<view class="place"></view>
			<!-- 编辑弹窗 -->
			<good-Modify ref='productPop' :discountIndex="discountIndex" :discountList="discountList" @bindDiscountChange="bindDiscountChange"
			 @editSubmit="editSubmit"></good-Modify>
			<!-- 选配弹窗 -->
			<prod-pop ref='prodPop' type="current" :class="popupClass" @changeSpec='changeSpec'></prod-pop>
		</view>
		<view slot="footer">
			<view class="btns">
				<button v-if="draftForm.ordFusionShoppingCartId" class="btn bg-red" @tap="addLsOrderNew">生成订单</button>
				<button class="btn bg-brown" @tap="submitForm">保存</button>
			</view>
		</view>
	</page>
</template>

<script>
	import mixinDraft from '@/mixins/draft'
	import utils from '@/common/js/utils.js'
	import uniLeftAction from '@/components/uni-left-action/uni-left-action.vue'
	import orderInfo from '@/components/order-info/order-info.vue'
	import changePrice from '@/components/change-price/change-price.vue'
	import prodPop from '@/components/prod-pop/prod-pop.vue'
	import goodModify from "@/components/good-modify/good-modify.vue"
	import parmasData from './parmas.js'
	const paramsOrder = JSON.stringify(parmasData.orderParamsData);

	export default {
		mixins: [mixinDraft],
		components: {
			uniLeftAction,
			orderInfo,
			changePrice,
			prodPop,
			goodModify
		},
		data() {
			return {
				orderForm: JSON.parse(paramsOrder),
				draftForm: parmasData.draftForm,
				confirmSum: {
					realSum: 0
				}, // 收款信息
				confirmRecSumTotal: 0,
				prodList: [], // 即时商品列表
				// 改价list
				oldList: [],
				// 商品规格弹窗
				popupClass: '',
				// 意向金收款弹框
				ztPrice: null,
				modalShow2: false,
				saveDealPriceFlag: true, //判断加个
				saveDealInterval: null,
				ordFusionShoppingCartId: '',
				// 组织
				orgParams: null,
				// 是否禁用
				isDisabled: false,
				// 0编辑商品 1优惠 2折扣
				priceState: 0
			};
		},
		onLoad(option) {
			if (option.ordFusionShoppingCartId) {
				this.draftForm.ordFusionShoppingCartId = option.ordFusionShoppingCartId
			}
			this.init()
		},
		onShow() {
			this.handleData()
		},
		methods: {
			// 客户信息
			updateOrderInfo(orderInfo, isDisabled) {
				this.draftForm = orderInfo;
				this.isDisabled = isDisabled;
			},
			// 批量改价 切换
			switchState(list, priceState) {
				this.prodList = list;
				this.priceState = priceState;
			},
			// 批量改价 提交
			saveBatchPrice(orderForm, oldList) {
				this.draftForm = orderForm;
				this.oldList = oldList;
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
			},
			// 返回页面更新数据
			handleData() {
				this.setSalesList()
				this.setProdList()
			},
			// 跳转选择商品页
			toChooseGood() {
				uni.setStorageSync('prodList', this.prodList)
				uni.setStorageSync('delList', [])
				this.$toPage('/pages/chooseProduct/chooseProduct?type=draft')
			},
			// 回填商品数据
			setProdList() {
				let curProdList = uni.getStorageSync('chooseProduct')
				if (!curProdList) {
					return false
				}
				this.$utils.setEachVal(curProdList, 'amount', 1)
				this.$utils.setEachVal(curProdList, 'isAdd', true)
				this.$utils.setEachVal(curProdList, 'orderTypeCode', '1001') // 默认配送
				if (this.draftForm.ordFusionShoppingCartId) {
					this.$utils.setEachVal(curProdList, 'ordFusionShoppingCartId', this.draftForm.ordFusionShoppingCartId)
				}

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

				if (this.draftForm.ordFusionShoppingCartId) {
					this.addItem(curProdList)
				}
				this.draftForm.cartItemInsertList = curProdList
				this.prodList = this.prodList.concat(curProdList)
				this.updateDraft(false);
				uni.removeStorageSync('chooseProduct')
			},
			// 查询订单详情
			getOrderInfo() {
				this.$http({
					url: this.$api.getDraftInfo,
					data: {
						ordFusionShoppingCartId: this.draftForm.ordFusionShoppingCartId
					},
					success: res => {
						if (res.code == '02') {
							this.$msg(res.msg)
							return
						}
						uni.setStorageSync("orderItemLineNo", 0)
						this.draftForm = res.data
						// #ifdef H5
						if (Number(this.draftForm.deliveryDate)) {
							this.draftForm.deliveryDate = utils.formatDate(new Date(Number(this.draftForm.deliveryDate))).f1
						}
						if (Number(this.draftForm.contractDate)) {
							this.draftForm.contractDate = utils.formatDate(new Date(Number(this.draftForm.contractDate))).f1
						}
						// #endif
						// 初始化一次
						if (!this.draftForm.phoneUserInfo) {
							this.draftForm.phoneUserInfo = {
								customerMobilePhone: this.draftForm.customerCellphoneNum,
								customerName: this.draftForm.customerName,
								addressDetail: this.draftForm.consigneeAddressDetail
							}
						}
						if (res.data.cartItemSelectList) {
							this.prodList = res.data.cartItemSelectList
							this.prodList.forEach(item => {
								// 初始化Prod新增属性
								this.$utils.setInitProd(item, {
									discountDeatilList: this.discountDeatilList,
									discountList: this.discountList
								})
							})
							uni.setStorageSync('draftProduct', this.prodList)
						}
						if (this.oldList.length == 0) {
							this.oldList = this.prodList;
						}
						this.setTotalPrice()
						this.$refs.orderPop.getAttachmentList(this.draftForm.attachmentId);
						this.initSales()
						this.draftForm.addressDetails = this.draftForm.cityName ? this.draftForm.cityName + this.draftForm.countyName :
							'';
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

						if (this.draftForm.ordFusionShoppingCartId) {
							this.getOrderInfo()
						}
					}
				})
			},
			// 保存更新
			submitForm() {
				var pricereg = /^\d+(\.\d+)?$/
				if (!pricereg.test(this.draftForm.itemChargedTotal)) {
					this.$msg('请输入正确的金额')
					return false
				}
				// 草稿订单没有费用costTotal
				this.draftForm.totalPrice = this.draftForm.itemChargedTotal
				//将最新的商品数据保存
				let orderItemLineNo = uni.getStorageSync("orderItemLineNo");
				this.prodList.forEach(item => {
					if (!item.orderItemLineNo) {
						orderItemLineNo += 10;
						item.orderItemLineNo = orderItemLineNo;
					}
				})
				uni.setStorageSync("orderItemLineNo", orderItemLineNo)
				this.draftForm.cartItemInsertList = this.prodList
				this.draftForm.cartItemUpdateList = this.prodList
				if (!this.draftForm.ordFusionShoppingCartId) {
					if (!this.saveDealPriceFlag) {
						this.saveDealInterval = setInterval(() => {
							if (this.saveDealPriceFlag) {
								clearInterval(this.saveDealInterval)
								// 更新表
								this.addDraft()
							}
						}, 500)
					} else {
						// 更新表
						this.addDraft()
					}
				} else {
					if (!this.saveDealPriceFlag) {
						this.saveDealInterval = setInterval(() => {
							if (this.saveDealPriceFlag) {
								clearInterval(this.saveDealInterval)
								// 更新表
								this.updateDraft(true)
							}
						}, 500)
					} else {
						// 更新表
						this.updateDraft(true)
					}
				}
			},
			updateDraft(isBtn) {
				// 更新表
				this.$http({
					url: this.$api.updateDraft,
					data: this.draftForm,
					success: res => {
						if (res.code == '01') {
							if (isBtn) {
								this.$msg('更新成功')
							}
							this.getOrderInfo()
						} else {
							this.$msg(res.message)
						}
					}
				})
			},
			addDraft() {
				// 新增表
				this.$http({
					url: this.$api.addDraft,
					data: this.draftForm,
					success: res => {
						if (res.code == '01') {
							this.$msg('保存成功')
							this.draftForm.ordFusionShoppingCartId = res.data.ordFusionShoppingCartId
							this.getOrderInfo()
						} else {
							this.$msg(res.message)
						}

					}
				})
			},
			// 新增明细行
			addItem(list) {
				this.$http({
					url: this.$api.addDraftItem,
					data: list,
					success: res => {
						this.getOrderInfo()
					}
				})
			},
			// 选配打开
			xpHandle(e) {
				if (e.configureAllowFlag == 1) {
					if (e.statusCode == '1001' || !e.statusCode) {
						this.configInfo(e)
					}
				}
			},
			// 判断是否需要选配
			configInfo(item) {
				this.$http({
					url: this.$api.queryLastConfigInfo,
					data: {
						itemCode: item.originalItemCode
					},
					success: (res) => {
						if (res.data.type == 1) {
							this.popupClass = 'show';
							this.$refs.prodPop.showPopup(this.popupClass, item);
							this.modalProduct = item
						}
					}
				})
			},
			// 编辑成功
			changeSpec(e, id) {
				e.amount = e.amount > 1 ? e.amount : 1;
				this.$utils.setInitProd(e, {
					discountDeatilList: this.discountDeatilList,
					discountList: this.discountList
				})

				if (this.draftForm.ordFusionShoppingCartId) {
					e.shoppingCartItemId = this.modalProduct.shoppingCartItemId
					e.versionTime = ''
					this.$http({
						url: this.$api.updateDraftItem,
						data: e,
						success: res => {
							if (res.code == '01') {
								let removeLineNo = uni.getStorageSync('removeLineNo'),
									deleteListItem = [],
									arr = [];
								this.prodList.forEach(item => {
									// 去除齐配关联
									if (removeLineNo == item.leadOrderItemLineNo && item.leadOrderItemLineNo) {
										deleteListItem.push({
											shoppingCartItemId: JSON.parse(JSON.stringify(item.shoppingCartItemId)),
											versionTime: JSON.parse(JSON.stringify(item.versionTime))
										});
										delete item.leadOrderItemLineNo;
										delete item.strongFlag
										delete item.shoppingCartItemId
										arr.push(item);
									}
								})
								uni.removeStorageSync('removeLineNo')
								if (deleteListItem.length > 0) {
									this.$http({
										url: this.$api.removeBatchItems,
										data: {
											keyInfos: deleteListItem
										},
										success: res => {
											this.getOrderInfo()
										}
									})
								}
								
								if (e.selectedItemSetList.length > 0) {
									e.selectedItemSetList.forEach(ele => {
										ele.orderTypeCode = '1001'
										ele.amount = ele.quantity ? ele.quantity : 1;
										ele.ordFusionShoppingCartId = this.draftForm.ordFusionShoppingCartId;
										this.$utils.setInitProd(ele, {
											discountDeatilList: this.discountDeatilList,
											discountList: this.discountList
										})
										arr.push(ele)
									})
									// this.draftForm.cartItemInsertList = arr
								}
								if (arr.length > 0) {
									this.addItem(arr)
								}
								if (deleteListItem.length == 0 && arr.length == 0) {
									this.getOrderInfo()
								}
							}
						}
					})
				} else {
					for (let i in this.prodList) {
						if (this.prodList[i].originalItemCode == e.originalItemCode || this.prodList[i].itemCode == e.originalItemCode) {
							this.prodList.splice(i, 1, e)
						}
					}
					this.draftForm.cartItemInsertList = this.prodList
					this.setTotalPrice()
					this.updateDraft(false);
				}
			},
			// 删除回调
			removeHandle(e, index) {
				if (this.draftForm.ordFusionShoppingCartId) {
					let deleteListItem = [],
						addListItem = [];
					deleteListItem.push(e)
					this.prodList.forEach(prodItem => {
						if (prodItem.leadOrderItemLineNo == e.orderItemLineNo) {
							deleteListItem.push(JSON.parse(JSON.stringify(prodItem)));
							delete prodItem.leadOrderItemLineNo;
							delete prodItem.strongFlag
							delete prodItem.shoppingCartItemId
							addListItem.push(JSON.parse(JSON.stringify(prodItem)));
						}
					})
					this.updateList(deleteListItem, addListItem)
				} else {
					this.prodList.forEach(prodItem => {
						if (prodItem.leadOrderItemLineNo == e.orderItemLineNo) {
							delete prodItem.leadOrderItemLineNo;
							delete prodItem.strongFlag
						}
					})
					this.prodList.splice(index, 1)
					this.draftForm.cartItemInsertList = this.prodList;
				}
				//计算金额
				this.setTotalPrice()
			},
			removeBatchItems(deleteListItem) {
				return new Promise((resolve, reject) => {
					if (deleteListItem.length > 0) {
						this.$http({
							url: this.$api.removeBatchItems,
							data: {
								keyInfos: deleteListItem
							},
							success: res => {
								resolve(res);
							}
						})
					} else {
						resolve({
							code: "03"
						});
					}
				})
			},
			addDraftItem(addListItem) {
				return new Promise((resolve, reject) => {
					if (addListItem.length > 0) {
						this.$http({
							url: this.$api.addDraftItem,
							data: addListItem,
							success: res => {
								resolve(res);
							}
						})
					} else {
						resolve({
							code: "03"
						});
					}
				})
			},
			updateList(deleteListItem, addListItem) {
				const promise1 = this.removeBatchItems(deleteListItem);
				const promise2 = this.addDraftItem(addListItem);
				Promise.all([promise1, promise2]).then((values) => {
					if (values[0].code && values[1].code) {
						this.getOrderInfo();
					}
				});
			},
			// 直接生成订单 并跳转到详情页
			addLsOrderNew() {
				this.setOrderForm();
				// 表单校验
				let validate = this.$validate.check(this.draftForm, this.$rules.addOrder)
				if (validate) {
					// 校验是否有未选配行
					let xpflag = this.$utils.limitSpec(this.prodList)
					if (xpflag) {
						return false
					}
					var pricereg = /^\d+(\.\d+)?$/
					if (!pricereg.test(this.orderForm.itemChargedTotal)) {
						this.$msg('请输入正确的金额')
						return false
					}
					// 校验纸质单号是否必填
					if (this.orgParams.paperBillNoIsRequired == 1 && this.orderForm.orderDocsNo == '') {
						this.$msg('纸质单号不能为空！')
						return false
					}
					// 校验零售单是否上传
					if (this.orgParams.attachmentMustUploadLs == 1 && this.orderForm.attachmentId == '') {
						this.$msg('请上传附件')
						return false
					}
					
					let orderItemLineNo = uni.getStorageSync("orderItemLineNo");
					this.prodList.forEach(item => {
						if (!item.orderItemLineNo) {
							orderItemLineNo += 10;
							item.orderItemLineNo = orderItemLineNo;
						}
					})
					uni.setStorageSync("orderItemLineNo", orderItemLineNo)
					this.draftForm.totalPrice = this.draftForm.itemChargedTotal;
					this.orderForm.totalPrice = this.draftForm.itemChargedTotal;
					this.orderForm.orderTypeCode = '1001'
					if (!this.orderForm.orderId) {
						// 判断是否有自提并且没有付款金额
						let ztPrice = this.$utils.computeZt(this.prodList)
						let comfirmTotalPrice = 0
						comfirmTotalPrice = this.$utils.sum([this.confirmReceiptPrice, this.confirmSum.realSum])
						if (ztPrice > comfirmTotalPrice) {
							this.$msg('收款金额必须大于自提商品金额')
							return false
						}
						uni.showLoading({
							title: '保存中'
						})
						this.$http({
							url: this.$api.createSaleOrder,
							data: this.$utils.addLsOrder(this.orderForm, this.prodList, this.confirmSum, []),
							success: res => {
								this.$msg(res.msg)
								if (res.code == '01') {
									let data = res.data[0]
									if (this.ordFusionShoppingCartId) {
										this.removeDraft()
										uni.setStorageSync('removeDraft', true);
									}
									this.$closedTo('/pages/addOrder/addOrder?orderId=' + data.orderId + '&statusCode=' + data.statusCode +
										'&type=orderDetail');
								}
							}
						})
					}
				} else {
					this.$msg(this.$validate.error)
				}
			},
			//赋值表单信息
			setOrderForm() {
				this.orgParams = uni.getStorageSync('orgParams');
				let draftForms = this.draftForm;
				if (draftForms) {
					for (let key in draftForms) {
						for (let orderkey in this.orderForm) {
							if (orderkey == key) {
								this.orderForm[orderkey] = draftForms[key]
								break
							}
						}
					}
					this.ordFusionShoppingCartId = draftForms.ordFusionShoppingCartId
				}

				let salesCode = this.draftForm.salesNo.split(',')
				let salesId = this.draftForm.salesId.split(',')
				let salesName = this.draftForm.salesName.split(',')
				let tmp = []
				for (let i = 0; i < salesId.length; i++) {
					tmp.push({
						checked: true,
						personId: salesId[i],
						personName: salesName[i],
						personCode: salesCode[i],
						salesId: salesId[i],
						salesName: salesName[i],
						salesNo: salesCode[i],
					})
				}
				this.orderForm.createListSales = tmp
			},
			// 删除草稿单
			removeDraft() {
				this.$http({
					url: this.$api.delDraft,
					data: [{
						ordFusionShoppingCartId: this.ordFusionShoppingCartId
					}]
				})
			}
		},
		filters: {
			formatDate: function(value) {
				return utils.formatDate(new Date(value)).f1;
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

		.text {
			margin-right: 5px;
		}
	}

	.btns {
		display: flex;

		.btn {
			flex: 1;
			border-radius: 0;
		}
	}

	.order-body {
		.text-black {
			color: #272727;
		}
	}
</style>
