'use strict'

let debug = require('debug')('Server:Apps:Dmarc:Filters:00_from_mail');
let debug_internals = require('debug')('Server:Apps:Dmarc:Filters:00_from_mail:Internals');

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


const xml_to_json = require('./xml_to_json')

module.exports = function(payload){
  let {input, output } = payload

  let filter = function(doc, opts, next, pipeline){
    let { id, req, type, input } = opts
		// debug('3rd filter', doc, opts)
		// process.exit(1)
		if(/^dmarc/.test(req.id) && req.type === 'fetch' && doc.attachments){
			Array.each(doc.attachments, function(attachment){
				// debug('3rd filter', attachment.content)
				xml_to_json(attachment.content, opts, function(report){
					if(report !== undefined){
						next({msg: doc, data: report}, opts, next, pipeline)
					}
				}, pipeline)

				// let xml = attachment.content

				// let report = convert.xml2js(xml, {compact: true})
				// debug('report %O', report)
				// process.exit(1)
			})
		}
  }


  return filter
}
