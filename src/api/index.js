// #ifndef H5
// const host = 'https://ls.kukahome.com/apis/'  // 正式
const host = 'https://lstest.kukahome.com/apis/' 
// const host = 'https://lsrelease.kukahome.com/apis/'
// const host = 'http://192.168.248.123:8082/'// 献涛 
// const host = 'http://192.168.251.198:8082/' // 杨林/
// #endif
// #ifdef H5
const host = '/h5/' 
// #endif

const isMock = false
const api = {
	baseUrl: host,
	mock: isMock,
	isTest: false,
	token: {},
	// 获取短信验证码
	getMsgCode: host + 'iretail/phone/identify',
	// 获取 unionId
	getWxUid: 'iretail/api/mobile/app/queryUnionId',
	// unionId 登录
	wxLogin: 'iretail/api/mobile/app/userAccountNoPassWdLogin',
	// 手机密码登录
	pwLogin: 'iretail/api/mobile/app/userAccountLogin',
	// 登录
	identifyLogin: 'iretail/api/mobile/app/phoneIdentifyLogin',
	// 获取账号名和生效门店权限列表
	AuthDataInfo: 'iretail/api/mobile/app/queryAuthDataInfo',
	// 保存意向金
	saveReceipt: 'iretail/api/mobile/app/saveReceipt',
	//意向金确认
	saveAndSummitReceipt: 'iretail/api/mobileShoping/receiptconfirm/app/saveAndSummitReceipt',
	// 获取收款方式
	dealerSettle: 'iretail/api/mobile/app/queryDealerSettle',
	// 获取收款类型
	receiptTypeList: 'iretail/api/mobile/app/queryReceiptTypeList',
	// 获取收款详情
	receiptAsDetail: 'iretail/api/mobile/app/queryReceiptAsDetail',
	// 获取收款性质
	paymentNature:'iretail/api/mobile/app/queryPaymentNature',
	// 门店切换
	changeSessionDealer: 'iretail/api/mobile/app/changeSessionDealer',
	// 获取意向金
	getReceiptList: 'iretail/api/mobile/app/queryReceiptList',
	// 订单已收款列表查询
	getOrderReceiptList:'iretail/api/mobile/app/queryOrderReceiptList',
	// 获取关联意向金
	getConfirmWithPagination:'iretail/api/mobile/app/queryConfirmWithPagination',
	// 商品档案查询
	getItemInfo: 'iretail/api/mobile/app/queryItemInfo',
	// 库存可用量列表查询
	getStockAvailableQty: 'iretail/api/mobile/app/queryStockAvailableQty',
	// 订单列表
	getOrderList: 'iretail/api/mobile/app/queryOrderList',
	// 上传附件
	upload: 'attachment/upload',
	// 上传附件直接保存
	uploadSave: 'iretail/api/mobile/app/modifyAttachment',
	// 海报合成
	generateImg: 'attachment/generateImg',
	// 打印
	orderPrint: 'attachment/generateImageForOther',
	// 获取商品详情
	getProductDetail: 'iretail/api/mobile/app/queryItemDetail',
	// 退出登录
	logout: 'logout',
	// 销售人员列表queryPersonList
	personList: 'iretail/api/mobile/app/queryPersonMobiles',
	// 获取销售政策
	getpolicyList: 'iretail/api/mobile/app/queryPolicyList',
	// 新增草稿订单
	addDraft: 'iretail/fusion/app/api/v1/addShoppingCart',
	// 查询草稿单详情
	getDraftInfo: 'iretail/fusion/app/api/v1/queryShoppingCart',
	// 删除草稿单
	removeDraft: 'iretail/fusion/app/api/v1/removeShoppingCart',
	// 删除草稿明细
	removeDraftItem: 'iretail/fusion/app/api/v1/removeShoppingCartItemV2',
	// 批量删除草稿明细
	removeBatchItems: 'iretail/fusion/app/api/v1/batchRemoveShoppingCartItems',
	// 更新草稿单主体
	updateDraft: 'iretail/fusion/app/api/v1/updateShoppingCart',
	// 更新草稿单明细,
	updateDraftItem: 'iretail/fusion/app/api/v1/modifyShoppingCartItemV2',
	// 新增草稿单明细
	addDraftItem: 'iretail/fusion/app/api/v1/addShoppingCartItemBatchV2',
	// 获取商品规格
	getConfigSet: 'iretail/api/mobile/app/queryConfigSet',
	// 保存商品规格
	saveItemConfigResult: 'iretail/api/mobile/app/saveItemConfigResult',
	// 商品折扣类型
	getDealerDiscount: 'iretail/api/mobile/app/queryChlDealerDiscount',
	// 草稿单列表
	getDraftList: 'iretail/fusion/app/api/v1/queryShoppingCartList',
	// 草稿单删除
	delDraft: 'iretail/fusion/app/api/v1/batchRemoveShoppingCart',
	// 查询组织参数
	getOrgParams: 'iretail/api/mobile/app/queryMobileOrgParam',
	// 订单跟踪
	getOrderTracking: 'iretail/api/mobile/app/queryOrderTracking',
	// 订单跟踪new
	getOrdSalTracking: 'iretail/api/mobile/app/queryOrdSalOrderOperationHistory',
	// 成交价计算
	getDealPrice: 'iretail/api/mobile/app/queryTransactionPrice',
	// 订单详情
	getOrderDetail: 'iretail/api/mobile/app/queryOrderDetail',
	// 上下样订单详情
	getQuerySingle: 'iretail/api/mobileShoping/app/querySingle',
	// 批量更新草稿单明细
	updateDraftItemList: 'iretail/fusion/app/api/v1/batchModifyShoppingCartItemV2',
	// 新增零售单
	addLsOrder: 'iretail/api/mobile/app/createSaleOrder',
	// 更新零售单
	updateLsOrder: 'iretail/api/mobile/app/modifySalOrder',
	// 提交零售单
	submitSalOrder: 'iretail/api/mobile/app/submitSalOrder',
	// 附件查询
	getAttachmentList: 'iretail/api/mobile/app/queryAttachmentList',
	// 创建零售单
	createSaleOrder: 'iretail/api/mobile/app/createSaleOrder',
	// 手机号模糊查询
	getCustomerListByPhone: 'iretail/api/mobile/app/queryCustomerListByPhone',
	// 差价
	getItemPrice: 'iretail/api/mobile/app/queryItmItemMarkedPrice',
	// 扫码查询
	getScanItemDetail: 'iretail/api/mobile/app/queryStockInfoByItemCode',
	// 是否带强弱齐配
	checkKitBill: 'iretail/api/mobileShoping/app/checkConfigConfigureKitBill',
	// 查询图库图片列表
	getImageList:'iretail/api/mobile/app/queryTKImageList',
	// 首页-门店货号列表
	getProductNoList:'iretail/api/mobile/app/productNoList',
	// 首页-货号详情查询SKU
	topSkuList:'iretail/api/mobile/app/topSkuList',
	// 模糊搜索地址
	SearchAddress:'iretail/api/mobile/app/getCustomerAddressList',
	// 查询门店地址
	queryStoreListByPage:'iretail/api/mobile/app/queryStoreListByPage',
	// 查询首页商品
	queryIndexProd: 'iretail/api/mobile/app/productNoList',
	// 删除订单
	removeOrder:'iretail/api/mobile/app/removeOrder',
	// 查询总部最晚发货周期
	queryFactoryDeliveryDateLatest: 'iretail/api/mobile/app/queryFactoryDeliveryDateLatest',
	// 查询上下市信息 
	queryOnDownMarketInfo: 'iretail/api/mobile/app/queryOnDownMarketInfo',
	// 查询面料
	queryFabricPageList:'iretail/api/mobile/app/queryFabricPageList',
	// 查询货号列表
	productNoPageList:'iretail/api/mobile/app/productNoPageList',
	// 查询库存
	productList:'iretail/api/mobileShoping/app/queryStockAvailableQty',
	// 查询三天可交付
	sevenDaysList: 'iretail/api/mobileShoping/app/queryProCycleSevenDaysList',
	// 即时库存的接口
	queryItemSuitStk: 'iretail/api/mobileShoping/app/queryItemSuitStk',
	// 查询仓库接口
	queryWareHouse: 'iretail/api/mobileShoping/app/queryWareHouse',
	// 锁定查询接口
	queryUnion: 'iretail/api/mobileShoping/app/queryUnion',
	// 锁定穿透接口
	queryIdByOrderNo: 'iretail/api/mobileShoping/app/queryIdByOrderNo',
	// 销售未发接口
	querySaleUndeQty: 'iretail/api/mobileShoping/app/querySaleUndeQtyDetailList',
	// 销售未发穿透接口
	queryOrderItemInfo: 'iretail/api/mobileShoping/app/queryOrderItemInfo',
	//补丁
	patchSalOrder:'iretail/api/mobile/app/patchSalOrder',
	//收款记录
	queryOrderReceipt:'iretail/api/mobile/app/queryOrderReceipt',
	//门店样品
	appqueryStoreStockConditionInfo:'iretail/api/mobile/app/queryStoreStockConditionInfo',
	// 查询库存商品
	queryStockInfo:'iretail/api/mobile/app/queryStockInfo',
	//  查询库存货号列表
	productNoPageListOnlyStock:'iretail/api/mobile/app/productNoPageListOnlyStock',
	// 查询库存筛选条件
	queryStockConditionInfo:'iretail/api/mobile/app/queryStockConditionInfo',
	// 获取面料尺寸
	queryConfigConditionInfo:'iretail/api/mobile/app/queryConfigConditionInfo',
	// 选配条件
	queryLastConfigInfo:'iretail/api/mobile/app/queryLastConfigInfo',
	// 获取热门搜索
	queryHotItemInfo:'iretail/api/mobile/app/queryHotItemInfo',
	// 即时库存
	queryAllStockByCondition:'iretail/api/mobile/app/queryAllStockByCondition',
	// lz.
	queryProductInfo:'iretail/api/mobile/app/queryProductInfo',
	// 获取销售人员分账比例
	queryOrderSalesById:'iretail/api/mobileShoping/app/queryOrderSalesById',
	// 获取发版日志
	queryByPage:'iretail/api/mobileShoping/app/queryByPage',
	// 查询组织
	getAuthDataDealerList:'iretail/api/mobileShoping/app/getAuthDataDealerList',
	// 查询产品线
	queryTradepathByPage:'iretail/api/mobileShoping/app/queryTradepathByPage',
	// 打印次数
	modifyOrderPrintTimes:'iretail/api/mobile/app/modifyOrderPrintTimes'
}

export default api
