'use strict'

let debug = require('debug')('Server:Apps:Stat:Periodical:Filters:from_changes_build_buffer');
let debug_internals = require('debug')('Server:Apps:Stat:Periodical:Filters:from_changes_build_buffer:Internals');

// paths_blacklist = /os_procs_cmd_stats|os_procs_stats|os_networkInterfaces_stats|os_procs_uid_stats/
let paths_blacklist = /^[a-zA-Z0-9_\.]+$/
let paths_whitelist = /^os$|^os\.networkInterfaces$|^os\.blockdevices$|^os\.mounts$|^os\.procs$|^os\.procs\.uid$|^os\.procs\.cmd$|^munin|^logs/
// let paths_whitelist = /^munin/
// let paths_whitelist = /^os$|^os\.networkInterfaces$|^os\.blockdevices$|^os\.mounts$|^munin/

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

const async = require('async')

let buffer = []
let expire = undefined

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = HOUR * 24

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

const roundHours = function(timestamp){
  timestamp = roundMinutes(timestamp)
  let d = new Date(timestamp)
  d.setHours(0)

  return d.getTime()
}

const DEFAULT_GROUP_INDEX = 'metadata.host'

module.exports = function(payload){
	let {input, output, group_index } = payload
	let type = input.type || 'minute'
  let full_range = input.full_range
	full_range = full_range || false
  let table = input.clients.options.table
  group_index = (group_index !== undefined) ? group_index : DEFAULT_GROUP_INDEX

  // throw new Error('el default debe traer solo los hosts, luego traer los paths y enviar todo a este plugin')
  // process.exit(1)
  // {
  //
  //
  // 	"q": [
  // 		{"metadata": ["path"]}
  // 	],
  // "aggregation": "distinct",
  // "filter": "r.row('metadata')('host').eq('colo')"
  // }

  let interval = -1

  let filter = function(doc, opts, next, pipeline){
    debug('1st filter %o', doc, table)
    // process.exit(1)
    if(expire === undefined && type === 'inmediate'){
      expire = 0
    }
    else if(expire === undefined && type === 'second'){
      expire = roundMilliseconds(Date.now() + SECOND)
    }
    else if(expire === undefined && type === 'minute'){
      expire = roundSeconds(Date.now() + MINUTE)
    }
    else if(expire === undefined && type === 'hour'){
      expire = roundMinutes(Date.now() + HOUR)
      // expire = roundMinutes(Date.now() + MINUTE)//for testing
    }
    else if(expire === undefined){
      throw new Error("You should use a periodical range for bigger ranges than 'hour': "+type + ':'+ expire)
    }
    // else if(expire === undefined && type === 'day'){
    //   expire = roundHours(Date.now() + DAY)
    //   // expire = roundMinutes(Date.now() + MINUTE)//for testing
    // }
    // else if(expire === undefined && type === 'month'){
    //   expire = roundHours(Date.now() + DAY)
    //   // expire = roundMinutes(Date.now() + MINUTE)//for testing
    // }

    debug('expire %s %s', new Date(), new Date(expire))
    // process.exit(1)

    if(doc && doc.id === 'changes' && doc.data && doc.metadata && doc.metadata.from === table){
      // process.exit(1)
      let { type, input, input_type, app } = opts

      buffer.push(doc)

      let __next = function(){
        if( Date.now() >= expire){
          if(buffer.length > 0){
            next(Array.clone(buffer), opts, next, pipeline)
            buffer = []
          }

          expire = undefined
          clearInterval(interval)
          interval = -1
          // if(type === 'minute'){
          //   expire = roundSeconds(Date.now() + MINUTE)
          // }
          // else if(type === 'hour'){
          //   expire = roundMinutes(Date.now() + HOUR)
          // }

          // process.exit(1)
        }
      }

      if( Date.now() >= expire){
        __next()
      }
      else if(interval === -1){//if no perdiocal data comes in, use an interval (ex: logs)
        interval = setInterval(__next, 1000)
      }


    }
    // else{
    //   next(doc, opts, next, pipeline)
    // }

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
