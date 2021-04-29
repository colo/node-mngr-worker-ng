'use strict'

let debug = require('debug')('Server:Apps:Mail-fetch:Filters:00_parse');
let debug_internals = require('debug')('Server:Apps:Mail-fetch:Filters:00_parse:Internals');

const path = require('path'),
      ETC =  process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), '/etc/')
      : path.join(process.cwd(), '/devel/etc/')

// const sanitize_filter = require(path.join(ETC, 'snippets/filter.sanitize.rethinkdb.template')),
      // data_formater_filter = require(path.join(ETC, 'snippets/filter.data_formater')),
      // compress_filter = require(path.join(ETC, 'snippets/filter.zlib.compress'))

// const roundMilliseconds = function(timestamp){
//   let d = new Date(timestamp)
//   d.setMilliseconds(0)
//
//   return d.getTime()
// }

const parse = require('parse-email')

module.exports = function(payload){
  let {input, output } = payload

  let filter = function(doc, opts, next, pipeline){
    let { id, req, type, input } = opts

		if(req.type === 'fetch'){//right now do nothing with 'search' results
			// debug('first filter', doc, opts)
			// process.exit(1)
			Array.each(doc, function(msg){
				parse(msg.body).then((email) => {
			    // debug('parsed', email)
					// debug('parsed', email.attachments[0].contentType, email.attachments[0].filename)
					// process.exit(1)
					next(email, opts, next, pipeline )
			  })
			})


		}


  }


  return filter
}
