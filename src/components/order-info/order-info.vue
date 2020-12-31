<template>
	<view>
		<template v-if="currentIndex == 0">
			<!-- 客户信息 -->
			<view class="list list-title" style="justify-content: space-between;">
				<view class="title bold">
					客户信息
				</view>
				<view class="title bold" v-if="nowstoreName=='门店全局'">
					{{orderForm.storeName}}
				</view>
			</view>
			<view class="list">
				<view class="title"><text class="sign" v-if="orderForm.orderId">*</text>客户手机：</view>
				<view class="action">
					<input type="number" v-model="orderForm.customerCellphoneNum" placeholder="11位手机号码" :disabled="isDisabled" @input='getCustomer' />
				</view>
			</view>
			<view class="list">
				<view class="title"><text class="sign" v-if="orderForm.orderId">*</text>客户姓名：</view>
				<view class="action">
					<input type="text" style="width: 100%;" placeholder-class="input-calss-form" v-model="orderForm.customerName"
					 :disabled="isDisabled" placeholder="请输入" @input="orderField" />
				</view>
			</view>
			<view class="list" hover-class='hover' @tap="showAddress" style="align-items: center;" v-if="orderForm.orderTypeCode != '1003'">
				<view class="title"><text class="sign" v-if="orderForm.orderId">*</text>选择区域：</view>
				<view class="action">
					<input type="text" class="address-input" placeholder-class="input-calss-form" v-model="orderForm.addressDetails"
					 placeholder="请输入" disabled="true" style="flex: 1;" />
					<text class="icon iconfont icon-arrow-right"></text>
				</view>
			</view>
			<view class="list" v-if="orderForm.orderTypeCode != '1003'">
				<view class="title"><text class="sign" v-if="orderForm.orderId">*</text>详细地址：</view>
				<view class="action">
					<input type="text" style="width: 100%;" :focus="focusAddressDetail" placeholder-class="input-calss-form" v-model="orderForm.consigneeAddressDetail"
					 placeholder="请输入详细地址" :disabled="isDisabled" @input="orderField" />
				</view>
			</view>
			<view class="list" :hover-class="!isDisabled ? 'hover' : ''" v-if="orderForm.orderTypeCode != '1003'">
				<view class="title"><text class="sign" v-if="orderForm.orderId">*</text>客户交期：</view>
				<view class="action">
					<datetime-picker class="datePicker" :dateStr="orderForm.deliveryDate" :defaultValue="orderForm.deliveryDate"
					 :isDisabled="isDisabled" fields="day" @change="changeDeliveryDate">
					</datetime-picker>
					<text class="icon iconfont icon-arrow-right" v-if="!isDisabled"></text>
				</view>
			</view>
			<view class="list" :hover-class="!disabled ? 'hover' : ''">
				<view class="title"><text class="sign" v-if="orderForm.orderId">*</text>合同日期：</view>
				<view class="action">
					<datetime-picker class="datePicker" :dateStr="orderForm.contractDate" :defaultValue="orderForm.contractDate"
					 :isDisabled="disabled" fields="day" @change="changeContractDate">
					</datetime-picker>
					<text class="icon iconfont icon-arrow-right" v-if="!disabled"></text>
				</view>
			</view>
		</template>
		<template v-else>
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
			<view class="list" hover-class='hover' @tap="toPerson">
				<view class="title">销售人员</view>
				<view class="action">
					<text class="text-black" style="white-space: pre-wrap;">{{ orderForm.salesShowName }}</text>
					<text class="icon iconfont icon-arrow-right"></text>
				</view>
			</view>
			<view class="list">
				<view class="title"><text class="sign" v-if="orderForm.orderId && orgParams.paperBillNoIsRequired == 1">*</text>纸质单号：</view>
				<view class="action">
					<input type="text" placeholder-class="input-calss-form" v-model="orderForm.orderDocsNo" placeholder="请输入" @input="orderField" />
				</view>
			</view>
			<view class="list">
				<view class="title">备注信息：</view>
				<view class="action">
					<input type="text" maxlength="256" placeholder-class="input-calss-form" v-model="orderForm.notes" placeholder="请输入"
					 :disabled="isDisabled" @input="orderField" />
				</view>
			</view>
			<view class="list" v-if="orderForm.orderTypeCode!='1003'">
				<view class="title">送货说明：</view>
				<view class="action">
					<input type="text" maxlength="256" placeholder-class="input-calss-form" v-model="orderForm.consigneeNotes"
					 placeholder="请输入" :disabled="isDisabled" @input="orderField" />
				</view>
			</view>
			<view class="list">
				<view class="title">上传附件</view>
				<view class="action attachment">
					<tui-upload :value="picList" :params="uploadParams" @complete="uploadSuccess" @remove="uploadRemove"></tui-upload>
				</view>
			</view>
		</template>
		<!-- 地址弹窗 -->
		<search-pop ref='searchPop' :placeholder="placeholder" @choose='choose' @hidepopup='hidepopup'></search-pop>
	</view>
</template>

<script>
	import utils from '@/common/js/utils.js'
	import searchPop from '@/components/search-pop/search-pop.vue'
	import datetimePicker from '@/components/datetime-picker/datetime-picker.vue'
	import tuiUpload from '@/components/tui-upload/tui-upload.vue'
	export default {
		name: 'orderInfo',
		components: {
			searchPop,
			datetimePicker,
			tuiUpload
		},
		props: {
			orderForm: {
				type: Object
			},
			isDisabled: {
				type: Boolean,
				default: false
			},
			currentIndex: {
				type: Number,
				default: 0
			}
		},

		data() {
			return {
				orgParams: uni.getStorageSync('orgParams'),
				nowstoreName: uni.getStorageSync('storeInfo').storeName,
				focusAddressDetail: false, // 地址弹层input
				placeholder: '',
				popupClass: '',
				disabled: false,
				// 上传图片参数
				uploadParams: {
					mainType: 'salorder',
					subType: ''
				},
				picList: [], // 图片列表
			}
		},
		created() {
			// 设置默认门店信息
			this.setDefaultStore()
			if (this.currentIndex == 0) {
				if (this.isDisabled || (uni.getStorageSync('orgParams') && uni.getStorageSync('orgParams').contractDateModifyFlag ==
						0)) {
					this.disabled = true;
				}
				this.$nextTick(() => {
					// 设置默认交期 合同日期
					this.setDefaultDate()
				})
			} else {
				this.$nextTick(() => {
					// 获取销售政策列表
					this.getPolicyList()
					this.getAttachmentList(this.orderForm.attachmentId)
				})
			}
		},
		methods: {
			updateOrderInfo(orderInfo, isDisabled) {
				this.$emit('updateOrderInfo', orderInfo, isDisabled);
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
										if (res.data[i].addressDetail) {
											this.orderForm.consigneeAddressDetail = res.data[i].addressDetail;
										} else {
											res.data[i].addressDetail = "";
										}
										this.orderForm.phoneUserInfo = res.data[i];
									}
								}
							}
						}
						this.updateOrderInfo(this.orderForm, this.isDisabled);
					}
				})
			},
			// 选择地址弹窗
			showAddress() {
				if (this.isDisabled) {
					return
				}
				uni.setNavigationBarTitle({
					title: '搜索地址'
				})
				this.updateOrderInfo(this.orderForm, false);
				this.placeholder = "输入小区名";
				this.focusAddressDetail = false;
				this.$refs.searchPop.showPopup('address', this.orderForm.consigneeAddressDetail);
			},
			// 销售政策选择弹窗
			showSearch() {
				this.placeholder = "";
				this.$refs.searchPop.showPopup('policy');
			},
			// 跳转选择销售人员
			toPerson() {
				let type = this.orderForm.ordFusionShoppingCartId ? 'draft' : 'order'
				let id = type == 'draft' ? this.orderForm.ordFusionShoppingCartId : this.orderForm.orderId
				this.$toPage('/pages/personList/personList?type=' + type + '&orderId=' + id)
			},
			// 选中回调
			choose(e, typeName) {
				if (typeName == 'policy') {
					this.orderForm.marketingPolicyId = e.policyId
					this.orderForm.marketingPolicyName = e.policyName
				} else if (typeName == 'dealer') {

				} else if (typeName == 'address') {
					this.selectAdress(e);
				}
				this.updateOrderInfo(this.orderForm, this.isDisabled);
			},
			//地址回填方法
			selectAdress(val) {
				setTimeout(() => {
					this.focusAddressDetail = true;
				}, 300)
				// 小区名称
				this.orderForm.consigneeCommunity = val.communityName
				// this.orderForm.consigneeAddressDetail = val.communityName
				this.orderForm.countyNameCheck = val.countyName;
				this.orderForm.countyNameUnCheck = val.countyName;
				// 经纬度
				this.orderForm.consigneeAddressLatitude = val.latitude;
				this.orderForm.consigneeAddressLongitude = val.longitude;
				// 详细地址
				if (val.fullAddress.length > 100) {
					this.orderForm.consigneeAddress = val.fullAddress.slice(0, 99);
				} else {
					this.orderForm.consigneeAddress = val.fullAddress;
				}

				// 省
				this.orderForm.provinceCode = val.provinceCode;
				this.orderForm.provinceName = val.provinceName;
				// 市
				this.orderForm.cityCode = val.cityCode;
				this.orderForm.cityName = val.cityName;
				// 区
				this.orderForm.countyName = val.countyName;
				this.orderForm.countyCode = val.countyCode;
				// 市 + 区
				this.orderForm.addressDetails = val.cityName ? val.cityName + val.countyName : '';
				// 默认地址 + 自己补充
				if ((!this.orderForm.phoneUserInfo || !this.orderForm.phoneUserInfo.addressDetail || this.orderForm.consigneeAddressDetail
						.indexOf(this.orderForm.phoneUserInfo.addressDetail) <
						0) && val.communityName) {
					this.orderForm.consigneeAddressDetail = val.communityName;
				}
			},
			// 客户交期
			changeDeliveryDate(e) {
				this.orderForm.deliveryDate = e.f1;
				this.updateOrderInfo(this.orderForm, this.isDisabled);
			},
			// 合同日期
			changeContractDate(e) {
				this.orderForm.contractDate = e.f1;
				this.updateOrderInfo(this.orderForm, this.isDisabled);
			},
			setDefaultDate() {
				// 设置默认交期
				if (this.orderForm.deliveryDate == '' || this.orderForm.deliveryDate == ' null' || this.orderForm.deliveryDate ==
					undefined) {
					this.orderForm.deliveryDate = this.$utils.getCurrentDate(true)
				}
				// 设置默认合同日期
				this.orderForm.contractDate = this.$utils.getCurrentDate()
				this.updateOrderInfo(this.orderForm, this.isDisabled);
			},
			// 设置默认门店信息
			setDefaultStore() {
				let data = uni.getStorageSync('storeInfo')
				this.orderForm.storeNo = data.storeCode
				this.orderForm.storeId = data.storeId
				this.orderForm.storeName = data.storeName
				this.updateOrderInfo(this.orderForm, this.isDisabled);
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
						this.updateOrderInfo(this.orderForm, this.isDisabled);
					}
				})
			},
			// 上传图片
			uploadSuccess(e) {
				let tmp = e.imageId
				this.orderForm.attachmentId = tmp.join(',')
				this.updateOrderInfo(this.orderForm, this.isDisabled);
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
						if (res.code == '01') {
							this.$emit('getOrderDetail')
						}
					}
				})
			},
			// 删除图片
			uploadRemove(e) {
				let tmp = e.imageId
				this.orderForm.attachmentId = tmp.join(',')
				this.updateOrderInfo(this.orderForm, this.isDisabled);
				if (!this.orderForm.orderId) {
					return
				}
				this.uploadSave(this.orderForm.attachmentId);
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

			orderField() {
				this.updateOrderInfo(this.orderForm, this.isDisabled);
			},
			// 关闭地址弹窗
			hidepopup() {
				if (this.orderForm.orderId) {
					uni.setNavigationBarTitle({
						title: '订单详情'
					})
				} else if (this.orderForm.ordFusionShoppingCartId) {
					uni.setNavigationBarTitle({
						title: '草稿单详情'
					})
				} else {
					uni.setNavigationBarTitle({
						title: '创建订单'
					})
				}

				this.$emit('hidepopup')
			},
		}
	}
</script>

<style lang="scss">
	.action {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.datePicker,
		input {
			flex: 1;
		}
	}
</style>
