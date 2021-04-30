'use strict'

let debug = require('debug')('Server:Apps:Dmarc:Filters:01_to_report');
let debug_internals = require('debug')('Server:Apps:Dmarc:Filters:01_to_report:Internals');

const path = require('path'),
      ETC =  process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), '/etc/')
      : path.join(process.cwd(), '/devel/etc/')

const sanitize_filter = require(path.join(ETC, 'snippets/filter.sanitize.rethinkdb.template'))
      // data_formater_filter = require(path.join(ETC, 'snippets/filter.data_formater')),
      // compress_filter = require(path.join(ETC, 'snippets/filter.zlib.compress'))

// const roundMilliseconds = function(timestamp){
//   let d = new Date(timestamp)
//   d.setMilliseconds(0)
//
//   return d.getTime()
// }


const xml_to_json = require('./xml_to_json')
const moment = require('moment')

module.exports = function(payload){
  let {input, output } = payload

  let filter = function(doc, opts, next, pipeline){
    let { req, type, input } = opts
		debug('4rd filter', doc.msg)
		// process.exit(1)
		let ts = (doc.msg.date) ? moment(doc.msg.date).valueOf() : Date.now()
		let id = opts.req.id+'.'+doc.data.report.org+':'+doc.data.policy.domain+'@'+ts
		id = id.replace(/\s/g, '')
		let report = {
			// id: opts.req.id+'.'+doc.data.report.org+':'+doc.data.policy.domain+'@'+doc.data.report.range.start+'-'+doc.data.report.range.end,
			id: id,
			data: doc.data,
			metadata: {
				domain: doc.data.policy.domain,
				host: doc.data.report.org,
				tag: opts.req.id.split('.'),
				path: opts.req.id,
				range: doc.data.report.range,
				timestamp: ts,
				type: 'periodical'
			}
		}
		sanitize_filter(report, opts, next, pipeline)

		// debug('4rd filter', report, opts)
		// process.exit(1)

  }


  return filter
}
