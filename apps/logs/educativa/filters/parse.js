'use strict'

const debug = require('debug')('Server:Apps:Logs:Educativa:Filter:Parse'),
      debug_internals = require('debug')('Server:Apps:Logs:Educativa:Filter:Parse:Internals')


const moment = require ('moment')

const fs = require('fs');

const path = require('path')

const PREFIX =  process.env.NODE_ENV === 'production'
      ? path.resolve(process.cwd(), './')
      : path.resolve(process.cwd(), './devel/')


const csv = require('csvtojson')
// const schema = 'cgi|start|end|user|course|type|action'

module.exports = function(payload){
  let {input, output, opts } = payload
  // let type = input.type
  // let full_range = input.full_range
  // let table = input.clients.options.table
  // full_range = full_range || false
  // let group_index = (opts && opts.group_index !== undefined) ? opts.group_index : DEFAULT_GROUP_INDEX

  let filter = function(doc, opts, next, pipeline){
    // debug('parse', doc)
    // process.exit(1)
    /**
    * to test different type of tags
    **/
    // tag_type = (tag_type === 'nginx') ? 'apache' : 'nginx'
    // debug_internals('filters to apply...', doc, opts.input.options.id )


    try  {
      // const parser = new Parser(pipeline.schema)
      // if(parser === undefined) parser = new Parser(pipeline.options.schema)

      // doc.log = schema + '\n' + doc.log
      // debug('parse %s', doc.log)
      // process.exit(1)

      csv({
        delimiter: '|',
        noheader: true,
        headers: ['cgi', 'start', 'end', 'user', 'course', 'type', 'action']
      })
      .fromString(doc.log)
      .then((json)=>{
        Array.each(json, function(result){
          result.log = doc.log

          result.start = result.start.replace('.', '') * 1
          result.end = result.end.replace('.', '') * 1
          result.duration = result.end - result.start

          if(result.duration >= 0){//negative duartion is a known erro, discard

            result.type = (result.type === 1) ? 'upload' : 'download'

            result.course *=1
            if(isNaN(result.course)) result.course = undefined

            // debug('parse %o', result)
            // process.exit(1)

            let doc_ts = (result.end) ? (result.end / 1000).round() : Date.now()

            let ts = Date.now()
            ts += (doc.counter) ? '-'+doc.counter : ''

            Object.each(result, function(value, key){
              if(value === null || value === undefined)
                delete result[key]
            })

            let new_doc = {
              id: doc.hostname+'.'+opts.input.options.id+'.'+doc.log_type+'.'+doc.domain+'@'+ts,
              data: result,
              metadata: {
                host: doc.hostname,
                // path: 'logs.nginx.'+doc.domain,
                path: 'logs.'+doc.log_type,
                domain: doc.domain,
                timestamp: doc_ts,
                _timestamp: Date.now(), //doc creation
                // tag: [doc.log_type, 'web', 'protocol', 'url', 'uri', 'schema', doc.input],
                tag: [doc.log_type, doc.input],
                type: 'periodical'
              }
            }

            // debug('parsed line', new_doc)
            next(new_doc)

          }

        })

      })


    }
    catch(e){
      debug_internals('error parsing line', e)
      // process.exit(1)
    }
    // debug('PREFIX', PREFIX)
  }


  return filter
}
