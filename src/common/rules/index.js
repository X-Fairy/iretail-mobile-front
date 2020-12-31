const rules = {
	phone: [{
		name: 'telephone',
		checkType: 'phoneno',
		errorMsg: '手机号格式错误'
	}],
	passLogin:[{
			name: 'telephone',
			checkType: 'phoneno',
			errorMsg: '请输入正确的手机号'
		},
		{
			name: 'identifyingCode',
			checkType: 'notnull',
			errorMsg: '请输入密码'
		}
	],
	isWxLogin: [{
			name: 'telephone',
			checkType: 'notnull',
			errorMsg: ''
		},
		{
			name: 'identifyingCode',
			checkType: 'notnull',
			errorMsg: ''
		},
		{
			name: 'unionId',
			checkType: 'notnull',
			errorMsg: ''
		}
	],
	isH5Login: [{
			name: 'telephone',
			checkType: 'phoneno',
			errorMsg: '请输入正确的手机号'
		},
		{
			name: 'identifyingCode',
			checkType: 'notnull',
			errorMsg: '请输入验证码'
		}
	],
	// 意向金收款
	collection: [{
			name: 'customerName',
			checkType: 'notnull',
			errorMsg: '请填写客户姓名'
		},
		{
			name: 'customerCellphoneNum',
			checkType: 'phoneno',
			errorMsg: '请填写正确的手机号'
		},
		{
			name: 'realSum',
			checkType: 'price',
			errorMsg: '请填写正确的收款金额'
		}
	],
	// 开立订单
	addOrder: [{
			name: 'customerName',
			checkType: 'notnull',
			errorMsg: '请输入客户姓名'
		},
		{
			name: 'customerCellphoneNum',
			checkType: 'phoneno',
			errorMsg: '请填写正确的手机号'
		},
		{
			name: 'consigneeAddressDetail',
			checkType: 'notnull',
			errorMsg: '请输入客户地址'
		}
	]
}

export default rules
