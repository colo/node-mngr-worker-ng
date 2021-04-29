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

    // if(!doc.modules && Object.getLength(doc.data) > 0){//discard modules doc
    if(doc.data && doc.config && Object.getLength(doc.data) > 0 && Object.getLength(doc.config) > 0){//discard modules doc
      debug('filter %o', doc)
      // process.exit(1)

      let new_doc = {data: {}, config: {}, metadata: {}}
      new_doc.data = doc.data
      new_doc.config = doc.config
      let path = 'munin.'+doc.id.replace(/\_/, '.', 'g')
      let timestamp = roundMilliseconds(Date.now())
      new_doc.id = doc.host+'.'+path+'@'+timestamp
      new_doc.metadata = {
        id: new_doc.id,
        path: path,
        type: 'periodical',
        host: doc.host,
        timestamp: timestamp,
        tag: ['munin', doc.id.replace(/\_/, '.', 'g')]
      }


      // opts.input_type.options.id = doc.host
      // opts.app.options.id = 'munin.'+doc.id.replace(/\_/, '.', 'g')

      // debug_internals('filter %o %o', new_doc, input_type.options.requests.periodical.length)

      // pipeline.outputs[0].options.buffer.size = input_type.options.requests.periodical.length
      // let redis = /redis/
      // if(redis.test(path)){
      //   debug('redis doc %o', new_doc)
      //   process.exit(1)
      // }

      sanitize_filter(
        new_doc,
        opts,
        pipeline.output.bind(pipeline),
        pipeline
      )
    }



  }


  return filter
}
