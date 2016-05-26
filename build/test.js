// node --use_strict build/test.js --loader=browserify -n=100
// Low: 2342
// High: 4266
// Average: 2739.34
// Size: 2938137

// node --use_strict build/test.js --loader=webpack -n=100
// Low: 2478
// High: 3752
// Average: 3090.14
// Size: 8734627

let async = require('async');
let fs = require('fs');
let path = require('path');
let parseArgs = require('minimist')(process.argv);

const ROOT = path.resolve(__dirname, '../');
const LOADERS = {
	browserify: require('./browserify'),
	webpack: require('./webpack')
};

let defaultArgs = {
	minify: false,
	watch: false,
	loader: 'browserify',
	n: 1
};

let args = Object.assign({}, defaultArgs, parseArgs);
let filePath = path.join(ROOT, '/public/scripts', args.minify ? 'bundle.min.js' : 'bundle.js');

cleanup();

let times = [];
let date = Date.now();

if(args.watch) {
	let counter = 0;
	LOADERS[args.loader](['./public/scripts/main.js'], args.minify, args.watch, function() {
		if(counter > 0) {
			times.push(Date.now() - date);
		}
		counter++;
		if(counter <= args.n) {
			fs.appendFileSync(path.join(ROOT, '/public/scripts/components/App.js'), '\nvar foo="bar";');
			date = Date.now();
		}
		else {
			finish();
			process.exit(0);
		}
	});
}
else {
	async.timesSeries(
		args.n,
		function(n, next) {
			LOADERS[args.loader](['./public/scripts/main.js'], args.minify, args.watch, function() {
				times.push(Date.now() - date);
				if(n !== args.n-1) {
					cleanup();
				}
				date = Date.now();
				next();
			});
		},
		function(err) {
			finish();
		}
	);
}

function finish() {
	let sum = times.reduce((prev, current) => {
		return prev+current;
	}, 0);
	times.sort(function(a, b) {
		if (a < b) {
			return -1;
		}
		if (a > b) {
			return 1;
		}
		// a must be equal to b
		return 0;
	});
	let stats = fs.statSync(filePath);
	console.log('Low:', times[0]);
	console.log('High:', times[times.length-1]);
	console.log('Average:', sum/times.length);
	console.log('Size:', stats.size);
}


function cleanup() {
	try {
		fs.unlinkSync(filePath);
	}
	catch(e) {}
	
	try {
		if(args.minify) {
			fs.unlinkSync(path.join(ROOT, '/public/scripts', 'bundle.min.js.map'));
		}
	}
	catch(e) {}
}