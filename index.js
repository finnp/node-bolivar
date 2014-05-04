var fs = require('fs');
var http = require('http');
var path = require('path');
var cheerio = require('cheerio');
var findit = require('findit');

var bolivar = function(options) {

  var print = function(text) {
    if(!options.silent) {
      console.log(text);
    }
  };

  print('Root directory: ' + options.root);

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
      print('* ' + url);
      var intFile = fs.createWriteStream(path.join(options.paths[type], filename));
      http.get(url, function(extFile) {
        extFile.pipe(intFile)
      });
      return path.join('/', options.paths[type], filename);
    } else {
      return url;
    }  
  };

  var finder = findit(options.root);

  finder.on('directory', function (dir, stat, stop) {
      var base = path.basename(dir);
      if (base === '.git' || base === 'node_modules') stop()
  });

  finder.on('file', function (file, stat) {
      var relFile = path.relative(options.root, file);
      if(path.extname(file) === '.html') {
        print('File: ' + relFile);
        resolveExternals(options.root, relFile);
      }
  }); 
};

module.exports = bolivar;

