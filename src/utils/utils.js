import http from '@/utils/request.js'
import api from '@/api/index.js'
import msg from '@/utils/msg.js'
import md5 from "@/common/js/md5.js"

const utils = {}
let time = null;
// 获取当前日期
utils.getCurrentDate = (e) => {
	var date;
	if (e) {
		date = new Date(new Date().setMonth(new Date().getMonth() + 1)); //客户交期(当前日期的后一个月)
	} else {
		date = new Date(); //合同日期
	}
	var seperator1 = "-";
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = year + seperator1 + month + seperator1 + strDate;
	return currentdate;
}

// 求和
utils.sum = (list) => {
	let tmp = 0
	list.forEach(item => {
		tmp = tmp + Number(item)
	})
	return tmp
}
// 减法
utils.subtraction = (largeNum, num) => {
	let tmp = 0
	tmp = Number(largeNum) - Number(num)
	return tmp.toFixed(2)
}
// 循环赋值
utils.setEachVal = (list, name, val) => {
	list.forEach(item => {
		item[name] = val
	})
}
// 初始化商品属性
utils.setInitProd = (item, ObjectList) => {
	let index = 1; // 折扣类型默认
	item.checked = true; //初始化选中状态
	item.itemType = '1001'; // 所有移动端添加都为1001
	item.storageLocationId = !item.storageLocationId ? item.storageBinsId :item.storageLocationId
	item.storageLocationName = !item.storageLocationName ? item.storageBinsName : item.storageLocationName
	item.itemIdentificationNo = !item.itemIdentificationNo ? item.suitSerialNum : item.itemIdentificationNo
	item.sampleFlag = item.storageCode == '1001' ? '1' : '0' // 0和1004代表普通，1和1001代表样品
	item.freeTypeCode = '2'
	// 初始化行号
	if (item.orderItemLineNo > uni.getStorageSync('orderItemLineNo')) {
		uni.setStorageSync('orderItemLineNo', item.orderItemLineNo);
	}
	if (!item.dealPrice) {
		item.dealPrice = item.singlePrice * item.amount //初始化
	}
	if (item.singlePrice == 0) {
		item.freeTypeCode = '1'
		index = 0;
	}
	if (!item.itemFlag && item.storageCode && item.isAdd) {
		for (let i in ObjectList.discountList) {
			if (ObjectList.discountList[i].sampleFlag == item.sampleFlag) {
				item.discountTypeId = ObjectList.discountList[i].dealerDiscountId;
				item.discountTypeName = ObjectList.discountList[i].discountName;
				item.discountTypeCode = ObjectList.discountList[i].discountCode;
				if (ObjectList.discountList[i].defaultFlag == 1) {
					return
				}
			}
			
			if (i == (ObjectList.discountList.length - 1)) {
				item.itemFlag = true; // 初始化过默认样品
			}
		}
	}
	
	// 初始化折扣类型
	if (!item.discountTypeId && ObjectList.discountDeatilList) {
		item.discountTypeId = ObjectList.discountDeatilList[index] ? ObjectList.discountDeatilList[index].dealerDiscountId :
			'';
		item.discountTypeName = ObjectList.discountDeatilList[index] ? ObjectList.discountDeatilList[index].discountName :
			'';
		item.discountTypeCode = ObjectList.discountDeatilList[index] ? ObjectList.discountDeatilList[index].discountCode :
			'';
	}
	return item;
}
// 计算总价
utils.setTotal = (list, type) => {
	let tmp = 0
	switch (type) {
		case 'marked':
			list.forEach(item => {
				if (item.markedPrice) {
					tmp = tmp + item.markedPrice * item.amount
				}
			})
			break
		case 'deal':
			list.forEach(item => {
				if (item.singlePrice) {
					tmp = tmp + item.singlePrice * item.amount
				}
			})
			break
		case 'beforeTotalPrice':
			list.forEach(item => {
				if (item.markedPrice) {
					tmp = tmp + item.markedPrice * item.amount
				}
			})
			break
		case 'totalPrice':
			list.forEach(item => {
				if (item.singlePrice) {
					if (item.dealPrice && item.isOld) {
						tmp = tmp + parseFloat(item.dealPrice);
					} else {
						tmp = tmp + item.singlePrice * item.amount
					}
					if (!item.dealPrice) {
						item.dealPrice = (item.singlePrice * item.amount).toFixed(2)

					}
				}
			})
			break
	}
	return tmp.toFixed(2)
}

// 计算折扣金额
utils.setDiscount = (oriPrice, curPrice) => {
	let tmp = 0
	tmp = curPrice - oriPrice
	return tmp.toFixed(2)
}

// 成交价分摊赋值
utils.setEachItemDealPrice = (list, computedList) => {
	let tmp = JSON.parse(computedList)
	let len = tmp.length
	for (let i = 0; i < len; i++) {
		if (!list[i].itemModel && !list[i].itemSpecs) {} else {
			list[i].singlePrice = tmp[i].singlePrice
			list[i].discountRate = tmp[i].discountRate
			list[i].dealPrice = tmp[i].dealPrice
		}
	}
}

// 计算增加价格
utils.computeAddPrice = (prodList) => {
	let tmp = 0
	prodList.forEach(item => {
		if (item.markedPrice) {
			tmp = tmp + Number(item.markedPrice)
		}
	})
	return tmp
}

// 格式化数据类型
utils.filterData = (data, type) => {
	switch (type) {
		case 'draft':

			break
		case 'item':
			data.singlePrice = data.singlePrice ? Number(data.singlePrice) : data.singlePrice,
				data.dealPrice = data.singlePrice ? Number(data.singlePrice) * data.amout : data.dealPrice
			break
		case 'updateDraft':
			data.singlePrice = data.singlePrice ? Number(data.singlePrice) : data.singlePrice,
				data.itemSpecs = data.itemSpecs
			data.mmodel = data.mmodel
			break;
	}
	return data
}

// 格式化附件图片
utils.filterAttachmentUrl = (list) => {
	let tmp = []
	list.forEach(item => {
		tmp.push(item.fileUrl)
	})
	return tmp
}

utils.filterAttachmentId = (list) => {
	let tmp = []
	list.forEach(item => {
		tmp.push(item.fileId)
	})
	return tmp
}

// 设置用户信息
utils.setSaleInfo = (data) => {
	let userInfo = uni.getStorageSync('userInfo')
	data.personPhone = userInfo.personPhone
	data.salesNo = userInfo.personCode
	data.salesName = userInfo.personName
	data.salesId = userInfo.personId
}

// 草稿 转换
utils.draftChange = (data, prodList) => {
	let createListSales = [];
	// data.contractDate = utils.getCurrentDate();
	data.createListSales = createListSales;
	data.createListItem = prodList;
	data.cartItemInsertList = prodList
	let dataForm = data;
	return dataForm
}

// 格式化零售单
utils.addLsOrder = (data, prodList, confirmSum, receiptList) => {
	let dataForm = {}
	let createListSales = []
	let salesNo = []
	salesNo = data.salesNo.split(',')
	salesNo.forEach(item => {
		createListSales.push({
			salesNo: item.toString()
		})
	})
	if (!data.contractDate) {
		data.contractDate = utils.getCurrentDate()
	}
	data.createListItem = prodList;
	let totalReceipt = 0
	receiptList.forEach(item => {
		totalReceipt = totalReceipt + Number(item.confirmSum)
	})
	data.confirmedSum = confirmSum.realSum + totalReceipt
	dataForm = {
		data: data,
		receiptList: receiptList
	}

	return dataForm
}

// 设置更新零售单
utils.setLsOrder = (data, prodList, createList, deleteList, updateList, receiptList) => {
	let dataForm = {}
	let tmp_1 = []
	let tmp_2 = []
	let md5ProdList = uni.getStorageSync("md5ProdList");
	
	prodList.forEach(item => {
		delete item.isOld;
		delete item.totalDealPrice;
		
		if (item.isAdd) {
			tmp_1.push(item)
		}
		
		if (item.orderItemId) {
			item.updateflag = 0;
			md5ProdList.forEach(ele => {
				if (ele.md5Id == item.md5No && ele.md5Str != md5.hex_md5(JSON.stringify(item))) {
					item.updateflag = 1;
				}
			})
			tmp_2.push(item)
		}
	})
	data.createListItem = tmp_1
	data.deleteListItem = deleteList
	data.updateListItem = tmp_2
	data.selectListItem = [];
	data.selectListSales = [];
	dataForm = {
		data: data,
		receiptList: receiptList
	}
	return dataForm
}

// 判断是否存在自提单
utils.isZt = (list) => {
	for (let i = 0; i < list.length; i++) {
		if (list[i].orderTypeCode == 1003) {
			return true
		}
		if (i == (list.length - 1)) {
			return false
		}
	}
}

// 计算自提金额
utils.computeZt = (list) => {
	let tmp = 0
	list.forEach(item => {
		if (item.orderTypeCode == 1003) {
			tmp = tmp + item.singlePrice * item.amount
		}
	})
	return tmp
}

// 设置料品价格
utils.setItemPrice = (item, itemCode) => {
	http({
		url: api.getItemPrice,
		data: {
			itemCode: itemCode
		},
		success: res => {
			item.markedPrice = res.data.markedPrice
			item.singlePrice = res.data.markedPrice

		}
	})

}

// 计算金额
// 总金额 markedTotalPrice 折扣金额 discountPrice 成交价 totalPrice 总价 totalDealPrice
utils.setListItemsPrice = (prodList, list, data) => {
	let totalMarkedPrice = 0
	list.forEach(item => {
		totalMarkedPrice = totalMarkedPrice + item.dealPrice
	})
	for (let i = 0; i < list.length; i++) {
		prodList[i].totalDealPrice = list[i].totalDealPrice
		prodList[i].totalMarkedPrice = list[i].totalMarkedPrice
		prodList[i].totalPrice = list[i].totalDealPrice
		prodList[i].discountRate = list[i].discountRate
		prodList[i].singlePrice = list[i].singlePrice
		prodList[i].dealPrice = list[i].dealPrice
	}
	let item = list[0]
	data.totalMarkedPrice = item.totalMarkedPrice ? item.totalMarkedPrice : 0
	data.totalPrice = item.totalPrice ? item.totalPrice : 0
}
// 获取订单中商品的最大行数
utils.getOrderItemLineNo = () => {
	let prodList = uni.getStorageSync('prodList') ? uni.getStorageSync('prodList') : [],
		delList = uni.getStorageSync('delList') ? uni.getStorageSync('delList') : [],
		orderItemLineNo = 0;
	// 合并
	prodList = prodList.concat(delList);
	prodList.forEach(item => {
		if (item.orderItemLineNo > orderItemLineNo) {
			orderItemLineNo = item.orderItemLineNo;
		}
	})
	
	uni.setStorageSync('orderItemLineNo', orderItemLineNo)
	return orderItemLineNo;
}

// 订单明细增删改
utils.setOrderItem = (data, list, type) => {
	let curItem = list[0]
	let index = curItem.index
	switch (type) {
		case 'add':
			data['updateListItem'] = data['updateListItem'].concat(list)
			break
		case 'update':
			if (!data.updateListItem) {
				data.updateListItem = []
			}
			let updateListItem = data.updateListItem
			if (updateListItem.length > 0) {
				for (let i = 0; i < updateListItem.length; i++) {
					if (curItem.orderItemId == updateListItem[i].orderItemId) {
						updateListItem[i] = curItem
					} else {
						updateListItem.push(curItem)
					}
				}
			} else {
				updateListItem.push(curItem)
			}
			break
		case 'updateItem':
			data[index] = curItem
			break
		case 'remove':

			break
	}
	return data
}

//规格校验
utils.limitSpec = (list) => {
	let flag = 0
	list.forEach(ele => {
		if (ele.configureAllowFlag == '1' && (ele.itemSpecs == undefined || ele.itemSpecs == null || ele.itemSpecs.trim() ==
				'' || ele.itemSpecs.trim() == '0' || ele.itemModel == undefined || ele.itemModel == null || ele.itemModel.trim() ==
				'' || ele.itemModel.trim() == '0')) {
			msg('料号：' + ele.productNo + '没有选配，请先选配')
			flag++
			return false;
		}
	})
	return flag > 0 ? true : false
}

// 数组去重
utils.deteleObject = (obj) => {
	var uniques = [];
	var stringify = {};
	for (var i = 0; i < obj.length; i++) {
		var keys = Object.keys(obj[i]);
		keys.sort(function(a, b) {
			return (Number(a) - Number(b));
		});
		var str = '';
		for (var j = 0; j < keys.length; j++) {
			str += JSON.stringify(keys[j]);
			str += JSON.stringify(obj[i][keys[j]]);
		}
		if (!stringify.hasOwnProperty(str)) {
			uniques.push(obj[i]);
			stringify[str] = true;
		}
	}
	uniques = uniques;
	return uniques;
}
// 防止重复多次点击
utils.multipleClicks = (title = '', duration = 800) => {
	let isDisabled = false;
	if (!uni.getStorageSync('isDisabled')) {
		isDisabled = true;
		uni.setStorageSync('isDisabled', isDisabled);
		if (title) {
			uni.showLoading({
				title: title
			})
			if (duration == 800) {
				duration = 3000
			}
		}
		time = setInterval(() => {
			if (uni.getStorageSync('isDisabled')) {
				uni.removeStorageSync('isDisabled')
				clearInterval(time);
			}
		}, duration)
	}
	return isDisabled;
}
utils.multipleRemoveClicks = () => {
	if (uni.getStorageSync('isDisabled')) {
		uni.removeStorageSync('isDisabled')
		clearInterval(time);
	}
}
// 数字格式化（只能输入数字或两位小数）
utils.inputNum = (val, max) => {
	// let maxLength = val.indexOf('.');
	// // 限制长度
	// if (val.length > max) {
	// 	val = val.substring(0, val.length - 1)
	// 	uni.showToast({
	// 		title: `长度最大不能超过${max}位`,
	// 		icon: 'none'
	// 	})
	// 	return val
	// }
	if (val.indexOf(".") < 0 && val != "") {
		val = parseFloat(val);
	} else if (val.indexOf(".") == 0) {
		//'首位小数点情况'
		val = val.replace(/[^$#$]/g, "0.");
		val = val.replace(/\.{2,}/g, ".");
	} else if (val.indexOf(".") > 0) {
		if (!(/^(\d?)+(\.\d{0,2})?$/.test(val))) {
			//去掉最后一位
			val = val.substring(0, val.length - 1)
		}
		if (val.indexOf(".") > 1 && val.indexOf("0") == 0) {
			val = val.substring(1, val.length)
		}
	}
	return val
}

// 获取埋点信息
utils.getAnaInfo = (name) => {
	let tmp = {}
	let userInfo = uni.getStorageSync('userInfo')
	let storeInfo = uni.getStorageSync('storeInfo')
	tmp = {
		user_name: userInfo.userName,
		user_phone: userInfo.personPhone,
		store_name: storeInfo.storeName,
		store_id: storeInfo.storeId,
		org_id: storeInfo.orgId
	}
	wx.reportAnalytics(name, tmp)
}

export default utils
