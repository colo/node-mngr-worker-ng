const path = require('path')

const conn = require('../../default.conn')()

let pipelines = [

    /**
    * OS Rethinkdb stats (periodical)
    **/
    require(path.join(process.cwd(), 'apps/stats/pipeline'))(
      {
        input: Object.merge(
          Object.clone(conn), {
            module: require(path.join(process.cwd(), 'apps/stats/input/rethinkdb')),
            db: 'rethinkdb',
            table: 'stats',
            // format: 'tabular'
            // full_range: true,
            type: 'second',
            // id: 'all',//optionally declare a server id for stats path (use full when quering multiple servers)
            once: {
                'id': 'periodical',
                query: {
                  index: false,
                  register: 'periodical',
                  q: [
                    "id",
                    "query_engine",
                    "server"
                  ],
                  "filter": [
                		// "r.row('id').eq(['server', '6e7e0e21-0468-4946-accd-315aa92aa70b'])"
                    // "r.row('id').eq(['server', 'a8235e33-42cb-41ab-ab30-683640810d86'])"
                    "this.r.row.hasFields('db').not().and(this.r.row('server').eq('elk'))"

                	],
                }
            }
          }
        ),
        output: Object.merge(Object.clone(conn), {table: 'os'}),
        filters: Array.clone([require(path.join(process.cwd(), 'apps/stats/filters/02_from_buffer_rethinkdb'))]),

      }

    ),
]

module.exports = pipelines
