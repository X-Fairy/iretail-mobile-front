<template>
	<page>
		<view slot="body">
			<view style="margin-top: 16rpx;">
				<view class="uni-list-cell" v-for="(item, index) in selectListSales" :key="index">
					<view class="name">{{item.salesName || item.personName}}
						<text v-if="item.sign" class="sign">我</text>
					</view>
					<view style="display: flex;align-items: center;">
						<input class="rate" type="digit" placeholder-style="color:#B2B2B2;opacity:0.5;" :placeholder="item.achieveRate"
						  :data-index='index' @input="inputText" @keyboardheightchange="inputFocus"/>
						<text>%</text>
					</view>

				</view>
			</view>
			<view  class="footer" :style="{bottom:bottom+'rpx'}">
				<view class="btn" @tap='submit' hover-class="subBtnHover">
					保存
				</view>
			</view>
		</view>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				data: null,
				list: null,
				selectListSales: null,
				bottom:uni.getSystemInfoSync().statusBarHeight
			}
		},
		onLoad(option) {
			this.data = JSON.parse(option.data)
			// #ifdef H5
			this.data.forEach(ele => {
				ele.achieveRate = ele.achieveRate.toString();
			})
			// #endif
			if (option.orderId) {
				this.getOrderSales(option.orderId)
			} else {
				this.selectListSales = this.data
			}
		},
		methods: {
			// 计算分账比例
			getAchieveRate(data) {
				let num = 100 % data.length
				if (num == 0) {
					data.forEach(ele => {
						ele.achieveRate = 100 / data.length
						ele.sign = false
						if (ele.personId == uni.getStorageSync('userInfo').personId) {
							ele.sign = true
						}
					})
				} else {
					data.forEach(ele => {
						ele.achieveRate = Math.floor(100 / data.length)
						ele.sign = false
						if (ele.personId == uni.getStorageSync('userInfo').personId) {
							ele.achieveRate = ele.achieveRate + num
							ele.sign = true
						}
					})
				}
				// #ifdef H5
				data.forEach(ele => {
					ele.achieveRate = ele.achieveRate.toString();
				})
				// #endif
				return data
			},
			// 获取销售人员分账比例
			getOrderSales(e) {
				this.$http({
					url: this.$api.queryOrderSalesById,
					data: {
						orderId: e,
						page: 1,
						rows: 10000
					},
					success: (res) => {
						this.list = res.data
						if (this.isObjectValueEqual(this.list, this.data)) {
							this.selectListSales = res.data
							this.selectListSales.forEach(ele => {
								ele.sign = false
								if (ele.salesId == uni.getStorageSync('userInfo').personId) {
									ele.sign = true
								}
								// #ifdef H5
								ele.achieveRate = ele.achieveRate.toString();
								// #endif
							})
						} else {
							this.selectListSales = this.data
						}
					}
				})
			},
			isObjectValueEqual(a, b) {
				if (a.length != b.length) {
					return false;
				}
				for (var i = 0; i < a.length; i++) {
					if (a[i].salesId !== b[i].salesId) {
						return false;
					}
				}
				return true;
			},			
			inputText(e){				
				if(e.detail.value>100){
					this.$msg('销售员分账比例总和必须是100')
					return
				}
				let index=e.detail.value.indexOf('.')
				if(index!=-1){
					let num=e.detail.value.split('.')
					if(num[1].length>2)
					this.$msg('请正确输入分账比例(最大3位整数2位小数)')
					return
				}				
				let i = e.currentTarget.dataset.index
				this.selectListSales[i].achieveRate = e.detail.value
			},
			inputFocus(e){
				let statusBarHeigh = uni.getSystemInfoSync().statusBarHeight
				if (e.detail.height > 0) {				
					this.bottom = e.detail.height * 2 - statusBarHeigh;
				} else {					
					this.bottom = uni.getSystemInfoSync().statusBarHeight
				}
			},
			submit() {
				let total = 0;
				this.selectListSales.forEach(ele => {
					total += Number(ele.achieveRate)
				})
				if (total != 100) {
					this.$msg('销售员分账比例总和必须是100')
				} else {
					this.selectListSales.forEach(ele => {
						if (!ele.personName) {
							ele.personName = ele.salesName
							ele.personId = ele.salesId
							ele.personCode = ele.salesNo
						}
					})
					uni.setStorageSync('choosePerson', this.selectListSales)
					uni.navigateBack({
						delta: 2
					})
				}

			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #F7F7F7;
	}

	.uni-list-cell {
		padding: 32rpx;
		font-size: 28rpx;
		border-bottom: 1rpx solid #F2F2F2;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #FFFFFF;

		.sign {
			display: inline-block;
			padding: 4rpx 16rpx;
			background: #FFF5F5;
			margin-left: 16rpx;
			color: #E42727;
			font-size: 20rpx;
		}

		.rate {
			width: 200rpx;
			text-align: right;
			caret-color: red;
			color: $title;
			font-weight: 500;
			font-size: 36rpx;
			margin-right: 4rpx;
		}
	}

	.footer {
		padding: 24rpx 32rpx;
		background: #FFFFFF;
		position: fixed;
		transition: bottom 0.2s linear;
		width: 100%;
	}

	.btn {
		background: #E42727;
		border-radius: 8px;
		padding: 18rpx 0;
		text-align: center;
		color: #FFFFFF;
		font-size: 28rpx;
		font-weight: 500;
	}
	.subBtnHover{
		background: #B40808;
	}
</style>
