<template>
	<view>
		<view class="header" :style="{height:height+'rpx'}">
			<text class="title" :style="{paddingTop:paddingTop+'rpx'}">欢迎使用零售分销</text>
		</view>
		<!-- ,paddingTop:contentPadding+'rpx' -->
		<view class="content" :style="{top:'-'+marginTop+'rpx',paddingTop:contentPadding+'rpx'}">
			<!-- :class="upClass" -->
			<view class="manBox" :class="upClass">
				<!-- :class="popupClassK" -->
				<view class="boxS">
					<view class="box">
						<view class="item phone">
							<input type="number" @keyboardheightchange="inputFocus" v-model="telephone" placeholder-style="font-size: 32rpx; color: #B2B2B2;"
							 placeholder="请输入手机号" style="width: 70%;" />
							<view class="get">
								<text @tap="getCode" v-if="!showTime" :style="{opacity:telephone.length==11?'1':'0.4'}">{{tip}}</text>
								<view class="time" v-else>
									<uni-countdown :show-day="false" :show-hour="false" :show-minute="false" :second="second" @timeup="timeup" />
									<text>s</text>
								</view>
							</view>
						</view>
						<view class="item password">
							<input type="number" v-model="password" @keyboardheightchange="inputFocus" placeholder-style="font-size: 32rpx; color: #B2B2B2;"
							 placeholder="输入验证码" style="width: 100%;" />
						</view>
					</view>
					<view class="part" :class="popupClassK">
						<view class="item phone">
							<input type="number" v-model="telephone" @keyboardheightchange="inputFocus" placeholder-style="font-size: 32rpx; color: #B2B2B2;"
							 placeholder="请输入手机号" style="width: 100%;" />
						</view>
						<view class="item password">
							<input type="text" v-model="password" @keyboardheightchange="inputFocus" placeholder-style="font-size: 32rpx; color: #B2B2B2;"
							 placeholder="输入密码" style="width: 90%;" :password='showPass' />
							<text class="icon iconfont" :class="showPass?'icon-eye-off':'icon-eye'" @tap="isShowPass"></text>
						</view>
					</view>
				</view>
				<view class="errorMsg" :style="{option: errorMsg ? 1 : 0}">{{errorMsg}}</view>
				<!-- #ifndef H5 -->
				<button type="warn" class="loginBtn" open-type="getUserInfo" @getuserinfo="getAuth">登录</button>
				<!-- #endif -->
				<!-- #ifdef H5 -->
				<button type="warn" class="loginBtn" open-type="getUserInfo" @tap="login">登录</button>
				<!-- #endif -->
				<view class="code-pass" @tap='changeLogin'>
					{{isCode?'使用密码登录':'使用验证码登录'}}
					<text class="icon iconfont icon-arrow-right"></text>
				</view>
			</view>
		</view>
		<view class="kuka">
			<image src="../../static/kuka.png" mode=""></image>
		</view>
		<auth-pop ref='authPop' :class="authClass" @handleClick="completeAuth"></auth-pop>
	</view>
</template>

<script>
	import uniCountdown from '@/components/uni-countdown/uni-countdown.vue'
	import utils from '@/common/js/utils.js'
	import md5 from "@/common/js/md5.js"
	export default {
		components: {
			uniCountdown
		},
		data() {
			return {
				contentPadding: 116,
				paddingTop: 114,
				height: 390,
				marginTop: 120,
				telephone: '',
				password: '',
				popupClassK: '',
				tip: '获取验证码',
				isDisabled: false,
				// 是否验证码登录
				isCode: true,
				// 是否显示密码
				showPass: true,
				// 显示验证码倒计时
				showTime: false,
				// 剩余秒数
				second: 59,
				// 授权参数
				authorize: false,
				authClass: '',
				logOut: false,
				// 登录参数
				params: {
					telephone: '',
					passwd: '',
					identifyingCode: '',
					unionId: ''
				},
				// 微信参数
				wxParams: {
					code: '',
					encryptedData: '',
					iv: ''
				},
				upClass: '',
				// 登录失败信息
				errorMsg: ''
			}
		},
		onLoad(e) {
			this.popupClassK = 'none'
			this.logOut = e.logOut || true
			var system = uni.getSystemInfoSync();
			system.model = system.model.replace(' ', '');
			system.model = system.model.toLowerCase();
			let getHeight = system.safeArea.height
			this.height = getHeight / 100 * 35 * 2
			this.paddingTop = getHeight / 100 * 12 * 2
			this.marginTop = getHeight / 100 * 22
			if (system.model.indexOf('iphonex') != -1 || system.model.indexOf('iphone11') != -1) {
				this.paddingTop = this.paddingTop + 20
			}
		},
		onShow() {
			// #ifndef H5
			this.isAuth()
			// #endif
		},
		methods: {
			inputChange(e) {
				this.params = {
					telephone: this.telephone,
					identifyingCode: this.password
				}
			},
			// 授权判断
			isAuth() {
				wx.getSetting({
					success: res => {
						if (res.authSetting["scope.userInfo"]) {
							this.authorize = true
							if (this.logOut) {
								return false
							}
							this.getWxSettings()
						} else {
							this.authorize = false
							this.showPopup()
						}
					}
				})
			},
			// 授权弹窗
			showPopup() {
				this.authClass = 'show'
				this.$refs.authPop.showPopup(this.authClass)
			},
			// 获取授权
			getAuth(e) {
				if (e.detail.userInfo) {
					this.getWxSettings()
					this.authorize = true
				} else {
					this.$msg('请先完成授权')
				}
			},
			// 完成授权
			completeAuth(e) {
				this.wxParams = e
				this.authorize = true
			},
			// 获取微信参数
			getWxSettings(e) {
				uni.login({
					success: (res) => {
						this.wxParams.code = res.code
						uni.getUserInfo({
							success: res => {
								this.wxParams.encryptedData = res.encryptedData
								this.wxParams.iv = res.iv
								uni.setStorageSync('weixinInfo', res.userInfo)
								this.formSubmit()
							},
							fail: () => {
								this.$msg('获取微信params失败')
							}
						})
					},
					fail: () => {
						this.$msg('获取微信code失败')
					}
				})
			},
			// 获取验证码
			getCode() {
				if (!this.userLogin) {
					// #ifndef H5
					if (!this.authorize) {
						this.$msg('请先完成授权')
						return false
					}
					// #endif
					let validate = this.$validate.check({
						telephone: this.telephone
					}, this.$rules.phone)
					if (validate) {
						uni.request({
							url: this.$api.getMsgCode,
							method: 'POST',
							data: {
								telephone: this.telephone,
								type: '0'
							},
							success: res => {
								if (res.data.code == '02') {
									this.$msg(res.data.message)
								} else {
									this.showTime = true;
									this.second = 59;
								}
							}
						})
					} else {
						this.$msg(this.$validate.error)
					}
				}
			},
			// 微信授权登录
			formSubmit(e) {
				this.$http({
					url: this.$api.getWxUid,
					data: this.wxParams,
					success: res => {
						if (res.code == '01') {
							let unionId = res.bizObject
							this.params = {
								telephone: this.telephone,
								identifyingCode: this.password,
								unionId: unionId
							}
							this.login()
						} else {
							this.$msg(res.message)
						}
					}
				})
			},
			// 登录
			login() {
				let validate;
				// #ifndef H5
				// 若手机号验证码非空，走手机验证码登录逻辑
				validate = this.$validate.check(this.params, this.$rules.isWxLogin)
				// #endif
				
				// #ifdef H5
				this.params = {
					telephone: this.telephone,
					identifyingCode: this.password
				}
				// h5端只要手机号和验证码
				validate = this.$validate.check(this.params, this.$rules.isH5Login)
				// #endif
				if (!this.isCode) {
					this.pwLogin()
					return false
				}
				
				if (!validate) {
					// #ifdef H5
					this.$msg(this.$validate.error)
					return
					// #endif
					uni.showLoading({
						title: '登录中'
					})
					this.$http({
						url: this.$api.wxLogin,
						data: this.params,
						header: {
							"Content-Type": "application/x-www-form-urlencoded",
							'AUTH_TYPE': '1'
						},
						success: (res) => {
							if (res.code == '01') {
								this.setUserInfo(res)
							}
						}
					})
				} else {
					uni.showLoading({
						title: '登录中'
					})
					this.$http({
						url: this.$api.identifyLogin,
						data: this.params,
						header: {
							"Content-Type": "application/x-www-form-urlencoded",
							'AUTH_TYPE': '1'
						},
						success: (res) => {
							if (res.code == '01') {
								this.errorMsg = "";
								this.setUserInfo(res)
							} else {
								this.errorMsg = res.msg;
							}
						}
					})
				}
			},
			// 密码登录
			pwLogin() {
				let validate = this.$validate.check(this.params, this.$rules.passLogin)
				if (validate) {
					this.params.passwd = md5.hex_md5(this.password)
					uni.showLoading({
						title: '登录中'
					})
					this.$http({
						url: this.$api.pwLogin,
						data: this.params,
						header: {
							"Content-Type": "application/x-www-form-urlencoded",
							'AUTH_TYPE': '1'
						},
						success: (res) => {
							if (res.code == '01') {
								this.errorMsg = "";
								this.setUserInfo(res)
							} else {
								this.errorMsg = res.msg;
							}
						}
					})
				} else {
					this.$msg(this.$validate.error)
				}
			},

			// 倒计时结束
			timeup() {
				this.showTime = false;
				this.tip = '重新获取'
			},
			// 切换登录方式
			changeLogin() {
				this.isCode = !this.isCode;
				if (this.isCode) {
					this.popupClassK = 'show'
					setTimeout(() => {
						this.popupClassK = 'none'
					}, 100)
				} else {
					this.popupClassK = 'hide'
				}
				this.password = ''
			},
			inputFocus(e) {
				if (e.detail.height > 0 || e.detail.value > 0) {
					this.upClass = 'up'
					this.contentPadding = 48

				} else {
					this.upClass = 'down'
					this.contentPadding = 116
				}
			},
			inputblur() {
				this.contentPadding = 116
			},
			// 查看密码
			isShowPass() {
				this.showPass = !this.showPass
				this.$forceUpdate()
			},
			// 登录成功配置用户信息   
			setUserInfo(res) {
				this.params = {
					"auth_token": res.authToken,
					"user_code": res.usercode,
					"xAuthToken": res.xAuthToken,
					"auth_type": '1'
				}
				uni.setStorageSync('token', this.params)
				this.getInfo()
				// this.getAuthDataDealerList()
			},
			// 获取账号名和生效门店权限列表
			getInfo() {
				this.$http({
					url: this.$api.AuthDataInfo,
					success: (res) => {
						uni.setStorageSync('storeList', res.data.storeList);
						let userInfo = {
							'userName': res.data.userName,
							'userCode': res.data.userCode,
							'userPhone': res.data.personPhone,
							'personPhone': res.data.personPhone,
							'personId': res.data.personId,
							'personCode': res.data.personCode,
							'personName': res.data.personName,
							'personTypeList': res.data.personTypeList
						}
						uni.setStorageSync('userInfo', userInfo)
						let storeInfo = {
							'storeId': res.data.storeList[0].storeId,
							'storeName': res.data.storeList[0].storeName,
							'storeCode': res.data.storeList[0].storeCode,
							'orgId': res.data.storeList[0].orgId
						}
						uni.setStorageSync('storeInfo', storeInfo)
						this.getOrgParams()
						this.$msg('登录成功')
						uni.reLaunch({
							url: '/pages/index/index?jumpLogin=true'
						})
					}
				})
			},
			// 查询组织参数
			getOrgParams() {
				this.$http({
					url: this.$api.getOrgParams,
					success: res => {
						let orgParams = res.data;
						uni.setStorageSync('orgParams', orgParams)
					}
				})
			},
		}
	}
</script>

<style lang="scss">
	page {
		background: #F7F7F7;
	}

	@keyframes show {
		0% {
			transform: translateY(0);
		}

		100% {
			transform: translateY(-90rpx);
		}
	}

	@keyframes hide {
		0% {
			transform: translateY(-90rpx);
		}

		100% {
			transform: translateY(0);
		}
	}
	@keyframes showPart {
		0% {
			transform: translateY(232rpx);
		}

		100% {
			transform: translateY(0);
		}
	}
	@keyframes hidePart {
	
		0% {
			transform: translateY(0);
			
			
		}
		100% {
			transform: translateY(232rpx);
		
		}
	}
	.header {
		width: 100%;
		height: 30%;
		background-color: #E24646;

		.title {
			display: block;
			color: #FFFFFF;
			font-size: 52rpx;
			font-weight: 500;
			padding: 114rpx 0 0 48rpx;
		}
	}

	.content {
		width: 94%;
		height: 100%;
		background: #FFFFFF;
		box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.05);
		border-radius: 16rpx;
		margin: auto;
		padding: 116rpx 48rpx 250rpx;
		position: relative;

		.manBox {

			// height:580rpx;
			// background-color: #000000;
			// position: relative;
			// &.up{
			// 	animation: show 0.3s cubic-bezier(0, .79, .59, 1) both;
			// }
			&.down {
				animation: hide 0.3s cubic-bezier(0, .79, .59, 1) both;
			}
		}

		.boxS {
			position: relative;
			width: 100%;
			height: 232rpx;
			overflow: hidden;
			
			.part {
				width: 100%;
				position: absolute;
				// top: 0;
				// transform: translateY(0);
				// visibility: visible;
				// transition: all 0.3s;
				background: #FFF;
				// z-index: 10;
				&.show {
					z-index: 10;
					animation: hidePart 0.15s linear;
					// transform: translateY(232rpx);
				}
				&.hide {
					z-index: 10;
					animation: showPart 0.15s linear;
				}
				&.none {
					z-index: 8;
				}
			}

			.box {
				position: absolute;
				// top: 0;
				width: 100%;
				// opacity: 1;
				z-index: 9;
				background: #FFF;
			}
		}
		
		.errorMsg {
			color: #E42727;
			font-size: 24rpx;
			height: 40rpx;
			line-height: 40rpx;
			margin-top: 8rpx;
		}

		.item {
			box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.07);
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 96rpx;

			input {
				height: 100%;
			}

			.get {
				color: #E42727;
				font-size: 28rpx;
				font-weight: 600;
			}
		}

		.phone {
			.time {
				display: flex;
				align-items: baseline;
			}
		}

		.password {
			margin-top: 40rpx;

			.icon {
				width: 10%;
				text-align: center;
				padding: 20rpx 0;
				font-size: 32rpx;
				color: #B2B2B2;
			}
		}

		.loginBtn {
			margin-top: 32rpx;
			color: #fff;
			height: 80rpx;
			line-height: 80rpx;
			font-size: 28rpx;
			font-weight: 600;
			z-index: 15;
		}

		.loginBtn::after {
			border: 0 !important;
		}

		.code-pass {
			width: 45%;
			margin: 40rpx auto 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #737373;
			font-size: 28rpx;
			line-height: 80rpx;

			.icon {
				padding-left: 10rpx;
				font-size: 36rpx;
			}
		}
	}

	.kuka {
		position: fixed;
		bottom: 60rpx;
		width: 100%;
		text-align: center;

		image {
			width: 370rpx;
			height: 30rpx;
		}
	}
</style>
