const toPage = (path)=>{
	uni.navigateTo({
		url: path
	})
}

const toTab = (path)=>{
	uni.switchTab({
		url: path
	})
}
const closedTo = (path) => {
	uni.redirectTo({
		url: path
	})
}

export { toPage, toTab, closedTo }