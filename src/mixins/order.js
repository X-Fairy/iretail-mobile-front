export default {
	data() {
		return {
			createListItem: [], //添加商品
			deleteListItem: [], // 删除商品
			updateListItem: [], // 更新商品
			discountIndex: 0, // 当前折扣类型
			discountList: [], // 折扣类型列表
			discountDeatilList: [], // 折扣类型默认列表
			prodList: [], // 即时商品列表
			// 编辑弹窗
			modalShow: false, // 编辑弹窗
			modalProduct: {},
			// 选配弹窗
			popupClass: '',
			hackReset: true
		}
	},
	methods: {
		// 设置默认销售人员
		setDefaultSale() {
			this.$utils.setSaleInfo(this.orderForm)
			let user = {
				checked: true,
				personId: this.orderForm.salesId,
				personName: this.orderForm.salesName,
				personCode: this.orderForm.salesNo,
				personPhone: this.orderForm.personPhone,
				achieveRate:100
			}
			uni.setStorageSync('choosePerson', [user])
		},
		// 初始化接口返回销售人员
		initSales() {
			// let salesCode = this.orderForm.salesNo.split(',')
			// let salesId = this.orderForm.salesId.split(',')
			// let salesName = this.orderForm.salesName.split(',')
			let tmp = []	
			this.orderForm.selectListSales.forEach(ele=>{
				tmp.push({
					checked: true,
					personId: ele.salesId,
					personName: ele.salesName,
					personCode: ele.salesNo,
					salesId: ele.salesId,
					salesName: ele.salesName,
					salesNo: ele.salesNo,
					achieveRate:ele.achieveRate
				})
			})
			console.log(tmp)
			// for (let i = 0; i < salesId.length; i++) {
			// 	tmp.push({
			// 		checked: true,
			// 		personId: salesId[i],
			// 		personName: salesName[i],
			// 		personCode: salesCode[i],
			// 		salesId: salesId[i],
			// 		salesName: salesName[i],
			// 		salesNo: salesCode[i],
			// 	})
			// }
			this.orderForm.createListSales = tmp
			this.showSalesName(this.orderForm.salesName);
			uni.setStorageSync('choosePerson', tmp)
		},
		// 回填销售人员
		setSalesList() {
			let sales = uni.getStorageSync('choosePerson')
			this.orderForm.createListSales = sales
			let tmpCode = []
			let tmpName = []
			let tmpId = []
			let saleList = []
			sales.forEach(res => {
				tmpCode.push(res.personCode)
				tmpName.push(res.personName)
				tmpId.push(res.personId)
				let ele = {
					checked: true,
					personId: res.personId,
					personName: res.personName,
					personCode: res.personCode,
					salesId: res.personId,					
					salesName: res.personName,
					salesNo: res.personCode,
					salesPhone: res.personPhone,
					achieveRate:res.achieveRate
				}
				saleList.push(ele)
			})
			this.orderForm.createListSales = saleList
			this.orderForm.salesId = tmpId.join(',')
			this.orderForm.salesNo = tmpCode.join(',')
			this.orderForm.salesName = tmpName.join(',')
			
			this.showSalesName(this.orderForm.salesName);
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
				this.orderForm.salesShowName = strName.substr(0, length).trim() + '...' ;
			} else {
				this.orderForm.salesShowName = strName;
			}
			// #ifdef H5
			this.hackReset = false;
			this.$nextTick(() => {
				this.hackReset = true;
			})
			// #endif
		},
		// 编辑商品
		editHandle(item) {
			if (!item.itemSpecs) {
				this.$msg('请先进行选配')
				return
			}
			this.compareDiscount(item);
			this.modalProduct = item
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
			// debugger
			// this.modalProduct.updateFlag = 1;
			var r = /^\d+(\.\d+)?$/ //只能有一位小数
			if (!r.test(this.modalProduct.singlePrice)) {
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
			
			if(this.modalProduct.dealPrice != ""){
				this.modalProduct.dealPrice = (this.modalProduct.singlePrice * this.modalProduct.amount).toFixed(2);
			}
			if (this.modalProduct.singlePrice == 0) {
				this.modalProduct.freeTypeCode = '1'
			} else {
				this.modalProduct.freeTypeCode = '2'
			}
			this.prodList[this.modalProduct.index] = this.modalProduct;
			this.modalShow = false;
			this.setTotalPrice()
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
			let discountPrice = this.$utils.setDiscount(beforeTotalPrice, totalPrice);
			this.orderForm.itemChargedTotal = totalPrice
			this.orderForm.discountBeforeTotal = beforeTotalPrice
			this.orderForm.discountTotal = discountPrice
			//未收款计算
			if (this.orderForm.costTotal) {
				this.orderForm.notChargedTotal = this.$utils.subtraction(Number(this.orderForm.itemChargedTotal) + Number(this.orderForm.costTotal), this.orderForm.chargedTotal)
			} else {
				this.orderForm.notChargedTotal = this.$utils.subtraction(this.orderForm.itemChargedTotal, this.orderForm.chargedTotal)
			}
		},
		// 选配打开
		xpHandle(item) {			
			if (item.configureAllowFlag == 1) {
				if(item.statusCode == '1001' || !item.statusCode){
					this.configInfo(item)
				}				
			}
		},
		// 判断是否需要选配
		configInfo(item){
			this.$http({
				url:this.$api.queryLastConfigInfo,
				data:{
					itemCode:item.originalItemCode
				},
				success:(res)=>{
					if(res.data.type==1){
						this.popupClass = 'show';
						item.selfUPFlag = "updateFlag"; //订单修改商品信息
						this.$refs.prodPop.showPopup(this.popupClass, item);
						this.modalProduct = item
					}
				}
			})
		},
		// 订单跟踪
		toTrack() {
			uni.navigateTo({
				url: '/pages/orderTracking/orderTracking?orderId=' + this.orderForm.orderId + '&orderTypeCode=' + this.orderForm.orderTypeCode +
					'&statusCode=' + this.orderForm.statusCode
			})
		},
		// 成交价改变
		changeDealPrice(e) {
			var reg = /^\d+(\.\d+)?$/ //正整数
			if (!reg.test(e)) {
				this.$msg('请输入正确的金额')
				return
			}
			let total = Number(e).toFixed(2)
			//未收款计算
			if (this.orderForm.costTotal) {
				this.orderForm.notChargedTotal = this.$utils.subtraction(Number(this.orderForm.itemChargedTotal) + Number(this.orderForm.costTotal), this.orderForm.chargedTotal)
			} else {
				this.orderForm.notChargedTotal = this.$utils.subtraction(this.orderForm.itemChargedTotal, this.orderForm.chargedTotal)
			}
			this.computeDealPrice(total)
		},		
		// 去填收款单
		toOrderCollection() {
			if(uni.getStorageSync('storeInfo').storeName=='门店全局'){
				this.$msg('门店全局下不能收款')
				return
			}
			if(this.showFlag){
				uni.setStorageSync("flagData",this.createListItem)
			}
			if (!this.orderForm.customerCellphoneNum) {
				this.$msg('请先填写手机号')
				return false
			}
			this.$store.state.collectionData = {
				storeNo: this.orderForm.storeNo,
				orderNo: this.orderForm.orderNo,
				customerCellphoneNum: this.orderForm.customerCellphoneNum,
				customerName: this.orderForm.customerName
			}
			let money = this.orderForm.notChargedTotal
			// 新页面部分功能接口未开发
			uni.navigateTo({
				url: '../collectionDetail/collectionDetail?money=' + money+'&order=2'
			})
		},
		// 删除商品回调
		removeHandle(e) {
			if (e.orderItemId) {
				this.deleteListItem.push(e)
			}
			this.prodList.forEach(prodItem => {
				if (prodItem.leadOrderItemLineNo == e.orderItemLineNo) {
					prodItem.leadOrderItemLineNo = null;
					prodItem.strongFlag = null
					// delete prodItem.leadOrderItemLineNo;
					// delete prodItem.strongFlag
				}
			})
			this.prodList.splice(e.index, 1)
			this.setTotalPrice()
		},
		//prod-list子组件number-box-list加减法数量改变事件
		prodlistAmount(item) {
			this.modalProduct = item
			this.editSubmit()
		}
	}
}
