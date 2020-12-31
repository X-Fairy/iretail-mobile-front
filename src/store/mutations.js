const mutations = {
	setStatusBarHeight(state, data) {
		state.statusBarHeight = data
	},
	setWindowHeight(state, data) {
		state.windowHeight = data
	},
	setTheme(state, data) {
		state.theme = data
	},
	setTabIndex(state, index) {
		state.tabIndex = index
	}
}

export default mutations