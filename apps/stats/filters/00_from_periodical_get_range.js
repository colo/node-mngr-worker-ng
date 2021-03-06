'use strict'

let debug = require('debug')('Server:Apps:Stat:Periodical:Filters:from_periodical_get_range');
let debug_internals = require('debug')('Server:Apps:Stat:Periodical:Filters:from_periodical_get_range:Internals');

// paths_blacklist = /os_procs_cmd_stats|os_procs_stats|os_networkInterfaces_stats|os_procs_uid_stats/
let paths_blacklist = /^[a-zA-Z0-9_\.]+$/
let paths_whitelist = /^os|^munin|^logs/
// let paths_whitelist = undefined
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

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = HOUR * 24
const WEEK = DAY * 7

const DEFAULT_GROUP_INDEX = 'metadata.host'

module.exports = function(payload){
	let {input, output, group_index } = payload
	let type = input.type || 'minute'
  let full_range = input.full_range
	full_range = full_range || false
  let table = input.clients.options.table
  group_index = (group_index !== undefined) ? group_index : DEFAULT_GROUP_INDEX

	// debug('1st filter %o', type, full_range, table, group_index)
	// process.exit(1)

  let filter = function(doc, opts, next, pipeline){
		// debug('1st filter', doc)
		// process.exit(1)

    if(doc && ( doc.id === 'periodical.range' || doc.id === 'once.range' ) && doc.data && doc.metadata && doc.metadata.from === table){
			// debug('1st filter %o', doc)

      // // let { type, input, input_type, app } = opts
      //
      // // let hosts = []
      // // let paths = []
      // // let range = [0,0]
      // // let historical_range = [0,0]
      //
      // // if(doc && doc.data && doc.metadata && doc.metadata.from === 'logs'){
      // if(!pipeline.current) pipeline.current = {}
      // pipeline.current[doc.metadata.from] = doc
      //
      // // debug('PIPELINE %o', pipeline)
      // // let hosts = pipeline.current[doc.metadata.from].hosts //from first filter, attach hosts
      //
      // // debug('2nd filter %o', hosts)



      let start, end, while_end
      start = doc.metadata.range.start
      while_end = doc.metadata.range.end

      // if(type === 'minute'){
      //   end = roundSeconds( start + MINUTE )
      // }
      // else if(type === 'hour'){
      //   end = roundMinutes( start + HOUR)
      // }
      // else if(type === 'day'){
      //   end = roundHours( start + DAY )
      // }
      // else if(type === 'week'){
      //   end = roundHours( start + WEEK)
      // }

      if(type === 'minute'){
        // start = roundSeconds( start )
        end = start + MINUTE
      }
      else if(type === 'hour'){
        // start = roundMinutes( start )
        end = start + HOUR
      }
      else if(type === 'day'){
        // start = roundHours( start )
        end = start + DAY
      }
      else if(type === 'week'){
        // start = roundHours( start )
        end = start + WEEK
      }

      if(while_end < end)
        end = while_end

      // end = roundSeconds( end )

      debug('date from %s to %s - end %s', new Date(start), new Date(end), new Date(while_end))
			// process.exit(1)
      do{
        // let ranges = []
        let ranges = {
          id: "range",
          Range: undefined,
          query: []
        }

        debug('date from %s to %s', new Date(start), new Date(end))

        Array.each(doc.data, function(distinct_group){
          Array.each(distinct_group, function(distinct_doc){
            let path = (distinct_doc.metadata && distinct_doc.metadata.path) ? distinct_doc.metadata.path : undefined

            if(path === undefined || __white_black_lists_filter(paths_whitelist, paths_blacklist, path)){
              debug('path %s %o', path, distinct_doc, group_index.split('.')[0], group_index.split('.')[1])
              // process.exit(1)


              // let start, end
              let req = { query: { filter: [] } }
              if(doc.metadata.filter){
                if(Array.isArray(doc.metadata.filter)){
                  req.query.filter = Array.clone(doc.metadata.filter)
                }
                else{
                  req.query.filter.push(doc.metadata.filter)
                }
              }

              let first_level_group = group_index.split('.')[0]
              let second_level_group = group_index.split('.')[1]

              let data = distinct_doc[first_level_group][second_level_group]

              if(data !== undefined){
                req.query.filter.push(
                  "r.row('"+first_level_group+"')('"+second_level_group+"').eq('"+data+"')"
                )
              }


              if(distinct_doc.data && Object.getLength(distinct_doc.data) > 0){
                Object.each(distinct_doc.data, function(data, prop){
                  req.query.filter.push(
                    "r.row('data')('"+prop+"').eq('"+data+"')"
                  )
                })

              }

              if(distinct_doc.metadata && Object.getLength(distinct_doc.metadata) > 0){
                Object.each(distinct_doc.metadata, function(data, prop){
                  req.query.filter.push(
                    "r.row('metadata')('"+prop+"').eq('"+data+"')"
                  )
                })

              }

              if(type === 'minute'){
                req.query.filter.push("r.row('metadata')('type').eq('periodical')")
                // end = roundSeconds(end)
                // start  = roundSeconds(start)
              }
              else if(type === 'hour'){
                req.query.filter.push("r.row('metadata')('type').eq('minute')")
                // start  = roundMinutes(start)
              }
              else if(type === 'day'){
                req.query.filter.push("r.row('metadata')('type').eq('hour')")
                // start  = roundHours(start)
              }
              else if(type === 'week'){
                req.query.filter.push("r.row('metadata')('type').eq('day')")
                // start  = roundHours(start)
              }

              // process.exit(1)

              ranges.Range = "posix "+start+"-"+end+"/*"
              ranges.query.push(Object.merge(
              // ranges.push(Object.merge(
                  req,
                  {
                    id: "range",
                    Range: "posix "+start+"-"+end+"/*",
                    query: {
                      index: false,
                      "q": [
                        "id",
                        "data",
                        "metadata"
                      ],
                      "transformation": [
                        {
                        "orderBy": {"index": "r.desc(timestamp)"}
                        },
                      ],

                    },
                    params: {},


                  }
                )
              )
              // debug('path %s %o %o', path, distinct_doc, ranges.query)
              // process.exit(1)


              // })
            }

          })




        })

        debug('RANGES %o count %d', ranges, ranges.query.length)
        // process.exit(1)

        /**
        * seems to work better , end up with less impact on rethinkdb engine
        **/
        // Array.each(ranges, function(range){
        //   pipeline.get_input_by_id('input.periodical').fireEvent('onRange', range)
        // }.bind(this))

        /**
        * input/rethinkdb takes req.query [] and execute'em sequancially
        **/
        // pipeline.get_input_by_id('input.periodical').fireEvent('onRange', ranges)
				pipeline.fireEvent('onRange', ranges)

        // async.eachLimit(
        //   ranges,
        //   1,
        //   function(range, callback){
        //     // pipeline.get_input_by_id('input.periodical').fireEvent('onRange', range)
        //     // callback()
        //     let wrapped = async.timeout(function(range){
        //       // sleep(1001).then( () => {
        //       //   // process.exit(1)
        //       //   debug('RANGE', range)
        //       // })
        //
        //
        //       pipeline.get_input_by_id('input.periodical').fireEvent('onRange', range)
        //       // process.exit(1)
        //       // callback()
        //     }, 100)
        //
        //     // try{
        //     wrapped(range, function(err, data) {
        //       if(err){
        //         // pipeline.get_input_by_id('input.periodical').fireEvent('onRange', range)
        //         callback()
        //       }
        //     })
        //     // }
        //     // catch(e){
        //     //   callback()
        //     // }
        //   }
        // )
        // // }
        // // else if(doc && doc.metadata && doc.metadata.from === 'logs_historical'){
        // //
        // // }
        //
        // // debug('filter %o %o %o', doc, range, hosts, paths)
        // // next({id: 'munin.default', hosts, paths, range}, opts, next, pipeline)

        start = end
        // if(type === 'minute'){
        //   end = roundSeconds( start + MINUTE )
        // }
        // else if(type === 'hour'){
        //   end = roundMinutes( start + HOUR)
        // }
        // else if(type === 'day'){
        //   end = roundHours( start + DAY )
        // }
        // else if(type === 'week'){
        //   end = roundHours( start + WEEK)
        // }
        if(type === 'minute'){
          end = start + MINUTE
        }
        else if(type === 'hour'){
          end = start + HOUR
        }
        else if(type === 'day'){
          end = start + DAY
        }
        else if(type === 'week'){
          end = start + WEEK
        }

        // end = roundSeconds( end )
      } while(end <= while_end)

      // process.exit(1)




    }
    else{
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
