// 获取浏览器的版本号和版本信息

export function getBrowserInfo() {
  var userAgent = navigator.userAgent;
  var browserVersion, browserInfo;

  // 判断浏览器类型和版本号
  if (userAgent.indexOf("Chrome") > -1) {
    var regExp = /Chrome\/(\d+\.\d+)/;
    if (regExp.test(userAgent)) {
      browserVersion = RegExp.$1;
      browserInfo = "Chrome " + browserVersion;
    }
  } else if (userAgent.indexOf("Safari") > -1) {
    var regExp = /Version\/(\d+\.\d+)/;
    if (regExp.test(userAgent)) {
      browserVersion = RegExp.$1;
      browserInfo = "Safari " + browserVersion;
    }
  } else if (userAgent.indexOf("Firefox") > -1) {
    var regExp = /Firefox\/(\d+\.\d+)/;
    if (regExp.test(userAgent)) {
      browserVersion = RegExp.$1;
      browserInfo = "Firefox " + browserVersion;
    }
  } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    var regExp = /(?:Opera|OPR)\/(\d+\.\d+)/;
    if (regExp.test(userAgent)) {
      browserVersion = RegExp.$1;
      browserInfo = "Opera " + browserVersion;
    }
  } else if (userAgent.indexOf("Edge") > -1) {
    var regExp = /Edge\/(\d+\.\d+)/;
    if (regExp.test(userAgent)) {
      browserVersion = RegExp.$1;
      browserInfo = "Edge " + browserVersion;
    }
  } else if (userAgent.indexOf("IE") > -1 || userAgent.indexOf("Trident") > -1) {
    var regExp = /(?:MSIE|rv:)(\d+\.\d+)/;
    if (regExp.test(userAgent)) {
      browserVersion = RegExp.$1;
      browserInfo = "IE " + browserVersion;
    }
  } else {
    browserVersion = "Unknown";
    browserInfo = "Unknown";
  }

  // 输出结果
  console.log("浏览器版本号：" + browserVersion);
  console.log("浏览器版本信息：" + browserInfo);
  return { browserVersion, browserName: browserInfo };
}
