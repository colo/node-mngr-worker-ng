var debug = require('debug')('filter:sanitize.munin');
var debug_internals = require('debug')('filter:sanitize.munin:Internals');

module.exports = function(doc, opts, next, pipeline){//sanitize.munin + metadata
	let { type, input, input_type, app } = opts;

	debug_internals('TO _sanitize.munin_doc opts %o', opts);

	let doc_id = input.options.id +'.'+input_type.options.id;
	doc_id += (doc.id) ? '.'+doc.id : '';

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

	//debug_internals('TO _sanitize.munin_doc %o', doc);

	if(!doc._id){
		doc._id = doc_id +'@'+timestamp;
	}

	let metadata = {
		id: input.options.id,
		host: input_type.options.id,
		version: input_type.options.version,
		path: (doc.id) ? 'munin.'+doc.id : 'munin',
		type: type,
		timestamp: timestamp
	};

	if(doc['metadata']){
		doc['metadata'] = Object.merge(doc['metadata'], metadata);
	}
	else{
		doc['metadata'] = metadata;
	}

	debug_internals('sanitize.munin + metadata filter %o', doc);
	debug_internals('sanitize.munin + metadata filter->next %o', next);

	//return doc;
	next(doc, opts, next, pipeline);
}
