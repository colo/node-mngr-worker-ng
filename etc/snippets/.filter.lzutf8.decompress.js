var debug = require('debug')('filter:lzutf8:decompress');
var debug_internals = require('debug')('filter:lzutf8:decompress:Internals');

var decompress = require('lzutf8').decompress;

module.exports = function(doc, opts, next, pipeline){


  if(doc.data && doc.data != null){
    // debug_internals('pre-zip data %o', doc.data);

    let data = decompress(doc.data, {inputEncoding: "Base64"});
    delete doc.data
    doc.data = data

    debug_internals('post-decompress data %o', doc.data);
  }



	//return doc;
	next(doc, opts, next, pipeline);
}
