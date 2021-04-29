var debug = require('debug')('filter:zlib:compress');
var debug_internals = require('debug')('filter:zlib:compress:Internals');

// var stringify = require('zipson').stringify;
var zlib = require('zlib')
var buffer = require('buffer')

module.exports = function(doc, opts, next, pipeline){

  let compress_doc = function(doc, cb){
    if(doc.data && doc.data != null){
      let data = ''
      zlib.deflate(JSON.encode(doc.data), (err, buffer) => {

        if (!err) {
          data = buffer.toString('latin1')
          // console.log('buffer', buffer.toString('base64'))

          delete doc.data
          doc.data = data
          debug_internals('post-zip data %o', data);

          cb(doc)
        } else {
          // handle error
          console.log('ERR', err)
        }
      })

    }
    else{
      cb(doc)
    }

    // return doc
  }

  if( typeof(doc) == 'array' || doc instanceof Array || Array.isArray(doc) ){
    let docs = []
    Array.each(doc, function(d, index){
      d = compress_doc(d, function(compressed){
        docs.push(compressed)
        if(index == doc.length - 1)
          next(docs, opts, next, pipeline);
      })
    })
  }
  else{
    doc = compress_doc(doc, function(compressed){
      next(compressed, opts, next, pipeline);
    })
  }

  // next(doc, opts, next, pipeline);

  // if(doc.data && doc.data != null){
  //   // debug_internals('pre-zip data %o', doc.data);
  //   let data = ''
  //   zlib.deflate(JSON.encode(doc.data), (err, buffer) => {
  //     if (!err) {
  //       data = buffer.toString('latin1')
  //       // console.log('buffer', buffer.toString('base64'))
  //
  //       delete doc.data
  //       doc.data = data
  //       debug_internals('post-zip data %o', data);
  //
  //       next(doc, opts, next, pipeline);
  //     } else {
  //       // handle error
  //       console.log('ERR', err)
  //     }
  //   });
  //
  //
  // }
  // else{
  //   next(doc, opts, next, pipeline);
  // }




}
