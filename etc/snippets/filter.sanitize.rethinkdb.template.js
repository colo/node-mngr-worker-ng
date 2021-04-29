var debug = require('debug')('filter:sanitize');
var debug_internals = require('debug')('filter:sanitize:Internals');

module.exports = function(doc, opts, next, pipeline){//sanitize + metadata
	let { type, input, input_type, app } = opts;

	debug_internals('TO _sanitize_doc opts %o', input_type.options.id);

	let doc_id = []
	if(input && input.options && input.options.id) doc_id.push(input.options.id)
	if(input_type && input_type.options && input_type.options.id) doc_id.push(input_type.options.id)
	if(app && app.options && app.options.id) doc_id.push(app.options.id)
	doc_id = (doc_id.length > 0) ? doc_id.join('.') : ''

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

	if(!doc.id){
		doc.id = doc_id +'@'+timestamp;
	}

	let metadata = {
		id: doc.id,
		host: (input_type && input_type.options && input_type.options.id ) ? input_type.options.id : '',
		path: (app && app.options && app.options.id) ? app.options.id : '',
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

	/**
	* removes any null || undefined
	**/
	doc = JSON.parse(JSON.stringify(doc))

	next(doc, opts, next, pipeline);
}
