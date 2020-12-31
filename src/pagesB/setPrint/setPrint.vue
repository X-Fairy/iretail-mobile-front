<template>
	<page>
		<view slot="body">
			<view class="listBox" v-if="printData.length>0">
				<radio-group @change="radioChange">
					<label class="uni-list-cell uni-list-cell-pd" v-for="(item,index) in printData" :key="index">
						<view class="left">
							<view>
								<radio :value="item.code" :checked="index === current" style="transform:scale(0.8)" color="#D31311" />
							</view>
							<view>{{item.note}}</view>
						</view>
						<text class="iconfont Trash" @tap.stop="del(index)"></text>
					</label>

				</radio-group>
			</view>
			<view class="loading-text" v-else>
				暂无打印机设备，请添加！
			</view>
			<!-- 提示信息 -->
			<modal :show="showmodal" :maskClosable="false" :custom="true" class="modalBox" height="300rpx" top="40%">
				<view class="content">
					<view class="title">
						打印机备注
					</view>
					<input v-model="note" placeholder="输入备注" />
				</view>
				<view class="submitBtn">
					<view class="close" @tap="showmodal=false">
						取消
					</view>
					<view class="confirm" @tap="confirm">
						确定
					</view>
				</view>

			</modal>
		</view>
		<view slot="footer">
			<view class="subBtn" @tap='scan'>
				新增打印机
			</view>
		</view>
	</page>
</template>
<script>
	import modal from "@/components/modal/modal"
	export default {
		data() {
			return {
				// 打印机列表
				printData: uni.getStorageSync('printList') || [],
				current: -1,
				showmodal: false,
				currentCode: '',
				note: ''
			};
		},
		onLoad() {

		},
		onShow() {
			console.log(uni.getStorageSync('printCode'))
			if (uni.getStorageSync('printCode')) {
				if (this.printData.length == 0) {
					this.printData.unshift(uni.getStorageSync('printCode'))
					this.current = 0
				} else {
					this.printData.forEach((ele, i) => {
						if (ele.code == uni.getStorageSync('printCode').code) {
							this.current = i
						}
					})
				}
			}
		},
		methods: {
			// 扫一扫
			scan() {
				uni.scanCode({
					success: (res) => {
						let isAdd = true
						this.printData.forEach(ele => {
							if (ele.code == res.result) {
								this.$msg('已添加过该打印设备')
								isAdd = false
								return
							}
						})
						if (isAdd) {
							this.showmodal = true;
							this.currentCode = res.result
							this.note = ''
						}

					}
				});
			},
			confirm() {
				if (this.note == '') {
					this.$msg("请填写打印机备注")
					return
				}
				let obj = {
					note: this.note,
					code: this.currentCode
				};
				this.printData.unshift(obj)
				uni.setStorageSync('printList', this.printData)
				uni.setStorageSync('printCode', this.printData[0])
				this.current = 0
				this.$msg('添加成功！')
				this.showmodal = false

			},
			// 选择
			radioChange(e) {
				this.printData.forEach((ele, i) => {
					if (ele.code == e.detail.value) {
						this.current = i
					}
				})				
				uni.setStorageSync('printCode', this.printData[this.current])
			},
			// 删除
			del(e) {
				uni.showModal({
					title: '提示',
					content: '是否删除当前打印机编号？',
					cancelText: '取消',
					confirmText: '确定',
					success: res => {
						if(res.confirm){
							if (this.current == e) {
								uni.removeStorageSync('printCode');					
							}
							this.printData.splice(e, 1)
							if(this.printData.length>0){
								this.current = 0;
								uni.setStorageSync('printCode', this.printData[0])
							}
							uni.setStorageSync('printList', this.printData)
						}
					}
				});
				
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #F7F7F7;
	}

	.header {
		margin-top: 20rpx;
		width: 100%;
		background: #FFFFFF;
		display: flex;
		justify-content: space-between;
		height: 90rpx;
		align-items: center;
		padding: 0 32rpx;
		font-size: 30rpx;

		.right {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 15%;
		}
	}

	.subBtn {
		background: #E42727;
		border: 1px solid #E42727;
		color: #FFFFFF;
		font-size: 28rpx;
		font-weight: 500;
		padding: 18rpx 0;
		text-align: center;
	}

	.listBox {
		background: #fff;
		margin-top: 20rpx;
		font-size: 28rpx;

		.uni-list-cell {
			text-align: center;
			padding: 20rpx 32rpx;
			border-bottom: 1rpx solid $bottom-line-color;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.left {
				display: flex;
				align-items: center;
			}

			.Trash {
				font-size: 32rpx;
				color: #737373;
			}
		}
	}

	.modalBox {
		.tui-modal-box {
			padding: 0 !important;
		}

		.content {
			width: 95%;
			margin: auto;
			text-align: center;

			.title {
				padding: 30rpx 0;
			}

			input {
				text-align: left;
				margin: 0 40rpx 40rpx;
				border-bottom: 1rpx solid #F0F0F3;
				height: 70rpx;
				line-height: 70rpx;
			}
		}

		.submitBtn {
			width: 100%;
			height: 90rpx;
			line-height: 90rpx;
			text-align: center;
			display: flex;
			border-top: 1rpx solid #F0F0F3;

			.close,
			.confirm {
				width: 50%;
				height: 100rpx;
				line-height: 100rpx;
				text-align: center;
				font-size: 32rpx;
			}
			.close{
				border-right: 1rpx solid #F0F0F3;
				padding-top: 0;
			}
			.confirm{
				color: $red;
			}
		}

	}
</style>
