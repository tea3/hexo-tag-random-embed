'use strict';

var logu         = require('log-util');
var PLUGIN_LABEL = "[hexo-tag-embed-html]";

module.exports.log = function(cat , mes , path){
  
  var filePath = !(path=="" || !path) ? "\n\nPlease check the following file.\n-> " + path : "";
  if(cat == "success"){
    logu.debug(PLUGIN_LABEL +" "+ mes + filePath);
  }else if(cat == "info"){
    logu.info(PLUGIN_LABEL +" "+ mes + filePath);
  }else if(cat == "warn"){
    logu.warn(PLUGIN_LABEL + " warning: " +" "+ mes + filePath);
  }else if(cat == "error"){
    logu.error(PLUGIN_LABEL + " error: " +" "+ mes + filePath);
  }
};