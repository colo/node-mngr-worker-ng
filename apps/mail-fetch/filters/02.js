'use strict'

let debug = require('debug')('Server:Apps:Mail-fetch:Filters:02');
let debug_internals = require('debug')('Server:Apps:Mail-fetch:Filters:02:Internals');

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



module.exports = function(payload){
  let {input, output } = payload

  let filter = function(doc, opts, next, pipeline){
    let { id, req, type, input } = opts
		debug('3rd filter', doc, opts)
		process.exit(1)

  }


  return filter
}
