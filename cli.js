var fs = require('fs');
var http = require('http');
var cheerio = require('cheerio');

var testFile = fs.readFileSync('example.html');

var $ = cheerio.load(testFile.toString());

var isExternal = function(path) {
  return path && path.indexOf('//') > -1;
};

var completeUrl = function(url) {
  // Assuming it is an URL not a local path
  if(url[0] == '/') return 'http:' + url;
  return url;
};

var paths = {
  css: 'css',
  js: 'js'
}


var resolve = function(type, url) {
  if(isExternal(url)) {
    url = completeUrl(url);
    var fileName = url.split('/').pop();
    console.log('Replacing \n * ' + url);
    var intFile = fs.createWriteStream(paths[type] + '/' + fileName);
    http.get(url, function(extFile) {
      extFile.pipe(intFile)
    });
    return 'href', '/' + paths[type] + '/' + fileName;
  } else {
    return url;
  }
  
};

$('link[rel=stylesheet]').each(function(i, elem) {
  var url = $(this).attr('href');
  localPath = resolve('css', url);
  $(this).attr('href', localPath);
});

$('script').each(function(i, elem) {
  var url = $(this).attr('src');
  resolve('js', url);
});