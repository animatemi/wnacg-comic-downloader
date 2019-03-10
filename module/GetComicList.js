var util = require("./util")
var comicList = new Array

let setting = require("../data/setting.json")

exports.get = function(subscriptions,callback){
  for(let key of subscriptions.reverse()){
    key.downloadUrl=encodeURI(`https://${setting.domain}/albums-index-page-1-sname-${key.keyword}.html`)
  }

  getPage(subscriptions,callback)
}

//获取页面html，并筛选出相应的漫画信息
function getPage(subscriptions,callback){
  var thisSub = subscriptions.pop()

  const request = require('request')
 
  request(thisSub.downloadUrl,(error, response, body) => {
    if (!error && response.statusCode == 200) {

      //调试代码
      // const fs = require("fs")
      // fs.writeFile('./html.txt',body,function(err){
      //   if(err) console.log('写文件操作失败')
      // })

      var resObj = comicFilter(body)

      //漫画筛选
      var stopFlag = true
      while(stopFlag && resObj.data.length > 0){
        let rod = resObj.data.pop()
        
        //漫画id要大于上次下载的id,漫画创建时间要晚于或等于上次下载文件的创建时间
        if(rod.id<=thisSub.lastId || util.compareDate(thisSub.lastTime,rod.date)){
          resObj.nextPage = ""
          continue
        }else{
          resObj.data.push(rod)
          stopFlag = false
        }
      }

      //加上关键词
      for(let rd of resObj.data){
        rd.keyword = thisSub.keyword
      }

      comicList = comicList.concat(resObj.data)

      if(resObj.nextPage){
        //当前页面存在下一页
        thisSub.downloadUrl=resObj.nextPage
        subscriptions.push(thisSub)
        getPage(subscriptions,callback)
      }else if(!resObj.nextPage && subscriptions.length > 0){
        //还有未搜索的关键词
        getPage(subscriptions,callback)
      }else{
        callback(comicList)    
      }
    }else{
      //请求失败后的回调
      console.log(`请求${thisSub.downloadUrl}失败, 3秒后重新请求`)
      subscriptions.push(thisSub)
      setTimeout(() => {
        getPage(subscriptions,callback)
      }, 3000)
    }
  })
}

//从html中筛选出漫画信息
function comicFilter(html){
  const cheerio = require('cheerio')
  const $ = cheerio.load(html,{decodeEntities: false})

  var res = {}
  res.data = new Array

  $('.gallary_wrap .cc .gallary_item').each(function(index,item){
    let obj = {}

    obj.id=$('.info .title a',$(item)).attr('href').replace(/[^0-9]/ig,"")  //漫画ID
    obj.title = $('.info .title a',$(item)).attr('title')                   //漫画标题
    //obj.url = $('.info .title a',$(item)).attr('href')                    //漫画在线页面链接
    //obj.picSrc = $('img',$(item)).attr('src')                             //漫画缩略图
    
    let tmp = $('.info_col',$(item)).html().split('，')

    obj.pageSum = tmp[0].replace(/[^0-9]/ig,"")                             //漫画页数
    tmp[1] = tmp[1].replace(/[^0-9-]/ig,"")
    obj.date = tmp[1].substr(0,10)                                          //漫画创建日期

    res.data.push(obj)
  })

  var nPage = $('.paginator .next a').attr('href')                          //当前页面的下一页
  if(nPage){
    res.nextPage=`https://ncg.world${nPage}`
  }else{
    res.nextPage=""
  }

  return res
}