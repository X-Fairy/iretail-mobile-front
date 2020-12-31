/**
 * @说明：工具集
 * @作者：陈万照
 * @公司：山东标梵互动技术有限公司
 * @官网：http://biaofun.com/
 * @版本：v1.0.0
 * @时间：2020年4月28日11:28:13
 */
export default {

	/**
	 * 精确判断数据是否是 Date 类型
	 * @param {Any} val 要判断的数据
	 * @returns {Boolean} true：是；false：不是；
	 */
	isDate(val) {
		return Object.prototype.toString.call(val) === '[object Date]';
	},

	/**
	 * 精确判断数据是否是 String 类型
	 * @param {Any} str 要判断的数据
	 * @returns {Boolean} true：是；false：不是；
	 */
	isString(str) {
		return str instanceof String || typeof str == 'string';
	},

	/**
	 * 精确判断数据是否是 Number 类型
	 * @param {Any} val 要判断的数据
	 * @returns {Boolean} true：是；false：不是；
	 */
	isNumber(val) {
		return Object.prototype.toString.call(val) === '[object Number]';
	},

	/**
	 * 格式化日期
	 * @param {Date|String} date 日期或日期字符串
	 */
	formatDate(date) {
		let YYYY = null;
		let M = null;
		let MM = null;
		let D = null;
		let DD = null;
		let h = null;
		let hh = null;
		let m = null;
		let mm = null;
		let s = null;
		let ss = null;
		let ms = null;
		let ms2 = null;
		let ms3 = null;
		let ms4 = null;
		let dt = null;
		// 如果 date 是 String 类型
		if (date && this.isString(date)) {
			// 真机运行时，如果直接用 new Date('YYYY-MM-DD hh:mm:ss') 会报 Invalid Date 错误，所以采用下面的方式创建日期
			let dtArr = date.replace(/\//g, '.').replace(/-/g, '.').replace(/:/g, '.').replace(/T/g, ' ').replace(' ', '.').replace(
				'Z', '').split('.');

			let year = 2020;
			let month = 12;
			let day = 18;
			let hour = 0;
			let minute = 0;
			let second = 0;
			let millisecond = 0;

			// 年
			if (dtArr.length > 0 && !isNaN(dtArr[0])) {
				year = parseInt(dtArr[0]);
			}
			// 月
			if (dtArr.length > 1 && !isNaN(dtArr[1])) {
				month = parseInt(dtArr[1]);
			}
			// 日
			if (dtArr.length > 2 && !isNaN(dtArr[2])) {
				day = parseInt(dtArr[2]);
			}
			// 时
			if (dtArr.length > 3 && !isNaN(dtArr[3])) {
				hour = parseInt(dtArr[3]);
			}
			// 分
			if (dtArr.length > 4 && !isNaN(dtArr[4])) {
				minute = parseInt(dtArr[4]);
			}
			// 秒
			if (dtArr.length > 5 && !isNaN(dtArr[5])) {
				second = parseInt(dtArr[5]);
			}
			// 毫秒
			if (dtArr.length > 6 && !isNaN(dtArr[6])) {
				millisecond = parseInt(dtArr[6]);
			}

			date = new Date(year, month - 1, day, hour, minute, second, millisecond);
		}

		// 如果 date 是 Date 类型
		if (date && this.isDate(date)) {
			YYYY = date.getFullYear();
			M = date.getMonth() + 1;
			MM = M >= 10 ? M : '0' + M;
			D = date.getDate();
			DD = D >= 10 ? D : '0' + D;
			h = date.getHours();
			hh = h >= 10 ? h : '0' + h;
			m = date.getMinutes();
			mm = m >= 10 ? m : '0' + m;
			s = date.getSeconds();
			ss = s >= 10 ? s : '0' + s;
			ms = date.getMilliseconds();
			ms2 = ms;
			ms3 = ms;
			ms4 = ms;
			if (ms < 10) {
				ms2 = '0' + ms;
				ms3 = '00' + ms;
				ms4 = '000' + ms;
			} else if (ms < 100) {
				ms3 = '0' + ms;
				ms4 = '00' + ms;
			} else {
				ms4 = '0' + ms;
			}
		}

		// 返回的数据对象
		let result = {
			YYYY: YYYY,
			MM: MM,
			M: M,
			DD: DD,
			D: D,
			hh: hh,
			h: h,
			mm: mm,
			m: m,
			ss: ss,
			s: s,
			ms: ms,
			ms2: ms2,
			ms3: ms3,
			ms4: ms4,
			dt: date,
			f1: `${YYYY}-${MM}-${DD}`,
			f2: `${YYYY}年${M}月${D}日`,
			f3: `${YYYY}-${M}-${D} ${hh}:${mm}`,
			f4: `${h}:${m}:${s}`,
			f5: `${MM}-${DD}`,
			f6: `${YYYY}-${MM}`,
			f7: `${YYYY}年${M}月`,
			f8: `${h}:${m}`,
			f9: `${M}月${D}日`,
			f10: `${YYYY}/${MM}/${DD}`,
			notes: 'YYYY（年），MM（月，补0），M（月，不补0），DD（日，补0），D（日，不补0），hh（时，补0），h（时，不补0），mm（分，补0），m（分，不补0），ss（秒，补0），s（秒，不补0），ms（毫秒，不补0），ms2（毫秒，补0到2位），ms3（毫秒，补0到3位），ms4（毫秒，补0到4位），其余的f1，f2，... 看格式就知道了！'
		};
		return result;
	},

	/**
	 * 时间格式转化
	 * @param {Number} num 数字
	 */
	changeDay(date) {
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		month = (month < 10 ? "0" + month : month);
		if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		return date.getFullYear() + "-" + month + "-" + strDate
	},
	/**
	 * 金额3位一个逗号 从右边往左计算
	 * @param {str} 
	 * 
	 */
	formatNum(value) {
		var b = false;
		if (value == null || value == "") return "0";
		value = value.toString();
		if (value.indexOf('-') != -1) {
			b = true;
			value = value.substring(1, value.length);
		}
		if (/^\-?[0-9]+(.[0-9]+)?$/.test(value)) {
			value = value.toString().replace(/^(\d*)$/, "$1.");
			value = (value + "00").replace(/(\d*\.\d\d)\d*/, "$1");
			value = value.replace(".", ",");
			var re = /(\d)(\d{3},)/;
			while (re.test(value))
				value = value.replace(re, "$1,$2");
			value = value.replace(/,(\d\d)$/, ".$1");
		}
		if (b) {
			value = "-" + value;
		}
		return value;
	},
	/**
	 * 手机号验证
	 * @param {mobile} num 数字
	 */
	checkMobile(mobile) {
		return RegExp(/^1[34578]\d{9}$/).test(mobile);
	},
	/**
	 * 空格分隔手机号
	 * @param {number} num 数字
	 */
	phone(number) {
		return number.replace(/^(.{3})(.*)(.{4})$/, '$1 $2 $3');
	},
	// 规格去重
	unique(arr) {		
		let chooseArr = []
		arr.forEach(ele => {
			let item = ele.partspecdec.split('+')
			item.forEach(e => {
				chooseArr.push({
					plName: e,
					count: ele.selectedAmount,
					issueseq:ele.issueseq
				})
			})
		})
		for (var r = 0; r < chooseArr.length; r++) { 
			for (var j = r + 1; j < chooseArr.length; j++) {
				if (chooseArr[r].plName == chooseArr[j].plName) {
					chooseArr[r].count=chooseArr[r].count+chooseArr[j].count;
					chooseArr.splice(j, 1)
				}
			}
		}
		return chooseArr
	},
	// 去重数量求和
	uniqueSum(arr) {
		var obj = {}
		for (var i = 0; i < arr.length; i++) {
			if (!obj[arr[i]]) {
				obj[arr[i]] = 1;
			} else {
				obj[arr[i]] = obj[arr[i]] + 1
			}
		}
		return obj
	},
	// 规格数据初始化
	specInit(arr){
		arr.forEach(ele => {
			ele.selectedAmount = 0;
			ele.chooseSpec = false
			ele.disabled = false
			ele.submitChoose = false
		})
		
	}
}
