#!/usr/bin/env node

var findit = require('findit');
var fs = require('fs');
var path = require('path');

var Bolivar = require('../index.js');

var options = require('nomnom')
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
  .parse()
  ;

// To be included in CLI
options.paths = {
  css: 'css',
  js: 'js',
  img: 'img'
}

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