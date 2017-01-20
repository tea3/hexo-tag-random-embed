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
	var i          = 0;
    
    if(args.length > 2){
      for(i = 2; i < args.length; i++){
        tags.push(args[i]);
      }
    }
    
    // checking args
    if( !listData || listData == "" || listData.length == 0 || !listCount || (tags.length == 0 && (!instanceID || instanceID == "")) )return returnHTML;
    
    for( i = 0; i < listData.length; i++){
      if( listData[i].instanceID == instanceID ){
        matchList.push({ "mc" : 9999 , "htmlData" : listData[i].htmlData });
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
    
    for( i = 0; i < listCount && i < matchList.length; i++){
    	returnHTML += matchList[i].htmlData;
    }

  	return returnHTML;
});