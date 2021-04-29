'use strict'

let debug = require('debug')('Server:Apps:Web-Apis:Filters:00_from_ipv4_get_abuseipdb_check');
let debug_internals = require('debug')('Server:Apps:Web-Apis:Filters:00_from_ipv4_get_abuseipdb_check:Internals');

const { fork } = require('child_process'),
          path = require('path')

module.exports = function(payload){
  let {input, output, opts } = payload
  // let type = input.type
  // let full_range = input.full_range
  // let table = input.clients.options.table
  // full_range = full_range || false
  // let group_index = (opts && opts.group_index !== undefined) ? opts.group_index : DEFAULT_GROUP_INDEX

  let filter = function(doc, opts, next, pipeline){
    debug('3rd filter %O', doc)
    // process.exit(1)
    let fork_filter = fork(process.cwd()+'/libs/fork_filter', [
      path.join(process.cwd(), '/apps/web-apis/filters/abuseipdb'),
    ])

    fork_filter.on('message', function(msg){
      let data = msg.result
      let doc = msg.doc
      // debug('result %o %o', msg)
      // process.exit(1)
      // delete forks[host]

      next(data, opts, next, pipeline)
      // try{
      //   callback()
      // }
      // catch(e){
      //   debug('callback err', e)
      // }

    })

    fork_filter.send({
      params: doc,
      // doc:  Object.clone(real_data)
    })

  }


  return filter
}
