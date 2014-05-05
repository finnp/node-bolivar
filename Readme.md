# Bolivar

> Get independant from external css, js and images

Bolivar is a CLI for removing external CSS, JS and image dependencies from your projects, moving them into `css`, `js` and `img` folders. It's convenient if you used a lot of CDNs and external images and now want to work offline on your HTML.

Just install it with `npm install -g bolivar` and use `bolivar` in your projects root. 

Make sure the project is GIT version controlled in case Bolivar screws something up. Bolivar will skip the `.git` and `node_modules` directories.

## Script usage
You can also use bolivar via require. It will not `console.log` messages but emit `file` and `url` events.
```javascript
	var bolivar = require('bolivar')({root: '/folder');
	bolivar.on('file', function(file) {
		console.log('Acting on ' + file.name);
	})
```