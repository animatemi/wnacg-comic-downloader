const fs = require('fs')

//日期格式：2018-07-01  如果date1的日期在date2后面，返回true
exports.compareDate = (date1,date2) => {
  var dateArr1 = date1.split("-")
  var dateArr2 = date2.split("-")

  for(let i=0;i<3;i++){
    if(dateArr1[i]>dateArr2[i]){
      return true
    }
  }
  return false
}

//创建文件名
exports.createFilename = () => {
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth()+1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return `文件夹创建于${year}年${month}月${day}日${hour}点${minute}分${second}秒`
}

//删除文件
exports.deleteFile = (filePath, success, fail) => {
  fs.unlink(filePath,function(error){
    if(error){
      fail(error)
    }else{
      success(filePath)
    }
  })
}

//过滤文件名非法字符
exports.filenameFilter = filename => filename.replace(/[\\\/:\*\?"<>\|]/ig,"-")