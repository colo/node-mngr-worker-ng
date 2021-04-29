'use strict'

let debug = require('debug')('Server:Apps:Vhosts:Filters:00_vhosts');
let debug_internals = require('debug')('Server:Apps:Vhosts:Filters:00_vhosts:Internals');

const path = require('path'),
      ETC =  process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), '/etc/')
      : path.join(process.cwd(), '/devel/etc/')

const sanitize_filter = require(path.join(ETC, 'snippets/filter.sanitize.rethinkdb.template'))

const roundMilliseconds = function(timestamp){
  let d = new Date(timestamp)
  d.setMilliseconds(0)

  return d.getTime()
}


module.exports = function(payload){
  let {input, output, opts } = payload
  // let type = input.type
  // let full_range = input.full_range
  // let table = input.clients.options.table
  // full_range = full_range || false
  // let group_index = (opts && opts.group_index !== undefined) ? opts.group_index : DEFAULT_GROUP_INDEX

  let filter = function(doc, opts, next, pipeline){
    let { type, input, input_type, app } = opts

    // debug('filter', type, input, input_type, app)
    // process.exit(1)

    // let host = doc.metadata.host
    // let module = doc.metadata.path

    let host = input_type.options.id
    doc.metadata.host = input_type.options.id
    let timestamp = roundMilliseconds(Date.now())
    doc.id = doc.metadata.host+'.'+doc.metadata.path+'.'+doc.data.schema+'.'+doc.data.uri+'.'+doc.data.port
    // +'@'+timestamp
    doc.metadata.timestamp = timestamp
    doc.metadata.id = doc.id
    doc.metadata.type = 'periodical'

    debug('filter %o', doc)
    // process.exit(1)

    sanitize_filter(
      doc,
      opts,
      pipeline.output.bind(pipeline),
      pipeline
    )

  }


  return filter
}
