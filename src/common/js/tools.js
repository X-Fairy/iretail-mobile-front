// 缓存处理
var tmps = {};

export const getTmpUrl = function(imgSrc){
	return new Promise((r,j)=>{
		if(tmps[imgSrc]){
			console.log('存在文件缓存,直接返回')
			return r(tmps[imgSrc]);
		}
		
		uni.getImageInfo({
			src: imgSrc,
			success: (image) => {
				// 微信小程序会把相对路径转为不完整的绝对路径，要在前面加'/'
				// const res = await this.downloadImage(image.path)
				image.path =  /^(http|\/\/|\/|wxfile|data:image\/(\w+);base64|file|bdfile)/.test(image.path)  ? image.path :  `/${image.path}`;
				tmps[imgSrc] = image;
				r(image)
				// console.log('获取图片成功',image)
			},
			fail: (err) => {
				j();
				console.log('获取图片失败', err, imgSrc)
			}
		});
	})
}