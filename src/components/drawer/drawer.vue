<template>
	<view v-if="visibleSync" :class="{ 'drawer--visible': showDrawer }" class="drawer" @touchmove.stop.prevent="clear">
		<view class="drawer__mask" :class="{ 'drawer__mask--visible': showDrawer && mask }" @tap="close('mask')" />
		<view class="drawer__content" :class="{'drawer--right': rightMode,'drawer--left': !rightMode, 'drawer__content--visible': showDrawer}"
		 :style="{width:drawerWidth+'rpx'}">
			<scroll-view scroll-y="true" class="drawer-box" v-if="current" :style="{marginTop:top+'rpx'}">
				<!-- 规格筛选 -->
				<view class="specBox" v-if="conditionInfo.itemSpecs">
					<view class="title">
						规格
					</view>
					<view class="box">
						<view class="spec" v-for="(item,index) in conditionInfo.itemSpecs" :key='index' :class="specList.includes(item)?'on':''"
						 @tap='choose(item,specList)'>
							{{item}}
						</view>
					</view>
				</view>
				<!-- 大小 -->
				<view class="specBox" v-if="conditionInfo.size">
					<view class="title">
						尺寸
					</view>
					<view class="box">
						<view class="spec" v-for="(item,index) in conditionInfo.size" :key='index' :class="sizeIndex==index?'on':''" @tap='chooseSize(index)'>
							{{item}}
						</view>
					</view>
				</view>
				<!-- 面料筛选 -->
				<view class="fabricBox" style="padding-top: 0;" v-if="conditionInfo.fabricList">
					<view class="title">
						配色
					</view>
					<view class="box">
						<view class="fabric" v-for="(item,i) in conditionInfo.fabricList" :key='i' :class="FabricIndex==i?'on':''"
						 @tap='chooseFabric(i)'>
							{{item}}
						</view>
					</view>
				</view>
			</scroll-view>
			<scroll-view :scroll-y="scrollY" :scroll-top="scrollTop" @scroll="scroll" class="drawer-box" v-else>
				<slot />
			</scroll-view>
			<view class="footer">
				<view class="removeBtn" @tap="confirm('del')">重置</view>
				<view class="confirm" @tap="confirm('ok')">确认</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'drawerBox',
		props: {
			// 是否自定义内容
			current: {
				type: Boolean,
				default: false
			},
			// 条件筛选
			conditionInfo: {
				type: Object,
				default: () => {
					return {}
				}
			},
			top: {
				type: Number,
				default: 0
			},
			// 面料

			/**
			 * 显示模式（左、右），只在初始化生效
			 */
			mode: {
				type: String,
				default: ''
			},
			/**
			 * 蒙层显示状态
			 */
			mask: {
				type: Boolean,
				default: true
			},
			/**
			 * 遮罩是否可点击关闭
			 */
			maskClick: {
				type: Boolean,
				default: true
			},
			/**
			 * 抽屉宽度
			 */
			width: {
				type: Number,
				default: 500
			},
			// 选中的规格
			specList: {
				type: Array,
				default: () => {
					return []
				}
			},
			// 选择的尺寸索引
			sizeIndex: {
				type: Number,
				default: -1
			},
			// 选择面料
			FabricIndex: {
				type: Number,
				default: -1
			},
			scrollDis: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				visibleSync: false,
				showDrawer: false,
				rightMode: false,
				watchTimer: null,
				drawerWidth: 500,
				scrollY: true,
				scrollTop: 0,
				old: {
					scrollTop: 0
				}
			}
		},
		created() {
			// #ifndef APP-NVUE
			this.drawerWidth = this.width
			// #endif
			this.rightMode = this.mode === 'right'
			if (this.current) {
				// #ifndef H5
				this.specList = [];
				// #endif
				this.sizeIndex = -1;
				this.FabricIndex = -1
			}
			this.scrollY = !this.scrollDis
		},
		watch: {
		    scrollDis(newValue, oldValue) {
				if (newValue) {
					this.goTop();
				} else {
					this.scrollY = true;
				}
		    }
		},
		methods: {
			clear() {},
			close(type) {
				if ((type === 'mask' && !this.maskClick) || !this.visibleSync) return
				this.change('showDrawer', 'visibleSync', false)
			},
			open() {
				if (this.visibleSync) return
				this.change('visibleSync', 'showDrawer', true)
			},
			change(param1, param2, status) {
				this[param1] = status
				if (this.watchTimer) {
					clearTimeout(this.watchTimer)
				}
				this.watchTimer = setTimeout(() => {
					this[param2] = status
					this.$emit('change', status)
				}, status ? 50 : 300)
			},
			// 选择尺寸
			chooseSize(index) {
				this.$emit('chooseSize', index)
			},
			// 选择面料
			chooseFabric(index) {
				this.$emit('chooseFabric', index)
			},
			// 选择规格，面料
			choose(e, arr) {
				if (arr.includes(e)) {
					let index = arr.indexOf(e)
					arr.splice(index, 1)
				} else {
					arr.push(e)
				}

				this.$emit('chooseSpec', arr)
			},
			confirm(e) {
				this.$emit('confirm', e)
			},
			goTop() {
				this.scrollTop = this.old.scrollTop
				this.$nextTick(function() {
					this.scrollTop = 0
					this.scrollY = false;
				});
			},
			scroll(e) {
				this.old.scrollTop = e.detail.scrollTop
			}
		}
	}
</script>

<style lang="scss">
	// 抽屉宽度
	$drawer-width: 220px;

	.drawer {
		display: block;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;
		/* #ifndef H5 */
		z-index: 99999999;
		/* #endif */
		/* #ifdef H5 */
		z-index: 999;
		/* #endif */
	}

	.drawer__content {
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
		position: absolute;
		top: 0;
		width: $drawer-width;
		bottom: 0;
		background-color: $uni-bg-color;
		transition: transform 0.3s ease;

	}

	.drawer-box {
		// overflow-y: scroll;
		top: 0;
		bottom: 0;
		position: absolute;
		padding-bottom: 120rpx;
		.specBox,
		.fabricBox {
			padding: 32rpx;
			font-size: 20rpx;
			padding-bottom: 0;

			.title {
				color: $title;
				font-weight: bold;
				font-size: 28rpx;
			}

			.box {
				padding: 24rpx 0;
				display: flex;
				justify-content: flex-start;
				align-items: center;
				flex-wrap: wrap;

				.spec,
				.fabric {
					text-align: center;
					padding: 10rpx 16rpx;
					border-radius: 100px;
					color: $title;
					font-size: 24rpx;
					background: #F2F2F2;
					border-radius: 100px;
					width: 180rpx;
					height: 64rpx;
					margin: 0 24rpx 24rpx 0;
					display: flex;
					justify-content: center;
					align-items: center;
					border: 1px solid #F2F2F2;

					&:nth-child(3n) {
						margin-right: 0;
					}

					&.on {
						background: #FCEBEB;
						border: 1px solid #E42727;
						border-radius: 200rpx;
						color: #E42727;
						font-weight: 600;
					}
				}
			}
		}
	}

	.drawer--left {
		left: 0;
		/* #ifdef APP-NVUE */
		transform: translateX(-$drawer-width);
		/* #endif */
		/* #ifndef APP-NVUE */
		transform: translateX(-100%);
		/* #endif */
	}

	.drawer--right {
		right: 0;
		/* #ifdef APP-NVUE */
		transform: translateX($drawer-width);
		/* #endif */
		/* #ifndef APP-NVUE */
		transform: translateX(100%);
		/* #endif */
	}

	.drawer__content--visible {
		transform: translateX(0px);
	}


	.drawer__mask {
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
		opacity: 0;
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		background-color: $uni-bg-color-mask;
		transition: opacity 0.3s;
	}

	.drawer__mask--visible {
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
		opacity: 1;
	}

	.footer {
		width: 100%;
		padding: 24rpx 26rpx;
		background-color: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 28rpx;
		position: fixed;
		bottom: 0;
		font-weight: 600;
		padding-bottom: 40rpx;

		.removeBtn {
			color: $subTitle;
			padding: 18rpx 0;
			width: 212rpx;
			text-align: center;
			border: 2rpx solid #CCCCCC;
			box-sizing: border-box;
			border-radius: 4px;
		}

		.confirm {
			padding: 18rpx 0;
			width: 370rpx;
			text-align: center;
			color: #fff;
			background: #E42727;
			border: 2rpx solid #E42727;
			border-radius: 4px;
		}
	}
</style>
