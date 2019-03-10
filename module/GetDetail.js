// exports.get=function(comicID,callback){
//   var downloadUrl = `https://ncg.world/photos-index-aid-${comicID}.html`

//   const request = require('request')
 
//   request(downloadUrl,(error, response, body) => {
//     if (!error && response.statusCode == 200) {
//       var obj = detailFilter(body)
//       callback(obj)
//     }
//   })
// }
const request = require('request')
var comicsAfterPatch = new Array

let setting = require("../data/setting.json")

exports.get=function(comics,callback){
  getDetail(comics,callback)
}

function getDetail(comics,callback){
  if(comics.length > 0){
    var thisComic = comics.shift()

    var downloadUrl = `https://${setting.domain}/photos-index-aid-${thisComic.id}.html`
    request(downloadUrl,(error, response, body) => {
      if (!error && response.statusCode == 200) {
        var obj = detailFilter(body)

        thisComic.classify = obj.classify
        thisComic.tags = obj.tags
        thisComic.summary = obj.summary       
        thisComic.uploader = obj.uploader

        comicsAfterPatch.push(thisComic)
        getDetail(comics,callback)
      }else{
        comics.unshift(thisComic)
        console.log(`请求${thisComic.id}-${thisComic.title}失败，3秒后重新请求`)
        setTimeout(() => {
          getDetail(comics,callback)
        }, 3000);
      }
    })
  }else{
    callback(comicsAfterPatch)
  }
}

//从页面挑选出漫画信息
function detailFilter(html){
  const cheerio = require('cheerio')
  const $ = cheerio.load(html,{decodeEntities: false})

  var obj={}

  obj.classify = $('.uwconn label').html().replace(/分類：/g,"")  //漫画分类

  obj.tags = new Array
  $('.uwconn .addtags .tagshow').each(function(index,item){
    obj.tags.push($(item).html())                                //漫画标签
  })

  obj.summary = $('.uwconn p').html().replace(/簡介：/g,"")       //漫画简介
  obj.summary = obj.summary.replace(/<br>/g,"")
  obj.uploader = $('.uwuinfo img').next('p').html()              //上传者

  return obj
}