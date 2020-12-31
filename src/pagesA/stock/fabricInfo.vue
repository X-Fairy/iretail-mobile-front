<template>
	<view class="fabric-Box">
		<view class="mains" @tap='toDetail'>
			<view class="left">
				<view class="title">
					{{infos.itemBrief ? infos.itemBrief + ' | ' : ''}}{{infos.productNo ? infos.productNo : ''}}
				</view>
				<text class="sign">{{infos.productLineName}}</text>
			</view>
			<view class="right" v-if="infos.productStateName">{{infos.productStateName}}</view>
		</view>
		
		<view class="time" v-if="infos.productTimeTitle && infos.productTime">
			{{infos.productTimeTitle}}：{{infos.productTime}}
		</view>
		
		<view class="modalList">
			<view class="modalBoxs">
				<view class="item" @tap='modalList[0].modalShow = !modalList[0].modalShow'>
					<view class="item-left">
						<text class="iconfont icon-zaishoupeise"></text>
						<text>在售配色</text>
					</view>
					<view class="box-right">
						<text class="number">{{infos.onMarket.count}}</text>
						<text class="iconfont icon-Arrow-Down" :class="{rotate: modalList[0].modalShow}"></text>
					</view>
				</view>
				<view class="content" v-show="modalList[0].modalShow">
					<view class="itemModel" v-for="(ele,index) in infos.onMarket.info" :key="index">
						<view class="title">
							{{ele.PartStyle}}
							<text v-if="ele.ColorDes">{{'（'+ele.ColorDes+'）'}}</text>
						</view>
						<view class="saletime" >
							<text v-if="ele.fabricTime" style="margin-right: 30rpx;">{{ele.fabricTimeTitle}}：{{ele.fabricTime}}</text>							
							<text v-if="ele.factoryDeliveryDateLatest">交期：{{ele.factoryDeliveryDateLatest+'天'}}</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="modalBoxs">
				<view class="item" @tap='modalList[1].modalShow = !modalList[1].modalShow'>
					<view class="item-left">
						<text class="iconfont icon-yuxiashipeise"></text>
						<text>预下市配色</text>
					</view>
					<view class="box-right">
						<text class="number">{{infos.estimateMarket.count}}</text>
						<text class="iconfont icon-Arrow-Down" :class="{rotate: modalList[1].modalShow}"></text>
					</view>
				</view>
				<view class="content" v-show="modalList[1].modalShow">
					<view class="itemModel" v-for="(ele,index) in infos.estimateMarket.info" :key="index">
						<view class="title">
							<text>{{ele.PartStyle}}</text>							
							<text v-if="ele.ColorDes">{{'（'+ele.ColorDes+'）'}}</text>
						</view>
						<view class="saletime" >
							<text v-if="ele.fabricTime" style="margin-right: 30rpx;">{{ele.fabricTimeTitle}}：{{ele.fabricTime}}</text>							
							<text v-if="ele.factoryDeliveryDateLatest">交期：{{ele.factoryDeliveryDateLatest+'天'}}</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="modalBoxs">
				<view class="item" @tap='modalList[2].modalShow = !modalList[2].modalShow'>
					<view class="item-left">
						<text class="iconfont icon-buzaishoupeise"></text>
						<text>不在售配色</text>
					</view>
					<view class="box-right">
						<text class="number">{{infos.offMarket.count}}</text>
						<text class="iconfont icon-Arrow-Down" :class="{rotate: modalList[2].modalShow}"></text>
					</view>
				</view>
				<view class="content" v-show="modalList[2].modalShow">
					<view class="itemModel" v-for="(ele,index) in infos.offMarket.info" :key="index">
						<view class="title">
							{{ele.PartStyle}}
							<text v-if="ele.ColorDes">{{'（'+ele.ColorDes+'）'}}</text>
						</view>
						<view class="saletime">
							<text v-if="ele.fabricTime" style="margin-right: 30rpx;">{{ele.fabricTimeTitle}}：{{ele.fabricTime}}</text>
							<text v-if="ele.factoryDeliveryDateLatest">交期：{{ele.factoryDeliveryDateLatest+'天'}}</text>							
						</view>
					</view>
				</view>
			</view>
			
			<view class="modalBoxs">
				<view class="item" @tap='modalList[3].modalShow = !modalList[3].modalShow'>
					<view class="item-left">
						<text class="iconfont icon-santiankejiaofu"></text>
						<text>三天可交付</text>
					</view>
					<view class="box-right">
						<text class="number">{{payList.length}}</text>
						<text class="iconfont icon-Arrow-Down" :class="{rotate: modalList[3].modalShow}"></text>
					</view>
				</view>
				<view class="content" v-show="modalList[3].modalShow">
					<view class="pay-list">
						<view class="pay-item" v-for="(item, index) in payList.slice(0, 6)" :key="index">
							<view class=""><text class="productNo">{{item.itemno}}</text><text>基地：{{item.baseofname}}</text></view>
							<block v-for="(ele, eIndex) in item.strList" :key="eIndex">
								<view v-if="ele != infos.productNo">{{ele}}</view>
							</block>
						</view>
					</view>
					
					<view class="itemMore" @tap="toItemMore(infos)" v-if="payList.length > 6">查看更多<text class="iconfont icon-Arrow-right"></text></view>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	export default {
		name: "fabricBox",
		props: {
			infos: {
				type: Object,
				default: () => {
					return []
				}
			}
		},
		data() {
			return {
				modalList: [
					{
						modalShow: false
					},
					{
						modalShow: false
					},
					{
						modalShow: false
					},
					{
						modalShow: false
					}
				],
				// 控制面料折叠展开class
				modalClass1: 'hide',
				modalClass2: 'hide',
				// 三天可交付
				payList: []
			};
		},
		created() {
			if (this.infos.productNo) {
				this.sevenDaysList();
			}
		},
		methods: {
			sevenDaysList() {
				this.$http({
					url: this.$api.sevenDaysList,
					data: {
						partno: this.infos.productNo,
						page: 1,
						pageSize: 1000
					},
					success: (res) => {
						if (res.code == '01') {
							
							res.data.forEach(item => {
								item.strList = [];
								if (item.partname.indexOf('~') >= 0) {
									item.strList = item.partname.split('~')
								} else {
									item.strList[0] = item.partname
								}
							})
							this.payList = res.data;
						}
					}
				})
			},
			// 在售面料
			showModal1() {
				this.modalClass1 = this.modalClass1 == 'show' ? 'hide' : 'show';
			},
			// 不在售面料
			showModal2() {
				this.modalClass2 = this.modalClass2 == 'show' ? 'hide' : 'show';
			},
			toDetail(){
				this.$emit('toDetail',this.infos.imageId)
			},
			toItemMore(item){
				uni.navigateTo({
					url: './deliveryList?title=' + item.itemBrief + ' | ' + item.productNo + '&productNo=' + item.productNo
				})
			}
		}
	}
	
</script>

<style lang="scss" scoped>
	.fabric-Box {
		background: #FFFFFF;
		border: 1rpx solid #DEDEDE;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
		border-radius: 16rpx;
		padding-bottom: 40rpx;
		margin: 0 24rpx;
		
		.mains {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 70rpx;
			border-bottom: 1rpx solid $bottom-line-color;
			padding-left: 24rpx;
		
			.left {
				display: flex;
				justify-content: left;
				align-items: center;
				font-size: 28rpx;
				color: $title;
		
				.sign {
					font-weight: 500;
					font-size: 20rpx;
					color: #999999;
					border: 1rpx solid #999999;
					border-radius: 4rpx;
					padding: 0 5rpx;
					margin-left: 16rpx;
				}
		
				.title {
					color: $title;
					font-weight: 500;
				}
			}
		
			.right {
				font-weight: 500;
				font-size: 20rpx;
				line-height: 14px;
				color: #FFFFFF;
				background: #45C177;
				border-radius: 24rpx 0px 0px 24rpx;
				padding: 6rpx 12rpx;
			}
		}
		
		.time {
			font-size: 24rpx;
			line-height: 32rpx;
			color: $subTitle;
			padding: 24rpx 24rpx 32rpx;
		}
		
		.modalList {
			padding: 0 24rpx;
		
			.modalBoxs {
				background: #FFFFFF;
				border: 1rpx solid #DEDEDE;
				border-radius: 8rpx;
				&:nth-of-type(n+2) {
					margin-top: 16rpx;
				}
				.item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					position: relative;
					height: 82rpx;
					font-size: 28rpx;
					color: $title;
					padding: 0 24rpx;
					
					.item-left {
						.iconfont {
							color: #737373;
							font-size: 40rpx;
							margin-right: 16rpx;
							&.icon-zaishoupeise {
								color: #45C177;
							}
							&.icon-yuxiashipeise {
								color: #FC5151;
							}
							&.icon-buzaishoupeise {
								color: #FFAB07;
							}
							&.icon-santiankejiaofu {
								color: #FC5151;
							}
						}
					}
					
					.box-right {
						.iconfont {
							color: #272727;
							font-size: 32rpx;
							margin-left: 8rpx;
							transform: rotate(0);
							transition: all 0.1s ease-in-out;
							&.rotate {
								transform: rotate(180deg);
							}
							&.opacity {
								opacity: 0;
							}
						}
					}
					
					.item-left,
					.box-right {
						display: flex;
						align-items: center;
						height: 48rpx;
						
						.number {
							font-weight: 500;
							font-size: 36rpx;
							color: #272727;
						}
					}
				}
		
				.content {
					.itemModel {
						background: #F7F7F7;
						border-top: 2rpx solid #F2F2F2;
						padding: 18rpx 24rpx;
						.title {
							display: flex;
							align-items: center;
							font-size: 28rpx;
							flex-wrap: wrap;
							// height: 44rpx;
							color: #272727;
						}
						.saletime {
							color: #737373;
							font-size: 24rpx;
							line-height: 32rpx;
							margin-top: 4rpx;
						}
					}
					
					.pay-list {
						.pay-item {
							border-top: 2rpx solid #F2F2F2;
							padding: 18rpx 24rpx 24rpx;
							view {
								display: flex;
								justify-content: space-between;
								font-size: 24rpx;
								line-height: 32rpx;
								color: #737373;
								margin-top: 4rpx;
								&:first-child {
									font-size: 28rpx;
									line-height: 44rpx;
									padding-bottom: 4rpx;
									margin-top: 0;
								}
								.productNo {
									color: #272727;
								}
							}
						}
					}
					
					.itemMore {
						display: flex;
						justify-content: center;
						align-items: center;
						height: 88rpx;
						font-size: 28rpx;
						color: #737373;
						background: #F7F7F7;
						box-shadow: inset 0 1rpx 0 rgba(0, 0, 0, 0.24);
						
						.iconfont {
							font-size: 32rpx;
							color: #737373;
						}
					}
				}
			}
		}
	}
</style>
