'use strict'

const debug = require('debug')('Server:Apps:Educativa:Size:Filter:Parse'),
      debug_internals = require('debug')('Server:Apps:Educativa:Size:Filter:Parse:Internals')


const fs = require('fs');

const path = require('path')

const PREFIX =  process.env.NODE_ENV === 'production'
      ? path.resolve(process.cwd(), './')
      : path.resolve(process.cwd(), './devel/')


const csv = require('csvtojson')

module.exports = function(payload){
  let {input, output, opts } = payload
  // let type = input.type
  // let full_range = input.full_range
  // let table = input.clients.options.table
  // full_range = full_range || false
  // let group_index = (opts && opts.group_index !== undefined) ? opts.group_index : DEFAULT_GROUP_INDEX

  let filter = function(doc, opts, next, pipeline){
    debug('parse', doc, opts.input.options.id)
    // process.exit(1)

    try  {

      csv({
        delimiter: '|',
        noheader: true,
        headers: ['type','hostname', 'user', 'install', 'size', 'timestamp']
      })
      .fromString(doc.value)
      .then((json)=>{
        Array.each(json, function(result){
					debug('result', result)
			    // process.exit(1)

          result.size *=1024 //du -k reports on 1k units => *1024 trasnform to bytes
					result.timestamp *=1
          let new_doc = {
            id: result.type+'.'+result.hostname+'.'+result.user+'.'+result.install+'@'+result.timestamp,
            data: result.size,
            metadata: {
              host: result.hostname,
              // path: 'logs.nginx.'+doc.domain,
              path: 'educativa.size.'+result.type,
              domain: result.user+'/'+result.install,
              timestamp: result.timestamp,
              _timestamp: Date.now(), //doc creation
              // tag: [doc.log_type, doc.input],
              type: 'periodical'
            }
          }

            debug('new doc', new_doc)
            next(new_doc)
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
