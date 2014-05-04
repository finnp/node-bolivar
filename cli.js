#!/usr/bin/env node

var findit = require('findit');
var fs = require('fs');
var path = require('path');

var resolveExternals = require('./index.js').resolveExternals;

var root = process.cwd();
console.log('Root directory: ' + root);
var finder = findit(root);
// resolveExternals(root, 'example2.html');


finder.on('directory', function (dir, stat, stop) {
    var base = path.basename(dir);
    if (base === '.git' || base === 'node_modules') stop()
});


finder.on('file', function (file, stat) {
    var ending = path.extname(file);
    var relFile = file.slice(root.length + 1, file.length);
    if(ending === '.html') {
      console.log('File: ' + relFile);
      resolveExternals(root, relFile);
    }
});


