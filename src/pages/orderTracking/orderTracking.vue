<template>
	<page headerBG='#fff'>
		<view slot="body">
			<view class="header-title" :style="{marginTop: barHeight + 'px'}">
				<text class="iconfont icon-arrow-left" @tap="topage"></text>
				<view class="track-tab">
					<view :class="activeIndex == 0 ? 'active' : ''" @tap="list(0)">操作记录</view>
					<view :class="activeIndex == 1 ? 'active' : ''" @tap="list(1)">采购跟踪</view>
				</view>
			</view>
			<!-- 订单跟踪列表 -->
			<view v-show="activeIndex == 0">
				<view class="trackNew-list" v-if="recordTrackList.length > 0">
					<block v-for="(item, index) in recordTrackList" :key="index">
						<view class="track-item" :class="recordTrackList.length == 1 ? 'noline' : ''">
							<view class="track-date">
								<view class="date">{{item.createTime | dateStamp}}</view>
								<view class="time">{{item.createTime | timeStamp}}</view>
							</view>
							<view class="track-news">
								<view class="track-status">
									<view class="status">{{item.operationTypeCodeValue}}</view>
									<view class="name">{{item.operaterName}}</view>
								</view>
								
								<view class="track-result">
									{{item.notes}}
								</view>
							</view>
						</view>
					</block>
				</view>
				<view class="tips" v-else>
					<image src="../../static/img/icon/margin.png" mode=""></image>
					<view class="msg">
						暂无订单跟踪
					</view>
				</view>
			</view>
			<!-- 订单跟踪列表 -->
			<view v-show="activeIndex == 1">
				<!-- 总部 订单跟踪列表 -->
				<view class="" v-if="trackList.length>0">
					<view class="track-list" v-for="(row,index) in trackList" :key="index">
						<view class="">
							<view class="code">
								{{row.productNo ? row.productNo : ''}}
							</view>
							<view class="details">
								<view class="from">
									{{row.orderName ? row.orderName : ''}}
								</view>
								<view class="number">
									{{row.orderNo ? row.orderNo : ''}}
								</view>
							</view>
							<view class="track">
								<view class="progress">
									<uni-steps v-if="row.isShow" :options="row.u9TrackingSteps" active-color="#AD946B" :active="row.status" direction="column" />
									
									<text v-else>{{row.currentStep}}</text>
								</view>
								<view class="more" @tap='showDetail(index)'>
									<text>{{row.isShow?'收起全部':'展开全部'}}</text>
									<text class="icon iconfont" :class="row.isShow ? 'icon-arrow-up':'icon-arrow-down'"></text>
									
								</view> 
							</view>
						</view>
					</view>
				</view>
				<view class="tips" v-show="showTips">
					<image src="../../static/img/icon/margin.png" mode=""></image>
					<view class="msg">
						暂无订单跟踪
					</view>
				</view>
			</view>
			<view class="loading-text" v-show="isLoading">{{loadingText}}</view>
		</view>
	</page>
</template>

<script>
	import uniSteps from '@/components/uni-steps/uni-steps.vue'
	import mixinWxAna from '@/mixins/wxAna'
	export default {
		mixins: [mixinWxAna],
		components: {
			uniSteps
		},
		data() {
			return {
				barHeight: 0,
				activeIndex: 0,
				// 查询参数
				trackParams: {
					orderId: "60300250",
					orderTypeCode: "1001",
					statusCode: "1003",
				},
				// 操作记录订单列表
				recordTrackList: [],
				// 采购跟踪
				trackList: [],
				showTips: false,
				isLoading: true,
				loadingText: '正在加载中...'
			};
		},
		onLoad(option) {
			this.setWxAna();
			this.barHeight = uni.getStorageSync("barHeight");
			if(option.orderId) {
				this.trackParams={
					orderId: option.orderId,
					orderTypeCode: option.orderTypeCode,
					statusCode: option.statusCode,
				}
				this.getOrdSalTracking()
				this.getOrderTracking()
			}
		},
		onShow() {
		},		
		methods: {
			list(index) {
				this.activeIndex = index;
				// this.trackList = [];
				// if (index == 0) {
				// 	this.getOrdSalTracking()
				// } else {
				// 	this.getOrderTracking()
				// }
			},
			// 返回上一页
			topage() {
				uni.navigateBack()
			},
			getOrdSalTracking() {
				this.$http({
					url: this.$api.getOrdSalTracking,
					data: this.trackParams,
					success:(res)=>{
						this.loadingText = '';
						if (res.code == "01") {
							if (res.data.length > 0) {
								this.recordTrackList = res.data;
							}
						} else {
							this.loadingText = res.message
							uni.showToast({
								title: res.message,
								icon:'none'
							})
						}
					}
				})
			},
			getOrderTracking() {
				this.$http({
					url: this.$api.getOrderTracking,
					data:this.trackParams,
					success:(res)=>{
						if(res.code=='01'){
							this.isLoading=false;
							if(res.data){
								this.trackList=res.data;
								this.trackList.forEach(ele=>{
									ele.isShow=false;
									ele.status = 0;
									if(ele.u9TrackingSteps&&ele.u9TrackingSteps.length>0){
										ele.u9TrackingSteps.forEach(it=>{
											if(it.status&&it.status!='0'){
												ele.status = ele.status+1;	
											}
										})
									}
								})
							}else{
								this.showTips=true
							}
						}else{
							this.isLoading=true
							this.loadingText=res.message
							uni.showToast({
								title:res.message,
								icon:'none'
							})
						}
					}
				})
			},
			showDetail(e) {
				this.trackList[e].isShow = !this.trackList[e].isShow;
				this.$forceUpdate();
			}
		},
		filters:{
			dateStamp(value) {
				if (!value) return '';
				
				var now = new Date(value);
				var year = now.getFullYear();
				var month = now.getMonth() + 1;
				if (month < 10) {
					month = '0' + month
				}
				var date = now.getDate();
				if (date < 10) {
					date = '0' + date
				}
				value = year + "-" + month + "-" + date
				return value
			},
			timeStamp(value) {
				if (!value) return '';
				
				var now = new Date(value);
				var hours = now.getHours();
				if (hours < 10) {
					hours = '0' + hours
				}
				var second = now.getMinutes();
				if (second < 10) {
					second = '0' + second
				}
				var min = now.getSeconds();
				if (min < 10) {
					min = '0' + min
				}
				value = hours + ":" + second + ":" + min
				return value
			}
		}
	}
</script>
<style lang="scss">
	.header-title {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 88rpx;
		
		.iconfont {
			position: absolute;
			left: 12rpx;
			font-size: 50rpx;
		}
		
		.track-tab {
			display: flex;
			align-items: center;
			background: #F7F7F7;
			border-radius: 10rpx;
			padding: 4rpx;
			
			view {
				width: 140rpx;
				height: 52rpx;
				line-height: 52rpx;
				text-align: center;
				font-size: 28rpx;
				color: #737373;
				&.active {
					font-weight: 500;
					color: #272727;
					background: #FFFFFF;
					box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
					border-radius: 8rpx;
				}
			}
		}
	}
	
	.track-list {
		padding: 30rpx;
		border-bottom: 1rpx solid #EEEEEE;
		width: 100%;
		font-size: 26rpx;
		position: relative;
	
		.code {
			color: #191A45;
			font-size: 30rpx;
		}
	
		.details {
			display: flex;
			justify-content: left;
			align-items: center;
			color: $subTitle;
			font-size: 22rpx;
			padding: 10rpx 0;
		}
	
		.track {
			display: flex;
			justify-content: space-between;
	
			padding-top: 10rpx;
	
			.progress {
				color: $brown;
			}
	
			.more {
				color: #818199;
				font-size: 22rpx;
	
				image {
					margin-left: 10rpx;
					width: 12rpx;
					height: 12rpx;
				}
			}
		}
	}
	.tips{
		margin-top: 40%;
		text-align: center;
		image{
			width: 400rpx;
			height: 280rpx;
		}
		.msg{
			padding-top: 30rpx;
			color: $subTitle;
			font-size: 24rpx;
		
		}
	}
	
	.trackNew-list {
		padding: 28rpx 34rpx 0 10rpx;
		
		.track-item {
			position: relative;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 12rpx 0;
			
			&::before {
				content: '';
				position: absolute;
				top: 50%;
				left: 184rpx;
				width: 14rpx;
				height: 14rpx;
				border-radius: 100%;
				background: #B2B2B2;
				margin-top: -7rpx;
				z-index: 2;
			}
			&::after {
				content: '';
				position: absolute;
				top: 0;
				left: 189rpx;
				display: block;
				width: 1rpx;
				height: 100%;
				background: #CCCCCC;
				z-index: 1;
			}
			&:first-child::after {
				top: 50%;
			}
			&:last-child::after {
				top: -50%;
			}
			&.noline {
				&::after {
					content: initial;
				}
			}
			.track-date {
				width: 158rpx;
				text-align: right;
				color: #737373;
				line-height: 32rpx;
				font-size: 24rpx;
			}
			
			.track-sign {
				position: relative;
				display: flex;
				align-items: center;
				.spot {
					width: 14rpx;
					height: 14rpx;
					background: #B2B2B2;
					border-radius: 100%;
				}
			}
			
			.track-news {
				width: 482rpx;
				background: #F7F7F7;
				border-radius: 8rpx;
				padding: 10rpx 24rpx;
				
				.track-status {
					display: flex;
					justify-content: space-between;
					line-height: 44rpx;
					
					.status {
						font-weight: 500;
						font-size: 28rpx;
						color: #272727;
					}
					
					.name {
						font-size: 24rpx;
						color: #737373;
					}
				}
				
				.track-prodNo,
				.track-result {
					font-size: 28rpx;
					line-height: 44rpx;
					color: #737373;
					word-wrap: break-word;
					word-break: break-all;
				}
			}
		}
	}
</style>
