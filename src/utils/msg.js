const msg = (title, duration=2000, mask=false, icon='none')=>{
	// 统一提示方便全局修改
	if(Boolean(title) === false){
		return;
	}
	uni.showToast({
		title,
		duration,
		mask,
		icon
	});
}

export default msg