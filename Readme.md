# Bolivar
[![Build Status](https://travis-ci.org/finnp/node-bolivar.svg?branch=master)](https://travis-ci.org/finnp/node-bolivar)
> Get independant from external css, js and images

Bolivar is a CLI for removing external CSS, JS and image dependencies from your
projects, moving them into `css`, `js` and `img` folders. It's convenient if you
used a lot of CDNs and external images and now want to work offline on your HTML.

Just install it with `npm install -g bolivar` and use `bolivar start` in your
projects root.

Make sure the project is GIT version controlled in case Bolivar screws something
up. Bolivar will skip the `.git` and `node_modules` directories.

## Command Line usage
```
$ bolivar start -h
Usage: bolivar start [options]

Options:
   -r, --root     The root directory to work on  [/Users/finn/code/node/npm/bolivar]
   -s, --silent   When set no messages will be printed
   -f, --force    Run bolivar without aborting on warnings
   -p, --parent   Parent directory of the assets  []
   -c, --child    Child directory of the assets  []
   --css          The directory name for .css files  [css]
   --js           The directory name for .js files  [js]
   --img          The directory name for image files  [img]

Start the replacing
```


## Script usage
You can also use bolivar via require. It will not `console.log` messages but emit
`file`, `url` and `download` events as well as an `end` event.
```javascript
	var bolivar = require('bolivar');
	bolivar({root: '/folder')
		.on('file', function(file) {
			console.log('Acting on ' + file.name);
		})
		.start();
```

## License
The MIT License (MIT)

Copyright (c) 2014 Finn Pauls

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
