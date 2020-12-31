<template>
	<view class="uni-numbox" :style="{ 'height': styleCSS.height }">
		<view @click="_calcValue('minus')" class="uni-numbox__minus" :style="{'width': styleCSS.height}">
			<text class="uni-numbox--text" :class="{ 'uni-numbox--disabled': inputValue <= min || disabled }" :style="{ 'font-size': styleCSS.iconSize, 'font-weight': styleCSS.iconWeight, 'margin-top': styleCSS.marginTop}">-</text>
		</view>
		<input :disabled="disabled" @blur="_onBlur"  @input="_oninput" class="uni-numbox__value" type="number" v-model="inputValue" :style="{'width': styleCSS.boxWidth, 'font-size': styleCSS.fontSize}"/>
		<view @click="_calcValue('plus')" class="uni-numbox__plus" :style="{'width': styleCSS.height}">
			<text class="uni-numbox--text" :class="{ 'uni-numbox--disabled': inputValue >= max || disabled }" :style="{ 'font-size': styleCSS.iconSize, 'font-weight': styleCSS.iconWeight }">+</text>
		</view>
	</view>
</template>
<script>
	export default {
		name: "UniNumberBox",
		props: {
			value: {
				type: [Number, String],
				default: 1
			},
			min: {
				type: Number,
				default: 0
			},
			max: {
				type: Number,
				default: 100
			},
			step: {
				type: Number,
				default: 1
			},
			disabled: {
				type: Boolean,
				default: false
			},
			isChange: {
				type: Boolean,
				default: true
			},
			eidititem:{
				type: Object,
			},
			index:{
				type: Number,
			},
			styleCSS: {
				type: Object,
				default: () => {
					return {
						boxWidth: '',
						height: '',
						fontSize: '',
						iconSize: '',
						iconWeight: '',
						marginTop: ''
					}
				}
			}
		},
		data() {
			return {
				inputValue: 0
			};
		},
		watch: {
			value(val) {
				this.inputValue = +val;
			},			
			inputValue(newVal, oldVal) {
				if (newVal !== oldVal) {
					this.$emit("change", newVal);
				}
			}
		},
		created() {
			this.inputValue = +this.value;
		},
		methods: {
			_calcValue(type) {
				if (this.disabled) {
					return;
				}
				const scale = this._getDecimalScale();
				let value = this.inputValue * scale;
				let step = this.step * scale;
				if (type === "minus") {					
					value -= step;
					if (value < this.min) {
						return
					}
					if (value > this.max) {
						value = this.max
					}
				} else if (type === "plus" ) {
					console.log(this.eidititem.status)
					if(!this.eidititem){
						this.$msg('请先选择规格')
						return
					}
					if (this.eidititem.selectionpara=='默认组合') {
						this.$msg('默认组合只能选一次')
						this.inputValue=1
						return
					}
					if (this.eidititem.status) {
						this.$msg('互斥只能选一次')
						this.inputValue=1
						return
					}
					value += step;
					if (value > this.max) {
						return;
					}
					if (value < this.min) {
						value = this.min
					}
				}
				this.inputValue = String(value / scale);
				this.eidititem.amount = Number(this.inputValue)
				this.eidititem.index = this.index
				this.$emit('numberBoxChange', this.eidititem)
			},
			_getDecimalScale() {
				let scale = 1;
				// 浮点型
				if (~~this.step !== this.step) {
					scale = Math.pow(10, (this.step + "").split(".")[1].length);
				}
				return scale;
			},
			_onBlur(event) {
				let value = event.detail.value;
				if(!this.eidititem){
					this.$msg('请先选择规格')
					return
				}
				if (this.eidititem.selectionpara=='默认组合') {
					this.$msg('默认组合只能选一次')
					this.inputValue = 1
					return
				}
				if (this.eidititem.status) {
					this.$msg('互斥只能选一次')
					this.inputValue=1
					return
				}
				if (!value) {
					return;
				}
				value = +value;
				if (value > this.max) {
					value = this.max;
				} else if (value < this.min) {
					value = this.min;
				}
				this.inputValue = value;
				this.eidititem.amount = Number(this.inputValue)
				this.eidititem.index = this.index
				this.$emit('numberBoxChange', this.eidititem)
			},
			_oninput(){
				this.eidititem.amount = Number(this.inputValue)
				this.eidititem.index = this.index
				this.$emit('numberBoxChange', this.eidititem)
			}
		}
	};
</script>
<style lang="scss">
	$box-height: 60rpx;
	/* #ifdef APP-NVUE */
	$box-line-height: 60rpx;
	/* #endif */
	$box-line-height: 42rpx;
	$box-width: 60rpx;

	.uni-numbox {
		display: flex;
		justify-content: space-between;
		// padding: 0 30rpx;
		// flex-direction: row;
		height: $box-height;
		line-height: $box-height;
		// width: 200rpx;
	}

	.uni-numbox__value {
		// background-color: $uni-bg-color;
		color: #000000;
		font-size: 36rpx;
		// width: 33.33%;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 80rpx;
		// height: $box-height;
		
		text-align: center;
		// width: 20%;
		// font-size: $uni-font-size-lg;
		// border-width: 1rpx;
		// border-style: solid;
		// border-color: $uni-border-color;
		// border-left-width: 1rpx;
		// border-right-width: 1rpx;
	}

	.uni-numbox__minus {
		display: flex;
		// width: 40%;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: $box-width;
		height: 100%;
		// height: $box-height;
	
		text-align: center;
		// font-size: 20px;
		color: #737373;
		background: #F2F2F2;
		border-radius: 4px;
		// background-color: $uni-bg-color-grey;
		// border-width: 1rpx;
		// border-style: solid;
		// border-color: $uni-border-color;
		// border-top-left-radius: $uni-border-radius-base;
		// border-bottom-left-radius: $uni-border-radius-base;
		// border-right-width: 0;
	}

	.uni-numbox__plus {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		justify-content: center;
		// width: 40%;
		width: $box-width;
		height: 100%;
		// height: $box-height;
		color: #737373;
		background: #F2F2F2;
		border-radius: 4px;
		// border-width: 1rpx;
		// border-style: solid;
		// border-color: $uni-border-color;
		// border-top-right-radius: $uni-border-radius-base;
		// border-bottom-right-radius: $uni-border-radius-base;
		// background-color: $uni-bg-color-grey;
		// border-left-width: 0;
	}

	.uni-numbox--text {
		font-size: 50rpx;
		color: $uni-text-color;
	}

	.uni-numbox--disabled {
		color: $uni-text-color-disable;
	}
</style>
