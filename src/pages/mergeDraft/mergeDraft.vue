<template>
	<page>
		<view slot="body">
			<view class="order-body">
				<!-- 客户信息 -->
				<order-info
					:orderForm="orderForm"
					:isDisabled="isDisabled"
					@updateOrderInfo="updateOrderInfo"
				></order-info>
				<!-- 商品信息 -->
				<view class="list list-title">
					<view class="title bold">商品信息</view>
				</view>
				<view v-if="prodList.length > 0">
					<uniLeftAction
						:prodList="prodList"
						:isDisabled="isDisabled"
						:priceState="priceState"
						:statusCode='orderForm.statusCode'
						@xpHandle="xpHandle"
						@editHandle="editHandle"
						@removeHandle="removeHandle"
						@prodlistAmount='prodlistAmount'
						@checkedChange="checkedChange"
					></uniLeftAction>
				</view>
				<view class="list list-title-goods " @tap="toGood">
					<view class="list-goods" style="display: flex;align-items: center;justify-content: center;">
						<text class="icon iconfont icon-icon-addcart goods-form-icon"></text>
						添加商品
					</view>
				</view>
				<!-- 批量改价 -->
				<change-price
					:orderForm="orderForm"
					:prodList="prodList"
					:priceState="priceState"
					:isDisabled="isDisabled"
					@switchState="switchState"
					@saveBatchPrice="saveBatchPrice"
				></change-price>
				
				<!-- 附加信息 -->
				<order-info
					v-if="hackReset"
					ref='orderPop'
					:orderForm="orderForm"
					:isDisabled="isDisabled"
					:currentIndex="1"
					@updateOrderInfo="updateOrderInfo"
				></order-info>
			</view>
			<view class="place"></view>
			<!-- 编辑弹窗 -->
			<good-Modify
				ref='productPop'
				:discountIndex="discountIndex"
				:discountList="discountList"
				@bindDiscountChange="bindDiscountChange"
				@editSubmit="editSubmit"
			></good-Modify>
			<!-- 选配弹窗 -->
			<prod-pop ref='prodPop' type="current" :class="popupClass" @changeSpec='changeSpec'></prod-pop>
		</view>
		<view slot="footer" v-if="!isDisabled">
			<view class="btns">
				<button class="btn bg-red" @tap="submitForm">生成订单</button>
				<button class="btn bg-brown" @tap="submitDraft">暂存草稿</button>
			</view>
		</view>
	</page>
</template>

<script>
	import mixinOrder from '@/mixins/order'
	import utils from '@/common/js/utils.js'
	import md5 from '@/common/js/md5.js'
	import uniLeftAction from '@/components/uni-left-action/uni-left-action.vue'
	import orderInfo from '@/components/order-info/order-info.vue'
	import changePrice from '@/components/change-price/change-price.vue'
	import prodPop from '@/components/prod-pop/prod-pop.vue'
	import goodModify from "@/components/good-modify/good-modify.vue"
	import parmasData from './parmas.js'
	const paramsOrder = JSON.stringify(parmasData.orderParamsData);
	export default {
		mixins: [mixinOrder],
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
				initMd5Str: '',
				confirmSum: {
					realSum: 0
				}, // 收款信息
				receiptList: [],
				// 改价list
				oldList: [],
				confirmReceiptPrice: 0,
				// 是否禁用
				isDisabled: false,
				// 组织
				orgParams: null,
				// 0编辑商品 1优惠 2折扣
				priceState: 0,
				// 是否保存成功
				isSuccess: true
			};
		},
		onLoad() {
			this.init()
			if (uni.getStorageSync('addOrderData')) {
				uni.showModal({
					title: '提示',
					content: '是否需显示上次未保存的信息',
					cancelText: '否',
					confirmText: '是',
					success: (res) => {
						if (res.confirm) {
							this.orderForm = uni.getStorageSync('addOrderData')
							this.prodList = this.orderForm.createListItem				
							this.$refs.orderPop.getAttachmentList(this.orderForm.attachmentId);
						} else if (res.cancel) {
							uni.removeStorageSync('addOrderData')
						}
					}
				})
			}
			this.$nextTick(() => {
				setTimeout(()=>{
					this.initMd5Str = md5.hex_md5(JSON.stringify(this.orderForm))
				},600)
			})
			// 初始化行号 齐配
			uni.setStorageSync("orderItemLineNo", 0)
		},
		onUnload() {
			if (this.isSuccess) {
				if (this.initMd5Str !== md5.hex_md5(JSON.stringify(this.orderForm))) {
					this.orderForm.createListItem = this.prodList
					uni.setStorageSync('addOrderData', this.orderForm)
				}
			}				
		},
		onShow() {
			this.orgParams = uni.getStorageSync('orgParams')
			this.handleData()
		},
		methods: {
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
			//暂存草稿
			submitDraft() {
				var data = {};
				function isEq(a, b, data) {
					var aKeys = Object.keys(b);
					aKeys.forEach(key => {
						if (a.hasOwnProperty(key)) {
							data[key] = a[key];
						}
					})
					return data
				}
				// 创建没有费用costTotal
				this.orderForm.totalPrice = this.orderForm.itemChargedTotal
				this.orderForm.orderTypeCode = '1001';
				isEq(this.orderForm, parmasData.draftParamsData, data);
				uni.showLoading({
					title:'保存中'
				})
				this.$http({
					url: this.$api.addDraft,
					data: this.$utils.draftChange(data, this.prodList),
					success: res => {
						if (res.code == '01') {
							this.$msg('保存成功')
							this.isSuccess = false
							uni.removeStorageSync('addOrderData')
							this.$closedTo('/pages/addDraft/addDraft?ordFusionShoppingCartId=' + res.data.ordFusionShoppingCartId);
						} else {
							this.$msg(res.message)
						}
					}
				})
			},
			init() {				
				// 新增时设置默认销售人员
				this.setDefaultSale();
				// 获取折扣类型列表
				this.getDealerDiscount();
			},
			// 返回页面更新数据
			handleData() {
				this.setSalesList(); //销售人员数据
				this.setprodList(); //商品数据
			},
			// 跳转到选择商品
			toGood() {
				uni.setStorageSync('prodList', this.prodList)
				uni.setStorageSync('delList', [])
				this.$toPage('/pages/chooseProduct/chooseProduct?type=order')
			},
			// 回填商品数据
			setprodList() {
				let curProdList = uni.getStorageSync('chooseProduct')
				if (!curProdList) {
					return false
				}
				this.$utils.setEachVal(curProdList, 'amount', 1)
				this.$utils.setEachVal(curProdList, 'isAdd', true)
				this.$utils.setEachVal(curProdList, 'orderTypeCode', '1001') // 默认配送
				
				curProdList.forEach(item => {
					// 齐配数量后台传递
					if (item.strongFlag == 0 || item.strongFlag == 1) {
						item.amount = item.quantity ? item.quantity : 1;
					}
					// 初始化Prod新增属性
					this.$utils.setInitProd(item, {
						discountDeatilList: this.discountDeatilList,
						discountList:this.discountList
					})
				})
				this.prodList = this.prodList.concat(curProdList)
				//计算金额
				this.setTotalPrice()				
				//未收款计算
				this.orderForm.notChargedTotal = this.$utils.subtraction(this.orderForm.itemChargedTotal, this.orderForm.chargedTotal)
				uni.removeStorageSync('chooseProduct')
			},
			// 选中状态
			checkedChange(item) {
				this.prodList[item.index].checked = !item.checked;
				this.$forceUpdate()
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
					}
				})
			},
			// 提交表单
			submitForm() {
				// 表单校验
				let validate = this.$validate.check(this.orderForm, this.$rules.addOrder)
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
					// if (this.orgParams.attachmentMustUploadLs == 1 && this.orderForm.attachmentId == '') {
					// 	this.$msg('请上传附件')
					// 	return false
					// }
					// 创建没有费用costTotal
					this.orderForm.totalPrice = this.orderForm.itemChargedTotal
					this.orderForm.orderTypeCode = '1001';
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
							title:'保存中'
						})
						this.$http({
							url: this.$api.createSaleOrder,
							data: this.$utils.addLsOrder(this.orderForm, this.prodList, this.confirmSum, this.receiptList),
							success: res => {
								this.$msg(res.msg)
								if (res.code == '01') {
									uni.removeStorageSync('addOrderData')
									this.isSuccess = false
									let data = res.data[0]							
									this.$closedTo('/pages/addOrder/addOrder?orderId=' + data.orderId + '&statusCode=' + data.statusCode +
										'&type=orderDetail&orderTypeCode='+data.orderTypeCode);
								} else if (res.code == '000X') {
									this.isSuccess = false
								}
							}
						})
					}
				} else {
					this.$msg(this.$validate.error)
				}
			},
			// 编辑成功
			changeSpec(e, id) {			
				let index = e.index
				e.amount = e.amount > 1 ? e.amount : 1;
				e.orderTypeCode = '1001'
				this.$utils.setInitProd(e, {
					discountDeatilList: this.discountDeatilList,
					discountList:this.discountList
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
							discountList:this.discountList
						})
						this.prodList.splice(length, 0, ele)
					})
				}
				this.setTotalPrice()
			},
		}
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: $page-bgcolor;
	}
	
	.order-body {
		.text-black {
			color: #272727;
		}
	}
</style>
