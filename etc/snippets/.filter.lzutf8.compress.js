var debug = require('debug')('filter:lzutf8:compress');
var debug_internals = require('debug')('filter:lzutf8:compress:Internals');

var compress = require('lzutf8').compress;

module.exports = function(doc, opts, next, pipeline){


  if(doc.data && doc.data != null){
    // debug_internals('pre-zip data %o', doc.data);

    let data = compress(JSON.encode(doc.data), {outputEncoding: "Base64"});
    delete doc.data
    doc.data = data

    debug_internals('post-compress data %o', doc.data);
  }



	//return doc;
	next(doc, opts, next, pipeline);
}
