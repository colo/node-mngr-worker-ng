var debug = require('debug')('filter:zlib:decompress');
var debug_internals = require('debug')('filter:zlib:decompress:Internals');

// var stringify = require('zipson').stringify;
var zlib = require('zlib')
var buffer = require('buffer')

module.exports = function(doc, opts, next, pipeline){

  let decompress_doc = function(d, cb){
    if(d.data && d.data != null){

      let data = ''
      const buffer = Buffer.from(d.data, 'latin1');
      zlib.unzip(buffer, (err, buffer) => {
        if (!err) {
          // console.log(buffer.toString());
          data = JSON.decode(buffer.toString())
          delete d.data
          d.data = data

          debug_internals('post-decompress data %o', data)

          cb(d)

        } else {
          console.log('ERR', err)
        }
      })

    }
    else if(d.doc && d.doc.data){
      decompress_doc(d.doc, function(doc){
        delete d.doc
        d.doc = doc
        cb(d)
      })
    }
    else{
      // debug_internals('NO doc.data %o', doc)
      cb(d)
    }

    // return doc
  }

  if( typeof(doc) == 'array' || doc instanceof Array || Array.isArray(doc) ){

    let docs = []
    Array.each(doc, function(d, index){

      decompress_doc(d, function(decompressed){
        // debug_internals('pre-decompress data %o', decompressed)
        docs.push(decompressed)
        if(index == doc.length - 1)
          next(docs, opts, next, pipeline);
      })
    })
  }
  else{
    decompress_doc(doc, function(decompressed){
      next(decompressed, opts, next, pipeline);
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
