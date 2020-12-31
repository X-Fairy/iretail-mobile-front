export default {
	data() {
		return {
			discountIndex: 0, // 当前折扣类型
			discountList: [], // 折扣类型列表
			discountDeatilList: [], // 折扣类型默认列表
			// 编辑弹窗
			modalShow: false, // 编辑弹窗
			modalProduct: {},
			targetIndex: null,
			// 选配弹窗
			popupClass: '',
			hackReset: true
		}
	},
	methods: {
		// 设置默认销售人员
		setDefaultSale() {
			this.$utils.setSaleInfo(this.draftForm)
			let user = {
				checked: true,
				personId: this.draftForm.salesId,
				personName: this.draftForm.salesName,
				personCode: this.draftForm.salesNo
			}
			uni.setStorageSync('choosePerson', [user])
		},
		// 初始化接口返回销售人员
		initSales() {
			let salesCode = this.draftForm.salesNo.split(',')
			let salesId = this.draftForm.salesId.split(',')
			let salesName = this.draftForm.salesName.split(',')
			let tmp = []
			for (let i = 0; i < salesId.length; i++) {
				tmp.push({
					checked: true,
					personId: salesId[i],
					personName: salesName[i],
					personCode: salesCode[i]
				})
			}
			this.showSalesName(this.draftForm.salesName);
			uni.setStorageSync('choosePerson', tmp)
		},
		// 回填销售人员
		setSalesList() {
			let sales = uni.getStorageSync('choosePerson')
			let tmpCode = []
			let tmpName = []
			let tmpId = []
			sales.forEach(res => {
				tmpCode.push(res.personCode)
				tmpName.push(res.personName)
				tmpId.push(res.personId)
			})
			this.draftForm.salesId = tmpId.join(',')
			this.draftForm.salesNo = tmpCode.join(',')
			this.draftForm.salesName = tmpName.join(',')
			
			this.showSalesName(this.draftForm.salesName);
		},
		// 销售人员展示风格
		showSalesName(salesName) {
			let strName = salesName.replace(/,/g, '  ');
			let list = strName.split(''), length = 0, len = 0;
			list.forEach(str => {
				if (len < 32) {
					length++;
					if(/^[\u4e00-\u9fa5]+$/.test(str)){
						len += 2;
					} else {
						len++;
					}
				}
			})
			if (len >= 32) {
				this.draftForm.salesShowName = strName.substr(0, length).trim() + '...';
			} else {
				this.draftForm.salesShowName = strName;
			}
			// #ifdef H5
			this.hackReset = false;
			this.$nextTick(() => {
				this.hackReset = true;
			})
			// #endif
		},
		// 编辑商品
		editHandle(item, index) {
			if (!item.itemSpecs) {
				this.$msg('请先进行选配')
				return
			}
			this.compareDiscount(item);
			this.modalProduct = item
			this.targetIndex = index;
			this.modalProduct.newPrice = null;
			this.$refs.productPop.showPopup(item);
		},
		compareDiscount(item) {
			this.discountList.forEach((ele, index) => {
				if (item.discountTypeId && item.discountTypeId == ele.dealerDiscountId) {
					this.discountIndex = index;
				}
			})
		},
		bindDiscountChange(e) {
			this.discountIndex = Number(e.detail.value);
			if (JSON.stringify(this.modalProduct.discountTypeId) != this.discountList[this.discountIndex].dealerDiscountId) {
				if (this.discountList[this.discountIndex].freeType == 1) {
					this.modalProduct.singlePrice = 0
				} else {
					if (this.modalProduct.singlePrice == 0) {
						this.modalProduct.singlePrice = this.modalProduct.markedPrice ? this.modalProduct.markedPrice : 1
					}
				}
			}
			this.modalProduct.discountTypeId = this.discountList[this.discountIndex].dealerDiscountId;
			this.modalProduct.discountTypeCode = this.discountList[this.discountIndex].discountCode;
			this.modalProduct.discountTypeName = this.discountList[this.discountIndex].discountName;
		},
		// 编辑提交
		editSubmit() {
			var r = /^\d+(\.\d+)?$/ //只能有一位小数
			if(!r.test(this.modalProduct.singlePrice)){
				this.$msg('请输入正确的金额')
				return
			}
			let str = this.modalProduct.singlePrice.toString(),
				len = str.length
			if (len > 9) {
				this.$msg('请输入最多九位数的金额')
				return
			}
			var re = /^[1-9]\d*$/;//正整数
			if (!re.test(this.modalProduct.amount)) {
				this.$msg('请输入正确的数量')
				return
			}
			if (this.modalProduct.amount == '' || this.modalProduct.amount <= 0) {
				this.$msg('数量不能小于0，不能为空')
				return
			}
			let count = this.modalProduct.amount.toString(),
				length = count.length
			if (length > 5) {
				this.$msg('请输入最多四位数的数量')
				return
			}
			
			if(this.modalProduct.dealPrice!=""){
				this.modalProduct.dealPrice = (this.modalProduct.singlePrice * this.modalProduct.amount).toFixed(2);
			}
			if (this.modalProduct.singlePrice == 0) {
				this.modalProduct.freeTypeCode = '1'				
			} else {
				this.modalProduct.freeTypeCode = '2'
			}
			this.draftForm.cartItemUpdateList = this.modalProduct;
			this.prodList[this.modalProduct.index] = this.modalProduct;
			this.modalShow = false;
			this.updateDraft(false);
			this.$refs.productPop.hidePopup();
		},
		// 计算成交金额
		setTotalPrice() {
			let beforeTotalPrice = this.$utils.setTotal(this.prodList, 'beforeTotalPrice')
			// 当改总价时直接拿后端dealPrice计算
			if (this.oldList && this.oldList.length > 0) {
				this.prodList.forEach(item => {
					item.isOld = false;
					this.oldList.forEach(ele => {
						if (ele.productNo == item.productNo && ele.itemModel == item.itemModel && ele.amount == item.amount && ele.singlePrice == item.singlePrice) {
							item.dealPrice = ele.dealPrice;
							item.isOld = true;
						}
					})
				})
			}
			let totalPrice = this.$utils.setTotal(this.prodList, 'totalPrice')
			let discountPrice = this.$utils.setDiscount(beforeTotalPrice, totalPrice)
			this.draftForm.itemChargedTotal = totalPrice
			this.draftForm.beforeTotalPrice = beforeTotalPrice
			this.draftForm.discountPrice = discountPrice
		},
		//prod-list子组件number-box-list加减法数量改变事件
		prodlistAmount(item){
			this.modalProduct = item;
			this.editSubmit()
		}
	}
}
