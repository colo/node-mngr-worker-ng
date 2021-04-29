'use strict'

const path = require('path');

var debug = require('debug')('filter:fix');
var debug_internals = require('debug')('filter:fix:Internals');

module.exports = {
 input: [
	{
		poll: {
			id: "input.os.stats.cradle",
			conn: [
				{
					scheme: 'cradle',
					//host:'192.168.0.180',
					host:'127.0.0.1',
					port: 5984 ,
					db: 'stats',
					module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/cradle')),
				}
			],
			
		},
	}
 ],
 filters: [
		//require('./snippets/filter.os.minute.statistics.template'),
		//require('./snippets/filter.fix.template'),
		function(docs, opts, next){//fix + metadata
			let { type, input, input_type, app } = opts;
			
			debug_internals('TO _fix_doc opts %o', opts);
			debug_internals('TO _fix_doc next %o', next);
			
			//let doc_id = input.options.id +'.'+input_type.options.id +'.'+app.options.id;
			//let timestamp = Date.now();
			
			//if(!doc.data){
				//var new_doc = { data: null };
				//if(Array.isArray(doc)){
					//new_doc.data = doc;
				//}
				//else{
					//new_doc.data = (doc instanceof Object) ? Object.clone(doc) : doc;
				//}
				
				//doc = new_doc;
			//}
			
			//debug_internals('TO _fix_doc %o', doc);
			
			//if(!doc._id){
				//doc._id = doc_id +'@'+timestamp;
			//}
			
			//let metadata = {
				//id: input.options.id,
				//host: input_type.options.id,
				//path: app.options.id,
				//type: type,
				//timestamp: timestamp
			//};
			
			//if(doc['metadata']){
				//doc['metadata'] = Object.merge(metadata, doc['metadata']);
			//}
			//else{
				//doc['metadata'] = metadata;
			//}
			
			
			
			//return doc;
			//next(doc);
			
			//let new_docs = [];
			Array.each(docs, function(row, index){
				if(!row.doc)
					debug_internals('WTF?? %o', row);
						
				if(row.doc.metadata.type == 'periodical')
					row.doc.metadata.type = 'minute';
					
				debug_internals('fix + metadata filter %o', row.doc);
				//new_docs.push(row.doc);
				
				//if(index == docs.length - 1)
					//next([new_docs]);
				
				next(row.doc);
				
			});
		}

	],
	output: [
		require('./snippets/output.stdout.template'),
		{
			cradle: {
				id: "output.os.stats.cradle",
				conn: [
					{
						//host: '127.0.0.1',
						host: '192.168.0.180',
						port: 5984,
						db: 'stats',
						opts: {
							cache: true,
							raw: false,
							forceSave: true,
						}
					},
				],
				module: require(path.join(process.cwd(), 'lib/pipeline/output/cradle')),
				buffer:{
					size: 0,
					expire:0
				}
			}
		}
	]
}
