'use strict'

const debug = require('debug')('Server:Apps:Educativa:Size:Filter:Emails'),
      debug_internals = require('debug')('Server:Apps:Educativa:Size:Filter:Emails:Internals')


// const fs = require('fs');

const path = require('path')

const PREFIX =  process.env.NODE_ENV === 'production'
      ? path.resolve(process.cwd(), './')
      : path.resolve(process.cwd(), './devel/')


// const csv = require('csvtojson')
module.exports = function(payload){
  let {input, output, opts } = payload
  // let type = input.type
  // let full_range = input.full_range
  // let table = input.clients.options.table
  // full_range = full_range || false
  // let group_index = (opts && opts.group_index !== undefined) ? opts.group_index : DEFAULT_GROUP_INDEX

  let filter = function(doc, opts, next, pipeline){
    debug('doc', doc, opts.input.options.id)

    doc.size *=1024 //du -k reports on 1k units => *1024 trasnform to bytes
		doc.timestamp *=1
    let new_doc = {
      id: doc.type+'.'+doc.hostname+'.'+doc.user+'.'+doc.install+'@'+doc.timestamp,
      data: doc.size,
      metadata: {
        host: doc.hostname,
        // path: 'logs.nginx.'+doc.domain,
        path: 'educativa.size.'+doc.type,
        domain: doc.user+'/'+doc.install,
        timestamp: doc.timestamp,
        _timestamp: Date.now(), //doc creation
        // tag: [doc.log_type, doc.input],
        type: 'periodical'
      }
    }

    debug('new doc', new_doc)
    next(new_doc)
  }


  return filter
}

// module.exports = function(payload){
//   let {input, output, opts } = payload
//   // let type = input.type
//   // let full_range = input.full_range
//   // let table = input.clients.options.table
//   // full_range = full_range || false
//   // let group_index = (opts && opts.group_index !== undefined) ? opts.group_index : DEFAULT_GROUP_INDEX
//
//   let filter = function(doc, opts, next, pipeline){
//     debug('doc', doc, opts.input.options.id)
//
//     doc.size *=1024 //du -k reports on 1k units => *1024 trasnform to bytes
// 		doc.timestamp *=1
//     let new_doc = {
//       id: doc.type+'.'+doc.hostname+'.'+doc.user+'@'+doc.timestamp,
//       data: doc.size,
//       metadata: {
//         host: doc.hostname,
//         // path: 'logs.nginx.'+doc.domain,
//         path: 'educativa.size.'+doc.type,
//         domain: doc.user,
//         timestamp: doc.timestamp,
//         _timestamp: Date.now(), //doc creation
//         // tag: [doc.log_type, doc.input],
//         type: 'periodical'
//       }
//     }
//
//       debug('new doc', new_doc)
//       next(new_doc)
//
//   }
//
//
//   return filter
// }
