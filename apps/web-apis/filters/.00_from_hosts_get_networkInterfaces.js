'use strict'

let debug = require('debug')('Server:Apps:Web-Apis:Filters:00_from_hosts_get_networkInterfaces');
let debug_internals = require('debug')('Server:Apps:Web-Apis:Filters:00_from_hosts_get_networkInterfaces:Internals');

let hosts_blacklist = undefined
let hosts_whitelist = /^(?!.*(carina)).*$/

let __white_black_lists_filter = function(whitelist, blacklist, str){
  let filtered = false
  if(!blacklist && !whitelist){
    filtered = true
  }
  else if(blacklist && !blacklist.test(str)){
    filtered = true
  }
  else if(blacklist && blacklist.test(str) && (whitelist && whitelist.test(str))){
    filtered = true
  }
  else if(!blacklist && (whitelist && whitelist.test(str))){
    filtered = true
  }

  return filtered
}

module.exports = function(payload){
  let {input, output, opts } = payload
  // let type = input.type
  // let full_range = input.full_range
  // let table = input.clients.options.table
  // full_range = full_range || false
  // let group_index = (opts && opts.group_index !== undefined) ? opts.group_index : DEFAULT_GROUP_INDEX

  let filter = function(doc, opts, next, pipeline){
    // let { type, input, input_type, app } = opts
    // debug('1st filter %o', JSON.stringify(doc))
    // process.exit(1)

    if(doc && doc.id === 'range' && doc.data){

      let filter

      Array.each(doc.data, function(group, index){
        // debug('1st filter %O', group)
        let host = group.metadata.host
        if(host !== undefined && __white_black_lists_filter(hosts_whitelist, hosts_blacklist, host) === true){
          debug('1st filter %s', host)

          if (filter === undefined) {
            filter = "this.r.row('metadata')('host').eq('"+host+"')"
          }
          else{
            filter += ".or(this.r.row('metadata')('host').eq('"+host+"')"
          }
          // pipeline.fireEvent('onOnce', {
          //   id: "default",
          //   query: {
          //     index: false,
          //     "q": [
          //       {"data": "networkInterfaces"},
          //       { "metadata": "host" }
          //     ],
          //     "filter": [
          //       "r.row('metadata')('host').eq('"+host+"')",
          //     ]
          //   },
          //   params: {},
          // })
        }

      })

      if(doc.data.length > 1){
        Array.each(doc.data, function(group, index){
          let host = group.metadata.host
          if(index < doc.data.length -1 && index !== 0 && host !== undefined && __white_black_lists_filter(hosts_whitelist, hosts_blacklist, host) === true){
            filter += ")"
          }

        })
      }

      debug('filter', filter)
      // process.exit(1)

      pipeline.fireEvent('onOnce', {
        id: "default",
        query: {
          index: false,
          "q": [
            {"data": "networkInterfaces"},
            { "metadata": "host" }
          ],
          "filter": filter
        },
        params: {},
      })




    }
    else{
      next(doc, opts, next, pipeline)
    }
  }


  return filter
}
