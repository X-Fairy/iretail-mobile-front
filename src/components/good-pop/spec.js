import untils from '@/common/js/utils.js'
import utils from '@/utils/utils.js' // 防止重复提交
export default {
	data() {
		return {
			height: '',
			pBottom: 300,
			bottom: 100,
			placeHeight: 200,
			//商品选择弹窗css类，控制开关动画
			popupClass: '',
			goodInfo: null,
			// 选择的面料
			selectedFabricGroupDto: [],
			// 选中的规格
			selectedSpecsGroupDtoList: [],
			// 	已选择的配件下单建议
			selectedItemSetList: [],
			itemCode: '',
			// 所有规格
			specsGroupDtoList: [],
			// 组合规格
			groupSpec: [],
			// 子组件规格
			childrenSpec: [],
			// 规格索引
			specIndex: null,
			// 组合规格索引
			groupIndex: null,
			// 面料组合
			fabricGroupDtoList: [],
			// 标准化面料必选
			fabricShow: false,
			// 面料索引
			fabricIndex: ' ',
			// 配件下单建议列表
			itemSetDtoList: [],
			// 互斥组合
			limitGroupDtoList: [],
			// 已选中的互斥组合对应的b名称
			listData: [],
			// 组合规格和子组件切换(0显示组合规格,1显示子组件)
			defaultValue: 0,
			arr: [{
					key: 0,
					value: '组合'
				},
				{
					key: 1,
					value: '子件'
				}
			],
			array: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			countIndex: [0],
			// 是否显示数量选择器
			selectorVisible: false,
			// 当前选中的子组件索引
			pickerIndex: null,
			// 当前数字
			num: null,
			// 显示已近选中的规格
			showSpecList: [],
			secondClassCode: '',
			// 选择的尺寸
			special: false,
			sizeList: [],
			modelToSizeMap: null,
			sizeModelToCodeMap: null,
			modelList: [],
			// 当前选择的尺寸索引
			sizeIndex: null,
			modalIndex: null,
			isLz: false,
		}
	},
	methods: {
		// 选择尺寸
		chooseSize(index) {
			this.showClass = 'hide'
			this.init()
			if (this.modalIndex == null) {
				this.$msg('请选择面料')
				return
			}
			this.groupSpec = [];
			this.childrenSpec = [];
			this.itemSetDtoList = [];
			this.sizeIndex = index
			let modal = this.sizeList[index] + '&&' + this.modelList[this.modalIndex]
			for (let i in this.sizeModelToCodeMap) {
				if (i == modal) {
					this.itemCode = this.sizeModelToCodeMap[i]
				}
			}
			this.showLoading = true
			this.getConfigSet()
		},
		// 获取图片
		getImage(e) {
			let itemParams = {
				exactQueryFlag: 1,
				productNo: this.goodInfo.productNo,
				storeId: uni.getStorageSync('storeInfo').storeId,
				pageNum: 1,
				pageSize: 200,
				itemModel: e,
				mfgConfigType: '002'
			}
			this.$http({
				url: this.$api.getItemInfo,
				data: itemParams,
				success: (res) => {
					res.data.forEach(ele => {
						if (ele.itemImg) {
							this.goodInfo.pictureUrl = ele.itemImg
						}
					})
					this.$forceUpdate();
				}
			})
		},
		chooseModal(index) {
			this.getImage(this.modelList[index]);
			this.modalIndex = index;
			this.sizeIndex = null;
			this.groupSpec = []
			this.childrenSpec = []
			this.itemSetDtoList = [];
			this.showClass = 'hide'
			this.init()
			if (this.modelToSizeMap) {
				for (let key in this.modelToSizeMap) {
					if (key == this.modelList[this.modalIndex]) {
						this.sizeList = this.modelToSizeMap[key]
					}
				}

				if (this.sizeList.length == 1) {
					this.sizeIndex = 0;
					let modal = this.sizeList[0] + '&&' + this.modelList[this.modalIndex]
					this.itemCode = this.sizeModelToCodeMap[modal]
					this.getConfigSet()
					return
				}
			} else {
				for (let i in this.sizeModelToCodeMap) {
					if (i == this.modelList[this.modalIndex]) {
						this.itemCode = this.sizeModelToCodeMap[i]
					}
				}
				this.showLoading = true
				this.getConfigSet()
			}

		},
		// 不同机型获取高度
		getHeight() {
			let bottom = 100
			let system = uni.getSystemInfoSync();
			system.model = system.model.replace(' ', '');
			system.model = system.model.toLowerCase();
			if (system.model.indexOf('iphonex') != -1 || system.model.indexOf('iphone11') != -1) {
				bottom = 130;
				this.top = '7.5%';
				this.height = (system.screenHeight - system.statusBarHeight) * 2 + 'upx'
			}
			return bottom
		},
		// 分组合和子规格展示规格
		getSpecList(arr) {
			arr.forEach(ele => {
				if (ele.groupflag == 'true' && ele.selectionpara !== '不显示') {
					this.groupSpec.push(ele)
				} else if (ele.groupflag == 'false' && ele.selectionpara !== '不显示') {
					this.childrenSpec.push(ele)
				}
			})
			this.defaultValue = this.groupSpec.length > 0 ? 0 : 1
			if (this.defaultValue == 0) {
				this.specsGroupDtoList = this.groupSpec
			} else {
				this.specsGroupDtoList = this.childrenSpec
			}
		},
		// 查看大图
		imgBigClick() {
			var arr = [];
			arr[0] = this.goodInfo.pictureUrl;
			uni.previewImage({
				urls: arr,
				current: 0,
			});
		},
		// 切换去显示组合规格和子规格
		getSwitchValue(e) {
			this.defaultValue = e.key
			this.selectedSpecsGroupDtoList = [];
			this.showSpecList = [];
			this.groupIndex = null;
			untils.specInit(this.childrenSpec);
			untils.specInit(this.groupSpec)
			this.specsGroupDtoList = this.defaultValue == 0 ? this.groupSpec : this.childrenSpec;
			this.listData = [];
			this.selectedItemSetList = [];
			this.itemSetDtoList.forEach(ele => {
				ele.display = false;
			})
		},
		// 面料切换
		chooseFabricc(e, index, i) {
			this.fabricIndex = e.partstyleabb
			this.selectedFabricGroupDto[0] = this.fabricGroupDtoList[index].fabricList[i]
			this.goodInfo.pictureUrl = this.fabricGroupDtoList[index].fabricList[i].photo
		},
		// 选择组合规格(只能单选、不能加数量)
		chooseGrouspec(e, i) {
			if (this.groupSpec.length == 1 && this.childrenSpec.length == 0) {
				return
			}
			if (this.isLz) {
				this.goodInfo.pictureUrl = e.itemImg ? e.itemImg : '../../static/img/icon/cover.png'
			}
			this.specsGroupDtoList.forEach(ele => {
				ele.selectedAmount = 0
			})
			if (this.groupIndex == i) {
				this.groupIndex = null
				this.specsGroupDtoList[i].selectedAmount = 0
				this.selectedSpecsGroupDtoList = []
				this.showSpecList = []
				this.selectedItemSetList = []
				this.itemSetDtoList.forEach(ele => {
					ele.display = false;
				})
			} else {
				this.groupIndex = i;
				this.specsGroupDtoList[i].selectedAmount = 1
				this.selectedSpecsGroupDtoList[0] = this.specsGroupDtoList[i]
				if (this.selectedSpecsGroupDtoList[0].partspecdec) {
					this.showSpecList = untils.unique(this.selectedSpecsGroupDtoList) //去重
				} else {
					this.showSpecList[0] = {
						plName: this.selectedSpecsGroupDtoList[0].itemSpecs,
						count: 1
					}
				}

				this.getItem(i)
			}
		},
		// 选择子组件
		choosespec(item, i) {
			if ((this.groupSpec.length == 0 && this.childrenSpec.length == 1) || (this.groupSpec.length == 1 && this.childrenSpec
					.length == 0)) {
				return
			}
			this.specIndex = i;
			this.specsGroupDtoList[i].chooseSpec = !this.specsGroupDtoList[i].chooseSpec;
			let arr = this.selectedSpecsGroupDtoList.map(ele => {
				return ele.partspecdec
			})
			for (var z = 0; z < this.specsGroupDtoList.length; z++) {
				if (this.specsGroupDtoList[z].partspecdec == this.specsGroupDtoList[i].partspecdec) {
					for (var q1 = 0; q1 < this.selectedSpecsGroupDtoList.length; q1++) {
						if (this.specsGroupDtoList[z].ltprarm != this.selectedSpecsGroupDtoList[q1].ltprarm && this.specsGroupDtoList[
								this.specIndex].disabled) {
							this.specsGroupDtoList[i].selectedAmount = 0;
							this.specsGroupDtoList[i].chooseSpec = false;
							this.$msg('沙发与布套需分开下单')
							return false;
						}
					}
					let chooseSpecArr = this.specsGroupDtoList[i].partspecdec.split('+')
					for (let k in chooseSpecArr) {
						if (this.showLimitGroup(chooseSpecArr[k], this.listData) == false && this.specsGroupDtoList[
								i].chooseSpec) {
							this.specsGroupDtoList[i].selectedAmount = 0;
							this.specsGroupDtoList[i].chooseSpec = false;
							this.$msg('与已选组合为互斥组合')
							return false;
						}
						this.limitGroupList(chooseSpecArr[k]);
					}
				}
			}
			if (this.specsGroupDtoList[i].chooseSpec) {
				this.specsGroupDtoList[i].selectedAmount = 1;
				this.selectedSpecsGroupDtoList.push(this.specsGroupDtoList[i])
			} else {
				this.listData = [];
				this.selectedItemSetList = []
				this.specsGroupDtoList[i].selectedAmount = 0;
				if (this.selectedSpecsGroupDtoList.length > 0) {
					for (let n in this.selectedSpecsGroupDtoList) {
						if (this.selectedSpecsGroupDtoList[n].partspecdec == this.specsGroupDtoList[i].partspecdec) {
							this.selectedSpecsGroupDtoList.splice(n, 1)
						}
					}
				}
				this.selectedSpecsGroupDtoList.forEach(ele => {
					let specItem = ele.partspecdec.split('+')
					specItem.forEach(item => {
						this.limitGroupList(item);
					})
				})
			}
			this.specsGroupDtoList.forEach(ele => {
				ele.submitChoose = false
				ele.status = false;
				ele.disabled = false
				if (arr.includes(ele.partspecdec) && this.specsGroupDtoList[i].partspecdec !== ele.partspecdec) {
					ele.submitChoose = true
				}
				let itemArr = ele.partspecdec.split('+')
				// 互斥置灰
				itemArr.forEach(item => {
					if (this.listData.includes(item) && !ele.chooseSpec) {
						ele.disabled = true
					}
				})
				// 沙发与被套分开置灰
				this.selectedSpecsGroupDtoList.forEach(box => {
					if (ele.ltprarm !== box.ltprarm) {
						ele.disabled = true
					}
				})
			})
			if (this.listData.includes(this.specsGroupDtoList[i].partspecdec) && this.specsGroupDtoList[i].chooseSpec) {
				this.specsGroupDtoList[i].status = true
			}
			this.specsGroupDtoList[i].disabled = false
			this.showSpecList = untils.unique(this.selectedSpecsGroupDtoList) //去重
			this.getItem(i)
		},
		// 齐配逻辑
		// 当前选中的规格齐配处理
		getItem(i) {
			let isTrue = true,
				indexSpec = this.specsGroupDtoList[i].chooseSpec ? this.specsGroupDtoList[i].partspecdec : '';
			this.selectedItemSetList = []
			if (this.itemSetDtoList.length == 0) {
				return
			}
			this.itemSetDtoList.forEach(item => {
				item.checked = false;
				item.isDetail = false;
				item.display = false;
			})
			this.selectedSpecsGroupDtoList.forEach(ele => {
				this.itemSetDtoList.forEach(item => {
					if (ele.partspecdec !== item.specs) {
						isTrue = false
					} else {
						indexSpec = ele.partspecdec
					}
				})
			})
			if (isTrue || this.selectedSpecsGroupDtoList.length == 1) {
				this.itemSetDtoList.forEach(item => {
					if (indexSpec == item.specs) {
						item.display = true;
						if (item.forceFlag == 1) {
							item.checked = true;
							item.isDetail = true;
							this.selectedItemSetList.push(item);
						}
					}
				});
			}
		},
		// 配件下单一件
		chooseSetDto(index) {
			// 默认不可取消
			if (this.itemSetDtoList[index].isDetail) return;
			this.itemSetDtoList[index].checked = !this.itemSetDtoList[index].checked;
			var itemSetFlag = true;
			var selectedItemSetListNew = [];
			if (this.itemSetDtoList[index].checked) {
				if (this.selectedItemSetList.length > 0) {
					for (let i in this.selectedItemSetList) {
						if (this.selectedItemSetList[i].id == this.itemSetDtoList[index].id) {
							itemSetFlag = false;
						} else {
							selectedItemSetListNew.push(this.selectedItemSetList[i]);
						}
					}
					if (itemSetFlag == true) {
						this.selectedItemSetList.push(this.itemSetDtoList[index]);
					} else {
						this.selectedItemSetList = selectedItemSetListNew;
					}
				} else {
					this.selectedItemSetList.push(this.itemSetDtoList[index]);
				}
			} else {
				for (let i in this.selectedItemSetList) {
					if (this.selectedItemSetList[i].id == this.itemSetDtoList[index].id) {
						this.selectedItemSetList.splice(i, 1)
					}
				}
			}
			// #ifdef H5
			this.itemSetDtoList.splice(index, 1, this.itemSetDtoList[index])
			//  #endif
		},
		// 互斥组合List,为了遍历互斥组合是否已存在
		limitGroupList(partspecdec) {
			for (var j = 0; j < this.limitGroupDtoList.length; j++) {
				if (partspecdec == this.limitGroupDtoList[j].amutexitemname) {
					// 如果一致  将与amutexitemname对应的bmutexitemname取出，放入listData中
					this.listData.push(this.limitGroupDtoList[j].bmutexitemname);
				} else if (partspecdec == this.limitGroupDtoList[j].bmutexitemname) {
					// 如果一致  将与amutexitemname对应的bmutexitemname取出，放入listData中
					this.listData.push(this.limitGroupDtoList[j].amutexitemname);
				}
			}
		},
		// 判空方法
		isEmpty(value) {
			if (value == null || value == undefined || value == '') {
				return true;
			}
			return false;
		},
		// 校验是否为互斥组合
		showLimitGroup(partspecdec, data) {
			var flag = true;
			var msg = [];
			if (data.length > 0) {
				for (var k = 0; k < data.length; k++) {
					if (partspecdec == data[k]) {
						msg.push(data[k]);
					}
				}
				if (this.isEmpty(msg)) {
					return flag;
				} else {
					flag = false;
					return flag;
				}
			}
		},
		// 长按
		longpress(e, i) {
			if (e.status) {
				this.$msg('互斥只能选一次')
				return
			}
			if (e.selectionpara == '默认组合') {
				this.$msg('默认组合只能选一次')
				return
			}
			if (!e.chooseSpec) {
				this.$msg('请先选择规格')
				return
			}
			this.selectorVisible = true
			this.pickerIndex = i
			this.num = 1
		},
		// 选择数量
		bindPickerChange(e) {
			this.num = e.target.value
		},
		// 确定数量
		confirm() {
			this.selectorVisible = false
			this.specsGroupDtoList[this.pickerIndex].selectedAmount = this.num[0] + 1
			this.showSpecList = untils.unique(this.selectedSpecsGroupDtoList)
		},
		// 初始化
		init() {
			this.selectedSpecsGroupDtoList = [];
			this.selectedItemSetList = [];
			this.showSpecList = []
			// 组合规格初始化
			untils.specInit(this.groupSpec)
			// 子组件规格初始化
			untils.specInit(this.childrenSpec)
			this.listData = [];
			this.groupIndex = null
			this.specIndex = null;
			this.fabricIndex = '';
			// 重置选配
			for (var i = 0; i < this.itemSetDtoList.length; i++) {
				this.itemSetDtoList[i].display = false;

			}
		},
		// 清除选择
		removeSpec() {
			this.pBottom = 280
			if (this.selectedFabricGroupDto.length > 0) {
				if (this.selectedFabricGroupDto[0].partstyleabb !== '标准化面料') {
					this.selectedFabricGroupDto = [];
				}
			}
			this.init();
			if (this.special) {
				this.sizeIndex = null;
				this.modalIndex = null;
				this.sizeList = [];
				this.groupSpec = [];
				this.childrenSpec = [];
				this.itemCode = '';
				this.itemSetDtoList = [];
			}

		},
		// 确认
		submitContent() {
			if (this.showModal) {
				uni.showModal({
					title: '提示',
					content: "面料未维护不能选配，请联系配销",
					showCancel: false,
					success: (res) => {
						if (res.confirm) {
							console.log('用户点击确定');
						}
					}
				});
				return
			}

			if (!this.special && !this.isLz) {
				if (this.selectedSpecsGroupDtoList.length == 0 && this.selectedFabricGroupDto.length == 0) {
					this.$msg('请选择面料和规格')
					return false
				}

				if (this.selectedSpecsGroupDtoList.length > 0 && this.selectedFabricGroupDto.length == 0) {
					this.$msg('请选择面料')
					return false
				}
				if (this.selectedSpecsGroupDtoList.length == 0 && this.selectedFabricGroupDto.length > 0) {
					this.$msg('请选择规格组合')
					return false
				}
			} else {
				if (this.selectedSpecsGroupDtoList.length == 0) {
					this.$msg('请选择规格组合')
					return false
				}
			}
			if (this.isLz) {
				this.selectedSpecsGroupDtoList[0].amount = 1
				this.selectedSpecsGroupDtoList[0].itemSpecsWithSmallSpec = this.selectedSpecsGroupDtoList[0].itemSpecs
				if (!utils.multipleClicks('加载中')) {
					return
				}
				this.$http({
					url: this.$api.getItemPrice,
					data: {
						itemCode: this.selectedSpecsGroupDtoList[0].itemCode
					},
					success: res => {
						utils.multipleRemoveClicks()
						let markedPrice = res.data.markedPrice;
						this.selectedSpecsGroupDtoList[0].markedPrice = markedPrice;
						this.selectedSpecsGroupDtoList[0].singlePrice = markedPrice;
						// 赋值行号
						let orderItemLineNo = uni.getStorageSync('orderItemLineNo') + 10;
						this.selectedSpecsGroupDtoList[0].orderItemLineNo = orderItemLineNo;
						uni.setStorageSync('orderItemLineNo', orderItemLineNo);

						let prodList = uni.getStorageSync('chooseGoods') || []
						this.selectedSpecsGroupDtoList[0].pictureUrl = this.selectedSpecsGroupDtoList[0].itemImg
						this.selectedSpecsGroupDtoList[0].imageUrl = this.selectedSpecsGroupDtoList[0].itemImg
						prodList.push(JSON.parse(JSON.stringify(this.selectedSpecsGroupDtoList[0])))
						uni.setStorageSync('chooseGoods', prodList)
						uni.showToast({
							title: '添加成功'
						})
						this.removeSpec()
						this.hidepopup()
						this.$emit('success', prodList)
					}
				})
			} else {
				this.saveItemConfigResult()
			}
		},
		// 保存商品规格
		saveItemConfigResult() {
			if (!utils.multipleClicks('加载中')) {
				return
			}
			this.$http({
				url: this.$api.saveItemConfigResult,
				data: {
					"storeNo": uni.getStorageSync('storeInfo').storeCode,
					"selectedSpecsGroupDtoList": this.selectedSpecsGroupDtoList,
					"selectedFabricGroupDto": this.selectedFabricGroupDto[0] || '',
					"itemCode": this.itemCode,
					"selectedItemSetList": this.selectedItemSetList,
					"selectedLimit": this.listData
				},
				success: (res) => {
					utils.multipleRemoveClicks()
					if (res.code == '01') {
						let resultData = res.data;
						uni.setStorageSync('removeLineNo', this.goodInfo.orderItemLineNo)
						// 赋值行号
						let orderItemLineNo = uni.getStorageSync('orderItemLineNo') + 10;
						resultData.itemAppDto.orderItemLineNo = orderItemLineNo;
						resultData.selectedItemSetList.forEach(item => {
							orderItemLineNo += 10;
							item.leadOrderItemLineNo = resultData.itemAppDto.orderItemLineNo;
							item.orderItemLineNo = orderItemLineNo
							item.strongFlag = item.forceFlag
							item.versionStamp = this.goodInfo.versionStamp
						})
						uni.setStorageSync('orderItemLineNo', orderItemLineNo)
						this.dataDeal(JSON.parse(JSON.stringify(resultData)));
					} else {
						uni.showToast({
							title: res.message,
							icon: 'none'
						})
					}
				}
			})
		},
		common(object) {
			object.imageUrl = this.goodInfo.pictureUrl || this.goodInfo.imageUrl
			let itemSpecsWithSmallSpec = '',
				itemSpecsIssueSeq = '';
			this.showSpecList.forEach(ele => {
				if (ele.count > 1) {
					ele.newSpec = ele.plName + '×' + ele.count
				} else {
					ele.newSpec = ele.plName
				}
				itemSpecsWithSmallSpec += ele.newSpec + '+';
				if (ele.issueseq.indexOf('+') != -1) {
					itemSpecsIssueSeq = ele.issueseq + '+'
				} else {
					ele.newissueseq = '';
					if (ele.count > 1) {
						for (let i = 0; i < ele.count; i++) {
							ele.newissueseq += ele.issueseq + '+'
						}
						ele.newissueseq = ele.newissueseq.substring(0, ele.newissueseq.length - 1)
					} else {
						ele.newissueseq = ele.issueseq
					}
					itemSpecsIssueSeq += ele.newissueseq + '+'
				}

			})
			itemSpecsWithSmallSpec = itemSpecsWithSmallSpec.substring(0, itemSpecsWithSmallSpec.length - 1)
			itemSpecsIssueSeq = itemSpecsIssueSeq.substring(0, itemSpecsIssueSeq.length - 1)
			object.itemSpecsWithSmallSpec = itemSpecsWithSmallSpec;
			object.itemSpecsIssueSeq = itemSpecsIssueSeq;
		},
		discard() {

		}
	},
	filters: {
		text(value) {
			let index = value.indexOf('(无)')
			if (index !== -1) {
				value = value.substring(0, index)
			}
			return value
		}
	}
}
