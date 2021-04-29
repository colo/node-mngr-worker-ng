var debug = require('debug')('filter:zipson');
var debug_internals = require('debug')('filter:zipson:Internals');

var stringify = require('zipson').stringify;

module.exports = function(doc, opts, next, pipeline){


  if(doc.data && doc.data != null){
    // debug_internals('pre-zip data %o', doc.data);

    let data = stringify(doc.data)
    delete doc.data
    doc.data = data

    debug_internals('post-zip data %o', doc.data);
  }



	//return doc;
	next(doc, opts, next, pipeline);
}
