const pathFn  = require('path')
const assign  = require('object-assign')
const fs      = require('hexo-fs')
const lg      = require('./lib/log.js')
const mk      = require('marked')

// checking _config.yml
if(!hexo.config.randomEmbed || !hexo.config.randomEmbed.list){
  lg.log("error", "Please set the 'randomEmbed.lists' option." , "_config.yml")
  return
}

// loading lists
const listDataInt = fs.readFileSync(pathFn.join(process.env.PWD || process.cwd() , hexo.config.randomEmbed.list))
const listJson = JSON.parse(listDataInt)

// orverride config.randomEmbed
hexo.config.randomEmbed = assign( {} ,
  hexo.config.randomEmbed , {
    "listData" : listJson
  }
)




let shuffle = (array) => {
  let m = array.length, t, i
  while (m) {
    i = Math.floor(Math.random() * m--)
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }
  return array
}


let getHtmlData = (jsonList) => {
  let sstore = ""
  if(jsonList && jsonList != "" && jsonList.sstore){
    sstore = ` data-sstore="${encodeURIComponent(jsonList.sstore)}"`
  }
  let ystore = ""
  if(jsonList && jsonList != "" && jsonList.ystore){
    ystore = ` data-ystore="${jsonList.ystore}"`
  }
  let rstore = ""
  if(jsonList && jsonList != "" && jsonList.rstore){
    rstore = ` data-rstore="${jsonList.rstore}"`
  }
  let kenkoStore = ""
  if(jsonList && jsonList != "" && jsonList.kenkoStore){
    kenkoStore = ` data-kstore="${jsonList.kenkoStore}"`
  }
  let s5store = ""  
  if(jsonList && jsonList != "" && jsonList.s5store){
    if(jsonList.s5store != ""){
      s5store = ` data-s5store="${encodeURIComponent(jsonList.s5store)}"`
    }
  }else if(jsonList && jsonList != "" && jsonList.s5store == ""){
    s5store = ` data-s5store="none"`
  }
  
  if(jsonList && jsonList != ""){
    if(jsonList.htmlData && jsonList.htmlData != ""){
      return jsonList.htmlData
    }else if(jsonList.PA_API_URL && jsonList.ASIN && jsonList.title && jsonList.img && jsonList.description != undefined){
      
      let desc = mk(jsonList.description).replace(/\n$/,"").replace(/^\<p\>/,"").replace(/\<\/p\>$/,"")
      
      return '<div class="babylink-box"><div class="babylink-image"><a href="' + jsonList.PA_API_URL + '" class="PA_API_URL"' + s5store + sstore + ystore + rstore + kenkoStore + '><img src="' + jsonList.img.url + '" width="' + jsonList.img.width + '" height="' + jsonList.img.height + '" /></a></div><div class="babylink-info"><div class="babylink-title"><a href="' + jsonList.PA_API_URL + '" class="PA_API_URL">' + jsonList.title + '</a></div><div class="babylink-description">' + desc + '</div></div></div>'
      
    }else if(jsonList.ASIN && jsonList.title && jsonList.img && jsonList.description != undefined){
      
      let desc = mk(jsonList.description).replace(/\n$/,"").replace(/^\<p\>/,"").replace(/\<\/p\>$/,"")
      
      return '<div class="babylink-box"><div class="babylink-image"><a href="http://www.amazon.co.jp/exec/obidos/ASIN/' + jsonList.ASIN + '" data-sstore="' + sstore + '"><img src="' + jsonList.img.url + '" width="' + jsonList.img.width + '" height="' + jsonList.img.height + '" /></a></div><div class="babylink-info"><div class="babylink-title"><a href="http://www.amazon.co.jp/exec/obidos/ASIN/' + jsonList.ASIN + '">' + jsonList.title + '</a></div><div class="babylink-description">' + desc + '</div></div></div>'
    }else{
      return ""
    }
  }else{
    return ""
  }
}


let getRamdomEmbed = (args) => {
  let returnHTML = ""
  let matchList  = []
  let listData   = hexo.config.randomEmbed.listData
  let listCount  = Number(args[0])
  let instanceID = String(args[1])
  let tags       = []
  let classes    = ""
  let i          = 0
  let FORCENUM   = 9999


  if(args.length > 2){
    for(i = 2; i < args.length; i++){
      if(args[i].match(/^(class\-|class\:)/)){
        classes += (classes != "" ? " " : "") + args[i].replace(/^(class\-|class\:)/,"")
      }else{
        tags.push(args[i])
      }
    }
  }

  // checking args
  if( !listData || listData == "" || listData.length == 0 || !listCount || (tags.length == 0 && (!instanceID || instanceID == "")) )return returnHTML

  for( i = 0; i < listData.length; i++){
    if( listData[i].instanceID == instanceID ){
      matchList.push({ "mc" : FORCENUM , "htmlData" : getHtmlData(listData[i]) })
    }else{
      let matchCnt = 0
      for( let j = 0; j < tags.length; j++){
        if( listData[i].tags.indexOf(tags[j]) != -1){
          matchCnt++
        }
      }
      if( matchCnt > 0 )matchList.push({ "mc" : matchCnt , "htmlData" : getHtmlData(listData[i]) })
    }
  }

  if(matchList && matchList.length == 0){
    lg.log("warn", "No matching keywords were found. Please check the parameters." , "")
    console.log(args)
  }

  // sort by matchCnt
  matchList.sort(function (a,b){
    if(b.mc == a.mc){
      return (Math.random()*100 + 1) > 50 ? 1 : -1
    }else{
      return b.mc - a.mc
    }
  })

  if(matchList.length > 0 && matchList[0].mc != FORCENUM ){
    matchList = shuffle(matchList)
  }

  for( i = 0; i < listCount && i < matchList.length; i++){
    returnHTML += getHtmlData(matchList[i])
  }

  if(classes != "")returnHTML = '<div class="' + classes + '">' + returnHTML + '</div>'

  return returnHTML
}




hexo.extend.helper.register('randomEmbed', (args) => {
  return getRamdomEmbed(args)
})

hexo.extend.tag.register('randomEmbed', (args , content) => {
  return getRamdomEmbed(args)
});
