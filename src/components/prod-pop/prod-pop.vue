<template>
	<view class="popup" :class="popupClass" @touchmove.stop.prevent="discard" @tap="hidepopup">
		<!-- 遮罩层 -->
		<view class="mask"></view>
		<view class="layer" @tap.stop="discard">
			<view class="content">
				<view class="main" v-if="goodInfo">
					<view class="goods box">
						<image @tap="imgBigClick" :src="goodInfo.pictureUrl || '../../static/img/icon/cover.png'" mode="" class="goods-Img"></image>
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
								<view style="padding-right: 5rpx;word-break: break-all;">{{selectedFabricGroupDto[0].partstyleabb}}</view>
							</view>
						</view>
					</view>
					<view class="countBox">
						<view class="title">
							规格
							<text v-if="defaultValue==1" class="subTitle">长按规格可选择数量</text>
						</view>
						<view class="" v-if="groupSpec.length>0 && childrenSpec.length>0">
							<s-switch @switchValue="getSwitchValue" :defaultValue="defaultValue" :switchList="arr"></s-switch>
						</view>
					</view>
				</view>
				<view class="center">
					<scroll-view scroll-y="true" class="scroll-view-box">
						<!-- 组合规格 -->
						<view class="spec box" v-if="defaultValue==0">
							<view class="info-box" style="display: flex;flex-wrap: wrap;">
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
							<view class="info-box" style="display: flex;flex-wrap: wrap;">
								<view class="item" v-for="(item, index2) in childrenSpec" :key="index2" :class="item.disabled ? 'bg':item.submitChoose ? 'specOn':item.chooseSpec ? 'on':''"
								 @tap='choosespec(item,index2)' @longpress='longpress(item,index2)'>
									<view class="specItemBox">
										{{item.partspecdec}}
										<text v-if="item.selectedAmount>0" class="specCount">{{item.selectedAmount}}</text>
									</view>
								</view>
							</view>
						</view>
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
						<view class="set box" v-if="itemSetDtoList.length>0">
							<view class="title">
								齐套配件
							</view>
							<view class="info-box">
								<view class="item" v-for="(item, index) in itemSetDtoList" :key="index" @tap='chooseSetDto(index)' v-if="item.display"
								 :class="item.checked ?'specOn':''">
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
					<view class="mask"></view>
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
		</view>
	</view>
</template>

<script>
	import untils from '@/common/js/utils.js'
	import specData from '../good-pop/spec.js'
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
				itemId: '',
				// 默认选配
				configSelected: null,
				productIndex: null,
				orderItemId: null,
				specsIssueSeq: '',
				speciall: false
			};
		},
		created() {

		},
		onShow() {

		},
		methods: {
			//初始化已选中规格
			showPopup(params, info) {
				this.pBottom = 300
				this.bottom = this.getHeight()
				this.popupClass = params;
				this.orderItemId = info.orderItemId
				if (info) {
					this.itemId = info.itemId
					this.productIndex = info.index
					if (info.originalItemCode) {
						this.itemCode = info.originalItemCode
					} else {
						this.itemCode = info.itemCode
					}
					this.speciall = false
					this.specsIssueSeq = info.itemSpecsIssueSeq
					if (info.configSelected) {
						let str = info.configSelected;
						let index = str.indexOf('LIMIT')
						str = str.substr(0, index)
						this.configSelected = JSON.parse(str)
						this.configSelected.spec = this.configSelected.spec.replace('["', '').replace('"]', '').replace(/"/g, '')
						this.configSelected.spec = this.configSelected.spec.split(',')
						this.configSelected.spec = untils.uniqueSum(this.configSelected.spec);
					}
					this.goodInfo = info;
					this.selectedFabricGroupDto = [];
					this.showSpecList = [];
					this.groupSpec = [];
					this.defaultValue = 0;
					this.selectorVisible = false
					this.childrenSpec = [];
					this.selectedItemSetList = [];
					this.selectedSpecsGroupDtoList = [];
					this.getConfigSet()
				}
			},
			// 获取商品规格
			getConfigSet() {
				this.$http({
					url: this.$api.getConfigSet,
					data: {
						"itemCode": this.itemCode
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
						this.fabricGroupDtoList = res.data.fabricGroupDtoList
						if (this.fabricGroupDtoList.length > 0) {
							if (this.fabricGroupDtoList[0].fabricList[0].partstyleabb == '标准化面料') {
								this.fabricShow = true;
								this.selectedFabricGroupDto.push(this.fabricGroupDtoList[0].fabricList[0]);
							} else {
								this.fabricShow = false;
								this.selectedSpecList = []
							}
						}
						this.itemSetDtoList = res.data.itemSetDtoList
						if (this.itemSetDtoList.length > 0) {
							this.itemSetDtoList.forEach(ele => {
								ele.display = false
							})
						}
						this.specHotAppDtoList = res.data.specHotAppDtoList
						this.limitGroupDtoList = res.data.limitGroupDtoList;
						if (this.itemSetDtoList.length > 0) {
							for (let i in this.itemSetDtoList) {
								this.itemSetDtoList[i].display = false
								this.itemSetDtoList[i].id = '00' + i
							}
						}
						this.getSpecList(res.data.specsGroupDtoList) //当前显示的规格						
						if (this.configSelected) {
							for (let m in this.configSelected.spec) {
								res.data.specsGroupDtoList.forEach(ele => {
									if (ele.issueseq == m) {
										if (ele.groupflag == 'true' && this.groupSpec.length > 0) {
											this.defaultValue = 0
											this.specsGroupDtoList = this.groupSpec
										} else if (ele.groupflag == 'false') {
											if (this.childrenSpec.length == 0) {
												this.defaultValue = 0
												this.speciall = true
												this.specsGroupDtoList = this.groupSpec
											} else {
												this.defaultValue = 1
												this.specsGroupDtoList = this.childrenSpec
											}
										}
									}
								})
							}
						}
						untils.specInit(this.specsGroupDtoList)
						for (let n in this.specsGroupDtoList) {
							if (this.configSelected) {
								for (let i in this.configSelected.spec) {
									if (this.defaultValue == 1) {
										if (this.specsGroupDtoList[n].issueseq == i) {
											this.specsGroupDtoList[n].selectedAmount = this.configSelected.spec[i]
											this.specsGroupDtoList[n].submitChoose = true;
											this.specsGroupDtoList[n].chooseSpec = true
											this.selectedSpecsGroupDtoList.push(this.specsGroupDtoList[n])
										} else {
											let children = i.split('+')
											if (i.includes(this.specsGroupDtoList[n].issueseq) && this.specsGroupDtoList[n].groupflag == 'true') {
												this.specsGroupDtoList[n].selectedAmount = 1;
												this.specsGroupDtoList[n].submitChoose = true;
												this.specsGroupDtoList[n].chooseSpec = true
												this.selectedSpecsGroupDtoList.push(this.specsGroupDtoList[n])
											}

										}
									} else {
										if (this.specsGroupDtoList[n].issueseq == i) {
											this.specsGroupDtoList[n].selectedAmount = this.configSelected.spec[i]
											this.specsGroupDtoList[n].submitChoose = true;
											this.specsGroupDtoList[n].chooseSpec = true

											this.groupIndex = n
											this.selectedSpecsGroupDtoList.push(this.specsGroupDtoList[n])
										}
									}
								}
								if (this.speciall) {
									if (this.specsGroupDtoList[n].issueseq == this.specsIssueSeq) {
										this.specsGroupDtoList[n].selectedAmount = 1
										this.groupIndex = n
										this.selectedSpecsGroupDtoList.push(this.specsGroupDtoList[n])
									}
								}
							}
							this.getItem(n)
						}
						if (this.selectedSpecsGroupDtoList.length > 0) {
							this.selectedSpecsGroupDtoList.forEach(ele => {
								var specList = ele.partspecdec.split("+");
								for (let i in specList) {
									this.limitGroupList(specList[i]);
								}

							})
							this.specsGroupDtoList.forEach(ele => {
								let itemArr = ele.partspecdec.split('+')
								ele.disabled = false
								// 互斥置灰
								itemArr.forEach(item => {
									if (this.listData.includes(item) && !ele.submitChoose) {
										ele.disabled = true
									}
								})
								// 沙发与被套分开下单置灰
								this.selectedSpecsGroupDtoList.forEach(box => {
									if (ele.ltprarm !== box.ltprarm) {
										ele.disabled = true
									}
								})
							})
						}
						this.showSpecList = untils.unique(this.selectedSpecsGroupDtoList) //去重
						if (this.configSelected) {
							for (let i in this.fabricGroupDtoList) {
								for (let j in this.fabricGroupDtoList[i].fabricList) {
									if ('"' + this.fabricGroupDtoList[i].fabricList[j].partstyle + '"' == this.configSelected.fabric) {
										this.fabricIndex = this.fabricGroupDtoList[i].fabricList[j].partstyleabb
										this.selectedFabricGroupDto.push(this.fabricGroupDtoList[i].fabricList[j]);
									}
								}
							}
						}
					}
				})
			},
			dataDeal(resultData) {
				let object = {}
				object.configSelected = resultData.configSelected
				let data = resultData.itemParaConfigResultDto
				data.itemNotes = data.seibanMemo			
				data.configureAllowFlag = this.goodInfo.configureAllowFlag
				if (this.goodInfo && this.goodInfo.selfUPFlag) {
					object.updateFlag = 1;
				}				
				resultData = { ...this.goodInfo,
					...resultData
				};			
				Object.assign(object, resultData, resultData.itemAppDto, data);				
				if (object.singlePrice == 0) {
					object.freeTypeCode = '1'
				} else {
					object.freeTypeCode = '2'
				}				
				object.dealPrice = object.singlePrice ? Number(object.singlePrice) * object.amount : object.dealPrice
				this.common(object)
				console.log(JSON.stringify(object))
				if (resultData.selectedItemSetList.length > 0) {
					object.selectedItemSetList = []
					resultData.selectedItemSetList.forEach(ele => {
						ele.itemSpecsWithSmallSpec = ele.itemSpecs
						object.selectedItemSetList.push(ele)
					})
				}
				object.index = this.productIndex
				this.$emit('changeSpec', object, this.itemId);
				uni.showToast({
					title: '修改成功'
				})
				// 清除选择
				this.removeSpec()
				this.hidepopup()
			},
			// 关闭商品弹窗
			hidepopup() {
				this.popupClass = 'hide';
				setTimeout(() => {
					this.popupClass = 'none';
				}, 200);
				this.removeSpec();
			},

			discard() {

			}
		},

	}
</script>
<style lang="scss">
	@import "@/style/picker.scss";
</style>
