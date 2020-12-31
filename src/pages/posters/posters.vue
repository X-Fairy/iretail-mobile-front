<template>
	<page :customHeader='true' :isSwitchPage='true' headerBG='#4C0101'>
		<view slot="header" class="header-nav">
			<text class="icon iconfont icon-arrow-left" @tap="back"></text>
		</view>
		<view slot="body">
			<view class="posters-out">
				<view class="posters-contet">
					<view class="img-box" :style="{'width':widthBox,'height':imgHeight+'px','margin-top':headerHeight+10+'px'}">
						<text v-if="onLoadShow==1" class="icon iconfont icon-loading Rotation icon-loading-active1"></text>
						<text v-else-if="onLoadShow==2" class="icon iconfont icon-loading Rotation icon-loading-active2"></text>
						<text v-else-if="onLoadShow==3" class="icon iconfont icon-loading Rotation icon-loading-active3"></text>
						<image class="class-img" show-menu-by-longpress mode="aspectFit" :src="path" alt=""></image>
					</view>
					<!-- <lime-painter v-show="isShowPainter" :isRenderImage="isRenderImage" custom-style="position: fixed; left: 200%;" :board="base" @success="saveImage" @fail="failCanvas"></lime-painter> -->
					<view class="tips"  hover-class="hover">长按上图分享好友</view>
					<!-- #ifndef H5 -->
					<view class="save-button" @tap="saveClick" hover-class="hover">保存到相册</view>
					<!-- #endif -->
				</view>
			</view>
		</view>
	</page>
</template>

<script>
	// import limePainter from "@/components/lime-painter"
	import postersData from "./posters.js"

	export default {
		components: {
			// limePainter,
		},
		data() {
			return {
				coverImg: require('@/static/img/icon/cover.png'),
				uploadParams: {
					mainType: 'salorder',
					subType: ''
				},
				onLoadShow: null,
				sharkMargin: "30rpx auto 0rpx",
				imgHeight: "920rpx",
				isShowPainter: false, //canvas
				widthBox: '80%',
				heightBox: 449, //590
				path: "", //img
				isRenderImage: true, //是否下载
				// isShowPainter:false,
				shopData: [], //序号
				imgParams: {
					orderNo: '', // 订单号
					bgUrl: '', // 背景图
					avatarUrl: '', // 用户头像
					saleName: '', // 用户名称
					totalPrice: '', // 总金额
					payPrice: '', // 实际支付
					productList: '', // 货号list
					storeName: '', // 门店名称
				},
				base: {},
				equipmentObj: {
					width: 253,
					height: 449
				},
				userInfor: {},
				storeInfo: {
					storeName: "",
				},
				headerHeight: 0,
			};
		},
		onLoad(option) {
			this.orderId = option.orderId;
			this.showInit(this.orderId);
		},
		methods: {
			failCanvas() {
				uni.showToast({
					title: '海报生成失败',
					icon: 'none',
					duration: 2000
				})
			},
			// 上传图片
			uploadSuccess(e) {
				let tmp = e.imageId
				this.orderForm.attachmentId = tmp.join(',')
			},
			// 删除图片
			uploadRemove(e) {
				let tmp = e.imageId
				this.orderForm.attachmentId = tmp.join(',')
			},
			back() {
				this.isShowPainter = !this.isShowPainter;
				uni.navigateBack(1);
			},
			init() {
				this.headerHeight = uni.getStorageSync("headerHeight");
				this.storeInfo = uni.getStorageSync("storeInfo");
				const {
					windowWidth,
					windowHeight
				} = uni.getSystemInfoSync();
				this.equipmentObj.height = windowHeight;
				this.imgHeight = windowHeight * 0.74;
				let margin = windowHeight * 0.05;
				this.sharkMargin = `${margin}px auto 30rpx`;
			},
			//保存
			saveClick() {
				wx.getSetting({
					success: (res)=> {
						console.log(res.authSetting["scope.writePhotosAlbum"])
						/**授权，则调用相册**/
						if (res.authSetting["scope.writePhotosAlbum"] == true) {
							this.saveimg();
						} else if (res.authSetting["scope.writePhotosAlbum"] === false) {
							/**未授权，则打开授权页面，让用户授权**/
							wx.openSetting({
								success: (res) => {
									/**授权成功，则保存图片，失败则不保存**/
									if (res.authSetting["scope.writePhotosAlbum"] == true) {
										this.saveimg();
									}
								}
							})
						} else {
							this.saveimg();
						}
					},
					fail: (res) =>{
						console.log("打开设置失败", res)
					}
				})

				
			},
			saveimg(){
				uni.downloadFile({
					url: this.path,
					success: (res) => {
						if (res.statusCode === 200) {
							uni.saveImageToPhotosAlbum({
								filePath: res.tempFilePath,
								success: (res) => {
									uni.showToast({
										title: '保存相册成功',
										icon: 'none',
										duration: 2000
									})
								},
								fail: (res) => {
									uni.showToast({
										title: "保存失败，请稍后重试",
										icon: "none"
									});
								}
							});
						}
					},
					fail: (res) => {
						console.log(res)
					}
				})
			},
			//绘制图片链接
			saveImage(e) {
				this.onLoadShow = 3;
				if (e) {
					this.path = e;
					console.timeEnd();
					this.onLoadShow = null;
				} else {
					this.onLoadShow = 4;
				}
			},
			calculateFun(data, totalPrice, chargedTotal, orderNo, salesName) {
				var imgData;
				this.userInfor = uni.getStorageSync("weixinInfo");
				if (uni.getStorageSync("imageData")) {
					imgData = JSON.parse(uni.getStorageSync("imageData"))
				}
				if (this.userInfor.avatarUrl) {
					data[2].url = uni.getStorageSync('uploadImg') ? uni.getStorageSync('uploadImg') : this.userInfor.avatarUrl;
				} else {
					data[2].url = this.coverImg;
				}
				if (uni.getStorageSync("userInfo").personName) {
					data[3].text = salesName;
					// data[3].text = uni.getStorageSync("userInfo").personName; //
				}

				data[4].text = totalPrice + ''; // 金额

				// 20000及以上：人中龙凤。10000-20000（包括10000，不包括20000）：百里挑一。10000以下：大吉大利
				// debugger
				if (totalPrice >= 20000) {
					data[1].url = "https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/eedfc2f9bd8846d2a3a72ae42637aee9.png"
				} else if (totalPrice >= 10000 && totalPrice < 20000) {
					data[1].url = "https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/ee37ea9e1eee4c929e9998e2ffb0ab8b.png";
				} else {
					data[1].url = "https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/b3aa2d609be243af90eab4b6fe7eedbe.png"
				}
				data[5].text = "实付 " + chargedTotal; //实付金额
				data[data.length - 2].text = this.storeInfo.storeName; //门店
				data[data.length - 1].text = orderNo; //单号
			},
			getGenerateImg(orderNo, bgUrl, saleName, totalPrice, payPrice, productList) {
				let avatarUrl;
				// #ifndef H5
				avatarUrl = uni.getStorageSync('uploadImg') ? uni.getStorageSync('uploadImg') : uni.getStorageSync(
							'weixinInfo').avatarUrl;
				// #endif
				// #ifdef H5
				avatarUrl = 'https://kuka-iretail-test.oss-cn-hangzhou.aliyuncs.com/salorder/e1989cac833e44f9802476e5213567cf.png';
				// #endif
				this.$http({
					url: this.$api.generateImg,
					data: {
						orderNo: orderNo, // 订单号
						bgUrl: bgUrl, // 背景图
						avatarUrl: avatarUrl, // 用户头像
						saleName: saleName, // 销售人员
						totalPrice: totalPrice, // 总金额
						payPrice: '实付 ' + payPrice, // 实际支付
						productList: productList, // 货号list
						storeName: uni.getStorageSync('storeInfo').storeName, // 门店名称
					},
					success: (res) => {
						this.onLoadShow = 3;
						if (res.code == '01') {
							this.path = res.data.fileUrl;
							this.onLoadShow = null;
						} else {
							this.onLoadShow = 4;
							this.failCanvas();
						}
					}
				})
			},

			getOrderDetailApi(orderId) {
				this.$http({
					url: this.$api.getOrderDetail,
					data: {
						orderId: orderId
					},
					success: res => {
						if (res.code == '01') {
							// console.timeEnd();
							this.onLoadShow = 2;
							let data = res.bizObject;
							//data.totalPrice; //总价
							//data.selectListSales[0].orderNo; //订单号
							let productArray = [];

							if (data.selectListItem.length > 0) {
								data.selectListItem.forEach(item => {
									if (item.productNo) {
										productArray.push(item.productNo);
									}
								})
							}
							this.isShowPainter = true;
							if (productArray.length > 6) {
								this.shopData.priceList = productArray.splice(0, 6);
							} else {
								this.shopData.priceList = productArray;
							}
							// this.base = postersData(this.shopData).base;
							var totalPrice = data.totalPrice ? data.totalPrice : 0;
							var chargedTotal = data.chargedTotal ? data.chargedTotal : 0;
							var orderNo = data.orderNo ? data.orderNo : "";
							var bgUrl = uni.getStorageSync('bgColor') ? uni.getStorageSync('bgColor') :
								'https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/7e15369de892429880435d6bc242c2cf.png';
							// if (totalPrice >= 20000) {
							// 	bgUrl = "https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/140568fa23e64191820b87d4422de3a0.png"
							// } else if (totalPrice >= 10000 && totalPrice < 20000) {
							// 	bgUrl = "https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/39ea7d43336745258a7734a3362c8872.png"
							// } else {
							// 	bgUrl = "https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/7e15369de892429880435d6bc242c2cf.png"
							// }
							var salesName = data.selectListSales[0].salesName ? data.selectListSales[0].salesName : "";
							this.getGenerateImg(orderNo, bgUrl, salesName, totalPrice, chargedTotal, this.shopData.priceList);
							// this.calculateFun(this.base.views, totalPrice, chargedTotal, orderNo,salesName);
						}
					},
					fail: res => {
						uni.showToast({
							title: '详情获取失败',
							icon: 'none',
							duration: 1000 * 30
						})
					}
				})
			},

			showInit(orderId) {
				if (orderId) {
					this.onLoadShow = 1;
					this.getOrderDetailApi(orderId);
					this.init();
				} else {
					this.onLoadShow = 4;
				}
			}
		}
	}
</script>

<style lang="scss">
	// $bgred:#E42727;
	// $blue: #191A46;
	// $orange: #FF8D4E;
	// $brown: #AD946B;
	// $gray: #F6F6F8;
	// $black: #818199;
	.icon-loading-active1 {
		color: $black;
	}

	.icon-loading-active2 {
		color: $orange;
	}

	.icon-loading-active3 {
		color: $bgred;
	}

	.icon-loading-active4 {
		color: $blue;
	}


	.icon-loading {
		display: block;
		width: 50rpx;
		height: 50rpx;
		font-size: 50rpx;
		position: fixed;
		left: 46%;
		top: 44%;
	}

	@-webkit-keyframes rotation {
		from {
			-webkit-transform: rotate(0deg);
		}

		to {
			-webkit-transform: rotate(360deg);
		}
	}

	.Rotation {
		-webkit-transform: rotate(360deg);
		animation: rotation 2s linear infinite;
		-moz-animation: rotation 2s linear infinite;
		-webkit-animation: rotation 2s linear infinite;
		-o-animation: rotation 2s linear infinite;
	}

	.header-nav {
		.icon-arrow-left {
			padding-left: 30rpx;
			color: #fff;
			font-size: 40rpx;
		}
	}

	.posters-out {
		width: 100%;
		height: 100%;
		background-color: #AA2C17;

		.shark-button {
			width: 70%;
			height: 80rpx;
			line-height: 80rpx;
			background: #AA2C17;
			color: #F7C385;
			text-align: center;
			font-size: 28rpx;
			border-radius: 8rpx;
		}
		.tips{
			text-align: center;
			color: #F7C385;
			font-size: 28rpx;
			padding-top: 20rpx;
			opacity: 0.7;

		}

		.save-button {
			width: 70%;
			height: 80rpx;
			line-height: 80rpx;
			color: #F7C385;
			text-align: center;
			font-weight: 500;
			font-size: 28rpx;
			background: #AA2C17;
			margin: 30rpx auto;
			border-radius: 16rpx;

			&.hover {
				background: #941B07;
			}
		}
	}

	.posters-contet {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #4C0101;
		overflow: auto;
	}

	.img-box {
		margin: 0rpx auto 0rpx;
	}

	.class-img {
		width: 100%;
		height: 100%;
		display: inline-block;
	}

	.button-down {
		margin-top: 20rpx;
	}
</style>
