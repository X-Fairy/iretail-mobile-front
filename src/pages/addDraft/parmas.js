export default{
    orderParamsData:{
        orderId: '', // 订单id 60300483
        statusCode: '',
        storeNo: '', // 门店编码
        customerName: '', // 客户名称
        customerCellphoneNum: '', // 客户电话
        detailAddress: '', //客户地址详情，
		cityCode:"",
		cityName:"",
		countyCode:"",
		countyName:"",
		consigneeAddress: '', // 详细地址
		consigneeAddressDetail: '', // 客户地址详情
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
		storeId:''
    },
	draftForm: {
		ordFusionShoppingCartId: '', // 订单id
		storeNo: '', // 门店编码
		customerName: '', // 客户名称
		customerCellphoneNum: '', // 客户电话
		consigneeCommunity: "",
		countyName: '', // 区
		consigneeAddress: '', // 详细地址
		consigneeAddressDetail: '', // 客户地址详情
		deliveryDate: '', // 客户交期
		contractDate: '', //合同日期（当天日期）
		notes: '', // 备注，
		consigneeNotes:'',//送货说明
		totalPrice: 0, // 成交总价 
		itemChargedTotal: 0, //货品总金额
		beforeTotalPrice: 0, // 总金额
		discountPrice: 0, // 折扣金额
		confirmedSum: 0, // 收款金额
		marketingPolicyId: '', // 销售政策
		marketingPolicyName: '',
		salesNo: '',
		salesName: '',
		salesShowName: '',
		salesId: '',
		orderDocsNo: '', // 纸质单号
		orderTypeCode: '', //1001零售 1003自提
		cartItemInsertList: [],
		attachmentId: '', // 附件
		receiptList: [],
	}
}