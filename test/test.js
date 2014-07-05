var os = require('os');
var fs = require('fs');
var path = require('path');
var mocha = require('mocha');
var mkdir = require('mkdirp').sync;
var tmpdir = require('tmp').dir;
var nock = require('nock');
var bolivar = require('../index.js');
var urlParse = require('url').parse;

function mockUrls(id) {
  var urls = fs.readFileSync(path.join(__dirname, id + '-urls.txt'), 'utf-8').trim().split('\n');

  // mocking urls
  var mocks = [];
  urls.forEach(function (urlRaw) {
    url = urlParse(urlRaw);
    baseUrl = url.protocol + '//' + url.host;
    mocks.push(nock(baseUrl).get(url.path).reply(200, 'OK'));
  });

  return mocks;
}

describe('bolivar', function () {

    var tmp;

    before(function (done) {
      // Tempdir
      tmpdir({unsafeCleanup: true}, function (err, tmpPath) {
        if(err) throw err;
        mkdir(path.join(tmpPath, 'css')); // one already exists
        tmp = tmpPath;
        done();
      });
      // no real http calls here
      nock.disableNetConnect();
    });

    // files: detect.html detect-urls.txt
    it('should detect the correct urls', function (done) {

        // mocking urls
        var mocks = mockUrls('detect');

        fs.createReadStream(path.join(__dirname, 'detect.html'))
          .pipe(fs.createWriteStream(path.join(tmp, 'detect.html')))
          ;

        bolivar({root: tmp})
          .on('end', function () {
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

    // files: replace-ref.html replace.html replace-urls.txt
    it('should replace the urls properly', function (done) {
      mockUrls('replace');

      fs.createReadStream(path.join(__dirname, 'replace.html'))
        .pipe(fs.createWriteStream(path.join(tmp, 'replace.html')))
        ;

      bolivar({root: tmp})
        .on('end', function () {
          var file = fs.readFileSync(path.join(tmp, 'replace.html'), 'utf-8');
          var fRef = fs.readFileSync(path.join(__dirname, 'replace-ref.html'), 'utf-8');
          if (file === fRef) {
            done();
          } else {
            done(new Error('Wrong content'));
          }
        })
        .start()
        ;
    });

    // file: header.html
    it('should detect headers properly of files without ending', function (done) {
      var mocks = [
        nock('http://fonts.googleapis.com')
          .get('/css?family=Roboto')
          .reply(200, 'OK', { 'Content-Type': 'text/css'}),
        nock('http://test.de')
          .get('/dadimg')
          .reply(200, 'OK', { 'Content-Type': 'image/jpeg'}),
        nock('http://www.google.de')
          .get('/test')
          .reply(200, 'OK', { 'Content-Type': 'text/html'})
      ];

      fs.createReadStream(path.join(__dirname, 'header.html'))
        .pipe(fs.createWriteStream(path.join(tmp, 'header.html')))
        ;

      var urls = [
        'http://fonts.googleapis.com/css?family=Roboto',
        'http://test.de/dadimg'
      ]

      bolivar({root: tmp})
        .on('url', function (data) {
          var pos;
          if (pos = urls.indexOf(data.url) > -1) {
            urls = urls.splice(pos, 1);
          } else {
            done(new Error('False hit'));
          }
        })
        .on('end', function () {
          var missed = mocks.filter(function (url) {
            return !url.isDone();
          })

          if (missed.length === 0) {
            if (urls.length === 0) {
              done();
            } else {
              done(new Error('Miss'));
            }
          } else {
            done(new Error('Missed ' + missed.length + ' urls. One is ' + missed[0].pendingMocks()));
          }
          })
        .start()
        ;
    });
});
