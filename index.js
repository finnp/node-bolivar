var fs = require('fs');
var http = require('http');
var path = require('path');
var urlParse = require('url').parse;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var sar = require('search-act-replace');
var getAccepted = require('get-accepted');

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
  if(!options.paths.fonts) options.paths.fonts = 'fonts';

  options.filetypes = {
    css: {
      exts: ['.css'],
      mimes: ['text/css']
    },
    js: {
      exts: ['.js'],
      mimes: ['application/javascript', 'application/ecmascript']
    },
    img: {
      exts: ['.jpg', '.jpeg', '.png', '.gif'],
      mimes: ['image/gif', 'image/jpeg', 'image/png']
    },
    fonts: {
      exts: ['.ttf', '.eot', '.woff', '.svg'],
      mimes: ['application/x-font-ttf']
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
    var url = completeUrl(match[0]);
    var filetypes = self.options.filetypes;
    var fileExt = path.extname(urlParse(url).pathname);

    if (fileExt) {
      // by file extension
      for(filetype in filetypes) {
        var exts = filetypes[filetype].exts;
        if (exts.indexOf(fileExt) > -1) {
          self.extDownload(url, filetype, replace);
          return;
        }
      }
      replace(false);
    } else {
      // by mime type
      self.mimeDownload(url, replace);
    }
  }
}


Bolivar.prototype.mimeDownload = function (url, replace) {
  var self = this;
  var filetypes = self.options.filetypes;
  var mimetypes = [];
  for(filetype in filetypes) {
    mimetypes = mimetypes.concat(filetypes[filetype].mimes);
  }
  getAccepted(url, mimetypes, function (res) {
    if(res) {
      var type;
      var mime = res.headers['content-type'];
      for(filetype in filetypes) {
        var mimes = filetypes[filetype].mimes;
        if (mimes.indexOf(mime) > -1) {
          type = filetype;
        }
      }
      self.saveLocally(url, res, type, replace);
    } else {
      replace(false);
    }
  })
}


Bolivar.prototype.saveLocally = function (url, res, type, replace) {
  // Takes the FileStream and saves it
  this.emit('download', {url: url});
  var self = this;
  var filename = url.split('/').pop();
  var savePath = this.options.paths[type];
  var intFile = fs.createWriteStream(path.join(this.options.root, savePath, filename));
  if (savePath) {
    res
      .pipe(intFile)
      .on('finish', function () {
        var replacePath = path.join('/', savePath, filename);
        replace(replacePath);
        self.emit('url', {url: url, path: replacePath});
      })
      ;
  } else {
    replace(false);
  }
}

Bolivar.prototype.extDownload = function(url, type, replace) {
  // checks before if it should download
  var self = this;

  if (!type) {
    replace(false);
    return;
  }

  url = completeUrl(url);

  http.get(url, function(res) {
    self.saveLocally(url, res, type, replace);
  });
};



module.exports = Bolivar;
