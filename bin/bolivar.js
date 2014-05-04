#!/usr/bin/env node

var findit = require('findit');
var fs = require('fs');
var path = require('path');

var bolivar = require('../index.js');

var options = {};
options.root = process.cwd();
options.silent = false;
options.paths = {
  css: 'css',
  js: 'js',
  img: 'img'
}

if(!fs.existsSync(path.join(options.root, '.git'))) {
  console.log('No .git folder found. Are you sure you want to use this here?');
  process.exit()
}

bolivar(options);