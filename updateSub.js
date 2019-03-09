const fs=require('fs')

let settingPath = './data/setting.json'

let setting = require(settingPath)

for(let keyword of setting.keywords){
  let flag = true
  for(let sub of setting.subscription){
    if(sub.keyword===keyword){
      flag=false
      break
    }
  }
  if(flag){
    let tmp = {}
    tmp.keyword = keyword
    tmp.lastId = 0
    tmp.lastTime = "1970-01-01"
    setting.subscription.push(tmp)
  }
}

for(let sub of setting.subscription){
  let flag = true
  for(let keyword of setting.keywords){
    if(keyword == sub.keyword){
      flag = false
    }
  }
  if(flag){
    sub.disabled = true
  }
}

fs.writeFile(settingPath, JSON.stringify(setting,null,2), (err) => {
  if (err) {
    console.log(`更新订阅失败:${err}`)
  } else {
    console.log("更新订阅成功")
  }
})