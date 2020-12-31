<template>
	<view>
		<view class="tui-container">
			<view class="tui-upload-box">
				<view v-if="isShowAdd" class="tui-upload-add" @tap="chooseImage">
					<view class="tui-upload-icon tui-icon-plus"></view>
				</view>
				<view class="tui-image-item" v-for="(item,index) in imageList" :key="index">
					<image :src="item" class="tui-item-img" @tap.stop="previewImage(index)" mode="aspectFill"></image>
					<text v-if="!forbidDel" class="icon iconfont icon-x" @tap.stop="delImage(index)"></text>
					<view v-if="statusArr[index]!=1" class="tui-upload-mask">
						<!-- <view class="tui-upload-loading" v-if="statusArr[index]==2"></view> -->
						<text class="tui-tips">{{statusArr[index]==2?'上传中...':'上传失败'}}</text>
						<view class="tui-mask-btn" v-if="statusArr[index]==3" @tap.stop="reUpLoad(index)" hover-class="tui-hover"
						 :hover-stay-time="150">重新上传</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'tuiUpload',
		props: {
			//初始化图片路径
			value: {
				type: Array,
				default: ()=> {
					return []
				}
			},
			//禁用删除
			forbidDel: {
				type: Boolean,
				default: false
			},
			//禁用添加
			forbidAdd: {
				type: Boolean,
				default: false
			},
			//服务器地址
			serverUrl: {
				type: String,
				default: ""
			},
			// 参数
			params: {
				type: Object,
				default: null
			},
			//限制数
			limit: {
				type: Number,
				default: 10
			},
			//项目名，默认为 file
			fileKeyName: {
				type: String,
				default: "file"
			},

		},
		data() {
			return {
				//图片地址
				imageList: [],
				//上传状态：1-上传成功 2-上传中 3-上传失败
				statusArr: [],
				// 图片ID：
				imageId: []
			}
		},
		watch: {
			value(val) {
				this.statusArr = []
				this.imageId = []
				this.imageList = []
				let urlList = this.$utils.filterAttachmentUrl(val)
				this.imageList = urlList;
				let idList = this.$utils.filterAttachmentId(val)
				this.imageId = idList
				for (let item of this.imageList) {
					this.statusArr.push("1")
				}
			}
		},
		computed: {
			isShowAdd() {
				let isShow = true;
				if (this.forbidAdd || (this.limit && this.imageList.length >= this.limit)) {
					isShow = false;
				}
				return isShow
			}
		},
		methods: {
			// 重新上传
			reUpLoad(index) {
				this.$set(this.statusArr, index, "2")
				// this.change()
				this.uploadImage(index, this.imageList[index]).then(() => {
					this.change()
				}).catch(() => {
					this.change()
				})
			},
			change() {
				let status = ~this.statusArr.indexOf("2") ? 2 : 1
				if (status != 2 && ~this.statusArr.indexOf("3")) {
					// 上传失败
					status = 3
				}
				this.$emit('complete', {
					status: status,
					imgArr: this.imageList,
					len: this.imageList.length,
					imageId: this.imageId
				})
			},
			chooseImage() {
				uni.chooseImage({
					count: this.limit - this.imageList.length,
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album', 'camera'],    //这个是图片来源，相册或者相机
					success: (e) => {
						let imageArr = [];
						for (let i = 0; i < e.tempFilePaths.length; i++) {
							let len = this.imageList.length;
							if (len >= this.limit) {
								uni.showToast({
									title: `最多可上传${this.limit}张图片`,
									icon: "none"
								});
								break;
							}
							let path = e.tempFilePaths[i]
							imageArr.push(path)
							this.imageList.push(path)
							this.statusArr.push("2")
						}
						
						let uploadChange = false;
						let start = this.imageList.length - imageArr.length;
						for (let j = 0; j < imageArr.length; j++) {
							let index = start + j
							uploadChange = true
							this.uploadImage(index, imageArr[j]).then(() => {
								this.change()
							}).catch(() => {
								this.change()
							})
						}
						
						if (!uploadChange) {
							this.change()
						}
					}
				})
			},
			uploadImage(index, url) {
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
						name: this.fileKeyName,
						// header:uni.getStorageSync('token'),
						header: header,
						formData: this.params,
						filePath: url,
						success: (res) => {
							if (res.statusCode == 200) {
								//返回结果 此处需要按接口实际返回进行修改								
								let url = JSON.parse(res.data).data.fileUrl
								let id = JSON.parse(res.data).data.fileId;
								id && (this.imageId[index] = id)
								url && (this.imageList[index] = url)
								this.$set(this.statusArr, index, url ? "1" : "3")
								resolve(index)
							} else {
								this.$set(this.statusArr, index, "3")
								reject(index)
							}
						},
						fail: (res) => {
							this.$set(this.statusArr, index, "3")
							reject(index)
						}
					})
				})

			},
			delImage(index) {
				this.imageList.splice(index, 1)
				this.imageId.splice(index, 1)
				this.statusArr.splice(index, 1)
				this.$emit("remove", {
					index: index,
					imageId: this.imageId
				})
				// this.change()
			},
			previewImage(index) {
				if (!this.imageList.length) return;
				uni.previewImage({
					current: this.imageList[index],
					loop: true,
					urls: this.imageList
				})
			}
		}
	}
</script>

<style lang="scss">
	@font-face {
		font-family: 'tuiUpload';
		src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAATcAA0AAAAAByQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAAEwAAAABoAAAAciR52BUdERUYAAASgAAAAHgAAAB4AKQALT1MvMgAAAaAAAABCAAAAVjxvR/tjbWFwAAAB+AAAAEUAAAFK5ibpuGdhc3AAAASYAAAACAAAAAj//wADZ2x5ZgAAAkwAAADXAAABAAmNjcZoZWFkAAABMAAAAC8AAAA2FpiS+WhoZWEAAAFgAAAAHQAAACQH3QOFaG10eAAAAeQAAAARAAAAEgwAACBsb2NhAAACQAAAAAwAAAAMAEoAgG1heHAAAAGAAAAAHwAAACABEgA2bmFtZQAAAyQAAAFJAAACiCnmEVVwb3N0AAAEcAAAACgAAAA6OMUs4HjaY2BkYGAAYo3boY/i+W2+MnCzMIDAzb3qdQj6fwPzf+YGIJeDgQkkCgA/KAtvAHjaY2BkYGBu+N/AEMPCAALM/xkYGVABCwBZ4wNrAAAAeNpjYGRgYGBl0GJgZgABJiDmAkIGhv9gPgMADTABSQB42mNgZGFgnMDAysDA1Ml0hoGBoR9CM75mMGLkAIoysDIzYAUBaa4pDA7PGJ9xMjf8b2CIYW5gaAAKM4LkANt9C+UAAHjaY2GAABYIVmBgAAAA+gAtAAAAeNpjYGBgZoBgGQZGBhBwAfIYwXwWBg0gzQakGRmYnjE+4/z/n4EBQksxSf6GqgcCRjYGOIeRCUgwMaACRoZhDwCiLwmoAAAAAAAAAAAAAAAASgCAeNpdjkFKw0AARf/vkIR0BkPayWRKQZtYY90ohJju2kOIbtz0KD1HVm50UfEmWXoAr9ADOHFARHHzeY//Fx8Ci+FJfIgdJFa4AhgiMshbrCuIsLxhFJZVs+Vl1bT1GddtbXTC3OhohN4dg4BJ3zMJAnccyfm468ZzHXddrH9ZKbHzdf9n/vkY/xv9sPQXgGEvBrHHwst5kTbXLE+YpYVPkxepPmW94W16UbdNJd6f3SAzo5W7m1jaKd+8ZZIvk5nlKw9SK6Wle7BLS3f/bTzQLmfAF2T1NsQAeNp9kD1OAzEQhZ/zByQSQiCoXVEA2vyUKRMp9Ailo0g23pBo1155nUg5AS0VB6DlGByAGyDRcgpelkmTImvt6PObmeexAZzjGwr/3yXuhBWO8ShcwREy4Sr1F+Ea+V24jhY+hRvUf4SbuFUD4RYu1BsdVO2Eu5vSbcsKZxgIV3CKJ+Eq9ZVwjfwqXMcVPoQb1L+EmxjjV7iFa2WpDOFhMEFgnEFjig3jAjEcLJIyBtahOfRmEsxMTzd6ETubOBso71dilwMeaDnngCntPbdmvkon/mDLgdSYbh4FS7YpjS4idCgbXyyc1d2oc7D9nu22tNi/a4E1x+xRDWzU/D3bM9JIbAyvkJI18jK3pBJTj2hrrPG7ZynW814IiU68y/SIx5o0dTr3bmniwOLn8owcfbS5kj33qBw+Y1kIeb/dTsQgil2GP5PYcRkAAAB42mNgYoAALjDJyIAOWMGiTIxMjMxsKak5qSWpbFmZiRmJ+QAmgAUIAAAAAf//AAIAAQAAAAwAAAAWAAAAAgABAAMABAABAAQAAAACAAAAAHjaY2BgYGQAgqtL1DlA9M296nUwGgA+8QYgAAA=) format('woff');
		font-weight: normal;
		font-style: normal;
	}
	
	.tui-upload-box {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		.tui-image-item {
			width: 140rpx;
			height: 140rpx;
			position: relative;
			margin-left: 20rpx;
			margin-bottom: 20rpx;
			.tui-item-img {
				width: 140rpx;
				height: 140rpx;
				display: block;
				border-radius: 8rpx;
			}
			.iconfont {
				position: absolute;
				top: 0;
				right: 0;
				font-size: 32rpx;
				line-height: 32rpx;
				color: #FFFFFF !important;
			}
			&:nth-child(3n+1) {
				margin-left: 0;
			}
		}
		
		.tui-upload-mask {
			width: 100%;
			height: 100%;
			position: absolute;
			left: 0;
			top: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-around;
			padding: 40rpx 0;
			box-sizing: border-box;
			background: rgba(0, 0, 0, 0.6);
			border-radius: 8rpx;
			.tui-upload-loading {
				width: 28rpx;
				height: 28rpx;
				border-radius: 50%;
				border: 2px solid;
				border-color: #B2B2B2 #B2B2B2 #B2B2B2 #fff;
				animation: tui-rotate 0.7s linear infinite;
			}
			.tui-tips {
				font-size: 24rpx;
				color: #FFFFFF;
			}
			.tui-mask-btn {
				padding: 6rpx 16rpx;
				border-radius: 40rpx;
				text-align: center;
				font-size: 24rpx;
				color: #fff;
				border: 1rpx solid #fff;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
	
	.tui-upload-add {
		width: 140rpx;
		height: 140rpx;
		font-size: 68rpx;
		font-weight: 100;
		color: #C4C4C4;
		background-color: #F2F2F2;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8rpx;
		padding: 0;
		.tui-upload-icon {
			font-family: "tuiUpload" !important;
			font-style: normal;
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
			padding: 10rpx;
		}
		.tui-icon-plus:before {
			content: "\e609";
		}
	}
	
	@keyframes tui-rotate {
		0% {
			transform: rotate(0);
		}

		100% {
			transform: rotate(360deg);
		}
	}
	.tui-hover {
		opacity: 0.5;
	}
</style>
