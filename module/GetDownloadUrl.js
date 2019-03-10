// exports.get=function(comicID,callback){
//   var downloadUrl = `https://ncg.world/download-index-aid-${comicID}.html`

//   const request = require('request')
 
//   request(downloadUrl,(error, response, body) => {
//     if (!error && response.statusCode == 200) {
//       var obj = urlFilter(body)
//       callback(obj)
//     }
//   })
// }

const request = require('request')
var comicsAfterPatch = new Array

let setting = require("../data/setting.json")

exports.get=function(comics,callback){
  getDownloadUrl(comics,callback)
}

function getDownloadUrl(comics,callback){
  if(comics.length > 0){
    var thisComic = comics.shift()

    var downloadUrl = `https://${setting.domain}/download-index-aid-${thisComic.id}.html`
    request(downloadUrl,(error, response, body) => {
      if (!error && response.statusCode == 200) {
        var obj = urlFilter(body)
        
        thisComic.downloadUrl = obj

        comicsAfterPatch.push(thisComic)
        getDownloadUrl(comics,callback)
      }else{
        comics.unshift(thisComic)
        console.log(`请求${thisComic.id}-${thisComic.title}失败，3秒后重新请求`)
        setTimeout(() => {
          getDownloadUrl(comics,callback)
        }, 3000);
      }
    })
  }else{
    callback(comicsAfterPatch)
  }
}

//从页面筛选出网址
function urlFilter(html){
  const cheerio = require('cheerio')
  const $ = cheerio.load(html,{decodeEntities: false})

  var downloadUrl=new Array

  $('.download_btn a').each(function(index,item){
    downloadUrl.push($(item).attr('href'))
  })

  return downloadUrl[0]
}