'use strict'

let debug = require('debug')('Server:Apps:Vhosts:Filters:01_output');
let debug_internals = require('debug')('Server:Apps:Vhosts:Filters:01_output:Internals');

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

    // debug('2nd filter %s', JSON.stringify(doc), opts)
    debug('2nd filter', doc)
    // process.exit(1)

    let timestamp = roundMilliseconds(Date.now())

    if(type === 'once'){
      // debug('1st filter %s', JSON.stringify(doc), opts)
      // process.exit(1)
      doc.id = doc.metadata.host+'.'+doc.metadata.path
    }
    else{
      doc.id = doc.metadata.host+'.'+doc.metadata.path+'@'+timestamp
    }

    // let timestamp = roundMilliseconds(Date.now())
    // doc.id = doc.metadata.host+'.'+doc.metadata.path+'@'+timestamp
    doc.metadata.timestamp = timestamp

    sanitize_filter(
      doc,
      opts,
      pipeline.output.bind(pipeline),
      pipeline
    )

  }


  return filter
}
