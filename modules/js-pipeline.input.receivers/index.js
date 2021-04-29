'use strict'

const path = require('path')
			// ,Push = require('../index')

const debug = require('debug')('js-pipeline:Receivers'),
			debug_internals = require('debug')('js-pipeline:Receivers:Internals'),
			debug_events = require('debug')('js-pipeline:Receivers:Events')

module.exports = new Class({
	Implements: [Options, Events],

	ON_SUSPEND: 'onSuspend',
	ON_RESUME: 'onResume',
	ON_EXIT: 'onExit',

	ON_ONCE: 'onOnce',
	ON_RANGE: 'onRange',


	ON_CLIENT_CONNECT: 'onClientConnect',
	ON_CLIENT_CONNECT_ERROR: 'onClientConnectError',

	ON_DOC: 'onDoc',
	ON_DOC_ERROR: 'onDocError',

	ON_ONCE_DOC: 'onOnceDoc',
	ON_ONCE_DOC_ERROR: 'onOnceDocError',

	ON_DOC_SAVED: 'onDocSaved',

	ON_PERIODICAL_DOC: 'onPeriodicalDoc',
	ON_PERIODICAL_DOC_ERROR: 'onPeriodicalDocError',

	ON_RANGE_DOC: 'onRangeDoc',
	ON_RANGE_DOC_ERROR: 'onRangeDocError',

	// ON_ONCE_REQUESTS_UPDATED: 'onOnceRequestsUpdated',
	// ON_RANGE_REQUESTS_UPDATED: 'onRangeRequestsUpdated',
	// ON_PERIODICAL_REQUESTS_UPDATED: 'onPeriodicalRequestsUpdated',


	receivers: [],
	//connected receivers
	conn_receivers: {},

	//receivers that couldn't connect
	err_receivers: {},

	err_receiver_count: [],

	//db: null,
	options: {

		id: null,
		conn: undefined,
		receivers: [],

		connect_retry_count: 10,
		connect_retry_periodical: 5000,

		//requests: {
			//periodical: 1000,
		//},

		//docs:{
			//buffer_size: 10,
			//timer: 5, //seconds
		//}

	},

	initialize: function(options){

		// if(typeof(options.conn) != 'array' && options.conn instanceof Array && !Array.isArray(options.conn)){
		// 	let receiver = options.conn;
		// 	options.conn = [];
		// 	options.conn.receiver(receiver);
		// }
		this.receivers = (options.conn !== undefined) ? options.conn : options.receivers
		if(!Array.isArray(this.receivers))
			this.receivers = [this.receivers]

		this.setOptions(options)

		this.addEvent(this.ON_EXIT, this.exit.bind(this));


	},
	exit: function(){
		debug('exit');
		if(process && process.exit && typeof process.exit == 'function')//process.exit works only nodejs, not in browsers
			process.exit(0);
	},
	connect: function(){
		// let receivers = this.receivers;
		debug('connect', this.receivers)
		// process.exit(1)

			Array.each(this.receivers, function(receiver, index){

				if(!this.conn_receivers || !this.conn_receivers[index]){//to prevent multiples ON_ERROR trying to reconnect

					if(!this.err_receiver_count[index])
						this.err_receiver_count[index] = 0;

					// let push = null;

					//checks if the 'receiver app' already failed, else create a new one
					if(this.err_receivers && this.err_receivers[index]){

						debug('Connect->err_receivers %d', index);

						receiver = this.err_receivers[index];
					}
					else{

						debug('Connect->create receiver %o', receiver);
						// process.exit(1)
						// receiver = new Push(receiver);

						receiver['ON_DOC'] = this.ON_DOC;
						receiver['ON_DOC_ERROR'] = this.ON_DOC_ERROR;

						receiver['ON_ONCE'] = this.ON_ONCE;
						receiver['ON_RANGE'] = this.ON_RANGE;

						receiver['ON_PERIODICAL_DOC'] = this.ON_PERIODICAL_DOC;
						receiver['ON_PERIODICAL_DOC_ERROR'] = this.ON_PERIODICAL_DOC_ERROR;

						receiver['ON_ONCE_DOC'] = this.ON_ONCE_DOC;
						receiver['ON_ONCE_DOC_ERROR'] = this.ON_ONCE_DOC_ERROR;

						receiver['ON_DOC_SAVED'] = this.ON_DOC_SAVED;

						receiver['ON_RANGE_DOC'] = this.ON_RANGE_DOC;
						receiver['ON_RANGE_DOC_ERROR'] = this.ON_RANGE_DOC_ERROR;

						receiver.addEvent(receiver.ON_DOC, (doc, options) => this.fireEvent(this.ON_DOC, [doc, options]))

 						receiver.addEvent(receiver.ON_DOC_ERROR, (doc, options) => this.fireEvent(this.ON_DOC_ERROR, [doc, options]))

						receiver.addEvent(receiver.ON_ONCE_DOC, (doc, options) => this.fireEvent(this.ON_ONCE_DOC, [doc, options]))

						receiver.addEvent(receiver.ON_ONCE_DOC_ERROR, (doc, options) => this.fireEvent(this.ON_ONCE_DOC_ERROR, [doc, options]))

						receiver.addEvent(receiver.ON_PERIODICAL_DOC, (doc, options) => this.fireEvent(this.ON_PERIODICAL_DOC, [doc, options]));

						receiver.addEvent(receiver.ON_PERIODICAL_DOC_ERROR, (doc, options) => this.fireEvent(this.ON_PERIODICAL_DOC_ERROR, [doc, options]))

						receiver.addEvent(receiver.ON_RANGE_DOC, (doc, options) => this.fireEvent(this.ON_RANGE_DOC, [doc, options]))

						receiver.addEvent(receiver.ON_RANGE_DOC_ERROR, (doc, options) => this.fireEvent(this.ON_RANGE_DOC_ERROR, [doc, options]))


						receiver.addEvent(receiver.ON_USE, function(mount, app){
							debug_events('receiver.ON_USE %o', app);

							app['ON_DOC'] = this.ON_DOC;
							app['ON_DOC_ERROR'] = this.ON_DOC_ERROR;

							app['ON_ONCE_DOC'] = this.ON_ONCE_DOC;
							app['ON_ONCE_DOC_ERROR'] = this.ON_ONCE_DOC_ERROR;

							app['ON_PERIODICAL_DOC'] = this.ON_PERIODICAL_DOC;
							app['ON_PERIODICAL_DOC_ERROR'] = this.ON_PERIODICAL_DOC_ERROR;

							app['ON_RANGE_DOC'] = this.ON_RANGE_DOC;
							app['ON_RANGE_DOC_ERROR'] = this.ON_RANGE_DOC_ERROR;


							app.addEvent(this.ON_DOC, doc => this.fireEvent(this.ON_DOC, [doc, {type: 'receiver', input_type: receiver, app: app}]))

							app.addEvent(this.ON_DOC_ERROR, err => this.fireEvent(this.ON_DOC_ERROR, [err, {type: 'receiver', input_type: receiver, app: app}]))

							app.addEvent(this.ON_ONCE_DOC, doc => this.fireEvent(this.ON_ONCE_DOC, [doc, {type: 'once', input_type: receiver, app: app}]))

							app.addEvent(this.ON_PERIODICAL_DOC, doc => this.fireEvent(this.ON_PERIODICAL_DOC, [doc, {type: 'periodical', input_type: receiver, app: app}]))

							app.addEvent(this.ON_RANGE_DOC, doc => this.fireEvent(this.ON_RANGE_DOC, [doc, {type: 'range', input_type: receiver, app: app}]))

						}.bind(this));

						// receiver.addEvent(receiver.ON_CONNECT, function(result){
						// 	debug_events('receiver.ON_CONNECT %o', result);
						//
						// 	this._register_receiver(index, receiver);
						// }.bind(this));
						receiver.addEvent(receiver.ON_CONNECT, result => this._register_receiver(index))

						// receiver.addEvent(receiver.ON_CONNECT_ERROR, function(err){
						// 	debug_events('receiver.ON_CONNECT_ERROR %o', err);
						// 	this._register_error(index, receiver);
						// }.bind(this));
						receiver.addEvent(receiver.ON_CONNECT_ERROR, err => this._register_error(index, receiver))

					}

					try{
						// debug_events('receiver CONNECTED %o', receiver.connected, this.err_receiver_count[index], this.options.connect_retry_count)
						// process.exit(1)
						if(receiver.connected === true){
							// process.exit(1)
							this._register_receiver(index)
						}
						if(this.options.connect_retry_count < 0 || this.err_receiver_count[index] < this.options.connect_retry_count){
							//receiver.os.api.get({uri: 'hostname'});
							// process.exit(1)
							receiver.connect();
						}

					}
					catch(e){
						//////console.log(e);

					}


				}//
			}.bind(this));

		//}.bind(this));
	},
	//dispatch_range: function(req, app, app_req, type){
		//if(req.get('Range')){

			////let type = req.get('Range').trim().split(' ', 1)[0];
			////let type = req.get('Range').trim().split(' ', 1)[0];

			//let words = /(\w+)(?:\s)(\w+)(?:-)(\w+)/g;
			//let match = words.exec(req.get('Range').trim());
			//let type = match[1].toLowerCase();

			////console.log('--HEADER---');
			////console.log(match);

			//let start, end;

			//switch (type){
				//case 'date':
				//case 'utc':
					//let date = /^(\d\d\d\d)?(\d\d)?(\d\d)?(\d\d)?(\d\d)?(\d\d)?(\d\d)?$/;
					//start = date.exec(match[2]);
					//end = date.exec(match[3]);

					////console.log(start);
					////console.log(end);

					//start.forEach(function(value, i){
						//if(!value)
							//start[i] = 0;
					//});

					//end.forEach(function(value, i){
						//if(!value)
							//end[i] = 0;
					//});

					//if(type == 'utc'){
						//start = new Date(
							//Date.UTC(start[1], start[2], start[3], start[4], start[5], start[6], start[7])
						//).getTime();

						//end = new Date(
							//Date.UTC(end[1], end[2], end[3], end[4], end[5], end[6], end[7])
						//).getTime();
					//}
					//else{
						//start = new Date(start[1], start[2], start[3], start[4], start[5], start[6], start[7]).getTime();
						//end = new Date(end[1], end[2], end[3], end[4], end[5], end[6], end[7]).getTime();
					//}


				//break;

				//case 'posix':
				//case 'epoch':
					//start = parseInt(match[2]);
					//end = parseInt(match[3]);

				//break;

				//default:
					//throw new Error('Type ['+type+'] not implemented');

			//};


			//req['opt'] = {
				//range: {
					//type: type,
					//start: start,
					//end: end
				//},
			//};
		//}
		//else{
			//throw new Error('No Range header!');
		//}

		//debug_internals('dispatch_range %o', req['opt']);

		//return this.dispatch(req, app, app_req, type);
	//},
	//dispatch: function(req, app, app_req, type){
		//debug_internals('->dispatch %o', type);

		//let key = Object.keys(app_req)[0];
		//let value = Object.values(app_req)[0];

		//let verb = (key == 'api') ? Object.keys(value)[0] : key;
		//let data = (key == 'api') ? Object.values(value)[0] : value;
		////let original_app = app;

		//let dispatch_app = (key == 'api') ? app.api : app;

		//let req_receiver = (req == null) ? null : {
			//agent: req.headers['user-agent'],
			//ip: req.ip
		//};

		////req_receiver = req_receiver || null;
		////console.log(req_receiver);
		////console.log(data);

		//app.options.requests.current = {};
		//app.options.requests.current.type = type;
		//app.options.requests.current.receiver = req_receiver;

		//if(data instanceof Function){//this way we may run PRE-FUNCTION for complex requests
			//debug_internals('dispatch->function %o', [req, dispatch_app[verb]]);

			//data.attempt([req, dispatch_app[verb]], app);
		//}
		//else{
			//debug_internals('dispatch %o', dispatch_app[verb]);
			//dispatch_app[verb](data);
		//}

	//},
	// _register_receiver: function(index, receiver){
	_register_receiver: function(index){
		let receiver = this.receivers[index]

		//this.conn_receivers[receiver_id+'.'+hostname] = receiver;
		if(!this.conn_receivers)
			this.conn_receivers = [];

		this.conn_receivers[index] = receiver;

		if(this.err_receiver_count)
			delete this.err_receiver_count[index];

		if(this.err_receivers)
			delete this.err_receivers[index];

		debug_internals('_register_receiver %o', receiver);

		this.fireEvent(this.ON_CLIENT_CONNECT, receiver);

	},
	_register_error: function(index, receiver){
		debug_internals('_register_error %o', index);
		// process.exit(1)
		//console.log('DISCONNECTED hostname');
		//console.log(index);
		//console.log(this.receivers);

		this.err_receiver_count[index] += 1;

		let err_receiver = {};
		err_receiver = [];
		err_receiver[index] = this.receivers[index];
		//err_receiver.receiver(receiver);

		if(!this.err_receivers)
			this.err_receivers = [];

		if(this.err_receivers[index] != receiver){
			this.err_receivers[index] = receiver;

			let reconnect_timer = null;

			let reconnect = function(err_receiver){
				//console.log('RE CONNECTING');
				//console.log(err_receiver);

				reconnect_timer = this.connect.periodical(this.options.connect_retry_periodical, this, err_receiver);
			}.bind(this);


			let reconnect_stop = function(){clearInterval(reconnect_timer)}.bind(this);

			process.on('exit', (code) => reconnect_stop);

			//this.addEvent(this.ON_SUSPEND, reconnect_stop);

			//receiver.addEvent(receiver.ON_CONNECT_ERROR, stop);

			//this.addEvent(this.ON_RESUME, reconnect_start);

			receiver.addEvent(receiver.ON_CONNECT, reconnect_stop);

			reconnect(err_receiver);
		}

		if(this.conn_receivers)
			delete this.conn_receivers[index];

		debug_internals('_register_error %o', receiver);


		this.fireEvent(this.ON_CLIENT_CONNECT_ERROR, err_receiver);
	},


});
