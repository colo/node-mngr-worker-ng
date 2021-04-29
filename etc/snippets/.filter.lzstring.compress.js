var debug = require('debug')('filter:lzstring:compress');
var debug_internals = require('debug')('filter:lzstring:compress:Internals');

var compress = require('lz-string').compress;

module.exports = function(doc, opts, next, pipeline){


  if(doc.data && doc.data != null){
    // debug_internals('pre-zip data %o', doc.data);

    let data = compress(JSON.encode(doc.data))
    delete doc.data
    doc.data = data

    debug_internals('post-compress data %o', doc.data);
  }



	//return doc;
	next(doc, opts, next, pipeline);
}
