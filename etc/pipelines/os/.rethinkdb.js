const path = require('path')

const conn = require('../../default.conn')()

let pipelines = [

    /**
    * OS Rethinkdb stats
    **/
    require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {
          db: 'rethinkdb',
          table: 'stats',
          // format: 'tabular'
          full_range: false,
          // id: 'all',//optionally declare a server id for stats path (use full when quering multiple servers)
          requests: {
            req : {
              'id': 'changes',
              query: {
                "filter": [
              		// "r.row('id').eq(['server', '6e7e0e21-0468-4946-accd-315aa92aa70b'])"
                  // "r.row('id').eq(['server', 'a8235e33-42cb-41ab-ab30-683640810d86'])"
                  "this.r.row.hasFields('db').not().and(this.r.row('server').eq('elk'))"

              	],
              }
            }
          }
        }),
        output: Object.merge(Object.clone(conn), {table: 'os'}),
        filters: Array.clone([require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_rethinkdb'))]),
      }
    ),
]

module.exports = pipelines
