'use strict'

let debug = require('debug')('Server:Apps:Mail-fetch:Filters:attachments:zip');
let debug_internals = require('debug')('Server:Apps:Mail-fetch:Filters:attachments:zip:Internals');

const yauzl = require("yauzl")

module.exports = function(doc, opts, next, pipeline){
	let { id, req, type, input } = opts

	yauzl.fromBuffer(doc, {lazyEntries:true}, function(err, zipfile){
		if (!err) {

      // debug_internals('post-decompress data', zipfile)
			let content = ''
			zipfile.readEntry()
		  zipfile.on("entry", function(entry) {

	      zipfile.openReadStream(entry, function(err, readStream) {
	        if (err) throw err;
					readStream.on("data", (chunk) => { content+= chunk });
	        readStream.on("end", function() {
	          zipfile.readEntry();
						// debug_internals('post-decompress data %o', content)
						next(content, opts, next, pipeline)
	        });
	        // readStream.pipe(somewhere);
	      });

		  });

    } else {
      debug_internals('decompress ERR %o', err)
			process.exit(1)
    }


	})


}
