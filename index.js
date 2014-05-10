var fs = require('fs');
var http = require('http');
var path = require('path');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var cheerio = require('cheerio');
var findit = require('findit');

// Helper
var isExternal = function(path) {
    return path && path.indexOf('//') > -1;
};

var completeUrl = function(url) {
  // Assuming it is an URL not a local path
  if(url[0] == '/') return 'http:' + url;
  return url;
};

util.inherits(Bolivar, EventEmitter);

function Bolivar(options) {
  if(!(this instanceof Bolivar)) return new Bolivar(options);
  EventEmitter.call(this);

  // Default paths
  if(!options.paths) options.paths = {};
  if(!options.paths.css) options.paths.css = 'css';
  if(!options.paths.js) options.paths.js = 'js';
  if(!options.paths.img) options.paths.img = 'img';

  this.options = options;
}

Bolivar.prototype.start = function() {
  var self = this;
  self.finder = findit(self.options.root);

  self.finder.on('directory', function (dir, stat, stop) {
      var base = path.basename(dir);
      if (base === '.git' || base === 'node_modules') stop();
  });

  self.finder.on('file', function (file, stat) {
      var relFile = path.relative(self.options.root, file);
      if(path.extname(file) === '.html') {
        self.emit('file', {name: relFile});
        self.freeFile(self.options.root, relFile);
      }
  });
};

Bolivar.prototype.stop = function() {
  this.finder.stop();
};

Bolivar.prototype.freeFile = function(root, relFile) {
  var self = this;
  var filepath = path.join(root, relFile);
  var file = fs.readFileSync(filepath);
  var $ = cheerio.load(file.toString());

  var saveLocally = function(selector, attrName, type) {
    $(selector).each(function(i, elem) {
      var url = $(this).attr(attrName);
      localPath = self.downloadLocally(type, url);
      $(this).attr(attrName, localPath);
    });
  };

  saveLocally('link[rel=stylesheet]', 'href', 'css');
  saveLocally('script', 'src', 'js');
  saveLocally('img', 'src', 'img');
  fs.writeFileSync(filepath, $.html());
};


Bolivar.prototype.downloadLocally = function(type, url) {
  if(isExternal(url)) {
    url = completeUrl(url);
    var filename = url.split('/').pop();
    this.emit('url', {url: url});
    var savePath = this.options.paths[type];
    var intFile = fs.createWriteStream(path.join(savePath, filename));
    http.get(url, function(extFile) {
      extFile.pipe(intFile);
    });
    return path.join('/', savePath, filename);
  } else {
    return url;
  }
};

module.exports = Bolivar;
