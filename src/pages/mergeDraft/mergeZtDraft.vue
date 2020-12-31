<template>
	<page>
		<view slot="body">
			<view class="order-body">
				<!-- 客户信息 -->
				<view class="list list-title">
					<view class="title bold">
						客户信息
					</view>
				</view>
				<view class="list">
					<view class="title">客户手机：</view>
					<view class="action">
						<input type="number" v-model="orderForm.customerCellphoneNum" placeholder="11位手机号码" @input='getCustomer' />
					</view>
				</view>
				<view class="list">
					<view class="title">客户姓名：</view>
					<view class="action">
						<input type="text" style="width: 100%;" placeholder-class="input-calss-form" v-model="orderForm.customerName"
						 placeholder="请输入" />
					</view>
				</view>
				<view class="list" :hover-class="!disabled ? 'hover' : ''">
					<view class="title">合同日期：</view>
					<view class="action">
						<datetime-picker class="datePicker" :dateStr="orderForm.contractDate" :isDisabled="disabled" :defaultValue="orderForm.contractDate"
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
				<view class="list list-title-goods">
					<view class="list-goods">
						<!-- #ifndef H5 -->
						<view class="list-goods-add" @tap="toScan">
							<text class="iconfont icon-scan goods-form-icon"></text>
							扫描商品
						</view>
						<!-- #endif -->
						<view class="list-goods-add" @tap="toGood">
							<text class="iconfont icon-icon-addcart goods-form-icon"></text>
							添加商品
						</view>
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
			<good-Modify
				ref='productPop'
				:discountIndex="discountIndex"
				:discountList="discountList"
				@bindDiscountChange="bindDiscountChange"
				@editSubmit="editSubmit"
			></good-Modify>
			<!-- 选配弹窗 -->
			<prod-pop ref='prodPop' type="current" :class="popupClass" @changeSpec='changeSpec'></prod-pop>
			<!-- 销售弹窗 -->
			<search-pop ref='searchPop' @choose='choose'></search-pop>
		</view>
		<view slot="footer">
			<view class="btns" @tap="submitForm">生成订单</view>
		</view>
	</page>
</template>

<script>
	import mixinOrder from '@/mixins/order'
	import utils from '@/common/js/utils.js'
	import md5 from '@/common/js/md5.js'
	import uniLeftAction from '@/components/uni-left-action/uni-left-action.vue'
	import changePrice from '@/components/change-price/change-price.vue'
	import prodPop from '@/components/prod-pop/prod-pop.vue'
	import goodModify from "@/components/good-modify/good-modify.vue"
	import datetimePicker from '@/components/datetime-picker/datetime-picker.vue'
	import searchPop from '@/components/search-pop/search-pop.vue'
	import parmasData from './parmas.js'
	const paramsOrder = JSON.stringify(parmasData.orderParamsData);
	export default {
		mixins: [mixinOrder],
		components: {
			uniLeftAction,
			changePrice,
			prodPop,
			goodModify,
			datetimePicker,
			searchPop
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
				disabled: false, //合同
				// 0编辑商品 1优惠 2折扣
				priceState: 0,
				// 是否保存成功
				isSuccess: true,
				// 上传图片参数
				uploadParams: {
					mainType: 'salorder',
					subType: ''
				},
				picList: [], // 图片列表
			};
		},
		onLoad() {
			this.init()
			if (uni.getStorageSync('addOrderZtData')) {
				uni.showModal({
					title: '提示',
					content: '是否需显示上次未保存的信息',
					cancelText: '否',
					confirmText: '是',
					success: (res) => {
						if (res.confirm) {
							this.orderForm = uni.getStorageSync('addOrderZtData')
							this.prodList = this.orderForm.createListItem
							let orderItemLineNo = 10;
							this.prodList.forEach(item => {
								if (item.orderItemLineNo > orderItemLineNo) {
									orderItemLineNo = item.orderItemLineNo
								}
							})
							uni.setStorageSync('orderItemLineNo', orderItemLineNo);
							this.getAttachmentList(this.orderForm.attachmentId);
						} else if (res.cancel) {
							uni.removeStorageSync('addOrderZtData')
						}
					}
				})
			}
			this.$nextTick(() => {
				setTimeout(()=>{
					this.initMd5Str = md5.hex_md5(JSON.stringify(this.orderForm))
				}, 600)
			})
			// 初始化行号 齐配
			uni.setStorageSync("orderItemLineNo", 0)
		},
		onUnload() {
			if (this.isSuccess) {
				if (this.initMd5Str !== md5.hex_md5(JSON.stringify(this.orderForm))) {
					this.orderForm.createListItem = this.prodList
					uni.setStorageSync('addOrderZtData', this.orderForm)
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
			init() {
				// 新增时设置默认门店信息
				this.setDefaultStore();
				// 新增时设置默认销售人员
				this.setDefaultSale();
				// 设置默认日期
				this.setDefaultDate();
				// 获取销售政策列表
				this.getPolicyList();
				// 获取折扣类型列表
				this.getDealerDiscount();
				
				if (this.isDisabled || (uni.getStorageSync('orgParams') && uni.getStorageSync('orgParams').contractDateModifyFlag ==
						0)) {
					this.disabled = true;
				}
			},
			setDefaultDate() {
				// 设置默认交期
				this.orderForm.deliveryDate = this.$utils.getCurrentDate()
				// 设置默认合同日期
				this.orderForm.contractDate = this.$utils.getCurrentDate()
			},
			// 合同日期
			changeContractDate(e) {
				this.orderForm.contractDate = e.f1;
			},
			// 获取销售政策列表
			getPolicyList() {
				this.$http({
					url: this.$api.getpolicyList,
					data: {
						storeId: this.orderForm.storeId,
						pageNum: 1,
						pageSize: 10
					},
					success: (res) => {
						if (!this.orderForm.orderId && res.data.length > 0) {
							this.orderForm.marketingPolicyId = res.data[0].policyId
							this.orderForm.marketingPolicyName = res.data[0].policyName
						}
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
			// 返回页面更新数据
			handleData() {
				this.setSalesList(); //销售人员数据
				this.setprodList(); //商品数据
			},
			// 跳转到选择商品
			toGood() {
				uni.setStorageSync('prodList', this.prodList)
				uni.setStorageSync('delList', [])
				this.$toPage('/pages/chooseProduct/chooseProdZt?type=ztOrder')
			},
			// 选中回调
			choose(e, typeName) {
				this.orderForm.marketingPolicyId = e.policyId
				this.orderForm.marketingPolicyName = e.policyName
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
									item.itemSpecsWithSmallSpec = item.itemSpecs;
									item.singlePrice = item.singlePrice ? item.singlePrice : item.markedPrice;
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
			
			// 提交表单
			submitForm() {
				let reg = /^1[3-9]\d{9}$/;
				if (this.orderForm.customerCellphoneNum != '' && !reg.test(this.orderForm.customerCellphoneNum)) {
					this.$msg('请输入正确的手机号')
					return false
				}
				if (this.prodList.length == 0) {
					this.$msg('请先添加商品')
					return
				}
				// 校验纸质单号是否必填
				// if (this.orgParams.paperBillNoIsRequired == 1 && this.orderForm.orderDocsNo == '') {
				// 	this.$msg('纸质单号不能为空！')
				// 	return false
				// }
				
				// 校验零售单是否上传
				// if (this.orgParams.attachmentMustUploadLs == 1 && this.orderForm.attachmentId == '') {
				// 	this.$msg('请上传附件')
				// 	return false
				// }
				this.orderForm.totalPrice = this.orderForm.itemChargedTotal
				this.orderForm.orderTypeCode = '1003';
				let userInfo = uni.getStorageSync('userInfo')
				if (!this.orderForm.customerCellphoneNum) {
					this.orderForm.customerCellphoneNum = userInfo.personPhone
				}
				if (!this.orderForm.customerName) {
					this.orderForm.customerName = userInfo.personName
				}
				if (!this.$utils.multipleClicks('保存中')) {
					return
				}
				this.$http({
					url: this.$api.createSaleOrder,
					data: this.$utils.addLsOrder(this.orderForm, this.prodList, this.confirmSum, this.receiptList),
					success: res => {
						if (res.code == '01') {
							uni.removeStorageSync('addOrderZtData')
							this.isSuccess = false
							let data = res.data[0],
							addOrderZtList = uni.getStorageSync('addOrderZtList') ? uni.getStorageSync('addOrderZtList') : [],
							url = '/pages/addOrder/addZtOrder';
							
							if (data.statusCode == '1003' || data.statusCode == '1002') {
								url = '/pages/addOrder/orderDetailRo';
								if (res.message != '') {
									addOrderZtList.push({
										orderId: data.orderId,
										message: res.message
									});
									uni.setStorageSync('addOrderZtList', addOrderZtList)
								}
							}
							this.$closedTo(url + '?orderId=' + data.orderId + '&statusCode=' + data.statusCode +
								'&type=orderDetail&orderTypeCode=' + data.orderTypeCode);
						} else if (res.code == '000X') {
							this.isSuccess = false
							this.$utils.multipleRemoveClicks();
						} else {
							this.$msg(res.msg)
							this.$utils.multipleRemoveClicks();
						}
					}
				})
			},
			// 编辑成功
			changeSpec(e, id) {
				let index = e.index
				e.amount = e.amount > 1 ? e.amount : 1;
				e.orderTypeCode = '1003'
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
						ele.orderTypeCode = '1003'
						this.$utils.setInitProd(ele, {
							discountDeatilList: this.discountDeatilList,
							discountList:this.discountList
						})
						this.prodList.splice(length, 0, ele)
					})
				}
				this.setTotalPrice()
			},
			// 设置默认门店信息
			setDefaultStore() {
				let data = uni.getStorageSync('storeInfo')
				this.orderForm.storeNo = data.storeCode
				this.orderForm.storeId = data.storeId
				this.orderForm.storeName = data.storeName
			}
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
	.btns {
		display: block;
		line-height: 92rpx;
		font-size: 36rpx;
		text-align: center;
		background-color: #D31311;
		color: #FFFFFF;
	}
</style>
