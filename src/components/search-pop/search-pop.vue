<template>
	<view v-if="popupClass !== ''">
		<view class="popup" :class="popupClass" @touchmove.stop.prevent="discard" @tap="hidepopup">
			<!-- 遮罩层 -->
			<view class="mask">
				<view class="layer" @tap.stop="discard" :style="{height: winHeight}">
					<view class="header">
						<view class="input-box">
							<text class="iconfont icon-icon-search"></text>
							<input :placeholder="placeholder" :adjust-position="false" v-model="inputValue" :focus="inputFocus" confirm-type='search'
							 @confirm="inputChange" />
							<text class="iconfont icon-filled-close" v-if="inputValue.length > 0" @tap='remove'></text>
						</view>
						<view class="action" @tap="hidepopup">
							取消
						</view>
					</view>
					<scroll-view scroll-y="true" class="scroll-box" :style="{height: scrollHeight + 'px'}">
						<view v-if="addressShow">
							<view class="listBox" v-for="(item, index) in addressList" :key="index" @tap='choose(item, index)'
							 hover-class='hover'>
								<view class="name" v-if="item.sign">
									<block v-for="(ele, eIndex) in item.strList" :key="eIndex">
										<text :style="{color: ele == contrastValue ? '#272727' : '#999999'}" >{{ele}}</text>
									</block>
								</view>
								<view class="name" v-else style="color: #999999;">
									{{item.communityName}}
								</view>
							</view>
						</view>
						<view v-else style="padding-bottom:60rpx">
							<view class="listBox" v-for="(item, index) in list" :key="index" hover-class='hover'>
								<view class="name"  @tap='choose(item, index)'>
									{{item.showName}}
								</view>
								<view style="width: 10%;text-align: right;" v-if="item.del" @tap='del(index)'>
									<text class="iconfont icon-x" style="font-size: 36rpx;"></text>									
								</view>
							</view>
						</view>
						<view class="loading-text" v-if="loadingText">{{loadingText}}</view>
					</scroll-view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'searchPop',
		props: {
			placeholder: {
				type: String,
				default: '输入关键词'
			},
			// 内容高度
			winHeight: {
				type: String,
				default: '95.3%'
			},
		},
		data() {
			return {
				typeName: '',
				params: null,
				inputFocus: false,
				list: [],
				// 滚动区高度
				scrollHeight: 0,
				//商品选择弹窗css类，控制开关动画
				popupClass: '',
				// 输入框值
				inputValue: '',
				contrastValue: '',
				loadingText: '',
				addressList: [],
				addressShow: false
			};
		},

		methods: {
			showPopup(typeName, data) {
				this.popupClass = 'show';
				this.typeName = typeName;
				this.params = data ? data : null
				if (this.typeName == 'policy') {
					this.getPolicyList()
					this.list = uni.getStorageSync(this.typeName) || []
				} else if (this.typeName == 'dealer') {
					this.getdealerSettle()
				} else if (this.typeName == 'address') {
					this.list = uni.getStorageSync(this.typeName) || []
				}
				
				this.loadingText = '';
				this.addressShow = false;
				this.$nextTick(function(){
					const { windowHeight } = uni.getSystemInfoSync();
					const query = uni.createSelectorQuery().in(this);
					query.select('.header').boundingClientRect(data => {
						let height = (windowHeight * parseFloat(this.winHeight.replace("%","")/100)).toFixed(2)
						this.scrollHeight = height - data.height
					}).exec();
				})
				setTimeout(() => {
					this.inputFocus = true;
				}, 350)
			},
			inputChange(e) {
				if (this.typeName == 'policy') {
					this.getPolicyList()
				} else if (this.typeName == 'dealer') {
					this.getdealerSettle()
				} else if (this.typeName == 'address') {
					this.getAdress()
				}
			},
			remove() {
				this.inputValue = '';
				if (this.typeName == 'policy') {
					this.getPolicyList()
				} else if (this.typeName == 'dealer') {
					this.getdealerSettle()
				} else if (this.typeName == 'address') {
					this.getAdress()
				}
			},
			// 收款方式列表
			getdealerSettle() {
				this.$http({
					url: this.$api.dealerSettle,
					data: {
						storeNo: this.params.storeNo,
						marketSettleFlag: this.params.typeCode == '1002' ? 1 : 0,
						keyWords: this.inputValue,
						pageNum: 1,
						pageSize: 1000
					},
					success: (res) => {
						res.data.forEach(item => {
							item.showName = item.settleName;
						})
						this.list = res.data
						if (res.data.length == 0) {
							this.loadingText = '暂无搜索结果！'
						}
					}
				})
			},
			// 获取销售政策
			getPolicyList() {
				this.$http({
					url: this.$api.getpolicyList,
					data: {
						storeId: uni.getStorageSync('storeInfo').storeId,
						pageNum: 1,
						pageSize: 20,
						keyWords: this.inputValue ? this.inputValue : ''
					},
					success: (res) => {
						res.data.forEach(item => {
							item.showName = item.policyName;
						})
						this.list = res.data
						if (res.data.length == 0) {
							this.loadingText = '暂无搜索结果！'
						}
					}
				})
			},
			// 获取地址
			getAdress() {
				let data = [];
				this.addressShow = true;
				this.$http({
					url: this.$api.SearchAddress,
					data: {
						data: {
							keyWords: this.inputValue
						}
					},
					success: res => {
						if (res.code == 0) {
							this.contrastValue = this.inputValue;
							res.data.forEach((item, index) => {
								let indexOf = item.communityName.indexOf(this.contrastValue);
								item.sign = indexOf >=0 ? true : false;
								item.del = true;
								item.strList = [];
								item.showName = item.communityName;
								if (indexOf == 0) {
									item.strList[0] = item.communityName.substring(0, this.contrastValue.length)
									item.strList[1] = item.communityName.substring(this.contrastValue.length, item.communityName.length)
								} else if(indexOf == (item.communityName.length - this.contrastValue.length)) {
									item.strList[0] = item.communityName.substring(0, indexOf)
									item.strList[1] = item.communityName.substring(indexOf, item.communityName.length)
								} else {
									item.strList[0] = item.communityName.substring(0, indexOf)
									item.strList[1] = this.contrastValue
									item.strList[2] = item.communityName.substring(indexOf + this.contrastValue.length, item.communityName.length)
								}
							})
							this.addressList = res.data;
							this.loadingText = ''
						} else {
							this.addressList = []
							this.loadingText = '没有查询到相关结果'
						}
					}
				})
			},
			// 选中当前行
			choose(e, index) {
				this.$emit('choose', e, this.typeName)
				this.hidepopup()
				
				let listName = this.list.map(ele => {
					return ele.showName
				})
				if (!listName.includes(e.showName)) {
					this.list.push(e)
				}
				if (this.typeName != 'dealer') {
					uni.setStorageSync(this.typeName, this.list)
				}
				
				this.hidepopup()
			},
			// 删除数据
			del(index) {
				this.list.splice(index, 1)
				uni.setStorageSync(this.typeName, this.list)
			},
			// 关闭地址弹窗
			hidepopup() {
				this.popupClass = 'hide';
				this.inputFocus = false;
				this.inputValue = '';
				setTimeout(() => {
					this.popupClass = 'none';
				}, 300);

				this.$emit('hidepopup')
			},
			// 返回关闭弹窗
			back() {
				this.hidepopup()
			},
			discard() {}
		}
	}
</script>

<style lang="scss" scoped>
	.popup {
		.layer {
			background-color: #F2F2F2;

			.header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 24rpx 32rpx 24rpx 32rpx;
				background-color: #fff;
				width: 100%;
				position: fixed;

				.input-box {
					width: 90%;
					height: 80rpx;
					display: flex;
					justify-content: left;
					align-items: center;
					background-color: #F2F2F2;
					border-radius: 10rpx;
					padding-left: 20rpx;

					input {
						width: 100%;
						font-size: 28rpx;
						margin-left: 16rpx;
						caret-color: #E42727;
					}

					.icon-filled-close {
						color: #B2B2B2;
						font-size: 32rpx;
						padding: 20rpx 24rpx;
					}
					.icon-icon-search {
						font-size: 36rpx;
						color:#B3B3B3;
					}
				}

				.action {
					font-size: 28rpx;
				}
			}

			.scroll-box {
				position: relative;
				top: 128rpx;
				background: #FFFFFF;
				.listBox {
					background-color: #FFFFFF;
					display: flex;
					justify-content: space-between;
					width: 100%;
					align-items: center;
					padding: 26rpx 32rpx 26rpx;
					border-bottom: 1rpx solid #f2f2f2;
					font-size: 28rpx;
					
					.name {
						width: 90%;
					}
				}

				.hover {
					background-color: #F2F2F2;
				}
			}
		}
	}
</style>
