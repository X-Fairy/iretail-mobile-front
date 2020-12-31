export default{
    orderParamsData:{
        orderId: '', // 订单id 60300483
        statusCode: '',
        storeNo: '', // 门店编码
        customerName: '', // 客户名称
        customerCellphoneNum: '', // 客户电话
        detailAddress: '', //客户地址详情，
        consigneeAddressDetail: '',
        consigneeAddress:'',
		consigneeCommunity:'',
        deliveryDate: '', // 顾客日期
        contractDate: '', //合同日期（当天日期）
        notes: '', // 备注，
		consigneeNotes:'',//送货说明
        orderDocsNo: '', //纸质单号
		orderTypeCode: '', //1001零售 1003自提
        discountBeforeTotal: 0, //总金额
        discountTotal: 0, // 折扣金额
        totalPrice: 0, //成交金额
		itemChargedTotal: 0, //货品总金额
        confirmedSum: 0, //收款金额
        dealPrice: 0, // 成交总价 
        marketingPolicyId: '', // 销售政策
		marketingPolicyName: '', // 销售政策
        createListSales: [], //销售人员手机号集合       
        createListItem: [], //添加商品
		cartItemInsertList:[],
        deleteListItem: [], // 删除商品
        updateListItem: [], // 更新商品
        receiptList: [], //关联意向金
        money: 0, //意向金金额
        confirmSum: {}, //收款信息
        chargedTotal: 0, // 已收款
        notChargedTotal: 0, // 未收款金额
        attachmentId: '', // 附件
        salesNo:"",
		salesName: '', // 销售人员
        storeId:'',
        provinceCode:"",
        provinceName:"",
        cityCode:"",
        cityName:"",
        countyCode:"",
        countyName:"",
        consigneeAddressLongitude:"",
        consigneeAddressLatitude:"",
    },
	orderForm: {
		orderId: '', // 订单id 60300483
		statusCode: '',
		storeNo: '', // 门店编码
		customerName: '', // 客户名称
		customerCellphoneNum: '', // 客户电话
		detailAddress: '', //客户地址详情，
		consigneeAddressDetail: '',
		deliveryDate: '', // 顾客日期
		contractDate: '', //合同日期（当天日期）
		notes: '', // 备注，
		consigneeNotes:'',//送货说明
		orderDocsNo: '', //纸质单号
		orderTypeCode: '', //1001零售 1003自提
		discountBeforeTotal: 0, //总金额
		discountTotal: 0, // 折扣金额
		totalPrice: 0, //成交金额
		itemChargedTotal: 0, //货品总金额
		confirmedSum: 0, //收款金额
		dealPrice: 0, // 成交总价 
		marketingPolicyId: '', // 销售政策
		createListSales: [], //销售人员手机号集合
		salesName: '', // 销售人员
		salesShowName: '', // 展示销售人员
		createListItem: [], //添加商品
		deleteListItem: [], // 删除商品
		updateListItem: [], // 更新商品
		receiptList: [], //关联意向金
		money: 0, //意向金金额
		confirmSum: {}, //收款信息
		chargedTotal: 0, // 已收款
		notChargedTotal: 0, // 未收款金额
		attachmentId: '', // 附件
		consigneeCommunity: "",
		buyPrice: "", //成交价格标示
		prodList: null
	}
}