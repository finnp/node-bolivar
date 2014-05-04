var fs = require('fs');
var http = require('http');
var path = require('path');
var cheerio = require('cheerio');

var paths = {
  css: 'css',
  js: 'js',
  img: 'img'
}

var resolveExternals = function(root, relFile) {
  var filepath = path.join(root, relFile);
  var file = fs.readFileSync(filepath);
  var $ = cheerio.load(file.toString());

  var saveLocally = function(selector, attrName, type) {
    $(selector).each(function(i, elem) {
      var url = $(this).attr(attrName);
      localPath = resolve(type, url);
      $(this).attr(attrName, localPath);
    });
  };

  console.log('Replacing:');
  saveLocally('link[rel=stylesheet]', 'href', 'css');
  saveLocally('script', 'src', 'js');
  saveLocally('img', 'src', 'img');
  fs.writeFileSync(filepath, $.html());
};

var isExternal = function(path) {
  return path && path.indexOf('//') > -1;
};

var completeUrl = function(url) {
  // Assuming it is an URL not a local path
  if(url[0] == '/') return 'http:' + url;
  return url;
};

var resolve = function(type, url) {
  if(isExternal(url)) {
    url = completeUrl(url);
    var filename = url.split('/').pop();
    console.log('* ' + url);
    var intFile = fs.createWriteStream(path.join(paths[type], filename));
    http.get(url, function(extFile) {
      extFile.pipe(intFile)
    });
    return path.join('/', paths[type], filename);
  } else {
    return url;
  }  
};

exports.resolveExternals = resolveExternals;