<template>
	<view>
		<view class="setList">
			<!-- #ifndef H5 -->
			<view class="item" hover-class='hover' @tap='handleClick'>
				<view class="left">
					<text>头像</text>
				</view>
				<view class="right">
					<image :src="avatarUrl" mode="" class="img"></image>
					<text class="icon iconfont icon-arrow-right"></text>
				</view>
			</view>
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<view class="item">
				<view class="left">
					<text>头像</text>
				</view>
				<view class="right">
					<image src="https://kuka-iretail-test.oss-cn-hangzhou.aliyuncs.com/salorder/e1989cac833e44f9802476e5213567cf.png" mode="" class="img"></image>
				</view>
			</view>
			<!-- #endif -->
			<view class="item">
				<view class="left">
					<text>海报背景</text>
				</view>
			</view>
		</view>
		<view class="bgImgList">
			<view class="bgUrl" v-for="(ele,index) in bgImgList" :key="index">
				<image :src="ele" mode="" class="img" @tap="imgBigClick(index)"></image>
				<view class="check" @tap="radioChange(index)">
					<radio :value="ele" :checked="current==index?true:false" style="transform:scale(0.8)" color="#D31311" />
					<!-- <checkbox :value="ele" :checked="current==index?true:false" style="transform:scale(0.7)" color="#D31311"  /> -->
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				avatarUrl: uni.getStorageSync('uploadImg') ? uni.getStorageSync('uploadImg') : uni.getStorageSync(
					'weixinInfo').avatarUrl,
				// bgImgList: [
				// 	'https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/140568fa23e64191820b87d4422de3a0.png',
				// 	'https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/57a2b3fb10314dc380b77af217942af8.png'
				// ],
				bgImgList: [
					'https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/7e15369de892429880435d6bc242c2cf.png'
				],
				current: 0,
			};
		},
		onShow() {
			if (uni.getStorageSync('bgColor')) {
				for (let i in this.bgImgList) {
					if (this.bgImgList[i] == uni.getStorageSync('bgColor')) {
						this.current = i
					}
				}
			} else {
				this.current = 0
			}
		},
		methods: {
			// 更换头像
			handleClick() {
				wx.chooseImage({
					count: 1, // 默认9
					sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
					success: (res) => {
						// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
						var imgPaths = res.tempFilePaths
						this.uploadImage(imgPaths[0]);
					}
				})
			},
			//上传图片
			uploadImage(url) {
				let token = uni.getStorageSync('token')
				let orgId = uni.getStorageSync('storeInfo').orgId || null;
				let header;
				// #ifndef H5
				header = {
					"Content-Type": "multipart/form-data",
					'accept': 'application/json',
					"auth_token": token.auth_token,
					"user_code": token.user_code,
					"x-auth-token": token.xAuthToken,
					"auth_type": "1",
					"x-auth-mobile": "1",
					"org_id": orgId
				};
				// #endif
				// #ifdef H5
				header = {
					'accept': 'application/json',
					"auth_token": token.auth_token,
					"user_code": token.user_code,
					"x-auth-token": token.xAuthToken,
					"auth_type": "1",
					"x-auth-mobile": "1",
					"org_id": orgId
				};
				// #endif
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url: this.$api.baseUrl + this.$api.upload,
						name: 'file',
						header: header,
						filePath: url,
						formData: {
							mainType: 'salorder',
							subType: ''
						},
						success: (res) => {
							if (res.statusCode == 200) {
								uni.setStorageSync('uploadImg', JSON.parse(res.data).data.fileUrl)
								this.avatarUrl = JSON.parse(res.data).data.fileUrl
							} else {

							}
						},
						fail: (res) => {

						}
					})
				})

			},
			// 查看大图
			imgBigClick(e) {
				var arr = [];
				arr[0] = this.bgImgList[e];
				uni.previewImage({
					urls: arr,
					current: e,
				});

			},
			// 背景设置
			radioChange(e) {
				this.current = e
				uni.setStorageSync('bgColor', this.bgImgList[e])
			},
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
			padding: 24rpx 32rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1rpx solid #F0F0F3;

			.left {}

			.right {
				display: flex;
				align-items: center;
				justify-content: right;

				.img {
					width: 100rpx;
					height: 100rpx;
					border-radius: 10rpx;
					margin-right: 16rpx;
				}

				.radio {
					display: flex;
					align-items: center;
					justify-content: flex-start;
					margin-left: 20rpx;
				}
			}

		}
	}

	.bgImgList {
		display: flex;
		justify-content: left;
		flex-wrap: wrap;
		padding: 32rpx;
		background-color: #FFFFFF;

		.bgUrl {
			position: relative;
			margin: 0 24rpx 24rpx 0;

			.img {
				width: 200rpx;
				height: 340rpx;
			}

			.check {
				// background-color: rgba($color: #000000, $alpha: 0.5);
				position: absolute;
				bottom: 20rpx;
				right: 0;
			}
		}

		.more {
			text-align: center;
		}
	}
</style>
