var debug = require('debug')('filter:lzstring:decompress');
var debug_internals = require('debug')('filter:lzstring:decompress:Internals');

var decompress = require('lz-string').decompress;

module.exports = function(doc, opts, next, pipeline){


  if(doc.data && doc.data != null){
    // debug_internals('pre-zip data %o', doc.data);

    let data = decompress(doc.data)
    delete doc.data
    doc.data = data

    debug_internals('post-decompress data %o', doc.data);
  }



	//return doc;
	next(doc, opts, next, pipeline);
}
