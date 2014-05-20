var os = require('os');
var fs = require('fs');
var path = require('path');
var mocha = require('mocha');
var mkdir = require('mkdirp').sync;
var tmpdir = require('tmp').dir;
var nock = require('nock');
var bolivar = require('../index.js');
var urlParse = require('url').parse;

  describe('bolivar', function () {

    var tmp;

    before(function (done) {
      // Tempdir
      tmpdir({unsafeCleanup: true}, function (err, tmpPath) {
        if(err) throw err;
        mkdir(path.join(tmpPath, 'css'));
        mkdir(path.join(tmpPath, 'js'));
        mkdir(path.join(tmpPath, 'img'));
        tmp = tmpPath;
        console.log(tmp);
        done();
      });
      // no real http calls here
      nock.disableNetConnect();
    });

    it('should detect the correct urls', function (done) {

        var urls = fs.readFileSync(path.join(__dirname, 'detect-urls.txt'), 'utf-8').trim().split('\n');

        // mocking urls
        var mocks = [];
        urls.forEach(function (urlRaw) {
          url = urlParse(urlRaw);
          baseUrl = url.protocol + '//' + url.host;
          mocks.push(nock(baseUrl).get(url.path).reply(200, 'OK'));
        });

        fs.createReadStream(path.join(__dirname, 'detect.html'))
          .pipe(fs.createWriteStream(path.join(tmp, 'detect.html')))
          ;

        bolivar({root: tmp})
          .on('url', function (data) {
            console.log('go ' + data.url);
          })
          .on('downloaded',function (data) {
            console.log('Downloaded ' + data.url);
          })
          .on('end', function () {
            console.log('end');

            var missed = mocks.filter(function (url) {
              return !url.isDone();
            })

            if (missed.length === 0) {
              done();
            } else {
              done('Missed ' + missed.length + ' urls. One is ' + missed[0].pendingMocks());
            }
          })
          .start()
          ;
    });

    // it('should replace the urls properly', function (done) {
    //   fs.createReadStream(path.join(__dirname, 'replace.html'))
    //     .pipe(fs.createWriteStream(path.join(tmp, 'replace.html')))
    //     ;
    //
    //   bolivar({root: tmp})
    //     .on('end', function () {
    //       var file = fs.readFileSync(path.join(tmp, 'replace.html'), 'utf-8');
    //       var fRef = fs.readFileSync(path.join(__dirname, 'replace-ref.html'), 'utf-8');
    //       if (file === fRef) {
    //         done();
    //       } else {
    //         done('Wrong content');
    //       }
    //     })
    //     .start()
    //     ;
    // });
});
