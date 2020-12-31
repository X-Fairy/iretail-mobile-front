<template>
	<view>
		<view class="popup" :class="popupClass" @touchmove.stop.prevent="discard" @tap="hidepopup">
			<!-- 遮罩层 -->
			<view class="mask" style="background-color: rgba(0,0,0,0);"></view>
			<view class="layer" @tap.stop="discard" :style="{height:height}">
				<view class="content">
					<view class="main" v-if="goodInfo">
						<view class="goods box">
							<view class="goods-pic">
								<image @tap="imgBigClick" :src="goodInfo.pictureUrl || '../../static/img/icon/cover.png'" mode="" class="goods-Img"></image>
							</view>
							<view class="goods-detail">
								<view class="name">
									<text>{{goodInfo.productNo}}</text>
									<text class="icon iconfont icon-x" style="font-size: 40rpx;" @tap="hidepopup"></text>
								</view>
								<view class="specInfo">
									<text v-for="(ele,index) in showSpecList" :key="index">
										{{ele.plName}}<text v-if="ele.count>1">×{{ele.count}}</text>
										<text v-if="index<showSpecList.length-1">+</text>
									</text>
									<view style="padding-right: 5rpx;word-break: break-all;" v-if="selectedFabricGroupDto.length > 0">{{selectedFabricGroupDto[0].partstyleabb || modelList[modalIndex]}}</view>
								</view>
							</view>
						</view>
						<view class="countBox" v-if="!special" style="margin-top: 20rpx;">
							<view class="title">
								规格
								<!-- v-if="defaultValue==1" -->
								<text class="subTitle" v-if="!isLz">长按规格可选择数量</text>
							</view>
							<view v-if="groupSpec.length > 0 && childrenSpec.length > 0">
								<s-switch @switchValue="getSwitchValue" :defaultValue="defaultValue" :switchList="arr" :stepIndex="stepIndex"></s-switch>
							</view>
						</view>
					</view>
					<view class="center">
						<scroll-view scroll-y="true" class="scroll-view-box">
							<!-- 尺寸面料 -->
							<view class="" v-if="special">
								<view class="box" v-if="modelList.length>0" style="padding-top: 40rpx;">
									<view class="title">
										面料
									</view>
									<view class="info-box">
										<view class="item" v-for="(item, index) in modelList" :key="index" @tap='chooseModal(index)' :class="modalIndex==index ?'specOn':''">
											{{item}}
										</view>
									</view>
								</view>
								<!-- 尺寸 -->
								<view class="box" style="margin-top: 16rpx;" v-if="modelToSizeMap">
									<view class="title">
										尺寸<text class="subTitle" v-if="modalIndex==null">请先选择面料</text>
									</view>
									<view class="info-box">
										<view class="item" v-for="(item, index) in sizeList" :key="index" @tap='chooseSize(index)' :class="sizeIndex==index ?'specOn':''">
											{{item}}
										</view>
									</view>
								</view>
								<!--  -->
								<view class="countBox" v-if="modalIndex!=null || !modelToSizeMap" style="min-height: 70rpx;">
									<view class="title">
										规格<text class="subTitle" v-if="sizeIndex==null && modelToSizeMap">请先选择尺寸</text>
										<text class="subTitle" v-if="modalIndex==null && modelList.length>1">{{modelToSizeMap?'':'请先选择面料'}}</text>
										<!-- v-if="defaultValue==1" -->
										<text class="subTitle">长按规格可选择数量</text>
									</view>
									<view class="" v-if="groupSpec.length>0 && childrenSpec.length>0">
										<s-switch @switchValue="getSwitchValue" :defaultValue="defaultValue" :switchList="arr" :stepIndex="stepIndex"></s-switch>
									</view>
								</view>
							</view>
							<!-- LZ商品 -->
							<view class="" v-if="isLz">
								<view class="spec box" v-if="defaultValue==0">
									<view class="info-box newSpec show" style="display: flex;flex-wrap: wrap;" v-if="specsGroupDtoList.length>0">
										<view class="item" v-for="(item, index) in specsGroupDtoList" :key="index" :class="groupIndex==index ? 'specOn' : ''"
										 @tap='chooseGrouspec(item,index)'>
											<view class="specItemBox">
												{{item.itemSpecs}}
											</view>
										</view>
									</view>
								</view>
							</view>
							<view class="">
								<view class="spec box" v-if="defaultValue==0">
									<view class="info-box newSpec" style="display: flex;flex-wrap: wrap;" :class="showClass">
										<!-- :class="groupIndex==index ? 'specOn' : ''" -->
										<view class="item" v-for="(item, index) in groupSpec" :key="index" :class="item.disabled ? 'bg':item.submitChoose ? 'specOn':item.chooseSpec ? 'on':''"
										 @tap='choosespec(item,index)' @longpress='longpress(item,index)'>
											<view class="specItemBox">
												{{item.partspecdec}}
												<text v-if="item.selectedAmount>0" class="specCount">{{item.selectedAmount}}</text>
											</view>
										</view>
									</view>
								</view>

								<!-- 子组件 -->
								<view class="spec box" v-else>
									<view class="info-box newSpec" style="display: flex;flex-wrap: wrap;" :class="showClass">
										<view class="item" v-for="(item, index2) in childrenSpec" :key="index2" :class="item.disabled ? 'bg':item.submitChoose ? 'specOn':item.chooseSpec ? 'on':''"
										 @tap='choosespec(item,index2)' @longpress='longpress(item,index2)'>
											<view class="specItemBox">
												{{item.partspecdec}}
												<text v-if="item.selectedAmount>0" class="specCount">{{item.selectedAmount}}</text>
											</view>
										</view>
									</view>
								</view>
							</view>
							<view class="" v-if="!special">
								<view class="cate box" v-if="fabricGroupDtoList.length>0">
									<view class="title">
										面料
									</view>
									<view style="padding-top: 20rpx;">
										<view class="info-box" v-for="(item, index) in fabricGroupDtoList" :key="index" style="padding-top: 0;">
											<view class="item" v-for="(ele, i) in item.fabricList" :key="i" @tap='chooseFabricc(ele,index,i)' :class="fabricIndex==ele.partstyleabb || fabricShow ?'specOn':''">
												{{ele.partstyleabb | text}}
											</view>
										</view>
									</view>
								</view>
							</view>

							<view class="set box" v-if="itemSetDtoList.length>0">
								<view class="title">
									齐套配件
								</view>
								<view class="info-box">
									<view class="item specItem" v-for="(item, index) in itemSetDtoList" :key="index" @tap='chooseSetDto(index)'
									 v-if="item.display" :class="item.checked ?'specOn':''">
										{{item.productNo}} <text style="padding-left: 16rpx;font-weight: 300;">{{item.itemSpecs}}</text>
									</view>
								</view>
							</view>
						</scroll-view>
					</view>
					<view class="bottom" :style="{paddingBottom:bottom+'rpx'}">
						<view class="removeBtn" @tap='removeSpec'>重置</view>
						<view class="ok" @tap="submitContent">确认</view>
					</view>
					<!-- 数字选择器 -->
					<view v-if="selectorVisible">
						<!-- 遮罩层 -->
						<view class="mask" @tap="selectorVisible=false"></view>
						<!-- picker-view组件按钮 -->
						<view class="pickerBtn">
							<view class="cancer" @tap="selectorVisible=false">取消</view>
							<view class="specName">
								{{specsGroupDtoList[pickerIndex].partspecdec+'数量'}}
							</view>
							<view class="confirm" @tap="confirm">确定</view>
						</view>
						<view class="pickerView">
							<picker-view class="picker" indicator-class="indicator" :value="countIndex" @change="bindPickerChange">
								<picker-view-column class="column">
									<view v-for="(item, index) in array" :key="index">
										{{item}}
									</view>
								</picker-view-column>
							</picker-view>
						</view>
					</view>
				</view>
				<!-- 提示信息 -->
				<view class="tip-modal" @touchmove.stop.prevent v-if="showStep && !special">
					<view class="tip-mask" @tap='step'></view>
					<view class="tip-content">
						<view class="tip-box" :style="{left:left,top:modaltop}" v-for="(ele,index) in tipList" :key="index" :class="stepIndex==null?'hidemodal':stepIndex==index?'showmodal':'hidemodal'">
							{{ele}}
							<view :class="stepIndex==0 ? 'arrow' : 'down'"></view>
						</view>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import untils from '@/common/js/utils.js'
	import specData from './spec.js'
	import SSwitch from '../s-switch/s-switch.vue'
	export default {
		name: 'goodPop',
		props: {
			type: {
				type: String,
				default: 'cart'
			}
		},
		mixins: [specData],
		components: {
			SSwitch
		},
		data() {
			return {
				showModal: false,
				showLoading: false,
				showClass: '',
				showStep: false,
				stepIndex: null,
				left: '20rpx',
				modaltop: "50rpx",
				tipList: ['我们已经为你准备好了热门规格组合，助您快速下单', '切换到"子件"列表，您可以手动组合商品规格']
			};
		},
		created() {
			setTimeout(() => {
				this.stepIndex = 0
			}, 2500)
		},
		onShow() {

		},
		methods: {
			step() {
				if (this.stepIndex == 0) {
					this.stepIndex++
					this.left = '100rpx'
					this.modaltop = '170rpx'
				} else {
					this.stepIndex = null
					setTimeout(() => {
						this.showStep = false
					}, 200)
					uni.setStorageSync('showStepPop', true)
				}
			},
			showPopup(params, info) {
				this.bottom = this.type == 'detail' ? 20 : this.getHeight()
				this.height = this.type == 'detail' ? '100%' : this.getHeight()
				this.popupClass = params;
				if (info) {
					this.defaultValue = 0;
					this.selectorVisible = false
					this.itemCode = info.itemCode
					this.goodInfo = info;
					this.goodInfo.pictureUrl = info.itemImg
					this.showSpecList = [];
					this.groupSpec = [];
					this.childrenSpec = [];
					this.selectedFabricGroupDto = [];
					this.selectedSpecsGroupDtoList = [];
					this.selectedItemSetList = [];
					this.modelList = [];
					this.sizeList = [];
					this.sizeModelToCodeMap = null;
					this.modelToSizeMap = null
					this.itemSetDtoList = []
					this.showClass = ''
					this.isLz = false
					this.showModal = false;
					this.secondClassCode = info.secondClassCode
					this.specsGroupDtoList = []
					this.fabricGroupDtoList = []
					if (info.productNo.indexOf('LZ.') !== -1) {
						this.isLz = true
						this.getCandidates(info)
						return
					}
					if (info.specialConfigFlag == 1) {
						this.special = true
						this.getConditionInfo(info.productNo)
					} else {
						this.special = false
						this.getConfigSet()
					}


				}
			},
			// LZ.商品
			getCandidates(e) {
				let itemParams = {
					exactQueryFlag: 1,
					itemBriefFlag: 1,
					itemBrief: e.itemBrief,
					productNo: e.productNo,
					storeId: uni.getStorageSync('storeInfo').storeId,
					pageNum: 1,
					orderBy: 'item_specs asc',
					pageSize: 200
				}
				this.$http({
					url: this.$api.getItemInfo,
					data: itemParams,
					success: (res) => {
						this.specsGroupDtoList = res.data //当前显示的规格
						this.specsGroupDtoList.forEach(ele => {
							if (ele.itemModel) {
								ele.itemSpecs = ele.itemSpecs + ele.itemModel
							}
						})
						if (this.specsGroupDtoList.length == 1) {
							this.goodInfo.pictureUrl = this.specsGroupDtoList[0].itemImg ? this.specsGroupDtoList[0].itemImg :
								'../../static/img/icon/cover.png'
							this.groupIndex = 0;
							this.specsGroupDtoList[0].selectedAmount = 1
							this.selectedSpecsGroupDtoList = this.specsGroupDtoList
							this.showSpecList[0] = {
								plName: this.selectedSpecsGroupDtoList[0].itemSpecs,
								count: 1
							}
						}
					}
				})
			},
			// 获取尺寸面料
			getConditionInfo(e) {
				this.$http({
					url: this.$api.queryConfigConditionInfo,
					data: {
						productNo: e
					},
					success: (res) => {
						if (res.data) {
							if (this.secondClassCode == 'CPLB4') {
								this.modelList = res.data.modelList
								this.sizeModelToCodeMap = res.data.sizeModelToCodeMap;
								this.modelToSizeMap = res.data.modelToSizeMap
							} else {
								this.modelList = res.data.itemModelList
								this.sizeModelToCodeMap = res.data.modelToCodeMap
							}
							if (this.modelList.length == 1) {
								this.modalIndex = 0;
								if (this.modelToSizeMap) {
									for (let key in this.modelToSizeMap) {
										if (key == this.modelList[0]) {
											this.sizeList = this.modelToSizeMap[key]
										}
									}
									if (this.sizeList.length == 1) {
										this.sizeIndex = 0;
										let modal = this.sizeList[0] + '&&' + this.modelList[0]
										this.itemCode = this.sizeModelToCodeMap[modal]
										this.getConfigSet()
									}
								} else {
									this.itemCode = this.sizeModelToCodeMap[this.modelList[0]]
									this.getConfigSet()
								}
							}
						}
					}
				})
			},
			// 获取商品规格
			getConfigSet() {
				this.$http({
					url: this.$api.getConfigSet,
					data: {
						itemCode: this.itemCode
					},
					success: (res) => {
						if (res.code == '03') {
							this.showModal = true
							uni.showModal({
								title: '提示',
								content: res.message,
								showCancel: false,
								success: (res) => {
									if (res.confirm) {
										console.log('用户点击确定');
									}
								}
							});
						}
						if (!this.special) {
							this.fabricGroupDtoList = res.data.fabricGroupDtoList
							if (res.data.fabricGroupDtoList.length > 0) {
								let arr = []
								this.fabricGroupDtoList.forEach(ele => {
									arr = arr.concat(ele.fabricList)
								})
								if (this.fabricGroupDtoList[0].fabricList[0].partstyleabb == '标准化面料' || arr.length == 1) {
									this.goodInfo.pictureUrl = arr[0].photo
									this.fabricShow = true;
									this.selectedFabricGroupDto.push(this.fabricGroupDtoList[0].fabricList[0]);
								} else {
									this.fabricShow = false;
								}
							}
						} else {
							this.showLoading = false
						}
						this.itemSetDtoList = res.data.itemSetDtoList
						if (this.itemSetDtoList.length > 0) {
							for (let i in this.itemSetDtoList) {
								this.itemSetDtoList[i].display = false
								this.itemSetDtoList[i].id = '00' + i
							}
						}
						this.limitGroupDtoList = res.data.limitGroupDtoList;
						this.specHotAppDtoList = res.data.specHotAppDtoList
						this.getSpecList(res.data.specsGroupDtoList) //当前显示的规格							
						setTimeout(() => {
							this.showClass = 'show'
						}, 100)
						if ((this.groupSpec.length == 0 && this.childrenSpec.length == 1) || (this.groupSpec.length == 1 && this.childrenSpec
								.length == 0)) {
							this.specsGroupDtoList[0].selectedAmount = 1;
							this.specsGroupDtoList[0].chooseSpec = true;
							this.groupIndex = 0;
							this.selectedSpecsGroupDtoList.push(this.specsGroupDtoList[0])
							this.showSpecList = untils.unique(this.selectedSpecsGroupDtoList) //去重
							this.getItem(0)
						} else {
							this.specsGroupDtoList.forEach(ele => {
								ele.selectedAmount = 0;
								ele.chooseSpec = false;
							})
						}
						if (uni.getStorageSync('showStepPop') || this.type == 'detail') {
							this.showStep = false
						} else {
							if (this.groupSpec.length > 0 && this.childrenSpec.length > 0) {
								this.showStep = true
							} else {
								this.showStep = false
							}
						}
					}
				})
			},
			//数据整合
			dataDeal(resultData) {
				let object = {}
				object.configSelected = resultData.configSelected
				let tmp = uni.getStorageSync('chooseGoods') || []
				object.amount = 1
				this.common(object)
				let data = resultData.itemParaConfigResultDto
				data.itemNotes = data.seibanMemo
				data.configureAllowFlag = this.goodInfo.configureAllowFlag
				Object.assign(object, resultData.itemAppDto, data);
				tmp.push(object)
				if (resultData.selectedItemSetList.length > 0) {
					resultData.selectedItemSetList.forEach(ele => {
						ele.itemSpecsWithSmallSpec = ele.itemSpecs
						tmp.push(ele)
					})
				}
				uni.setStorageSync('chooseGoods', tmp)
				if (this.type == 'detail') {
					uni.navigateBack()
				}
				uni.showToast({
					title: '添加成功'
				})
				// 清除选择
				this.removeSpec()
				this.hidepopup()
				this.$emit('success', tmp)
			},
			// 关闭商品弹窗
			hidepopup() {
				this.popupClass = 'hide';
				setTimeout(() => {
					this.popupClass = 'none';
					this.removeSpec();
				}, 300);
				this.$emit('close')
			},
			// 返回关闭弹窗
			back() {
				this.hidepopup()
			},

		}

	}
</script>
<style lang="scss" scoped>
	@import "@/style/picker.scss";

	.tip-modal {
		width: 100%;
		height: 100%;
		position: fixed;

		.tip-content {
			z-index: 9999998;
			transition: all 0.3s ease-in-out;
			box-sizing: border-box;
			height: 100%;

			.tip-box {
				position: relative;
				background: #272832;
				border-radius: 4px;
				padding: 24rpx 32rpx;
				font-size: 28rpx;
				color: #FFFFFF;
				width: 600rpx;
				opacity: 0;
				transform: scale(0);

				&.showmodal {
					opacity: 1;
					transform: scale(1);
					// animation: showTip 1s linear;
					transition: all 0.2s;
				}

				&.hidemodal {
					opacity: 0;
					transform: scale(0);
					transition: all 0.2s;
					// animation: hideTip 2s linear;
				}
			}

			.arrow,
			.down {
				position: absolute;
				/* 左边框的宽 */
				border-left: 16rpx solid transparent;
				/* 右边框的宽 */
				border-right: 16rpx solid transparent;
				right: 32rpx;
			}

			.arrow {
				/* 下边框的长度|高,以及背景色 */
				border-top: 20rpx solid #272832;
				bottom: -16rpx;
			}

			.down {
				/* 下边框的长度|高,以及背景色 */
				border-bottom: 20rpx solid #272832;
				top: -16rpx;
			}


		}

		.tip-mask {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0);
			z-index: 9999996;
			transition: all 0.3s ease-in-out;
		}
	}

	.goods-pic {
		width: 160rpx;
		height: 160rpx;
		border-radius: 16rpx;
		overflow: hidden;
		border: 2rpx solid #F2F2F2;
	}

	.goods-Img {
		display: block;
	}
</style>
