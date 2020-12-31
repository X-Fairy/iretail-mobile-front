<template>
	<page>
		<view slot="body">
			<view class="">
				<view class="content" v-if="productDetail">
					<view class="" v-if="productDetail.Content">
						<!-- <u-parse :content="productDetail.Content" :loading="loading" /> -->
						<u-parse :html="productDetail.Content"  lazy-load >加载中...</u-parse>
					</view>
				</view>
				<view class="tips" v-show="tipShow">
					<image src="../../static/img/icon/margin.png" mode=""></image>
					<view class="msg">暂无商品详情</view>
				</view>
				<!-- 商品选样-模态层弹窗 -->
				<good-pop ref='goodPop' :class="popupClass" :goodInfo="goodInfo" @chooseGood="chooseGood" type="detail"></good-pop>
			</view>
			<view class="loading-text" v-show="isLoading">{{loadingText}}</view>
		</view>
		<!-- 底部菜单 -->
		<view slot="footer" v-if="params && params.itemCode && type=='order'">
			<view class="footer">
				<view class="">
					<view class="price" v-if="productDetail && productDetail.configureAllowFlag != 1 && productDetail.markedPrice">
						<text>￥</text>{{productDetail.markedPrice}}
					</view>
				</view>
				<view class="btns" @tap="showPop">
					<view class="join">
						<text>加入订单</text>
					</view>
				</view>
			</view>
		</view>
	</page>

</template>

<script>
	import goodPop from '@/components/good-pop/good-pop.vue'
	import uParse from '@/components/jyf-parser/jyf-parser.vue'
	import utils from '@/utils/utils.js'
	import mixinWxAna from '@/mixins/wxAna'
	export default {
		mixins: [mixinWxAna],
		components: {
			goodPop,
			uParse
		},
		data() {
			return {
				// 获取商品详情参数
				params: null,
				// 商品详情
				productDetail: null,
				popupClass: null, //商品选择弹窗css类，控制开关动画
				isLoading: true,
				loadingText: "正在加载中",
				tipShow: false,
				// 加入订单的商品
				chooseProduct: [],
				type: '',
				//商品详情
				goodInfo: null
			};
		},
		onLoad(option) {
			this.setWxAna();
			if (option.type) {
				this.type = option.type;
				if (option.type == 'stock') {
					this.params = {
						tkImageId: option.tkImageId
					};
					this.getProductDetail();
					return
				}

			}
			if (option.title) {
				uni.setNavigationBarTitle({
					title: option.title
				});
				this.productDetail = JSON.parse(decodeURIComponent(option.content))
				if (!this.productDetail.Content) {
					this.tipShow = true
				}
				this.isLoading = false
			} else if (option.product) {
				this.goodInfo = JSON.parse(decodeURIComponent(option.product))

				let title = this.goodInfo.Title ? this.goodInfo.Title : this.goodInfo.itemCode
				uni.setNavigationBarTitle({
					title: title
				});
				this.params = {
					itemCode: this.goodInfo.itemCode,
					tkImageId: this.goodInfo.tkImageId
				};
				this.getProductDetail();
			}
		},
		methods: {
			// 获取商品详情
			getProductDetail() {
				this.$http({
					url: this.$api.getProductDetail,
					data: this.params,
					success: (res) => {
						if (res.code == '01') {
							this.isLoading = false
							if (res.bizObject) {
								this.productDetail = res.bizObject;
							} else {
								this.tipShow = true
							}
						} else {
							this.isLoading = true
							this.loadingText = res.message
							uni.showToast({
								title: res.message,
								icon: 'none'
							})
						}
					}
				})
			},
			// 进入选配
			showPop() {
				if (this.goodInfo.configureAllowFlag == 1) {
					// 防止重复点击
					if (!this.$utils.multipleClicks()) {
						return
					}
					this.popupClass = 'show';
					this.$refs.goodPop.showPopup(this.popupClass, this.goodInfo);
				} else {
					// 防止重复点击
					if (!this.$utils.multipleClicks('加载中')) {
						return
					}
					this.goodInfo.amount = 1
					this.goodInfo.itemSpecsWithSmallSpec = this.goodInfo.itemSpecs
					let tmp = uni.getStorageSync('chooseGoods') || [];
					// 	tmp.push(this.goodInfo)
					this.$http({
						url: this.$api.getItemPrice,
						data: {
							itemCode: this.goodInfo.itemCode
						},
						success: res => {
							this.$utils.multipleRemoveClicks();
							this.goodInfo.markedPrice = res.data.markedPrice
							this.goodInfo.singlePrice = res.data.markedPrice
							let orderItemLineNo = uni.getStorageSync('orderItemLineNo') + 10;
							this.goodInfo.orderItemLineNo = orderItemLineNo;
							uni.setStorageSync('orderItemLineNo', orderItemLineNo)
							tmp.push(JSON.parse(JSON.stringify(this.goodInfo)))
							uni.setStorageSync('chooseGoods', tmp)						
							uni.navigateBack({
								delta: 1
							});
							this.$msg('添加成功');
						}
					})
				}
			},
		}
	}
</script>

<style lang="scss">
	.content {
		padding-bottom: 100rpx;
	}
	
	.tips {
		margin-top: 40%;
		text-align: center;
		
		image {
			width: 400rpx;
			height: 280rpx;
		}
		
		.msg {
			padding-top: 30rpx;
			color: $subTitle;
			font-size: 24rpx;
		}
	}
	
	.footer {
		position: fixed;
		bottom: 0;
		width: 100%;
		// padding-left: 4%;
		font-size: 28upx;
		height: 100upx;
		border-top: solid 1upx #eee;
		background-color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.price {
			color: $red;
			font-size: 30upx;
			font-weight: 600;
			
			text {
				font-size: 22rpx;
			}
		}
		
		.btns {
			width: 100%;
			display: flex;
			
			.stock,
			.join {
				width: 100%;
				// width: 180rpx;
				height: 100upx;
				line-height: 100rpx;
				color: #fff;
				text-align: center;
			}

			.stock {
				background-color: $brown;
			}
			
			.join {
				background-color: $red;
			}
		}
	}
</style>
