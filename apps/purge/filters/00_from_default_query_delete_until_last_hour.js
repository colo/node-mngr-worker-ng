'use strict'

let debug = require('debug')('Server:Apps:Purge:Filters:from_default_query_delete_until_last_hour');
let debug_internals = require('debug')('Server:Apps:Purge:Filters:from_default_query_delete_until_last_hour:Internals');

const roundMilliseconds = function(timestamp){
  let d = new Date(timestamp)
  d.setMilliseconds(0)

  return d.getTime()
}

const roundSeconds = function(timestamp){
  timestamp = roundMilliseconds(timestamp)
  let d = new Date(timestamp)
  d.setSeconds(0)

  return d.getTime()
}

const roundMinutes = function(timestamp){
  timestamp = roundSeconds(timestamp)
  let d = new Date(timestamp)
  d.setMinutes(0)

  return d.getTime()
}

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
// const HOUR = 10 * MINUTE//devel
const DAY = HOUR * 24
module.exports = function(payload){
  let {input, output, opts } = payload
  let table = input.clients.options.table
  // debug('1st filter', table)
  // process.exit(1)

  // let type = input.type
  // let full_range = input.full_range
  // let table = input.table
  // full_range = full_range || false
  // let {input, output, type } = payload
  // let table = input.table

  let filter = function(doc, opts, next, pipeline){
    debug('1st filter %o', doc, table)
    // process.exit(1)

    if(doc && doc.id === 'periodical' && doc.data && doc.metadata && doc.metadata.from === table){

      pipeline.fireEvent('onSuspend')

      // let end = roundSeconds(Date.now() - HOUR)
      let end = roundMilliseconds(Date.now() - HOUR)
      // let end = Date.now() - HOUR

      debug('1st filter END RANGE %s', new Date(end))
      // process.exit(1)

      Array.each(doc.data[0], function(group, index){
        debug('1st filter GROUP %o', group)
        // process.exit(1)

        // Array.each(group, function(data){
        // pipeline.get_input_by_id('input.periodical').fireEvent('onRange', {
        pipeline.fireEvent('onRange', {
          id: "delete",
          Range: "posix "+group.metadata.timestamp+"-"+end+"/*",
          query: {
            "q": [
              "id",
              // "data",
              // // {"metadata": ["host", "tag", "timestamp", "path", "range"]}
              // "metadata"
            ],
            "transformation": [
              // {
              // "orderBy": {"index": "r.desc(asc)"}
              // },
              // {
              //   "slice": [0, 1]
              // }


            ],
            "filter": [
              // "r.row('metadata')('path').eq('"+group.path+"')",
              // "r.row('metadata')('host').eq('"+host+"')",
              "r.row('metadata')('type').eq('"+group.metadata.type+"')"
            ]
          },
          params: {},
        })
        // })

        // Array.each(group.hosts, function(host){
        //   pipeline.get_input_by_id('input.periodical').fireEvent('onRange', {
        //     id: "range",
        //     Range: "posix 0-"+end+"/*",
        //     query: {
        //       "q": [
        //         "id",
        //         // "data",
        //         // // {"metadata": ["host", "tag", "timestamp", "path", "range"]}
        //         // "metadata"
        //       ],
        //       "transformation": [
        //         // {
        //         // "orderBy": {"index": "r.desc(asc)"}
        //         // },
        //         // {
        //         //   "slice": [0, 1]
        //         // }
        //
        //
        //       ],
        //       "filter": [
        //         "r.row('metadata')('path').eq('"+group.path+"')",
        //         "r.row('metadata')('host').eq('"+host+"')",
        //         "r.row('metadata')('type').eq('"+type+"')"
        //       ]
        //     },
        //     params: {},
        //   })
        // })

      })
      // }
      // else if(doc && doc.metadata && doc.metadata.from === 'logs_historical'){
      //
      // }

      // debug('filter %o %o %o', doc, range, hosts, paths)
      // next({id: 'munin.default', hosts, paths, range}, opts, next, pipeline)
    }
    else{
      // process.exit(1)
      if(doc && doc.id === 'delete'){
        pipeline.fireEvent('onResume')
      }

      next(doc, opts, next, pipeline)
    }

    // throw new Error('fix mngr-ui-admin Range - there are problems with filter/trasnformation/etc params')
    /**
    * get_input_by_id
    {

      "q": [
        "data",
        {"metadata": ["host", "tag", "timestamp"]}
      ],
      "transformation": [
        {
        "orderBy": {"index": "r.desc(timestamp)"}
        },
        {
          "slice": [0, 1]
        }


      ],
      "filter": "r.row('metadata')('path').eq('munin.entropy')"

    }
    *
    **/
    // input_type.fireEvent('onOnce', {
    //   query: {register: true}
    // })
  }

  return filter
}
