const conn = require('../../../default.conn')()
const http_receiver = require('../../../http.receiver')

const path = require('path')

const filters = [
  require(path.join(process.cwd(), 'apps/http-receiver/filters/00_from_array_to_doc')),
  require(path.join(process.cwd(), 'apps/educativa/size/filters/csv')),
	require(path.join(process.cwd(), 'apps/educativa/size/filters/emails'))
]

const JSPipelineInputHttpServer = require(path.join(process.cwd(), 'apps/http-receiver/input'))
// const JSPipelineInputSTDIN = require(path.join(process.cwd(), 'apps/dir.size/input/stdin'))

const JSPipelineOutput = require('../../../../../modules/js-pipeline.output.rethinkdb')
// const JSPipelineOutput = require(path.join(process.cwd(), 'apps/dir.size/web/output/rethinkdb.geospatial'))

const cron = require('node-cron')

const port = 11100

const debug = require('debug')('pipelines:receive:educativa:size.emails:output')

let pipelines = [


  // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
  require(path.join(process.cwd(), 'apps/http-receiver/pipeline'))(
    {
      input: {
        id: "input.educativa.size.emails.http-receiver",

        receivers: [
          new JSPipelineInputHttpServer(Object.merge(Object.clone(http_receiver), {port: port}))
        ],

        // type: 'second', // second || minute || hour || day || once
        // requests: {
        //   // periodical: 5000,
        //   periodical: function(dispatch){
        //     // return cron.schedule('14,29,44,59 * * * * *', dispatch);//every 15 secs
        //     return cron.schedule('* * * * * *', dispatch);//every 20 secs
        //   },
        // },
        // suspended: false,

      },

      filters: Array.clone(filters),

      output: [
				// function(doc){
				// 	debug('OUTPUT', doc)
				// }
        new JSPipelineOutput(Object.merge({
          id: "output.rethinkdb.educativa.size.emails",

          buffer:{
            // size: 1,
            // expire: 60001,
            size: 0,//-1 =will add until expire | 0 = no buffer | N > 0 = limit buffer no more than N
            // // expire: 60000, //miliseconds until saving
            // // periodical: 10000 //how often will check if buffer timestamp has expire
            // expire: 1000, //miliseconds until saving
            // periodical: 500 //how often will check if buffer timestamp has expire
          },

          table: 'educativa'
        },
        Object.clone(conn))),
      ],

      // opts: {
        /**
        * Nginx
        * schema: '$remote_addr - $remote_user [$time_local] '
        *     + '"$request" $status $body_bytes_sent "$http_referer" '
        *    + '"$http_user_agent" "$http_x_forwarded_for"'
        **/

        /**
        * Apache2
        **/
        // schema: '$remote_addr - $remote_user [$time_local] '
        //      + '"$request" $status $body_bytes_sent "$http_referer" '
        //     + '"$http_user_agent"'
      // },


      // opts: {
      //   group_index: 'metadata.host'
      // },
    }

  ),

]

module.exports = pipelines
