<template>
	<page>
		<view slot="body">
			<view class="userInfo" @tap="toStore">
				<view class="left">
					<image :src="weixinInfo.avatarUrl || coverImg" mode="" class="auto"></image>
					<view class="infos">
						<view class="name">
							{{userInfo.userName}}
						</view>
						<view class="store">
							{{storeName}}
						</view>
					</view>
				</view>

				<view class="right">
					<view class="">
						切换门店
					</view>
					<text class="icon iconfont icon-list-icon-next"></text>
				</view>
			</view>
			<view class="place"></view>

			<view class="setList">
				<view class="item" v-for="(item,index) in tabList" :key="index" @tap="toPage(item.url)" hover-class='hover'>
					<view class="left">
						<text class="iconfont" :class="item.icon"></text>
						<text>{{item.title}}</text>
					</view>
					<text class="icon iconfont icon-arrow-right"></text>
				</view>
			</view>
		</view>
	</page>
</template>

<script>
	export default {
		data() {
			return {
				coverImg: require('@/static/logo.png'),
				// 微信用户信息
				weixinInfo: {},
				// 登录信息
				userInfo: null,
				// 门店列表
				// 当前门店
				storeName: '',
				// 设置列表
				tabList: [{
						title: '意向金列表',
						icon: 'icon-receipt',
						url: '/pagesB/receiptList/receiptList'
					},
					{
						title: '海报设置',
						icon: 'icon-Image',
						url: './setting/setting'
					},
					{
						title: '打印机配置',
						icon: 'icon-printer',
						url: '/pagesB/setPrint/setPrint'
					},
					{
						title: '发版日志',
						icon: 'icon-file',
						url: '/pagesB/update/update'
					},
					{
						title: '应用设置',
						icon: 'icon-setting2',
						url: './loginOut'
					},
					{
						title: '身份认证',
						icon: 'icon-setting2',
						url: '/pagesB/authentication/authentication'
					}
					// {
					// 	title: '在线客服',
					// 	icon: 'icon-customer',
					// 	url: '/pagesB/webViwe/webViwe?url=' + encodeURIComponent(
					// 		'https://cschat.antcloud.com.cn/index.htm?tntInstId=4Ch_IQbR&scene=SCE00038833#/')
					// }
				],
			}
		},
		onLoad() {
			this.userInfo = uni.getStorageSync('userInfo');
			// #ifdef H5
			this.tabList.splice(2, 1);
			// #endif
		},
		onShow() {
			this.storeName = uni.getStorageSync('storeInfo').storeName;
			// #ifndef H5
			uni.getUserInfo({
				success: res => {
					this.weixinInfo = res.userInfo
					uni.setStorageSync('weixinInfo', res.userInfo)
				},
				fail: () => {
					this.$msg('获取用户信息失败')
				}
			})
			// #endif
		},
		methods: {
			// 切换门店
			toStore() {
				uni.navigateTo({
					url: 'store/store'
				})
			},
			toPage(e){
				if (uni.getStorageSync('storeInfo').storeName == '门店全局') {
					if(e=='/pagesB/receiptList/receiptList'){
						this.$msg('门店全局下不可查看意向金列表')
						return
					}					
				}
				this.$toPage(e)
			}
		}

	}
</script>

<style lang="scss">
	page {
		background-color: $page-bgcolor;
	}

	.setList {
		background-color: #fff;

		.item {
			font-size: 28rpx;
			padding: 20rpx 32rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1rpx solid #F0F0F3;

			.left {
				display: flex;
				align-items: center;
				justify-content: left;

				.iconfont {
					font-size: 36rpx;
					color: #909399;
					// width: 46rpx;
					margin-right: 15rpx;
					// height: 46rpx;
				}
			}

			.icon {
				font-size: 30rpx;
				color: #ACACBC;
			}

			.radios {
				display: flex;
				align-items: center;

				.radio {
					display: flex;
					align-items: center;
					justify-content: flex-start;
					margin-left: 20rpx;
				}
			}
		}
	}

	.place {
		width: 100%;
		height: 20rpx;
		background-color: $page-bgcolor;
	}

	.userInfo {
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #fff;


		.left {
			display: flex;
			justify-content: left;
			align-items: center;
			width: 78%;

			.auto {
				width: 150rpx;
				height: 150rpx;
				border-radius: 50%;

			}

			.infos {

				margin-left: 20rpx;

				.name {
					font-weight: 600;
					font-size: 30rpx;
				}

				.store {
					font-size: 26rpx;
					color: $uni-text-color-grey;
					padding-top: 10rpx;
				}
			}

		}

		.right {
			width: 20%;
			font-size: 24rpx;
			color: $uni-text-color-grey;
			flex-wrap: nowrap;
			display: flex;
			justify-content: left;
			align-items: center;
		}
	}
</style>
