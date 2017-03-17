'use strict';

var pathFn  = require('path');
var assign  = require('object-assign');
var fs      = require('hexo-fs');
var lg      = require('./lib/log.js');


// checking _config.yml
if(!hexo.config.randomEmbed || !hexo.config.randomEmbed.list){
  lg.log("error", "Please set the 'randomEmbed.lists' option." , "_config.yml");
  return;
}

// loading lists
var listData = fs.readFileSync(pathFn.join(process.env.PWD || process.cwd() , hexo.config.randomEmbed.list));
var listJson = JSON.parse(listData);


// orverride config.randomEmbed
hexo.config.randomEmbed = assign( {} ,
  hexo.config.randomEmbed , {
    "listData" : listJson
  }
);



// hexo.extend.tag.register('randomEmbed', require('./lib/helper'));
hexo.extend.tag.register('randomEmbed', function(args , content) {

    var returnHTML = "";

    var matchList  = [];
    var listData   = hexo.config.randomEmbed.listData;
    var listCount  = Number(args[0]);
    var instanceID = String(args[1]);
    var tags       = [];
    var classes    = "";
    var i          = 0;
    var FORCENUM   = 9999;


    function shuffle(array) {
      var m = array.length, t, i;

      // While there remain elements to shuffle…
      while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }
      return array;
    }
    

    if(args.length > 2){
      for(i = 2; i < args.length; i++){
        if(args[i].match(/^(class\-|class\:)/)){
          classes += (classes != "" ? " " : "") + args[i].replace(/^(class\-|class\:)/,"");
        }else{
          tags.push(args[i]);
        }
      }
    }
    // 
    // checking args
    if( !listData || listData == "" || listData.length == 0 || !listCount || (tags.length == 0 && (!instanceID || instanceID == "")) )return returnHTML;

    for( i = 0; i < listData.length; i++){
      if( listData[i].instanceID == instanceID ){
        matchList.push({ "mc" : FORCENUM , "htmlData" : listData[i].htmlData });
      }else{
        var matchCnt = 0;
        for( var j = 0; j < tags.length; j++){
          if( listData[i].tags.indexOf(tags[j]) != -1){
            matchCnt++;
          }
        }
        if( matchCnt > 0 )matchList.push({ "mc" : matchCnt , "htmlData" : listData[i].htmlData });
      }
    }

    // sort by matchCnt
    matchList.sort(function (a,b){
      if(b.mc == a.mc){
        return (Math.random()*100 + 1) > 50 ? 1 : -1;
      }else{
        return b.mc - a.mc;
      }
    });

    if(matchList.length > 0 && matchList[0].mc != FORCENUM ){
      matchList = shuffle(matchList);
    }

    for( i = 0; i < listCount && i < matchList.length; i++){
      returnHTML += matchList[i].htmlData;
    }

    if(classes != "")returnHTML = '<div class="' + classes + '">' + returnHTML + '</div>';

    return returnHTML;
});