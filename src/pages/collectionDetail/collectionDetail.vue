<template>
	<page>
		<view slot="body">
			<form class="formBox">
				<view class="formTab">
					<view class="formTab-item" v-for="(item, itemIndex) in candidates" :key="itemIndex" :class="index == itemIndex ? 'active' : ''"
					 @tap="bindPickerChange(itemIndex)" hover-class="hover">
						<text v-if="index == itemIndex" class="icon iconfont icon-Check-Circle-Filled-2"></text>
						<text v-else class="icon iconfont icon-list-icon-littlechoose-nor"></text>
						<text>{{item.value}}</text>
					</view>
				</view>
				<view class="small-place"></view>

				<view class="formInfo">
					<view class="formInfo-item" v-if="!isOrder">
						<view class="item-box">
							<view class="item-title">客户手机</view>
							<view class="item-cont">
								<input class="uni-input" type="number" v-model="data.customerCellphoneNum" placeholder="请输入" placeholder-style="color:#B2B2b2"
								 @input="searchPhone" />
							</view>
						</view>
					</view>
					<view class="formInfo-item" v-if="!isOrder">
						<view class="item-box">
							<view class="item-title">客户姓名</view>
							<view class="item-cont">
								<input class="uni-input" v-model="data.customerName" placeholder="请输入" placeholder-style="color:#B2B2B2" />
							</view>
						</view>
					</view>
					<view class="order-list" v-if="!isOrder && orderList.length > 0">
						<view class="order-list-title">该客户有{{ orderList.length }}笔订单</view>
						<view class="order-list-info">
							<block v-for="(item, index) in orderList" :key="index">
								<view class="list-item" :class="item.checked ? 'active' : ''">
									<view class="list-item-checked" @tap="changeChecked(index)">
										<text class="icon iconfont icon-list-icon-littlechoose-nor" v-if="!item.checked"></text>
										<text class="icon iconfont icon-Check-Circle-Filled-2" v-else></text>
									</view>
									<view class="list-item-numbers" hover-class="hover" @tap="toDetail(item)">
										<view class="">{{item.orderNo}}</view>
										<view class="list-item-price">
											<text class="color-orange">￥{{item.totalPrice | formatNum}}</text>
											<text class="icon iconfont icon-arrow-right"></text>
										</view>
									</view>
								</view>
							</block>
						</view>
					</view>
				</view>
				<view class="small-place" v-if="orderList.length == 0 && !isOrder"></view>
				<view class="formHead">
					<view class="formHead-title">
						收款金额
					</view>
					<view class="formHead-price">
						<view class="total-price">
							<input class="uni-input" :disabled="typeIndex==1?true:false" v-model="data.realSum" placeholder="0.00"
							 placeholder-style="color: rgba(178, 178, 178, .5)" />
						</view>
						<view class="min-price">待收款：{{notChargedTotal | formatNum}}</view>
					</view>
				</view>

				<view class="formInfo">
					<view class="formInfo-item" :hover-class="!isDisabled ? 'hover' : ''">
						<view class="item-box">
							<view class="item-title">收款日期</view>
							<view class="item-cont">
								<datetime-picker class="datePicker" :dateStr="data.bizDate" :isDisabled="isDisabled" start="2000-01-01" end="2100-12-30"
								 fields="day" @change="changeDatetimePicker">
								</datetime-picker>
								<text class="icon iconfont icon-arrow-right" v-if="!isDisabled"></text>
							</view>
						</view>
					</view>
					<view class="formInfo-item" hover-class='hover' v-if="paymentNatureList.length > 0">
						<view class="item-box">
							<view class="item-title">收款性质</view>
							<view class="item-cont">
								<picker @change="bindpaymentNature" :value="index1" :range="paymentNatureList" range-key="label" style="width: 100%;">
									<view class="uni-input" style="width: 100%;">{{paymentNatureList[index1].label}}</view>
								</picker>
								<text class="icon iconfont icon-arrow-right"></text>
							</view>
						</view>
					</view>
					<view class="formInfo-item" hover-class='hover' @tap='showSearch'>
						<view class="item-box">
							<view class="item-title">收款方式</view>
							<view class="item-cont" v-if="dealerSettle.length > 0">
								<view class="uni-input" style="width: 100%;">{{dealerSettle[index2].settleName}}</view>
								<text class="icon iconfont icon-arrow-right"></text>
							</view>
						</view>
					</view>
				</view>
				<view v-if="showType">
					<view class="small-place"></view>
					<view class="formInfo">
						<view class="formInfo-item" hover-class='hover'>
							<view class="item-box">
								<view class="item-title">意向金类型</view>
								<view class="item-cont">
									<picker @change="chooseType" :value="typeIndex" :range="typeList" range-key="label" style="width: 100%;">
										<view class="uni-input" style="width: 100%;" v-if="typeIndex >= 0">{{typeList[typeIndex].label}}</view>
									</picker>
									<text class="icon iconfont icon-arrow-right"></text>
								</view>
							</view>
						</view>
						<view class="formInfo-item">
							<view class="item-box">
								<view class="item-title">定制金额</view>
								<view class="item-cont">
									<input class="uni-input" :disabled="typeIndex==0 || typeIndex==-1?true:false" type="digit" v-model="data.customizedSum"
									 :placeholder="typeIndex==0 || typeIndex==-1?'当前收款性质≠意向金，不可输入金额':'请输入'" placeholder-style="color:#B2B2B2" />
								</view>
							</view>
						</view>
						<view class="formInfo-item">
							<view class="item-box">
								<view class="item-title">定制收款单号</view>
								<view class="item-cont">
									<input class="uni-input" :disabled="true" v-model="data.customizedReceiptNoo" placeholder="不可输入" placeholder-style="color:#B2B2B2" />
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="small-place"></view>
				<view class="formInfo">
					<view class="formInfo-item">
						<view class="item-box">
							<view class="item-title">缴款单号</view>
							<view class="item-cont">
								<input class="uni-input" v-model="data.paymentNo" placeholder="请输入" placeholder-style="color:#B2B2B2" />
							</view>
						</view>
					</view>
					<view class="formInfo-item">
						<view class="item-box">
							<view class="item-title">客户卡号</view>
							<view class="item-cont"><input type="number" class="uni-input" v-model="data.customerBankAccountNo" placeholder="请输入"
								 placeholder-style="color:#B2B2B2" /></view>
						</view>
					</view>
					<view class="formInfo-item" v-if="!isOrder">
						<view class="item-box">
							<view class="item-title">消费流水号</view>
							<view class="item-cont">
								<input class="uni-input" v-model="data.traceNo" placeholder="请输入" placeholder-style="color:#B2B2B2" />
							</view>
						</view>
					</view>
					<view class="formInfo-item">
						<view class="item-box">
							<view class="item-title">备注信息</view>
							<view class="item-cont">
								<input type="text" value="" v-model="data.notes" placeholder="请输入" placeholder-style="color:#B2B2B2" />
							</view>
						</view>
					</view>
					<view class="formInfo-item">
						<view class="item-box start">
							<view class="item-title">上传附件</view>
							<view class="item-cont attachment">
								<tui-upload :params="uploadParams" @complete="result" @remove="remove"></tui-upload>
							</view>
						</view>
					</view>
				</view>
			</form>
			<!-- 收款方式弹窗 -->
			<search-pop ref='searchPop' @choose='choose'></search-pop>
			<view class="place"></view>

			<!-- 提示信息 -->
			<view class="tip-modal" @touchstart="closeStep" v-if="showStep">
				<view class="tip-mask" @tap="closeStep"></view>
				<!-- showStepTop -->
				<view class="tip-content" :class="classStep" :style="{top: showStepTop + 'px'}">
					该客户存在的可收款订单将显示在这里，选中订单即可为该笔订单收款
				</view>
			</view>
		</view>
		<view slot="footer">
			<view class="form-submit">
				<button class="btn" @tap="formSubmit" hover-class="hover">保存</button>
			</view>
		</view>
	</page>
</template>

<script>
	import tuiUpload from '@/components/tui-upload/tui-upload.vue'
	import untils from '@/common/js/utils.js'
	import datetimePicker from '@/components/datetime-picker/datetime-picker.vue'
	import searchPop from '@/components/search-pop/search-pop.vue'
	export default {
		components: {
			tuiUpload,
			datetimePicker,
			searchPop
		},
		data() {
			return {
				showStep: false,
				classStep: '',
				showStepTop: 0,
				// 收款类型
				candidates: [],
				// 收款性质
				index: 0,
				// 是否订单详情过来
				isOrder: false,
				// 关联订单
				orderList: [],
				// 选中订单
				orderSelect: null,
				// 输入收款金额
				"realSum": '',
				// 代收款金额
				money: 0,
				// 最低收款金额
				notChargedTotal: 0,
				// 收款方式
				dealerSettle: [],
				index2: 0,
				// 收款方式
				paymentNatureList: [],
				paymentNatureListCopy: [],
				index1: 0,
				// 上传图片参数
				uploadParams: {
					"mainType": 'receipt',
					"subType": ''
				},
				lastTime: 0,
				// 表单
				data: {
					"bizDate": untils.changeDay(new Date()),
					"storeId": uni.getStorageSync('storeInfo') ? uni.getStorageSync('storeInfo').storeId : '', //门店Id
					"storeNo": uni.getStorageSync('storeInfo') ? uni.getStorageSync('storeInfo').storeCode : '', //门店编码
					"salesPhone": uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo').personPhone : '', //营业员手机
					"attachmentId": "", //附件
					"paymentNature": "", //收款性质，1001-定金；1002-余款；1004-意向金；1003-全款清
					"typeCode": '', //收款单类型，1001：自行收款；1002：商场收款
					"paymentTypeId": '', //收款方式ID
					"customerName": '', //用户名
					"customerCellphoneNum": '', //用户手机号
					"realSum": '', //收款金额
					"paymentNo": '', //缴款单号
					"customerBankAccountNo": '', //客户银行卡号后4位
					"traceNo": '', //三方流水号
					"notes": '', //备注
					"intentionType": '1001', //意向金类型
					"customizedSum": 0, //定制金额
					"customizedReceiptNoo": '' //定制收款单号

				},
				// "notes": "测试打款"
				orgParams: null, //组织参数
				isDisabled: false,
				// 意向金类型
				typeIndex: 0,
				typeList: [{
					code: '1001',
					label: '纯软体'
				}, {
					code: '1002',
					label: '纯定制'
				}, {
					code: '1003',
					label: '融合单'
				}],
				// 是否显示意向金类型下拉框
				showType: false
			};
		},
		onLoad(option) {
			if (option.money) {
				this.money = option.money
				this.notChargedTotal = option.money
				this.isOrder = true;
			}
			this.getreceiptTypeList();
			this.paymentNature();
			if (!option.order) {
				this.getTradepathByPage()
			}
		},
		onShow() {
			this.orgParams = uni.getStorageSync('orgParams')
			// 收款日期是否必须当天
			if (this.orgParams.setSalReceiptDateCheck == 1) {
				this.isDisabled = true;
			}
		},
		methods: {
			// 收款方式选择弹窗
			showSearch() {
				this.$refs.searchPop.showPopup('dealer', this.data);
			},
			// 选择收款方式
			choose(e) {
				this.data.paymentTypeId = e.dealerSettleId;
				for (let i in this.dealerSettle) {
					if (this.dealerSettle[i].dealerSettleId == this.data.paymentTypeId) {
						this.index2 = i;
						break
					}
				}
			},
			// 查询产品线
			getTradepathByPage() {
				this.$http({
					url: this.$api.queryTradepathByPage,
					data: {
						accurateProductLineName: '定制',
						effectiveFlag: 1
					},
					success: (res) => {
						if (res.data.length > 0) {
							this.showType = true
						} else {
							this.showType = false
						}
					}
				})
			},
			// 收款类型列表
			getreceiptTypeList() {
				this.$http({
					url: this.$api.receiptTypeList,
					success: (res) => {
						this.candidates = res.data;
						this.data.typeCode = this.candidates[0].code;
						this.getdealerSettle();
					}
				})
			},
			// 收款类型
			bindPickerChange(val) {
				this.index = val
				this.data.typeCode = this.candidates[val].code;
				this.getdealerSettle();
			},
			// 客户电话
			searchPhone(e) {
				let telephone = e.detail.value;
				this.orderList = [];
				if (telephone.length != 11) {
					return
				}
				let validate = this.$validate.check({
					telephone: telephone
				}, this.$rules.phone);
				if (validate) {
					this.getUserInfo();
					this.getOrderList();
				} else {
					this.$msg(this.$validate.error)
				}
			},
			getUserInfo() {
				this.$http({
					url: this.$api.getCustomerListByPhone,
					data: {
						customerCellphoneNum: this.data.customerCellphoneNum,
						pageNum: 1,
						pageSize: 10
					},
					success: (res) => {
						if (res.code == '01') {
							if (res.data.length > 0) {
								for (let i = 0; i < res.data.length; i++) {
									if (this.data.customerCellphoneNum == res.data[i].customerMobilePhone) {
										this.data.customerName = res.data[i].customerName;
										if (res.data[i].addressDetail) {
											this.data.consigneeAddressDetail = res.data[i].addressDetail;
										}
									}
								}
							}
						}
					}
				})
			},
			getOrderList() {
				this.orderList = [];
				this.$http({
					url: this.$api.getOrderList,
					data: {
						storeId: uni.getStorageSync("storeInfo").storeId,
						keyWords: this.data.customerCellphoneNum,
						priceFlag: '1',
						pageNum: 1,
						pageSize: 10,
					},
					success: res => {
						if (res.code == "01") {
							this.orderList = res.data;
							if (this.orderList.length == 1) {
								this.orderList[0].checked = true;
								this.notChargedTotal = this.orderList[0].totalPrice - this.orderList[0].chargedTotal;
								this.orderSelect = this.orderList[0];
								this.showType = false;
								
								this.bindpaymentReset(this.paymentNatureListCopy);
							}
							if (res.data.length > 0 && !uni.getStorageSync('showStepCollection')) {
								this.$nextTick(() => {
									setTimeout(() => {
										this.showStep = true;
										const {
											windowWidth,
											windowHeight
										} = uni.getSystemInfoSync();
										const query = uni.createSelectorQuery().in(this);
										query.select('.order-list-info').boundingClientRect(data => {
											this.showStepTop = data.top - (windowWidth / 750) * 160;
											setTimeout(() => {
												this.classStep = 'show'
											}, 200);
										}).exec();
									}, 800);

								})
							}
						} else {
							this.$msg(res.msg);
						}
					}
				});
			},

			// 选择关联订单
			changeChecked(index) {
				this.notChargedTotal = 0;
				this.money = 0;
				this.orderSelect = null;
				this.orderList.forEach((item, i) => {
					if (index == i && !item.checked) {
						item.checked = true;
						this.notChargedTotal = item.totalPrice - item.chargedTotal;
						this.money = item.totalPrice;
						this.orderSelect = item
					} else {
						item.checked = false;
					}
				})
				if (this.orderSelect) {
					this.showType = false;
				} else {
					this.showType = true;
				}
				this.bindpaymentReset(this.paymentNatureListCopy);
				this.$forceUpdate();
			},
			// 查看关联订单
			toDetail(item) {
				let url = '';
				if (item.statusCode != '1001') {
					url = '/pages/addOrder/orderDetailRo?orderId=' +
						item.orderId +
						'&statusCode=' +
						item.statusCode +
						"&type=collection&orderTypeCode=" +
						item.orderTypeCode +
						"&itemCount=" +
						item.itemCount

				} else {
					url = '/pages/addOrder/addOrder?orderId=' +
						item.orderId +
						'&statusCode=' +
						item.statusCode +
						"&type=collection&orderTypeCode=" +
						item.orderTypeCode
				}
				this.$toPage(url);
			},
			// 获取时间
			changeDatetimePicker(e) {
				this.data.bizDate = e.f1;
			},
			// 收款方式列表
			getdealerSettle() {
				this.$http({
					url: this.$api.dealerSettle,
					data: {
						storeNo: this.data.storeNo,
						marketSettleFlag: this.data.typeCode == '1002' ? 1 : 0,
						pageNum: 1,
						pageSize: 1000
					},
					success: (res) => {
						this.index2 = 0;
						if (res.data.length > 0) {
							this.dealerSettle = res.data;
							this.data.paymentTypeId = this.dealerSettle[0].dealerSettleId;
						} else {
							this.dealerSettle = [];
							this.data.paymentTypeId = '';
						}
					}
				})
			},
			// 收款方式
			binddealerChange(e) {
				let index = Number(e.detail.value)
				this.index2 = index;
				this.data.paymentTypeId = this.dealerSettle[index].dealerSettleId;
			},
			// 获取收款性质
			paymentNature() {
				this.$http({
					url: this.$api.paymentNature,
					success: (res) => {
						if (res.data) {
							this.paymentNatureListCopy = res.data;
							this.bindpaymentReset(this.paymentNatureListCopy);
						}
					}
				})
			},
			// 收款性质
			bindpaymentNature(e) {
				let index = Number(e.detail.value)
				this.index1 = index;
				this.data.paymentNature = this.paymentNatureList[index].value;
				if (this.data.paymentNature == '1004') {
					this.typeIndex = 0;
					this.data.intentionType = this.typeList[0].code
				} else {
					this.typeIndex = -1;
					this.data.intentionType = ''
				}
			},
			// 选择意向金类型
			chooseType(e) {
				let index = Number(e.detail.value)
				this.typeIndex = index;
				this.data.intentionType = this.typeList[index].code
				this.data.customizedSum = ''
				if (this.data.intentionType == '1001') {
					this.data.customizedSum = 0
				} else if (this.data.intentionType == '1002') {
					this.data.realSum = 0
				}
			},
			// 收款默认重置性质
			bindpaymentReset(list) {
				this.paymentNatureList = [];
				list.forEach((item, index) => {
					if (!this.isOrder && !this.orderSelect && item.label == '意向金') {
						this.paymentNatureList.push(item)
					} else if ((this.isOrder || this.orderSelect) && item.label != '意向金') {
						this.paymentNatureList.push(item)
					}
				})
				this.index1 = 0;
				this.data.paymentNature = this.paymentNatureList[0].value;
				if (this.data.paymentNature == '1004') {
					this.typeIndex = 0;
					this.data.intentionType = this.typeList[0].code
					this.data.customizedSum = 0
				} else {
					this.typeIndex = -1;
					this.data.intentionType = ''
					this.data.customizedSum = ''
				}
			},
			// 上传图片
			result(e) {
				this.data.attachmentId = e.imageId.join(',');
			},
			//移除图片
			remove(e) {
				let index = e.index
			},
			// 保存收款
			formSubmit() {
				let newObj = {}
				if (this.isOrder) {
					Object.assign(newObj, this.data, this.$store.state.collectionData);
				} else {
					Object.assign(newObj, this.data);
				}
				// 表单校验
				if (!this.isOrder) {
					if (newObj.customerCellphoneNum == '') {
						this.$msg('请填写手机号')
						return
					}
					var reg = /^1[0-9]{10,10}$/;
					if (!reg.test(newObj.customerCellphoneNum)) {
						this.$msg('手机号格式错误')
						return
					}
					if (newObj.customerName == '') {
						this.$msg('请填写客户姓名')
						return
					}
				}

				if (newObj.paymentNature == 1005 && Number(newObj.realSum) > 0) {
					this.$msg('退款只能输入负数')
					return
				}
				if (this.data.intentionType !== '1002') {
					if (Number(newObj.realSum) == 0 || newObj.realSum == '' || newObj.realSum == undefined || newObj.realSum == 'null') {
						this.$msg('请输入金额')
						return
					}
				}

				var reg = /^[+-]?\d+(\.\d+)?$/;
				if (!reg.test(newObj.realSum)) {
					this.$msg('请填写正确的收款金额')
					return
				}

				if (this.data.paymentTypeId == '') {
					this.$msg('请选择收款方式')
					return
				}
				if (this.data.intentionType == '1002' || this.data.intentionType == '1003') {
					if (this.data.customizedSum == '') {
						this.$msg('请输入定制金额')
						return
					} else if (this.data.customizedSum <= 0) {
						this.$msg('定制金额必须大于0')
						return
					}
				}
				if (this.data.customizedSum && !reg.test(this.data.customizedSum)) {
					this.$msg('请填写正确的定制金额')
					return
				}
				if (this.data.intentionType == '1002') {
					newObj.realSum = this.data.customizedSum
				}
				if (this.data.intentionType == '1003') {					
					newObj.realSum = Number(this.data.customizedSum) + Number(newObj.realSum)
				}
				if (this.orgParams.paymentNoRequiredFlag == 1 && newObj.paymentNo == "") {
					this.$msg('缴款单号不能为空')
					return
				}
				if (this.dealerSettle[this.index2].cardRequiredFlag == '1') {
					if (!this.data.customerBankAccountNo) {
						this.$msg('该收款方式必须维护客户卡号后四位')
						return
					}
				}
				if ((this.orgParams.attachmentMustUploadSsk == 1 || this.orgParams.attachmentMustUploadZsk == 1) && this.data.attachmentId ==
					'') {
					this.$msg('请上传收款单附件')
					return
				}
				if (this.orderSelect) {
					newObj.orderNo = this.orderSelect.orderNo;
					newObj.orderId = this.orderSelect.orderId;
					newObj.customerId = this.orderSelect.customerId;
				}
				this.throttle(newObj, 5000)
			},
			//函数节流
			throttle(newObj, delay) {
				let now = +new Date();
				if (Number(now) - Number(this.lastTime) > delay) {
					this.saveReceipt(newObj);
					this.lastTime = now;
				}
			},
			saveReceipt(newObj) {
				if(!this.$utils.multipleClicks('保存中')) {
					return
				}
				this.$http({
					url: this.$api.saveReceipt,
					data: newObj,
					success: (res) => {
						this.$utils.multipleRemoveClicks();
						uni.showToast({
							title: res.message,
							icon: 'none',
							duration:3000
						})
						if (res.code == '01') {
							if (this.isOrder) {
								let pages = getCurrentPages()
								let prevPage = pages[pages.length - 2]
								prevPage.$vm.getOrderDetail()
							}
							setTimeout(()=>{
								uni.navigateBack()
							}, 3000)
							
						}
					}
				})
			},
			closeStep() {
				uni.setStorageSync('showStepCollection', true)
				this.classStep = '';
				setTimeout(() => {
					this.showStep = false
				}, 300)
			},
		},
		filters: {
			formatNum: function(value) {
				return untils.formatNum(value);
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #FFFFFF;
	}

	.small-place {
		width: 100%;
		height: 16rpx;
		background: #F7F7F7;
	}

	.formBox {
		.formTab {
			display: flex;
			justify-content: space-between;
			align-items: center;
			background: #FFFFFF;
			padding: 16rpx 32rpx 24rpx;

			.formTab-item {
				display: flex;
				align-items: center;
				width: 332rpx;
				height: 96rpx;
				font-weight: 500;
				font-size: 28rpx;
				color: #999999;
				background: #FFFFFF;
				border-radius: 16rpx;
				margin-left: 22rpx;

				.iconfont {
					font-size: 40rpx;
					margin: 0 16rpx 0 32rpx;

					&.icon-littlechoose-nor {
						color: #999999;
					}

					&.icon-Check-Circle-Filled-2 {
						color: #E42727;
					}
				}

				&.hover {
					background: #FFF5F5;
				}

				&.active {
					color: #E42727;
					background: #FFF5F5;
				}

				&:first-child {
					margin-left: 0;
				}
			}
		}

		.formHead {
			border-bottom: 1rpx solid #F2F2F2;
			background: #FFFFFF;
			padding: 26rpx 32rpx 24rpx;

			.formHead-title {
				font-size: 28rpx;
				line-height: 44rpx;
				color: #272727;
			}

			.formHead-price {
				display: flex;
				justify-content: space-between;
				align-items: flex-end;
				font-weight: 500;
				font-size: 64rpx;
				line-height: 76rpx;
				color: #272727;
				margin-top: 16rpx;

				.total-price {
					flex: 1;
					margin-right: 32rpx;

					.uni-input {
						width: 100%;
						height: 76rpx;
						line-height: 76rpx;
						color: #272727;
					}
				}

				.min-price {
					font-weight: normal;
					font-size: 28rpx;
					line-height: 44rpx;
					text-align: right;
					color: #737373;
				}
			}
		}

		.formInfo {
			.formInfo-item {
				background: #FFFFFF;
				padding-left: 32rpx;

				.item-box {
					display: flex;
					align-items: center;
					font-size: 28rpx;
					min-height: 96rpx;
					line-height: 96rpx;
					color: #272727;
					border-bottom: 1rpx solid #F2F2F2;

					.item-title {
						width: 28%;
					}

					.item-cont {
						flex: 1;
						display: flex;
						justify-content: space-between;
						align-items: center;
						height: 100%;
						padding-right: 24rpx;
						width: 70%;

						input {
							width: 100%;
						}

						.iconfont {
							font-size: 32rpx;
							color: #999999;
						}

						.datePicker {
							width: 100%;
						}
					}

					&.start {
						align-items: flex-start;
						border-bottom: 0;
					}

					.listBox {
						position: relative;
						width: 70%;

						.list-container {
							position: absolute;
							z-index: 10;
							border-radius: 8rpx;
							// border: 1px solid #dcdfe6;
							width: 96%;
							background-color: #fff;
							box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);

							.popper__arrow {
								position: absolute;
								border-width: 20rpx;
								top: -40rpx;
								border-style: solid dashed dashed;
								border-color: transparent transparent #fff;
								left: 5%;
							}

							.item {
								height: 70rpx;
								line-height: 70rpx;
								padding: 0 20rpx;
								font-size: 24rpx;

								&.itemhover {
									background-color: #f7f7f7;
								}
							}
						}
					}



				}

				&.hover {
					background: #F2F2F2;
				}
			}

			.order-list {
				padding: 32rpx 32rpx 0;

				.order-list-title {
					font-size: 28rpx;
					line-height: 44rpx;
					color: #737373;
				}

				.order-list-info {
					.list-item {
						position: relative;
						// height: 80rpx;
						border: 1rpx solid #DEDEDE;
						border-radius: 16rpx;
						margin-top: 24rpx;

						.list-item-checked {
							position: absolute;
							top: 0;
							left: 8rpx;
							display: flex;
							justify-content: center;
							align-items: center;
							width: 88rpx;
							height: 80rpx;

							.iconfont {
								font-size: 40rpx;
								color: #999999;
								padding: 20rpx 24rpx;
							}
						}

						.list-item-numbers {
							display: flex;
							justify-content: space-between;
							align-items: center;
							width: 100%;
							height: 80rpx;
							background: #F7F7F7;
							border-radius: 16rpx;
							padding: 0 16rpx 0 96rpx;
							font-size: 28rpx;
							color: #737373;

							.color-orange {
								font-weight: 500;
								color: #FF5C00;
							}

							.list-item-price {
								display: flex;
								align-items: center;
							}

							.iconfont {
								font-size: 32rpx;
								color: #999999;
							}

							&.hover {
								background: #DEDEDE !important;
							}
						}

						&.active {
							border: 1rpx solid #FFD874;

							.icon-Check-Circle-Filled-2 {
								color: #E42727 !important;
							}

							.list-item-numbers {
								background: #FFF8ED;

								&.hover {
									background: #F9ECD7 !important;
								}
							}
						}

						&:first-child {
							margin-top: 16rpx;
						}
					}
				}
			}
		}
	}

	.form-submit {
		width: 100%;
		background: #FFFFFF;
		padding: 24rpx 32rpx;
		z-index: 99;

		.btn {
			width: 100%;
			height: 80rpx;
			line-height: 80rpx;
			font-weight: 500;
			font-size: 28rpx;
			color: #FFFFFF;
			background: #E42727;
			border-radius: 16rpx;
		}

		.hover {
			background: #B40808;
		}
	}

	.tip-modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 10;

		.tip-mask {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 2;
		}

		.tip-content {
			position: absolute;
			left: 32rpx;
			width: 674rpx;
			height: 136rpx;
			font-size: 28rpx;
			line-height: 44rpx;
			color: #FFFFFF;
			background: #272832;
			border-radius: 16rpx;
			box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.14);
			padding: 24rpx 32rpx;
			transition: all .2s cubic-bezier(0, .79, .59, 1);
			transform: scale(0.5);
			transform-origin: 32rpx 152rpx;
			visibility: hidden;
			opacity: 0;
			z-index: 1;

			&.show {
				visibility: visible;
				transform: scale(1);
				opacity: 1;
			}

			&::before {
				content: '';
				position: absolute;
				left: 40rpx;
				bottom: -16rpx;
				display: block;
				width: 0;
				height: 0;
				border-width: 16rpx 16rpx 0;
				border-style: solid;
				border-color: #272832 transparent transparent;
			}
		}
	}
</style>
