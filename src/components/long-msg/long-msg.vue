<template>
	<view class="alert-Bg" v-show="AlertShow" :style="{marginTop: marginTop + 'px', opacity: opacity}">
		<view class="alert-Content">{{message}}</view>
	</view>
</template>

<script>
	export default {
		name: "longMsg",
		data() {
			return {
				marginTop: 0,
				opacity: 0,
				AlertShow: false,
				message: '',
				time: 2000
			};
		},
		methods: {
			openShow(message, time) {
				this.AlertShow = true;
				this.message = message;
				
				const { windowHeight } = uni.getSystemInfoSync();
				this.$nextTick(function(){
					const query = uni.createSelectorQuery().in(this);
					query.select('.alert-Bg').boundingClientRect(data => {
						this.marginTop = 0 - (data.height / 2);
						this.opacity = 1;
					}).exec();
				})
				
				if (time) {
					this.time = time;
				}
				setTimeout(() => {
					this.closeShow();
				}, this.time)
			},
			closeShow() {
				this.AlertShow = false;
			}
		}
	};
</script>

<style lang="scss">
	.alert-Bg {
		position: fixed;
		top: 50%;
		left: 50%;
		font-size: 34rpx;
		color: #FFFFFF;
		width: 600rpx;
		background: rgba(0, 0, 0, .6);
		border-radius: 16rpx;
		text-align: center;
		padding: 28rpx 40rpx;
		margin-left: -300rpx;
		opacity: 0;
		z-index: 999;
	}
</style>
