'use strict'

let debug = require('debug')('Server:Apps:Mail-fetch:Filters:01_parse_attachment');
let debug_internals = require('debug')('Server:Apps:Mail-fetch:Filters:01_parse_attachment:Internals');

// const path = require('path'),
//       ETC =  process.env.NODE_ENV === 'production'
//       ? path.join(process.cwd(), '/etc/')
//       : path.join(process.cwd(), '/devel/etc/')

const gzip = require('./attachments/gzip'),
			zip = require('./attachments/zip')
      // data_formater_filter = require(path.join(ETC, 'snippets/filter.data_formater')),
      // compress_filter = require(path.join(ETC, 'snippets/filter.zlib.compress'))

const async = require('async')

module.exports = function(payload){
  let {input, output } = payload

  let filter = function(doc, opts, next, pipeline){
    let { id, req, type, input } = opts
		// debug('second filter', doc)
		// process.exit(1)
		if(doc.attachments){
			async.eachOf(doc.attachments, function(attachment, index, callback) {
				let uncompress

				switch (attachment.contentType) {
					case 'application/x-gzip':
					case 'application/gzip':
						uncompress = gzip
						break;

					case 'application/zip':
						uncompress = zip
						break;
					// default:

				}

				if(typeof uncompress === 'function'){
					uncompress(
						attachment.content,
						opts,
						(content) => {
							doc.attachments[index].content = content
							// debug('second filter zip', doc.attachments[0])
							// process.exit(1)
							callback()
						},
						pipeline
					)
				}
				else{
					debug('attachment.contentType', attachment.contentType)
					process.exit(1)
				}

			}, function(err) {
				// if any of the file processing produced an error, err would equal that error
				// if( err ) {
				// 	// One of the iterations produced an error.
				// 	// All processing will now stop.
				// 	console.log('A file failed to process');
				// } else {
				// 	console.log('All files have been processed successfully');
				// }
				next(doc, opts, next, pipeline)
			})

		}
		else{
			next(doc, opts, next, pipeline)
		}


  }


  return filter
}
