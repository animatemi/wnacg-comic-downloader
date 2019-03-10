const request = require("request")
const fs = require("fs")

var comicAfterDownload = new Array

exports.get = (obj,success,fail,complete) => {
  download(obj, success, fail,complete)
}

function download(obj, success, fail, complete) {
  var downloadFail = false

  var downloadFile = obj.pop()
  downloadFile.allowDownloadTime--
  request
  .get(downloadFile.downloadUrl)
  .on('response', function(response) {
    if(response.statusCode != 200){
      let errObj = {}
      errObj.file = downloadFile.title
      errObj.msg = response.statusCode
      fail(errObj)

      downloadFail = true
      downloadFile.disabled = true
      comicAfterDownload.push(downloadFile)
      
      if(obj.length > 0){
        setTimeout(() => {
          download(obj, success, fail, complete)
        }, 5000)
      }else{
        complete(comicAfterDownload)
      }
    }
  })
  .on('error', function(err) {
    let errObj = {}
    errObj.file = downloadFile.title
    errObj.msg = err
    if(downloadFile.allowDownloadTime>0){
      errObj.downloadAgain = true
    }
    fail(errObj)

    if(downloadFile.allowDownloadTime>0){
      obj.push(downloadFile)

      setTimeout(() => {
        download(obj, success, fail, complete)
      }, 5000)
    }else if(downloadFile.allowDownloadTime<=0 && obj.length > 0){
      downloadFile.disabled = true

      comicAfterDownload.push(downloadFile)

      setTimeout(() => {
        download(obj, success, fail, complete)
      }, 5000)
    }else{
      downloadFile.disabled = true
      
      comicAfterDownload.push(downloadFile)
      complete(comicAfterDownload)
    }
  })
  .pipe(fs.createWriteStream(downloadFile.filename))
  .on('close',() => {
    if(!downloadFail){
      comicAfterDownload.push(downloadFile)
    
      if(obj.length > 0){
        success(downloadFile.title)
  
        setTimeout(() => {
          download(obj, success, fail, complete)
        }, 5000)
      }else{
        complete(comicAfterDownload)
      }
    }
  })
}