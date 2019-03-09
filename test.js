const request = require("request")
const fs = require("fs")
const util = require("./module/util")
const downloadFile = require("./module/downloadFile")

// let result = require("./result.json")
// console.log(result.length)
// for(let r of result){
//   if(!r.downloadUrl){
//     console.log(`${r.id}-${r.title}`)
//   }
//   if(r.downloadUrl == ""){
//     console.log(`${r.id}-${r.title}`)
//   }
//   if(!r.title.indexOf(r.keyword) < 0){
//     console.log(`${r.id}-${r.title}`)
//   }
// }

// let detail = require("./detail.json")
// let setting = require("./data/setting.json")
// // console.log(detail.length)
// var count = 0
// for(let d of detail){
//   if(d.keyword == "如月群真"){
    // util.deleteFile(d.filename,function(res){
    //   console.log("删除"+res+"成功")
    // },function(res){
    //   console.log("删除"+d.filename+"失败,原因"+res)
    // })
//     count++
//     console.log(d.title)
//   }
// }
// console.log(count)

// var folder = util.createFilename()
// fs.mkdir(`${setting.savePath}/${folder}`, function (err) {
//   if(err){
//     console.log("保存目录创建出错")
//   }else{

//     downloadFile.get(res,
//       function(res){
//         console.log(res + "下载成功")
//       },function(res){
//         console.log(`${res.file}下载失败, 原因: ${res.msg}`)
//       },function(res){
//         fs.writeFile('./detail2.json',JSON.stringify(res,null,2),function(err){
//           if(err) console.log('保存操作结果失败')
//           else console.log('保存操作结果成功')
//         })
//       }
//     )
//   }
// })
// var obj = "你好\\/:*?\"<>|"
// console.log(obj)
// console.log(util.filenameFilter(obj))

let settingPath = './data/setting.json'
let setting = require(settingPath)

for(let s of setting.subscription){
  delete s.downloadUrl
}

fs.writeFile("./data/setting.json",JSON.stringify(setting,null,2),function(err){
  if(err) console.log('更新订阅失败'.error)
  else console.log('更新订阅成功'.success)
})