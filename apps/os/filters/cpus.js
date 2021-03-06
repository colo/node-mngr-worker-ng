var debug = require('debug')('filter:os-cpus');
var debug_internals = require('debug')('filter:os-cpus:Internals');

let conf = require('../etc/cpus')()

// let io = undefined
// let cpus_io_by_host = { }

module.exports = function(doc, opts, next, pipeline){
	let { type, input, input_type, app } = opts

	let val = doc.data
	let host = doc.host
	// let host = input_type.options.id
	let module = doc.module

	debug('cpus %o', val, host, module)
	// process.exit(1)

	// debug('val %o', val, app.options.id)


	if(
		val !== null
	){

		// let cpus_merged = {}

		// if(module === 'os'){

			let cpus_merged = {}
			Array.each(val, function(_doc, index){

				if(_doc.times){


					Object.each(_doc.times, function(value, prop){
						_doc.times[prop] = value * 1

						if(!cpus_merged[prop]) cpus_merged[prop] = 0
						cpus_merged[prop] +=  _doc.times[prop]
					})

				}

				if(conf.per_core === true){
					// let core_total = 0
					// Object.each(_doc.times, function(value, prop){
					// 	core_total += value
					// })

					_doc.times.cores = 1
					// _doc.times.io = (_doc.times.cores * 10000) - core_total
					next(
						{data: _doc.times, metadata: {host: host, path: module+'.cpus.'+index, tag: ['os', 'cpus'].combine(Object.keys(_doc.times))}},
						opts,
						next,
						pipeline
					)
				}


				/**
				* @todo - move to "info" docs
				**/
				// if(_doc.model && _doc.speed){
				// }
			})

			if(conf.merged === true){
				// let merged_total = 0
				// Object.each(cpus_merged, function(value, prop){
				// 	merged_total += value
				// })

				cpus_merged.cores = val.length
				// cpus_merged.io = (cpus_merged.cores * 10000) - merged_total

				next(
					{data: cpus_merged, metadata: {host: host, path: module+'.cpus', tag: ['os', 'cpus'].combine(Object.keys(cpus_merged))}},
					opts,
					next,
					pipeline
				)
			}
		// }
		// else{
		// 	// if(!cpus_io_by_host[host]) cpus_io_by_host[host] = 0
		//
		// 	cpus_io_by_host[host] = 0
		//
		// 	Object.each(val, function(_doc, device){
		// 		// debug('device %o', _doc, device)
		//
		// 		Object.each(_doc.stats, function(value, prop){
		// 			_doc.stats[prop] = value * 1
		// 		})
		// 		debug('device stats %o', _doc.stats, device)
		//
		// 		cpus_io_by_host[host] += _doc.stats.read_ticks
		// 		cpus_io_by_host[host] += _doc.stats.write_ticks
		// 		cpus_io_by_host[host] += _doc.stats.time_in_queue
		// 		// cpus_io_by_host[host] += _doc.stats.discard_ticks
		//
		// 	})
		//
		// 	debug('cpus_io_by_host %o', host, cpus_io_by_host[host])
		//
		// }
		//
		// if(conf.merged === true && Object.getLength(cpus_merged) > 0 && cpus_io_by_host[host] !== undefined){
		// 	cpus_merged.io = cpus_io_by_host[host]
		// 	next({data: cpus_merged, metadata: {host: host, path: module+'.cpus', tag: ['os', 'cpus'].combine(Object.keys(cpus_merged))}})
		// 	cpus_io_by_host[host] = undefined
		// }

		/**
		* @todo - move to "info" docs
		**/
		// 	next({data: {size: _doc.size, blockSize: _doc.blockSize}, metadata: {host: host, path: module+'.'+device+'.info', tag: ['os', 'blockdevices', device, 'blockSize', 'size']}})

	}//if


}
