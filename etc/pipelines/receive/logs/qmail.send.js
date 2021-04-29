const path = require('path')

const conn = require('../../../default.conn')()
const http_receiver = require('../../../http.receiver')

const logs_remote_filters = [
  require(path.join(process.cwd(), 'apps/http-receiver/filters/00_from_array_to_doc')),
  require(path.join(process.cwd(), 'apps/logs/qmail/send/filters/parse')),
]




let pipelines = [

]

/**
* multiple connections
**/
const PORTS = [
  11090
]

Array.each(PORTS, function(port){
  pipelines.push(
    require(path.join(process.cwd(), 'apps/http-receiver/pipeline'))({
      input: Object.merge(Object.clone(http_receiver), {port: port}),
      output: [{
    		rethinkdb: {
    			id: "output.logs.rethinkdb",
    			conn: [
    				Object.merge(
              Object.clone(conn),
              {table: 'logs'}
            ),
    			],
    			module: require('js-pipeline.output.rethinkdb'),
          // module: require(path.join(process.cwd(), 'apps/logs/web/output/rethinkdb.geospatial')),
          buffer:{
    				size: -1, //-1
    				// expire:0
            // size: 1000,
            // expire: 999,
            expire: 1000,
            periodical: 500,
    			}
    		}
    	}],
      filters: Array.clone(logs_remote_filters),
      // opts: {
      //   schema: '$remote_addr - $remote_user [$time_local] '
      //       + '"$request" $status $body_bytes_sent "$http_referer" '
      //       + '"$http_user_agent" "$http_x_forwarded_for"'
      // }
    }),
  )
})
module.exports = pipelines
