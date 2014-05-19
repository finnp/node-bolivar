var os = require('os');
var fs = require('fs');
var mocha = require('mocha');
var mkdir = require('mkdirp').sync;
var bolivar = require('../index.js');

describe('bolivar', function () {
  var tmp;

  before(function () {
    tmp = os.tmpdir();
    mkdir(tmp + 'css');
    mkdir(tmp + 'js');
    mkdir(tmp + 'img');
  });

  it('should detect the correct urls', function (done) {
      var urls = fs.readFileSync(__dirname + '/detect-urls.txt', 'utf-8').trim().split('\n');

      fs.createReadStream(__dirname + '/detect.html')
        .pipe(fs.createWriteStream(tmp + 'detect.html'))
        ;

      bolivar({root: tmp})
        .on('url', function (data) {
          var index = urls.indexOf(data.url);
          if(index > -1) {
            urls.splice(index, 1);
          } else {
            done('Matched ' + data.url + ' as URL.');
          }
        })
        .on('end', function () {
          if (urls.length === 0) {
            done();
          } else {
            done('Missed ' + urls.length + ' urls.');
          }
        })
        .start()
        ;
  });

  it('should replace the urls properly', function (done) {
    fs.createReadStream(__dirname + '/replace.html')
      .pipe(fs.createWriteStream(tmp + 'replace.html'))
      ;

    bolivar({root: tmp})
      .on('end', function () {
        var file = fs.readFileSync(tmp + 'replace.html', 'utf-8');
        var fRef = fs.readFileSync(__dirname + '/replace-ref.html', 'utf-8');
        if (file === fRef) {
          done();
        } else {
          done('Wrong content');
        }
      })
      .start()
      ;

  })
});
