'use strict'

const debug = require('debug')('Server:Apps:HttpReceiver:Filter:from_array_to_doc'),
      debug_internals = require('debug')('Server:Apps:HttpReceiver:Filter:from_array_to_doc:Internals')

module.exports = function(payload){
  let {input, output, opts } = payload
  // let type = input.type
  // let full_range = input.full_range
  // let table = input.clients.options.table
  // full_range = full_range || false
  // let group_index = (opts && opts.group_index !== undefined) ? opts.group_index : DEFAULT_GROUP_INDEX

  let filter = function(doc, opts, next, pipeline){
    debug('DOC', doc)
    // process.exit(1)
    if(Array.isArray(doc)){
      Array.each(doc, function(_doc){
        next(_doc, opts, next, pipeline)
      })
    }
    else{
      next(doc, opts, next, pipeline)
    }
  }


  return filter
  }

// module.exports = function(doc, opts, next, pipeline){
//   debug('DOC', doc)
//   // process.exit(1)
//   if(Array.isArray(doc)){
//     Array.each(doc, function(_doc){
//       next(_doc, opts, next, pipeline)
//     })
//   }
//   else{
//     next(doc, opts, next, pipeline)
//   }
//
// }
