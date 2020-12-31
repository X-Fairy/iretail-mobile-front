<template>
	<view class="uni-steps">
		<view :class="[direction==='column'?'uni-steps__column':'uni-steps__row']">
			<view :class="[direction==='column'?'uni-steps__column-text-container':'uni-steps__row-text-container']">
				<view v-for="(item,index) in options" :key="index" :class="[direction==='column'?'uni-steps__column-text':'uni-steps__row-text']">
				
					<text v-if="item.status==1" :style="{color:penddingColor}" :class="[direction==='column'?'uni-steps__column-title':'uni-steps__row-title']">{{item.stepName}}</text>
					<text v-if="item.status==0" :style="{color:unfinishedColor}" :class="[direction==='column'?'uni-steps__column-title':'uni-steps__row-title']">{{item.stepName}}</text>
					<text v-if="item.status==2" :style="{color:finishColor}" :class="[direction==='column'?'uni-steps__column-title':'uni-steps__row-title']">{{item.stepName}}</text>
				</view>
			</view>
			<view :class="[direction==='column'?'uni-steps__column-container':'uni-steps__row-container']">
				<view :class="[direction==='column'?'uni-steps__column-line-item':'uni-steps__row-line-item']" v-for="(item,index) in options"
				 :key="index">
					<view v-if="item.status==1" :style="{borderColor:penddingColor}" :class="[direction==='column'?'uni-steps__column-check':'uni-steps__row-check']" >
						
						<text :style="{color:penddingColor}" class="icon iconfont icon-arrow-circlefilled" style="font-size: 32rpx;"></text>
					</view>
					<view v-if="item.status==2" :style="{borderColor:finishColor}" :class="[direction==='column'?'uni-steps__column-check':'uni-steps__row-check']" >
					
						<text :style="{color:finishColor}" class="icon iconfont icon-arrow-circlefilled" style="font-size: 32rpx;"></text>
					</view>
					<view v-if="item.status==0" :style="{borderColor:unfinishedColor}" :class="[direction==='column'?'uni-steps__column-check':'uni-steps__row-check']" >
						<text :style="{color:unfinishedColor}" class="icon iconfont icon-arrow-circlefilled" style="font-size: 32rpx;"></text>
					
					</view>
					<!-- <view :class="[direction==='column'?'uni-steps__column-circle':'uni-steps__row-circle']" v-else ></view> -->
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'UniSteps',
		
		props: {
			direction: {
				// 排列方向 row column
				type: String,
				default: 'row'
			},
			//  0表示未执行状态， 1表示完成状态，  2表示部分完成状态
			penddingColor: {
				// 全部完成 1
				type: String,
				default: '#5CB37F'
			},
			unfinishedColor: {
				// 未完完成 0
				type: String,
				default: '#DEDEDE'
			},
			 finishColor : {
				// 部分完成 2
				type: String,
				default: '#F5AD40'
			},
			active: {
				// 当前步骤
				type: Number,
				default: 0
			},
			options: {
				type: Array,
				default () {
					return []
				}
			} // 数据
		},
		data() {
			return {}
		},
	}
</script>

<style lang="scss" scoped>
	.uni-steps {
		/* #ifndef APP-NVUE */
		display: flex;
		width: 100%;
		/* #endif */
		/* #ifdef APP-NVUE */
		flex: 1;
		/* #endif */
		flex-direction: column;
	}

	.uni-steps__row {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
	}

	.uni-steps__column {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row-reverse;
	}

	.uni-steps__row-text-container {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
	}

	.uni-steps__column-text-container {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		flex: 1;
	}

	.uni-steps__row-text {
		/* #ifndef APP-NVUE */
		display: inline-flex;
		/* #endif */
		flex: 1;
		flex-direction: column;
	}

	.uni-steps__column-text {
		padding: 6px 0px;
		
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
	}

	.uni-steps__row-title {
		font-size: 13px;
		line-height: 16px;
		text-align: center;
	}

	.uni-steps__column-title {
		font-size: 13px;
		text-align: left;
		line-height: 18px;
	}

	.uni-steps__row-desc {
		font-size: 12px;
		line-height: 14px;
		text-align: center;
	}

	.uni-steps__column-desc {
		font-size: $uni-font-size-sm;
		text-align: left;
		line-height: 18px;
	}

	.uni-steps__row-container {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
	}

	.uni-steps__column-container {
		/* #ifndef APP-NVUE */
		display: inline-flex;
		/* #endif */
		// width: 30px;
		flex-direction: column;
	}

	.uni-steps__row-line-item {
		/* #ifndef APP-NVUE */
		display: inline-flex;
		/* #endif */
		flex-direction: row;
		flex: 1;
		height: 14px;
		line-height: 14px;
		align-items: center;
		justify-content: center;
	}

	.uni-steps__column-line-item {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		flex: 1;
		align-items: center;
		justify-content: center;
		padding-right: 10rpx;
	}

	.uni-steps__row-line {
		flex: 1;
		height: 1px;
		background-color: $uni-text-color-grey;
	}

	.uni-steps__column-line {
		width: 1px;
		background-color: $uni-text-color-grey;
	}

	.uni-steps__row-line--after {
		transform: translateX(1px);
	}

	.uni-steps__column-line--after {
		flex: 1;
		transform: translate(0px, 1px);
	}

	.uni-steps__row-line--before {
		transform: translateX(-1px);
	}

	.uni-steps__column-line--before {
		height: 6px;
		transform: translate(0px, -1px);
	}

	.uni-steps__row-circle {
		width: 5px;
		height: 5px;
		border-radius: 100px;
		background-color: $uni-text-color-grey;
		margin: 0px 3px;
	}

	.uni-steps__column-circle {
		width: 14px;
		height: 14px;
		border-radius: 100px;
		border:1px solid  #ACACBC;
		margin: 4px 0px 5px 0px;
	}

	.uni-steps__row-check {
		margin: 0px 6px;
	}

	.uni-steps__column-check {
		height: 14px;
		line-height: 14px;
		margin: 2px 0px;
	}
</style>
