<template>
	<page>
		<view slot="body" >
			<view class="search-bar" v-show="customerReceiptConfirmTransfer == 0 ? false : true">
				<!-- 搜索框 -->
				<search-box placeholder="姓名/手机号" @inputChange="inputChange" @inputDel='inputDel'></search-box>
			</view>
			<view class="place" v-show="customerReceiptConfirmTransfer == 0 ? false : true"></view>
			<view class="receptList" v-if="receptList.length>0">
				<view class="recept-item" v-for="(item,index) in receptList" :key="index">
					<view class="left">
						<view class="totalPrice">
							<view class="left" style="display: flex;align-items: center;">
								<view class="">
									<text class="sign">￥</text>{{item.price | formatNum}}
								</view>
								<text class="icon iconfont icon-tab-icon-draft" @tap="editMoney(item,index)" ></text>
							</view>
							<view class="right">
								<text style="color: #ACACBC;font-size:22rpx ;font-weight: 500;">可用金额：</text>
								<text class="sign">￥</text>
								{{item.newRealSum | formatNum}}
							</view>
						</view>
						<view class="detail">
							<view class="methods detail-item">
								<view class="left">
									<text>客户姓名：</text>{{item.customerName}}
								</view>
								<view class="right">
									<text>客户电话：</text>{{item.customerCellphoneNum}}
								</view>
							</view>
							<view class="methods detail-item">
								<view class="left">
									<text>付款方式：</text>{{item.paymentTypeName}}
								</view>
								<view class="right">
									<text>收款时间：</text>{{item.bizDate | formatDate}}
								</view>
							</view>
							<view class="notes">
								<text>备注：</text>{{item.notes}}
							</view>
						</view>
					</view>
					<view class="" @tap='checkboxChange(index)'>
						<text v-if="item.checked" class="icon iconfont icon-list-icon-littlechoose-sel" style="color:#D31311 ;font-size: 40rpx;"></text>
						<text v-else class="icon iconfont icon-list-icon-littlechoose-nor" style="color:#D31311 ;font-size: 40rpx;"></text>	
					</view>
				</view>
			</view>
			
			<view class="loading-text">{{loadingText}}</view>
			<!-- 编辑弹窗 -->
			<modal :show="modalShow" @cancel="modalShow=false" :padding="padding" :custom="true" class="modalBox" height="300rpx">
				<view class="content">
					<view class="title">
						编辑使用金额
					</view>
					<input type="digit" v-model="money" placeholder="输入使用金额" />
				</view>

				<view class="btns">
					<view class="close" @tap="modalShow=false">
						取消
					</view>
					<view class="submit" style="color: #576B95;" @tap="confirm">
						确定
					</view>
				</view>
			</modal>
		</view>
		
		<view slot="footer">
			<view class="btnBox">
				<button class="btn" @tap="toback">返回</button>
				<button class="btn bg-red" @tap='submitBtn'>确认</button>
			</view>
		</view>	
	</page>
</template>

<script>
	import utils from '@/common/js/utils.js'
	import modal from "@/components/modal/modal"
	import searchBox from '@/components/search-box/index.vue'
	export default {
		components: {
			modal,
			searchBox,
		},
		data() {
			return {
				orderForm: null,
				// 意向金列表
				receptList: [],
				// 当前页
				page: 1,
				// 总页数
				totalPage: 1,
				loadingText: '正在加载中...',
				// 关键词搜索
				keyWords: '',
				// 是否显示弹窗
				modalShow: false,
				// 输入金额
				money: '',
				// 当前编辑的列表索引
				editIndex: null,
				customerReceiptConfirmTransfer: 0,
				padding: '40rpx 64rpx'
			};
		},
		onLoad(e) {
			// #ifdef H5
			this.padding = '0';
			// #endif
			if (e.orderId) {
				this.getOrderDetail(e.orderId)
			}
			this.customerReceiptConfirmTransfer = uni.getStorageSync('orgParams').receiptConfirmTransferAcrossCustomer
		},
		onShow() {
			this.chooseRecept = uni.getStorageSync('chooseRecept') || [];
		},
		// 上啦加载
		onReachBottom() {
			this.page++;
			if (this.page <= this.totalPage) {
				this.getReceptList();
			} else {
				this.loadingText = '暂无更多数据！'
			}
		},
		methods: {
			// 获取意向金列表
			getReceptList(type) {
				let code=uni.getStorageSync('orgParams').receiptConfirmTransferAcrossStore
				let customer= uni.getStorageSync('orgParams').receiptConfirmTransferAcrossCustomer
				if(type == 1){
					var  params = {
						"storeNo": uni.getStorageSync('storeInfo').storeCode, //门店编码
						"paymentNature": "1004", //默认传1004
						"keyWords": this.keyWords, //搜索关键字
						"pageNum": this.page, //页码，默认1
						"pageSize": 10 //记录条数，默认10，最大100
					}
				}else{
					var params = {
						"storeId":code==1 ? '' : uni.getStorageSync('storeInfo').storeId, //门店编码
						"customerCellphoneNum":customer==1? '' : this.orderForm.customerCellphoneNum,
						"keyWords": this.keyWords, //搜索关键字
						"pageNum": this.page, //页码，默认1
						"pageSize": 10 //记录条数，默认10，最大100
					}
				}
				this.$http({
					url: this.$api.getConfirmWithPagination,
					data: params,
					success: (res) => {
						if (res.data.length > 0) {
							this.receptList = this.receptList.concat(res.data);
							this.receptList.forEach(ele => {
								ele.price = ele.realSum - ele.confirmedSum - ele.canceledSum
								ele.realSum=ele.price
								ele.newRealSum=ele.realSum
								if (this.receptList.length == 1) {
									ele.checked = true
								} else {
									ele.checked = false
								}
							})							
						} else {
							this.loadingText = '暂无更多数据！'
						}
						this.totalPage = res.totalPage
						if (this.totalPage == 1) {
							this.loadingText = '到底了！'
						}
					}

				})
			},
			// 获取订单详情
			getOrderDetail(orderId) {
				this.$http({
					url: this.$api.getOrderDetail,
					data: {
						orderId: orderId
					},
					success: res => {
						if (res.code == '02') {
							return
						}
						this.orderForm = res.bizObject
						this.getReceptList();
					}
				})
			},
			// 修改意向金
			editMoney(e, index) {
				this.modalShow = true;
				this.editIndex = index;
			},
			// 确认修改
			confirm() {
				this.money = Number(this.money);
				if (this.money > this.receptList[this.editIndex].realSum) {
					this.$msg('不能大于可用金额')
				} else {
					this.receptList[this.editIndex].newRealSum = this.receptList[this.editIndex].realSum - this.money
					this.receptList[this.editIndex].price = this.money;
					this.receptList[this.editIndex].checked=true;
					this.modalShow = false;
					this.money = ''
				}
			},
			// 选择意向金
			checkboxChange(index) {
				this.receptList[index].checked = !this.receptList[index].checked;
				this.$forceUpdate()
			},
			// 提交
			submitBtn() {
				let arr = []
				this.receptList.forEach(ele => {
					if (ele.checked) {
						let item = {
							notConfirmSum: ele.recognisedAmount,
							confirmedSum: ele.confirmedSum,
							confirmSum: ele.price,
							canceledSum: ele.canceledSum,
							receiptId: ele.receiptId,
							receiptNo: ele.receiptNo,
							oldCustomerCellphoneNum: ele.customerCellphoneNum,
							oldCustomerId: ele.customerId,
							oldCustomerName: ele.customerName,
							oldRealSum: ele.newRealSum,
							confirmRemainSum: this.orderForm.notChargedTotal,
							confirmTotalPrice: this.orderForm.totalPrice,
							confirmCustomerId: this.orderForm.customerId,
							confirmCustomerName: this.orderForm.customerName,
							confirmOrderDocsNo: this.orderForm.orderDocsNo,
							orderId: this.orderForm.orderId,
							orderNo: this.orderForm.orderNo,
							storeId: this.orderForm.storeId,
							storeName: this.orderForm.storeName,
							storeNo: this.orderForm.storeNo
						}						
						arr.push(item)
					}
				})
				if (arr.length == 0) {
					this.$msg('请先选择意向金');
					return
				}
				uni.showModal({
					title: '提示',
					content: '是否关联意向金？',
					cancelText: '取消',
					confirmText: '确定',
					success: res => {
						if(res.confirm){
							this.saveAndSummitReceipt(arr);
						}
					}
				});
			},
			saveAndSummitReceipt(list) {
				this.$http({
					url: this.$api.saveAndSummitReceipt,
					data: list,
					success: (res) => {
						if (res.code == '01') {
							this.$msg('意向金关联成功');
							setTimeout(() => {
								let pages = getCurrentPages()
								let prevPage = pages[pages.length - 2]
								prevPage.$vm.getOrderDetail()
								uni.navigateBack()
							}, 800)
						} else {
							this.$msg(res.msg);
						}
					}
				})
			},
			// 搜索回调
			inputChange(key) {
				this.keyWords=key;
				this.search()
			},
			// 清空input
			inputDel(){
				this.keyWords='';
				this.search()				
			},
			// 搜索
			search(){
				this.loadingText='正在加载中...'
				this.page=1;
				this.receptList=[];
				this.getReceptList(1);
			},
			toback() {
				uni.navigateBack();
			}
		},
		filters:{
			formatDate: function(value) {
				return utils.formatDate(value).f1;
			},
			formatNum(num){
				return utils.formatNum(num)
			}
		}
	}
</script>

<style lang="scss">
	.search-bar {
		width: 100%;
		padding:0 3% 20rpx;
		background-color: #fff;
		position: fixed;
		box-shadow: 0 15rpx 25rpx #eee;
		z-index: 1;
	}
	.place {
		width: 100%;
		height: 100rpx;
		background-color: $page-bgcolor;
	}
	.modalBox {
		position: relative;
		z-index: 15;
		.tui-modal-box {
			padding: 0 !important;
		}

		.content {
			width: 95%;
			margin: auto;
			text-align: center;
			margin-bottom: 30rpx;

			.title {
				padding: 30rpx 0;
			}

			input {
				text-align: left;
				/* #ifndef H5 */
				margin: 0 40rpx 40rpx;
				/* #endif */
				/* #ifdef H5 */
				margin: 0 40rpx 20rpx;
				/* #endif */
				border-bottom: 1rpx solid #F0F0F3;
				height: 70rpx;
				line-height: 70rpx;
			}
		}

		.btns {
			display: flex;
			width: 100%;
			justify-content: space-between;
			height: 100rpx;
			border-top: 1rpx solid #F0F0F3;

			.close,
			.submit {
				width: 50%;
				height: 100rpx;
				line-height: 100rpx;
				text-align: center;
				font-size: 32rpx;
			}

			.close {
				border-right: 1rpx solid #F0F0F3;

			}
		}
	}

	.place {
		height: 120rpx;
		background-color: #fff;
	}

	.receptList {
		padding: 0 0 100rpx;

		.recept-item {
			padding: 30rpx;
			border-bottom: 1rpx solid #eee;
			text-align: left;
			display: flex;
			justify-content: space-between;
			align-items: center;
			.left{
				width: 95%;
			}
			.totalPrice {
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 30rpx;
				color: $red;
				font-weight: 550;

				.sign {
					font-size: 22rpx !important;
				}

				.left {
					width: 45%;
					.icon-tab-icon-draft{
						color: #191A45;
						font-size: 30rpx;
						padding: 10rpx 0;
					}
				
				}

				.right {
					width: 55%;
					text-align: left;
					color: $brown;
				}
			}

			.detail {
				// margin-top: 10rpx;
				font-size: 26rpx;

				text {
					color: #ACACBC;
				}

				.detail-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding-top: 10rpx;
					font-size: 22rpx;
					.left {
						width: 45%;
						text-align: left;
					}

					.right {
						width: 55%;
						text-align: left;
					}
				}

				.notes {
					padding-top: 10rpx;
					font-size: 22rpx;
				}
			}
		}
	}

	.btnBox {
		display: flex;
		align-items: center;
		background: #FFF;
		padding: 28rpx 24rpx 28rpx 32rpx;
		.btn {
			height: 80rpx;
			line-height: 80rpx;
			font-weight: 500;
			font-size: 28rpx;
			text-align: center;
			color: #272727;
			background: #FFFFFF;
			border-radius: 8rpx;
			padding: 0;
			&::after {
				border: 2rpx solid #CCCCCC;
			}
			&.bg-red {
				flex: 1;
				color: #FFFFFF;
				background: #E42727;
				&::after {
					border: 2rpx solid #E42727;
				}
			}
			&:first-child {
				width: 240rpx;
				margin-right: 16rpx;
			}
		}
	}
</style>
