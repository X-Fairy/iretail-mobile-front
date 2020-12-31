const ABmargin = 40;//中间距离
const fontM = 31;  // 文字间距
const cutNum = 15;// 最大截取
const originTop = 907;
const step = 80; //上下距离
const fontWidth = 15.5; //文字
const centerX = 375;//屏幕正中心X坐标

function getLeft(priceList, index) {
    var left = 0;
    if (index % 2 == 0) {
        // 返回奇数行left坐标
        // ++++
        var leftText = priceList[index];
        var twoText = priceList[index + 1] || "";
        let leftTextLength = (leftText.length >= cutNum ? leftText.slice(0, cutNum - 2) + '..' : leftText).length;
        let twoTextLength = (twoText.length >= cutNum ? twoText.slice(0, cutNum - 2) + '..' : twoText).length;
        var sumWidth = leftTextLength * fontWidth + fontM * 2 + ABmargin + twoTextLength * fontWidth + fontM * 2;
        left = centerX - sumWidth / 2;
        console.log(centerX, 'x', left, 'l', sumWidth, 'sumWidth')
        return left;
        // ++++ end

    } else {
        // 返回偶数行left坐标
        var leftText = priceList[index - 1];
        var twoText = priceList[index];
        let leftTextLength = (leftText.length >= cutNum ? leftText.slice(0, cutNum - 2) + '..' : leftText).length;
        let twoTextLength = (twoText.length >= cutNum ? twoText.slice(0, cutNum - 2) + '..' : twoText).length;
        var sumWidth = leftTextLength * fontWidth + fontM * 2 + ABmargin + twoTextLength * fontWidth + fontM * 2;
        left = centerX + sumWidth / 2 - (twoTextLength * fontWidth + fontM * 2);
        // console.log(centerX, 'x', left, 'l', sumWidth, 'sumWidth')
        return left;
    }
}
/**
 * priceList ['8028','066']
 * @param {*} priceList 
 */
function getList(priceList) {
    var oneLeft = 0; //A 坐标
    var twoLeft = 0; //B 坐标

    var arr = [];
    let oneLeftArray = []; //奇数
    let twoLeftArray = []; //偶数


    if (priceList.length == 1) {
        var width = fontWidth * (priceList[0].length >= cutNum ? cutNum : priceList[0].length) + (fontM * 2)
        var left = (750 - width) / 2;
        arr.push({
            type: "rect",
            css: {
                left: left + 'rpx', //750/2 -128
                top: '907rpx',//上一个top+48+80
                width: width + 'rpx',
                height: '60rpx',
                border: "1rpx solid #FFC27E",
                background: 'transparent',
                radius: "12rpx 12rpx 12rpx 12rpx"
            }
        })
        arr.push({
            type: "text",
            text: priceList[0].length > cutNum ? priceList[0].slice(0, cutNum - 2) + '..' : priceList[0],
            css: {
                color: '#FFC27E',
                left: left + 'rpx', //
                width: width + 'rpx', //计算
                height: '60rpx',
                textAlign: "center",
                top: 920 + 'rpx',//上一个
                fontSize: '28rpx',
                fontWeight: 'bold'
            }
        })
        return arr;
    }

    if (priceList.length > 1) {
        let oneMax = priceList[0].length;
        let twoMax = priceList[1].length;
        priceList.forEach((item, idx) => {
            if (idx % 2 == 0) {
                if (item.length >= oneMax) {
                    oneMax = item.length >= cutNum ? cutNum : item.length;
                }
                oneLeftArray.push(item);
            } else {
                if (item.length >= twoMax) {
                    twoMax = item.length >= cutNum ? cutNum : item.length;
                }
                twoLeftArray.push(item);
            }
        })
        let boxW = ((fontWidth * oneMax) + (fontWidth * twoMax) + ABmargin) + (fontM * 4);
        oneLeft = (750 - boxW) / 2;
        twoLeft = oneLeft + ((fontWidth * oneMax)) + ABmargin + (fontM * 2);
        priceList.forEach((item, idx) => {
            var left = getLeft(priceList, idx)

            var stepNumer = Math.floor(idx / 2)
            var top = stepNumer * step + originTop;
            var width = fontWidth * (item.length >= cutNum ? cutNum : item.length) + (fontM * 2); //计算

            arr.push({
                type: "rect",
                css: {
                    left: left + 'rpx', //
                    top: top + 'rpx',//上一个top
                    width: width + 'rpx', //计算
                    height: '60rpx',
                    border: "1rpx solid #FFC27E",
                    background: 'transparent',
                    radius: "12rpx 12rpx 12rpx 12rpx"
                }
            })
            arr.push({
                type: "text",
                text: item.length >= cutNum ? item.slice(0, cutNum - 2) + '..' : item,
                css: {
                    color: '#FFC27E',
                    width: width + 'rpx', //计算
                    height: '60rpx',
                    left: left + 'rpx', //
                    top: top + 15 + 'rpx',//上一个top
                    textAlign: "center",
                    // left: left + 20 + 'rpx', //
                    // top: top + 15 + 'rpx',//上一个
                    fontSize: '28rpx',
                    fontWeight: 'bold'
                }
            })
        })

        return arr;
    }
}


export default function getData(params) {
    // params = {
    //     priceList: ['88888', '4444', '5555', '66666']
    // }
    var { priceList } = params;
    var arr;
    if (priceList.length > 0) {
        arr = getList(priceList)
    } else {
        arr = [];
    }


    return {
        base: {
            width: '750rpx',
            height: '1334rpx',
            views: [
                {
                    type: 'image',
                    url: 'https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/c2fd08ecff684d2e894275e49c2531ac.png',
                    css: {
                        left: '0rpx',
                        top: '0rpx',
                        width: '750rpx',
                        height: '1334rpx',
                    }
                },
                //百里挑一 
                {
                    type: 'image',
                    url: 'https://kuka-iretail.oss-cn-hangzhou.aliyuncs.com/salorder/ee37ea9e1eee4c929e9998e2ffb0ab8b.png',
                    css: {
                        left: (750 - 592) / 2 + 'rpx', //(750-592)/2
                        top: '70rpx',
                        background: 'transparent',
                        width: '592rpx',
                        height: '209rpx',
                    }
                },
                //用户图像
                {
                    type: 'image',
                    url: '',
                    css: {
                        left: '287rpx',
                        top: '289rpx', //上一个img 高+top+10
                        width: '180rpx',//(750-592)/2
                        height: '180rpx',
                        background: 'transparent',
                        radius: '50%',
                    }
                },
                {
                    type: "text",
                    text: '',
                    css: {
                        color: '#FFC27E',
                        textAlign: "center",
                        top: '549rpx',//上一个 高+top+80
                        fontSize: '32rpx',
                        fontWeight: '500'
                    }
                },
                {
                    type: "text",
                    text: '',
                    css: {
                        color: '#FFC27E',
                        textAlign: "center",
                        top: '621rpx',//上一个top+36
                        fontSize: '108rpx',
                        fontWeight: 'bold'
                    }
                },
                {
                    type: "text",
                    text: '实付 0',
                    css: {
                        color: '#FFC27E',
                        textAlign: "center",
                        top: '779rpx',//上一个top+128+30
                        fontSize: '32rpx',
                    }
                },
                ...arr,

                {
                    type: 'text',
                    text: '',
                    css: {
                        color: '#FFC27E',
                        textAlign: "center",
                        top: '1185rpx',
                        fontSize: '28rpx',
                    }
                },
                {
                    type: 'text',
                    text: '00',
                    css: {
                        color: '#FFC27E',
                        textAlign: "center",
                        top: '1235rpx',
                        fontSize: '28rpx',
                    }
                },
            ]
        },
    }
}