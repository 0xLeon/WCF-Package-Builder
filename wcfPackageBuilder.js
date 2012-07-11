var fs = require('fs');
var fstream = require('fstream');
var Path = require('path');
var glob = require('glob');
var Tar = require('tar-async');
var debug = false;

console.log('Welcome to WCF Package Builder');

function getBuildConfig() {
	if (debug) console.log('getBuildConfig called');
	
	if (process.argv.length < 3) {
		console.error('No package directory given.');
		process.exit(1);
	}
	
	fs.exists(process.argv[2], function(exists) {
		if (!exists) {
			console.error('Given package directoy "' + process.argv[2] + '" doesn\'t exists.');
			process.exit(2);
		}
		else {
			try {
				process.chdir(process.argv[2]);
				if (debug) console.log('Changed working directoy to "' + process.cwd() + '"');
				checkPackageDir();
			}
			catch (err) {
				console.error('Couldn\'t change working directory to "' + process.argv[2] + '"');
				console.error(err);
				process.exit(3);
			}
		}
	});
}

function checkPackageDir() {
	if (debug) console.log('checkPackageDir called');
	
	fs.exists('./src/package.xml', function(exists) {
		if (!exists) {
			console.error(process.cwd() + ' doesn\'t seem to be a package, no package.xml file found in src directory');
			process.exit(4);
		}
		else {
			checkBuildDir();
		}
	});
}

function checkBuildDir() {
	if (debug) console.log('checkBuildDir called');
	
	fs.exists('./.build', function(exists) {
		if (exists) {
			clearBuildDir();
			return;
		}
		
		fs.mkdir('./.build', 0777, function(err) {
			if (err) throw err;
			
			fs.exists('./.build', function(exists) {
				if (!exists) {
					throw new Error('Could not create .build dir');
				}
				else {
					getPackageConfig();
				}
			});
		});
	});
}

function clearBuildDir() {
	if (debug) console.log('clearBuildDir called');
	
	glob('./build/*', function(err, matches) {
		if (err) throw err;
		
		if (!!matches.length) {
			console.log('Deleting old build files');
			
			matches.forEach(function(path, index) {
				fs.unlink(path, function(err) {
					if (err) throw err;
					
					if ((index + 1) === matches.length) {
						getPackageConfig();
					}
				});
			});
		}
		else {
			getPackageConfig();
		}
	});
}

function getPackageConfig() {
	if (debug) console.log('getPackageConfig called');
	
	glob('{./src/*.xml,./src/*.sql,./src/templatepatch.diff,./src/acptemplatepatch.diff}', function(err, matches) {
		if (err) throw err;
		
		matches.forEach(function(path, index) {
			fs.createReadStream(path).pipe(fs.createWriteStream('./.build/' + Path.basename(path)));
			
			if ((index + 1) === matches.length) {
				getACPTemplates();
			}
		});
	});	
}

function getACPTemplates() {
	if (debug) console.log('getACPTemplates called');
	
	fs.exists('./src/acptemplates', function(exists) {
		if (!exists) {
			getTemplates();
			return;
		}
		
		var tape = new Tar({
			output: fs.createWriteStream('./.build/acptemplates.tar')
		});
		var reader = fstream.Reader({
			path: './src/acptemplates/'/*,
			filter: function() {
				return this.basename.match(/.+\.tpl$/);
			}*/
		});
		var entryHandler = function(entry) {
			if (entry.type === 'File') {
				tape.append(entry.basename, entry, {
					allowPipe: true
				});
			}
		}
		
		console.log('Creating acptemplates tar archive');
		reader.on('entry', entryHandler);
		reader.on('end', function() {
			if (debug) console.log('acp templates reader end');
			
			getTemplates();
		});
	});
}

function getTemplates() {
	if (debug) console.log('getTemplates called');
	
	fs.exists('./src/templates', function(exists) {
		if (!exists) {
			getFiles();
			return;
		}
		
		var tape = new Tar({
			output: fs.createWriteStream('./.build/templates.tar')
		});
		var reader = fstream.Reader({
			path: './src/templates/'/*,
			filter: function() {
				return this.basename.match(/.+\.tpl$/);
			}*/
		});
		var entryHandler = function(entry) {
			if (entry.type === 'File') {
				tape.append(entry.basename, entry, {
					allowPipe: true
				});
			}
		}
		
		console.log('Creating templates tar archive');
		reader.on('entry', entryHandler);
		reader.on('end', function() {
			if (debug) console.log('templates reader end');
			
			getFiles();
		});
	});
}

function getFiles() {
	if (debug) console.log('getFiles called');
	
	fs.exists('./src/files', function(exists) {
		if (!exists) {
			getPackageInstallationPlugins();
			return;
		}
		
		var tape = new Tar({
			output: fs.createWriteStream('./.build/files.tar')
		});
		var reader = fstream.Reader('./src/files/');
		var entryHandler = function(entry) {
			if (entry.type === 'File') {
				var path = entry.path.replace(process.cwd() + Path.sep + 'src' + Path.sep + 'files' + Path.sep, '');
				
				tape.append(path, entry, {
					allowPipe: true
				});
			}
			else if (entry.type === 'Directory') {
				entry.on('entry', entryHandler);
			}
		}
		
		console.log('Creating files tar archive');
		reader.on('entry', entryHandler);
		reader.on('end', function() {
			if (debug) console.log('files reader end');
			
			getPackageInstallationPlugins();
		});
	});
}

function getPackageInstallationPlugins() {
	if (debug) console.log('getPackageInstallationPlugins called');
	
	fs.exists('./src/pips', function(exists) {
		if (!exists) {
			buildPackage();
			return;
		}
		
		var tape = new Tar({
			output: fs.createWriteStream('./.build/pips.tar')
		});
		var reader = fstream.Reader({
			path: './src/pips/'/*,
			filter: function() {
				return this.basename.match(/.+\.php$/);
			}*/
		});
		var entryHandler = function(entry) {
			if (entry.type === 'File') {
				tape.append(entry.basename, entry, {
					allowPipe: true
				});
			}
		}
		
		console.log('Creating pips tar archive');
		reader.on('entry', entryHandler);
		reader.on('end', function() {
			if (debug) console.log('pips reader end');
			
			buildPackage();
		});
	});
}

function buildPackage() {
	if (debug) console.log('buildPackage called');
	
	var tape = new Tar({
		output: fs.createWriteStream('./' + Path.basename(process.cwd()) + '.' + Math.round((new Date()).getTime() / 1000) + '.tar')
	});
	var reader = fstream.Reader('./.build/');
	
	console.log('Creating package archive');
	reader.on('entry', function(entry) {
		if (entry.type === 'File') {
			tape.append(entry.basename, entry, {
				allowPipe: true
			});
		}
	});
	
	reader.on('end', function() {
		fs.exists('./requirements', function(exists) {
			if (!exists) return;
			
			var requirementsReader = fstream.Reader('./requirements/');
			requirementsReader.on('entry', function(requirementsEntry) {
				tape.append('requirements/' +  requirementsEntry.basename, requirementsEntry, {
					allowPipe: true
				});
			});
		});
	});
}

getBuildConfig();
