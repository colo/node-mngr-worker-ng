var debug = require('debug')('filter:unzip');
var debug_internals = require('debug')('filter:unzip:Internals');

var parse = require('zipson').parse;

module.exports = function(doc, opts, next, pipeline){


  if(doc.data && doc.data != null){
    // debug_internals('pre-zip data %o', doc.data);

    let data = parse(doc.data)
    delete doc.data
    doc.data = data

    debug_internals('post-unzip data %o', doc.data);
  }



	//return doc;
	next(doc, opts, next, pipeline);
}
