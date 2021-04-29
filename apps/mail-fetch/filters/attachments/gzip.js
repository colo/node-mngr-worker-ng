'use strict'

let debug = require('debug')('Server:Apps:Mail-fetch:Filters:attachments:gzip');
let debug_internals = require('debug')('Server:Apps:Mail-fetch:Filters:attachments:gzip:Internals');

const zlib = require('zlib')


module.exports = function(doc, opts, next, pipeline){
	let { id, req, type, input } = opts

	zlib.unzip(doc, (err, buffer) => {
		if (!err) {
			// debug_internals('post-decompress data %o', buffer.toString())
			next(buffer.toString(), opts, next, pipeline)
		} else {
			debug_internals('decompress ERR %o', err)
			process.exit(1)
		}

		// process.exit(1)
	})

}
