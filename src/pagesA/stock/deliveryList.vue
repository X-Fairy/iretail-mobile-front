<template>
	<view class="box">
		<view class="header"><text>三天可交付</text><text>{{payList.length}}</text></view>
		
		<view class="content">
			<view class="pay-list" v-if="payList">
				<view class="pay-item" v-for="(item, index) in payList" :key="index">
					<view class=""><text class="productNo">{{item.itemno}}</text><text>基地：{{item.baseofname}}</text></view>
					<block v-for="(ele, eIndex) in item.strList" :key="eIndex">
						<view v-if="ele != productNo">{{ele}}</view>
					</block>
				</view>
			</view>
		</view>
	</view>

</template>

<script>
	export default {
		components: {
		},
		data() {
			return {
				payList: [],
				productNo: ''
			};
		},
		onLoad(option) {
			uni.setNavigationBarTitle({
				title: option.title
			})
			this.productNo = option.productNo;
			this.sevenDaysList(option.productNo);
		},
		methods: {
			sevenDaysList(productNo) {
				this.$http({
					url: this.$api.sevenDaysList,
					data: {
						partno: productNo,
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
		}
	}
</script>

<style lang="scss">
	page {
		background: #F7F7F7;
	}
	
	.box {
		.header {
			line-height: 96rpx;
			font-size: 28rpx;
			color: #737373;
			padding: 0 32rpx;
			text:first-child {
				margin-right: 8rpx;
			}
		}
		
		.content {
			background: #FFFFFF;
			
			.pay-list {
				.pay-item {
					border-bottom: 2rpx solid #F2F2F2;
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
		}
	}
</style>
