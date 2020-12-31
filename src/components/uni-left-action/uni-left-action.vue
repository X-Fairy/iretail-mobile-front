<template>
	<view>
		<view class="">
			<scroll-view :scroll-y="isScroll" :style="{ height: scrollHeight }">
				<block :key="itemIndex" v-for="(item, itemIndex) in dataList">
					<view :data-index="itemIndex" class="order-item" @touchstart="drawStart" @touchmove="drawMove" @touchend="drawEnd" :style="{ transform: 'translate3d(' + item.translateX + 'px, 0, 0)' }">
						<view class="">
							<good-Detail
								:item="item"
								:index="itemIndex"
								:isDisabled="isDisabled"
								:statusCode="statusCode"
								:priceState="priceState"
								:currentIndex="currentIndex"
								@goodCallback="goodCallback"
							></good-Detail>
						</view>
						<view class="remove" @click="delItem(item, itemIndex)">
							<text class="icon iconfont Trash"></text>
						</view>
					</view>
				</block>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import goodDetail from '@/components/good-detail/index.vue'
	export default {
		name: 'authPop',
		components: {
			goodDetail
		},
		watch: {
			prodList(newValue, oldValue) {
				this.dataList = [];
				newValue.forEach(item => {
					item.translateX = 0;
					this.dataList.push(item)
				})
			}
		},
		props: {
			scrollHeight: {
				type: String,
				default: 'auto'
			},
			prodList: {
				type: Array,
				default: () => {
					return []
				}
			},
			statusCode: {
				type: String,
				default: ''
			},
			priceState: {
				type: Number,
				default: 0
			},
			currentIndex: {
				type: Number,
				default: 0
			},
			isDisabled: {
				type: Boolean,
				default: false
			},
		},
		data() {
			return {
				isScroll: true,
				delBtnWidth: 0,
				dataList: [],
				//上次的位置
				currentX: 0,
				touchStartX: 0
			}
		},
		
		created() {
			let systemInfo = uni.getSystemInfoSync();
			this.delBtnWidth = ((systemInfo.screenWidth / 750) * 160).toFixed(2);
			this.prodList.forEach((item, index) => {
				item.translateX = 0;
				this.dataList.push(item)
			})
		},
		methods: {
			discard() {

			},
			goodCallback(callbackName, item) {
				this.$emit(callbackName, item)
			},
			drawStart: function(e) {
				this.isScroll = false;
				let touch = e.touches[0],
					index = e.currentTarget.dataset.index;

				this.touchStartX = touch.clientX;
				// 初始化
				this.dataList.forEach((item, i) => {
					if (!item.translateX || index != i) {
						item.translateX = 0;
					}
				})
				this.startX = touch.clientX;
				this.currentX = this.dataList[e.currentTarget.dataset.index].translateX;
			},
			drawMove: function(e) {
				if (this.isDisabled) {
					return
				}
				// this.$emit('changeScrollY', false)
				var touch = e.touches[0];
				var item = this.dataList[e.currentTarget.dataset.index];
				var disX = this.startX - touch.clientX;
				
				let currentTime = new Date().getTime();
				if (disX > 0) {
					//计算当前已滑动距离
					const leftDifference = this.currentX - Math.abs(disX);
					if (this.delBtnWidth > Math.abs(leftDifference)) {
						item.translateX = -disX;
					} else {
						item.translateX = -this.delBtnWidth;
					}
				} else {
					//计算当前已滑动距离
					const rightDifference = this.currentX + Math.abs(disX);
					if (0 < rightDifference) {
						item.translateX = 0;
					} else {
						item.translateX = rightDifference;
					}
				}
			},
			drawEnd: function(e) {
				this.isScroll = true;
				// this.$emit('changeScrollY', true)
				var item = this.dataList[e.currentTarget.dataset.index];
				
				let touch = e.changedTouches[0],
					isTrue = true,
					systemInfo = uni.getSystemInfoSync();
				if (this.touchStartX == touch.clientX && (systemInfo.screenWidth - this.touchStartX) > this.delBtnWidth) {
					isTrue = false
				}
				
				if (Math.abs(item.translateX) >= this.delBtnWidth / 2 && isTrue) {
					item.translateX = -this.delBtnWidth;
				} else {
					item.translateX = 0;
				}
			},
			delItem(item, index) {
				// 初始化
				item.translateX = 0;
				uni.showModal({
					title: '提示',
					content: '确定删除？',
					success: (res) => {
						if (res.confirm) {
							item.index = index;
							this.$emit('removeHandle', item)
						} else if (res.cancel) {
							// item.translateX = 0;
							console.log('用户点击取消')
						}
					}
				})
			},
		}
	}
</script>

<style lang="scss">
	.order-item {
		position: static;
		width: 100%;
		display: flex;
		position: relative;
		-webkit-overflow-scrolling: touch;
		overflow-scrolling: touch;
		// transition: transform 0.2s cubic-bezier(.165, .84, .44, 1);
		transition: transform 0.2s cubic-bezier(0, .79, .59, 1);
	}
	
	.remove {
		position: absolute;
		top: 0;
		right: -180rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 180rpx;
		height: 100%;
		background-color: #FC5151;
		.Trash {
			font-size: 48rpx;
			color: #FFFFFF;
		}
	}
</style>
