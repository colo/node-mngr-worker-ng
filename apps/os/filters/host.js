var debug = require('debug')('filter:host');
var debug_internals = require('debug')('filter:host:Internals');

// let conf = require('../etc/cpus')()

module.exports = function(doc, opts, next, pipeline){
	let { type, input, input_type, app } = opts

	let val = doc.data
	let host = doc.host
	// let host = input_type.options.id
	let module = doc.module

	debug('host %o', val)
	// process.exit(1)

	delete val.loadavg
	delete val.uptime
	delete val.freemem
	if(val.networkInterfaces){
		Object.each(val.networkInterfaces, function(data, iface){
			delete data.recived
			delete data.transmited
		})
	}
	if(val.cpus){
		Array.each(val.cpus, function(data, core){
			delete data.times
		})
	}

	// debug('HOST %s', JSON.stringify(val), opts)
	// process.exit(1)
	next(
		{
			data: val,
			metadata: {
				host: host,
				path: 'host',
				tag: ['host', 'os'].combine(Object.keys(val))
			}
		},
		opts,
		next,
		pipeline
	)


}
