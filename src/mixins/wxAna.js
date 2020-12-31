export default {
	data() {
		return {
            wx_user_name: '',
            wx_user_phone: '',
            wx_store_name: '',
            wx_store_id: '',
            wx_org_id: ''
		}
    },
    methods: {
        setWxAna() {
            let userInfo = uni.getStorageSync('userInfo')
            let storeInfo = uni.getStorageSync('storeInfo')
            this.wx_user_name = userInfo.userName
            this.wx_user_phone = userInfo.personPhone
            this.wx_store_name = storeInfo.storeName
            this.wx_store_id = storeInfo.storeId
            this.wx_org_id = storeInfo.orgId
        }
    }
}
