#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var findit = require('findit');

var Bolivar = require('../index.js');

var options = require('nomnom')
  .script('bolivar')
  .help('Get independant from external css, js and images')
  .option('root', {
    abbr: 'r',
    default: process.cwd(),
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
  .parse()
  ;

// To be included in CLI
options.paths = false;


var bolivar = new Bolivar(options);

if(!options.silent) {
  console.log('Root ' + options.root);

  bolivar.on('file', function(data) {
    console.log('File: ' + data.name);
  });

  bolivar.on('url', function(data) {
    console.log('* ' + data.url);
  });
}

if(!options.force && !fs.existsSync(path.join(options.root, '.git'))) {
  console.error('No .git found in root. Use -f if you are sure what you are doing.');
  process.exit();
}

bolivar.start();
