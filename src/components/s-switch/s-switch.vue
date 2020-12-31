<template>
	<view class="s-switch-container">
		<view class="s-switch-item" :class="item.selected ? 's-switch-selected' : stepIndex==2 ? 'two' :''" @click="selectItem(item)"
		 v-for="item in switchArr" :key="item.key">
			{{item.value}}
		</view>
	</view>
</template>

<script>
	export default {
		name: 'SSwitch',
		props: {
			defaultValue: {
				type: Number,
				default: 0
			},
			stepIndex: {
				type: Number,
				default: 3
			},
			switchList: {
				type: Array,
				default: [{
						key: 0,
						value: '是'
					},
					{
						key: 1,
						value: '否'
					}
				]
			}
		},
		data() {
			return {
				switchArr: [],
				zIndex: null
			}
		},
		methods: {
			selectItem(info) {
				if (info.selected === false) {
					for (const item of this.switchArr) {
						if (info.key === item.key) {
							item.selected = true
							this.$emit('switchValue', item)
						} else {
							item.selected = false
						}
					}
				}
			}
		},
		created() {
			for (let i = 0; i < 2; i++) {
				const arrItem = {
					key: this.switchList[i].key,
					value: this.switchList[i].value,
					selected: this.defaultValue === this.switchList[i].key ? true : false
				}
				// if (this.switchList[i].key === this.defaultValue) {
				// 	this.$emit('switchValue', arrItem)
				// }
				this.switchArr.push(arrItem)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.s-switch-container {
		padding: 2upx;
		display: flex;
		flex-direction: row;
		width: 192upx;
		height: 64upx;
		align-items: center;
		border-radius: 100upx;
		font-size: 24upx;
		background: #EBF4F3;
	}

	.two {
		z-index: 10000000;
		background: #FFFFFF;
	}

	.s-switch-item {
		color: #2B6962;
		width: 92upx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 40rpx;
		height: 52rpx;
	}

	.s-switch-item:first-child {
		margin-left: 4rpx;
	}

	.s-switch-selected {
		color: #ffffff;
		border-radius: 40upx;
		background: #2B6962;
		
	}
</style>
