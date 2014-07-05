#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var color = require('cli-color');

var cErr = color.red;
var cOk = color.green;
var cInfo = color.blue;

var Bolivar = require('../index.js');

var parser = require('nomnom')
  .script('bolivar')
  .help('Get independant from external css, js and images')
  .option('root', {
    position: 0,
    help: 'The root directory to work on'
  })
  .option('silent', {
    abbr: 's',
    flag: true,
    help: 'When set no messages will be printed'
  })
  .option('force', {
    abbr: 'f',
    flag: true,
    help: 'Run bolivar without aborting on warnings'
  })
  .option('parent', {
    abbr: 'p',
    default: '',
    help: 'Parent directory of the assets'
  })
  .option('child', {
    abbr: 'c',
    default: '',
    help: 'Child directory of the assets'
  })
  .option('css', {
    default: 'css',
    help: 'The directory name for .css files'
  })
  .option('js', {
    default: 'js',
    help: 'The directory name for .js files'
  })
  .option('img', {
    default: 'img',
    help: 'The directory name for image files'
  })
  ;

var options = parser.nom();

if(!options.root) {
  parser.print(parser.getUsage());
  process.exit();
}

options.paths = {
    css: path.join(options.parent, options.css, options.child),
    js: path.join(options.parent, options.js, options.child),
    img: path.join(options.parent, options.img, options.child)
};


options.root = path.resolve(options.root);
var bolivar = new Bolivar(options);

if(!options.silent) {
  console.log(cInfo('Root: ' + options.root));

  bolivar.on('file', function(data) {
    console.log('File: ' + data.name);
  });

  bolivar.on('url', function(data) {
    console.log('\uD83C\uDF0E  ' + data.url);
    console.log(' \u21B3 ' + cOk(data.path));
  });
}

if(!options.force && !fs.existsSync(path.join(options.root, '.git'))) {
  console.error(cErr('Warning: No .git found in root. Use -f if you are sure what you are doing.'));
  process.exit();
}

bolivar.start();
