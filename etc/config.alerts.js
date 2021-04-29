'use strict'

const path = require('path');

var cron = require('node-cron');

module.exports = {
 input: [
   //do a file input?
	{
		poll: {
			id: "input.config.alerts.cradle",
			conn: [
				{
					scheme: 'cradle',
					host:'elk',
					//host:'127.0.0.1',
					port: 5984 ,
					db: 'dashboard',
					module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/cradle')),
					load: ['apps/config/alerts']
				}
			],
			requests: {
				/**
				 * runnign at 20 secs intervals
				 * needs 3 runs to start analyzing from last historical (or from begining)
				 * it takes 60 secs to complete, so it makes historical each minute
				 * @use node-cron to start on 0,20,40....or it would start messuring on a random timestamp
				 * */
				// periodical: function(dispatch){
				// 	return cron.schedule('19,39,59 * * * * *', dispatch);//every 20 secs
				// }
				//periodical: 20000,
				//periodical: 2000,//test
			},

		},
	}
 ],
 filters: [
		// require('./snippets/filter.os.historical.minute.template'),
		function(doc, opts, next){
      console.log('config alerts filter', doc, opts, next)
      if(opts.type == 'once' &&  Object.getLength(doc) == 0)//empty configs.alerts, create default ones
        next(
          {
            data: {},
            // metadata: {
            //   path: 'config.alerts',
            //   timestamp: Date.now()
            // }
          },
          opts,
          next
        )

    },
    require('./snippets/filter.sanitize.template'),
	],
	output: [
    function(doc){
      console.log('config alerts output',JSON.decode(doc))
    },
		//require('./snippets/output.stdout.template'),
		// {
		// 	cradle: {
		// 		id: "output.config.alerts.cradle",
		// 		conn: [
		// 			{
		// 				//host: '127.0.0.1',
		// 				host: 'elk',
		// 				port: 5984,
		// 				db: 'dashboard',
		// 				opts: {
		// 					cache: true,
		// 					raw: false,
		// 					forceSave: true,
		// 				}
		// 			},
		// 		],
		// 		module: require(path.join(process.cwd(), 'lib/pipeline/output/cradle')),
		// 		buffer:{
		// 			size: 0,
		// 			expire:0
		// 		}
		// 	}
		// }
	]
}
