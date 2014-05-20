var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var sar = require('search-act-replace');

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

  options.filetypes = {
    'css': {
      exts: ['.css']
    },
    'js': {
      exts: ['.js']
    },
    'img': {
      exts: ['.jpg', '.jpeg', '.png', '.gif']
    },
    'fonts': {
      exts: ['.ttf']
    }
  }


  // This Url RegEx probably needs improvement...
  options.regex = /(https?:)?\/\/([\w\-]\.?)+(\/[\w\.\-]+)+\/?(\?(\w+(=\w+)?(\&\w+(=\w+)?)*)?)?/g;

  this.options = options;
}

Bolivar.prototype.start = function () {
  var self = this;
  sar(self.options.root, self.options.regex, matchedUrl)
    .on('end',function () {
      self.emit('end');
    })
    ;

  function matchedUrl(match, file, replace) {
    var fileUrl = completeUrl(match[0]);
    var fileExt = path.extname(url.parse(fileUrl).pathname);

    var filetypes = self.options.filetypes;
    var localLocation = false;
    for(filetype in filetypes) {
      var exts = filetypes[filetype].exts;
      if (exts.indexOf(fileExt) > -1) {
        localLocation = self.downloadLocally(filetype, fileUrl);
      }
    }
    replace(localLocation);
  }
}

Bolivar.prototype.downloadLocally = function(type, url) {
  var self = this;
  url = completeUrl(url);
  var filename = url.split('/').pop();
  var savePath = this.options.paths[type];
  this.emit('url', {url: url});
  if (savePath) {
    var intFile = fs.createWriteStream(path.join(this.options.root, savePath, filename));
    http.get(url, function(extFile) {
      extFile
        .pipe(intFile)
        .on('finish', function () {
          self.emit('downloaded', {url: url});
        })
        ;
    });
    return path.join('/', savePath, filename);
  } else {
    return false;
  }

};

module.exports = Bolivar;
