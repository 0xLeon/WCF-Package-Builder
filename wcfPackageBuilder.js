var fs = require('fs');
var fstream = require('fstream');
var Path = require('path');
var glob = require('glob');
var Tar = require('tar-async');
var debug = false;

console.log('Welcome to WCF Package Builder');

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
				var path = entry.path.replace(__dirname + Path.sep + 'src' + Path.sep + 'acptemplates' + Path.sep, '').replace(/\\/g, '/');
				tape.append(path, entry, {
					allowPipe: true
				});
			}
			else if (entry.type === 'Directory') {
				entry.on('entry', entryHandler);
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
				var path = entry.path.replace(__dirname + Path.sep + 'src' + Path.sep + 'templates' + Path.sep, '').replace(/\\/g, '/');
				
				tape.append(path, entry, {
					allowPipe: true
				});
			}
			else if (entry.type === 'Directory') {
				entry.on('entry', entryHandler);
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
				var path = entry.path.replace(__dirname + Path.sep + 'src' + Path.sep + 'files' + Path.sep, '').replace(/\\/g, '/');
				
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
				var path = entry.path.replace(__dirname + Path.sep + 'src' + Path.sep + 'pips' + Path.sep, '').replace(/\\/g, '/');
				
				tape.append(path, entry, {
					allowPipe: true
				});
			}
			else if (entry.type === 'Directory') {
				entry.on('entry', entryHandler);
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
		output: fs.createWriteStream('./' + Path.basename(__dirname) + '.' + Math.round((new Date()).getTime() / 1000) + '.tar')
	});
	var reader = fstream.Reader('./.build/');
	
	console.log('Creating package archive');
	reader.on('entry', function(entry) {
		if (entry.type === 'File') {
			var path = entry.path.replace(__dirname + Path.sep + '.build' + Path.sep, '').replace(/\\/g, '/');
			
			tape.append(path, entry, {
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

checkBuildDir();
