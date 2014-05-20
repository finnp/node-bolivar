var fs = require('fs');
var http = require('http');
var path = require('path');
var urlParse = require('url').parse;
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
    self.downloadLocally(completeUrl(match[0]), replace);
  }
}

Bolivar.prototype.downloadLocally = function(url, replace) {
  // checks before if it should download
  var self = this;
  var type;
  var filetypes = self.options.filetypes;
  var fileExt = path.extname(urlParse(url).pathname);
  for(filetype in filetypes) {
    var exts = filetypes[filetype].exts;
    if (exts.indexOf(fileExt) > -1) {
      type = filetype;
      break;
    }
  }
  if (!type) {
    replace(false);
    return;
  }

  url = completeUrl(url);
  var filename = url.split('/').pop();
  var savePath = this.options.paths[type];
  if (savePath) {
    var intFile = fs.createWriteStream(path.join(this.options.root, savePath, filename));
    this.emit('download', {url: url});
    http.get(url, function(extFile) {
      extFile
        .pipe(intFile)
        .on('finish', function () {
          var replacePath = path.join('/', savePath, filename);
          replace(replacePath);
          self.emit('url', {url: url, path: replacePath});
        })
        ;
    });
  } else {
    replace(false);
  }

};

module.exports = Bolivar;
