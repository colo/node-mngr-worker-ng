'use strict'

let debug = require('debug')('Server:Apps:Educativa:Backups.replica:Filters:dirvish');
let debug_internals = require('debug')('Server:Apps:Educativa:Backups.replica:Filters:dirvish:Internals');

/**
* from node-dirvish.conf
**/
const is_value_line = function(line){//value lines are ALWAYS indented by tabs or white space
	var result = false;
	if(line.indexOf(' ') == 0 || line.indexOf("\t") == 0)
		result = true;

	return result;
}

let comment = null;
let key = null;
// let config = {};
const process_line = function(line, config) {
		//line = line.clean();
		//var key = null;

		if(line == null || line == ''){//reset key
			key = null;
		}

		if(line.indexOf('#') == 0){//comment
			comment = (comment == null) ? line : comment + "\n"+line;
			line = null;
		}
		else if(line.indexOf('#') > 0){//comment after line
			comment = line.slice(line.indexOf('#'), line.length -1);
			line = line.slice(0, line.indexOf('#') - 1);

		}


		if(line != null && line != ''){//avoid null lines

			if(!is_value_line(line) && line.indexOf(':') == line.length - 1){//if line ends with ':' starts a multiline section
				key = line.slice(0, line.indexOf(':')).clean();
				config[key] = [];
			}
			else if(!is_value_line(line) && line.indexOf(':') > 0){//section : value
				var tmp = line.split(':');
				key = tmp[0].clean();

				// if(key == 'config' ||
				// 	key == 'file-exclude' ||
				// 	key == 'password-file' ||
				// 	key == 'client'){//include config file
				//
				// 	var tmp_key = key;//save key, as it gets overiden on the async call
				// 	var include_file = tmp[1].clean();
				//
				// 	if(!path.isAbsolute(include_file)){//if file path is not absolute, make an array of possible path
				// 		var vault_dir = '';//get vault dir
				// 		var files = [
				// 			vault_dir+'/'+include_file,
				// 			vault_dir+'/'+include_file+'.conf',
				// 			dir+'/'+include_file,
				// 			dir+'/'+include_file+'.conf'
				// 		];
				// 	}
				//
				// 	config[tmp_key] = include_file;//set it as value, if no file could be included, will keep this one
				//
				// 	files.each(function(file, index){
				// 		//var file_path = path.join(__dirname, file);
				// 		var file_path = file;
				//
				// 		try{
				// 			fs.accessSync(file_path, fs.R_OK);
				//
				// 			conf(file_path)
				// 			.then(function(cfg){
				// 				config[tmp_key] = {};
				// 				config[tmp_key][include_file] = cfg;
				//
				// 				////console.log('config[key]'+key);
				// 				////console.log(config);
				//
				// 			}.bind(this))
				// 			.done();
				//
				// 			throw new Error('Read: '+ file_path);//break the each loop
				// 		}
				// 		catch(e){
				// 			//console.log(e);
				// 		}
				//
				// 	}.bind(this));
				//
				// }
				// else{
				// 	////console.log('KEY: '+key);
				// 	////console.log('value: '+tmp[1]);
				// 	////console.log(config);

					if(tmp[1].clean() != '')
						config[key] = tmp[1].clean();
				// }

				key = null;
			}
			else if(/SET|UNSET|RESET/.test(line)){//the onlye 3 options that don't use colons <:>

				var tmp = line.split(' ');
				////console.log(tmp);
				key = tmp[0].clean();
				config[key] = [];

				for(var i = 1; i < tmp.length; i++){
					if(tmp[i].clean() != '')
						config[key].push(tmp[i].clean());
				}
				key = null;
			}
			else if(key == null){//only know case is the content of a 'password-file'
				config = line.clean();
			}
			else{//value of a multiline section
				if(line.clean() != '')
					config[key].push(line.clean());
			}

			////console.log('Comment from file:', comment);
			////console.log('Line from file:', line);

		}
	}

	module.exports = function(doc, opts, next, pipeline){
		let { id, req, type, input } = opts
		// debug('4rd filter', doc.split("\n"))
		let lines = doc.split("\n")
		let config = {}
		Array.each(lines, function(line){
			try {
				process_line(line, config)
			}
			catch(e){}
		})
		next(config, opts, next, pipeline)
		// debug('4rd filter', config)
		// process.exit(1)
	}
