<template>
	<page>
		<view slot="body">			
			<view class="quit" @tap="loginOut" hover-class='hover'>
				退出登录
			</view>
		</view>
	</page>
</template>

<script>
	export default {
		data() {
			return {
			}
		},
		onLoad() {
		},
		methods:{
			/**
			 * 退出登录
			 */
			loginOut() {
				uni.reLaunch({
					url: '../../login/newlogin?logOut=1'
				})
				this.$http({
					url:this.$api.logout,
					success:(res)=>{
						if(res.code=='01'){
							uni.removeStorageSync('storeInfo')
							uni.removeStorageSync('storeList')
							uni.removeStorageSync('userInfo')
							uni.removeStorageSync('weixinInfo')
							uni.removeStorageSync('chooseGoodData')
							uni.removeStorageSync('token')
						}
					}
				})
			},
		}
	}
</script>

<style lang="scss">
	page{
		background-color: $page-bgcolor;
	}
	.quit{		
		width: 100%;
		text-align: center;
		background-color: #fff;
		padding: 40rpx 0;
		color: $red;
		font-size: 28rpx;
		border-top: 1rpx solid #F0F0F3;
	}
	.hover{
		background-color: #F2F2F2;
	}
</style>
