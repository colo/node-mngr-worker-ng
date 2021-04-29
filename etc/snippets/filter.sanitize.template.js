var debug = require('debug')('filter:sanitize');
var debug_internals = require('debug')('filter:sanitize:Internals');

module.exports = function(doc, opts, next, pipeline){//sanitize + metadata
	let { type, input, input_type, app } = opts;

	debug_internals('TO _sanitize_doc opts %o', doc);

	let doc_id = input.options.id +'.'+input_type.options.id +'.'+app.options.id;
	if(doc['metadata'] && doc['metadata'].path)
		doc_id += '.'+doc['metadata'].path

	if(doc['metadata'] && doc['metadata'].range)
		doc_id += '.'+doc['metadata'].range.start +'-'+ doc['metadata'].range.end

	let timestamp = Date.now();

	if(!doc.data){
		var new_doc = { data: null };
		if(Array.isArray(doc)){
			new_doc.data = doc;
		}
		else{
			new_doc.data = (doc instanceof Object) ? Object.clone(doc) : doc;
		}

		doc = new_doc;
	}

	//debug_internals('TO _sanitize_doc %o', doc);

	if(!doc._id){
		doc._id = doc_id +'@'+timestamp;
	}

	let metadata = {
		id: input.options.id,
		host: input_type.options.id,
		path: app.options.id,
		type: type,
		timestamp: timestamp
	};

	if(doc['metadata']){
		doc['metadata'] = Object.merge(metadata, doc['metadata']);
	}
	else{
		doc['metadata'] = metadata;
	}

	debug_internals('sanitize + metadata filter %o', doc);
	debug_internals('sanitize + metadata filter->next %o', next);

	//return doc;
	next(doc, opts, next, pipeline);
}
