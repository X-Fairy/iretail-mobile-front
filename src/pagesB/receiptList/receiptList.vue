<template>
	<view>
		<view class="header">
			<!-- 搜索框 -->
			<search-box placeholder="姓名/手机号/备注" @inputChange="inputChange" @inputDel='inputDel'></search-box>
		</view>
		<view class="place"></view>
		<view class="receptList" v-if="receptList.length>0" style="background-color: #F7F7F7;">
			<view class="recept-item" v-for="(item,index) in receptList" :key="index">
				<view class="List-status">
					<text class="status-common status-1" v-if="item.statusCode=='1003'">审核</text> 
					<text class="status-common status-2" v-else-if="item.statusCode=='1002'">提交</text> 
					<text class="status-common status-3" v-else>开立</text> 
					{{item.customerName}}
					<text class="tel">{{item.customerCellphoneNum}}</text>
					<text class="icon iconfont More-Horizon more-icon"></text>
				</view>
				<view class="list-price">
					<view class="list-1">
						<text class="total-price">总金额：</text>￥{{item.realSum | formatNum}}
					</view>
					<view class="list-2">
						<text>可用金额：</text>￥{{item.price | formatNum}}
					</view>
				</view>
				<view class="list-infor"> 
					<text class="title">收款日期：</text>{{item.bizDate}}
				</view>
				<view class="list-infor"> 
					<text class="title">付款方式：</text>{{item.paymentTypeName}}
				</view>
				<view class="list-infor" v-if="item.notes"> 
					<text class="title" >备&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注：</text>{{item.notes}}
				</view>
				
			</view>
		</view>
		<view class="loading-text" >{{loadingText}}</view>
	</view>
</template>

<script>
	import searchBox from '@/components/search-box/index.vue'
	import utils from '../../common/js/utils.js'
	export default {
		components: {
			searchBox
		},
		data() {
			return {
				// 意向金列表
				receptList: [],
				// 当前页
				page: 1,
				// 总页数
				totalPage: 1,
				loadingText:'正在加载中...',
				// 关键词搜索
				keyWords:''

			};
		},
		onLoad() {
			this.getReceptList();			
		},
		// 上啦加载
		onReachBottom() {
			this.page++;
			if (this.page <= this.totalPage) {
				this.getReceptList();
			}else{
				this.loadingText='到底了！'
			}

		},
		methods: {
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
				this.getReceptList();
			},
			// 获取意向金列表
			getReceptList() {
				let params = {
					"storeId": uni.getStorageSync('storeInfo').storeId, //门店编码
					"storeNo": uni.getStorageSync('storeInfo').storeCode, //门店编码
					"paymentNature": "1004", //默认传1004
					"keyWords": this.keyWords, //搜索关键字
					"pageNum": this.page, //页码，默认1
					"pageSize": 10 //记录条数，默认10，最大100
				}
				this.$http({
					url: this.$api.getReceiptList,
					data: params,
					success: (res) => {
						if (res.data && res.data.length>0) {
							this.receptList = this.receptList.concat(res.data);
							this.receptList.forEach(ele => {
								ele.price=ele.realSum-ele.confirmedSum-ele.canceledSum;								
							})
							this.totalPage=res.totalPage
							if(this.totalPage==1){
								this.loadingText=''
							}
						}else{
							this.loadingText='暂无更多数据！'
						}						
					}

				})
			}
		},
		filters: {
			formatNum: function(value) {
				return utils.formatNum(value);
			}
		}
	}
</script>

<style lang="scss">
	.header {
		background: #fff;
		padding: 0rpx 3% 20rpx;
		box-shadow: 0 15rpx 25rpx #F8F8F8;
		position: fixed;
		width: 100%;
		
	}
	.place{
		height: 120rpx;
		background-color: #fff;
	}
	.receptList {
		padding: 0 0 50rpx;
		.recept-item {
			padding: 30rpx;
			// border-bottom: 1rpx solid #eee;
			text-align: left;
			background-color: #FFFFFF;
			margin-bottom: 16rpx;
			.List-status{
				width: 100%;
				border-bottom: solid 1rpx #F2F2F2;
				padding-bottom: 10px;
				font-weight: 500;
				font-size: 28rpx;
				color: #272727;
				.status-common{
						display: inline;
						padding: 5rpx 6rpx;
						vertical-align: middle;
						margin-right: 20rpx;
						border-radius: 7rpx;
						font-size: 20rpx;
					
						
					}
					.status-1{
						color: #FF650C;
						border: 1rpx solid #FF650C;
					}
					.status-2{
						color: #AC08BE;
						border: 1rpx solid #AC08BE;
					}
					.status-3{
						color: #00784E;
						border: 1rpx solid #00784E;
					}
					.tel{
						margin-left: 16rpx;
						font-size: 28rpx;
						color: #737373;
						font-weight: normal;
					}
					.more-icon{
						font-size: 36rpx;
						display: inline-block;
						float: right;
						color: #999999;
						margin-right: 20rpx;
					}
			}
			.list-price{
				width: 100%;
				display: flex;
				color: #E42727;
				font-size: 28rpx;
				font-weight: normal;
				margin-top: 10rpx;
				padding: 10rpx 0rpx;
				.list-1{
					flex: 6;
					text{
						color: #737373;
					}
					.total-price{
						display: inline-block;
						width: 140rpx;
						text-align: justify;
						text-align-last: justify;
					}
				}
				.list-2{
					flex: 6;
					text{
						color: #737373;
					}
				}
			}
			.list-infor{
				width: 100%;
				padding: 10rpx 0;
				color: #272727;
				font-size: 28rpx;
				font-weight: normal;
				.title{
					color: #737373;
				}
			}
			.totalPrice {
				display: flex;
				justify-content: space-between;
				align-items: center;
				font-size: 30rpx;
				color: $red;
				font-weight: 550;
				margin-top: 20rpx;
				.sign{
					font-size: 22rpx !important;
				}
				.left{
					width: 45%;
					.edit{
						width: 50rpx;
						height: 50rpx;
					}
				}
				.right{
					display: flex;
					justify-content: space-between;
					width: 55%;
					text-align: left;
					color: $brown;
				}
			}

			.detail {
				margin-top: 10rpx;
				font-size: 24rpx;

				text {
					color: #ACACBC;
				}

				.detail-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding-top: 10rpx;
					.left{
						width: 45%;
						text-align: left;
					}
					.right{
						width: 55%;
						text-align: left;
					}
				}

				.notes {
					padding-top: 10rpx;
				}
			}
		}
	}
	.tag {
		display: flex;
		text-align: right;
		justify-content: space-between;
		align-items: center;

		.status {
			padding: 8rpx 18rpx;
			font-size: 22rpx;

			color: #FFFFFF;
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
</style>
