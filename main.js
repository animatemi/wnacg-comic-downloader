const fs = require('fs')
const util = require("./module/util")
const downloadFile = require("./module/downloadFile")

var colors = require('colors')
colors.setTheme({
    success: 'green',
    info: 'blue',
    warning: 'yellow',
    error: 'red'
})

let settingPath = './data/setting.json'
let setting = require(settingPath)

function getComics(){
  console.log("开始获取更新列表……")

  return new Promise(function(resolve,reject){
    var subscriptions = new Array
  
    for(let sub of setting.subscription){
      if(!sub.disabled){
        //把复制的对象添加进去
        subscriptions.push(Object.assign({}, sub))
      }
    }
  
    const GetComicList= require('./module/GetComicList')

    GetComicList.get(subscriptions,function(obj){
      if(obj.length > 0){
        resolve(obj)
      }else{
        reject()
      }
    })
  })
}

getComics()
  .then(function(res){
    console.log(`更新列表获取完成, 共更新${res.length}部作品, 列表如下:`)
    for(let r of res){
      console.log(r.title.info)
    }
    console.log("开始进一步获取漫画信息……")

    return new Promise(function(resolve,reject){
      const GetDetail=require('./module/GetDetail')

      GetDetail.get(res,function(res2){
        resolve(res2)
      })
    })
  },function(){
    console.log("订阅无更新, 程序退出")
    process.stdout.write('\x07')
    process.exit(0)
  }).then(function(res){
    console.log("漫画信息补充完成, 获取下载链接后立即开始下载……")

    return new Promise(function(resolve,reject){
      const GetDownloadUrl = require('./module/GetDownloadUrl')

      GetDownloadUrl.get(res,function(res2){
        resolve(res2)
      })
    })
  }).then(function(res){

    console.log("下载链接获取完毕，开始下载")

    var folder = util.createFilename()
    fs.mkdir(`${setting.savePath}/${folder}`, function (err) {
      if(err){
        console.log("保存目录创建出错".error)
      }else{
        //添加下载文件名 和 下载错误重连次数
        for(let r of res){
          r.filename = `${setting.savePath}/${folder}/[${r.id}]${util.filenameFilter(r.title)}.zip`
          r.allowDownloadTime = 3
        }

        downloadFile.get(res,
          function(res){
            console.log(`${res}下载成功`.success)
          },function(res){
            if(res.downloadAgain){
              console.log(`${res.file}下载失败, 原因: ${res.msg},5秒后重新下载`.error)
            }else{
              console.log(`${res.file}下载失败, 原因: ${res.msg}`.error)
            }
          },function(res){
            //下载细节
            fs.writeFile(`${setting.savePath}/${folder}/detail.json`,JSON.stringify(res,null,2),function(err){
              if(err) console.log('保存操作结果失败'.error)
              else console.log('保存操作结果成功'.success)
            })

            var detailObj={}
            detailObj.totalCount = res.length
            detailObj.downloadFailCount = 0
            detailObj.downloadFailObj = new Array
            detailObj.notSupportDownloadCount = 0
            detailObj.notSupportDownloadObj = new Array
            detailObj.downloadSuccessCount = 0
            
            for(let r of res){
              if(r.disabled){
                util.deleteFile(r.filename,function(res){
                  console.log(`删除错误下载${res}成功`.success)
                },function(res){
                  console.log(`删除错误下载${r.filename}失败`.error)
                })

                if(r.allowDownloadTime > 0){
                  detailObj.notSupportDownloadCount++
                  detailObj.notSupportDownloadObj.push(r)
                }else{
                  detailObj.downloadFailCount++
                  detailObj.downloadFailObj.push(r)
                }
              }else{
                detailObj.downloadSuccessCount++

                for(let sub of setting.subscription){
                  if(r.keyword == sub.keyword){
                    if(util.compareDate(r.date,sub.lastTime)){
                      sub.lastTime = r.date
                    }
                    if(parseInt(r.id) > sub.lastId){
                      sub.lastId = parseInt(r.id)
                    }
                    break
                  }
                }
              }
            }

            //写回setting
            fs.writeFile("./data/setting.json",JSON.stringify(setting,null,2),function(err){
              if(err) console.log('更新订阅失败'.error)
              else console.log('更新订阅成功'.success)
            })

            //弹出报告
            console.log(`共下载${detailObj.totalCount}个, 其中成功${detailObj.downloadSuccessCount}个`)
            console.log(`下载失败${detailObj.downloadFailCount}个,请点击下面的链接下载:`)
            for(let ddf of detailObj.downloadFailObj){
              console.log(`标题: ${ddf.title}\n${ddf.downloadUrl}`.info)
            }
            console.log(`不支持下载的有${detailObj.notSupportDownloadCount}个,请到其他网站下载:`)
            for(let dnsd of detailObj.notSupportDownloadObj){
              console.log(dnsd.title.info)
            }

            //完成声音
            process.stdout.write('\x07')
          }
        )
      }
    })
  })