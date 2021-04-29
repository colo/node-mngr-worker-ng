const path = require('path')

const conn = require('../../../../default.conn')()
// const conn = require('../../../../servers/carina.conn')()

const stats_filters = [
  require(path.join(process.cwd(), 'apps/stats/filters/00_from_periodical_get_range')),
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stats/filters/02_from_ranges_create_stats'))
]


let pipelines = [


  /**
  * Logs Stats (periodical)
  **/
  // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
  require(path.join(process.cwd(), 'apps/stats/pipeline'))(
    {
      input: Object.merge(
        Object.clone(conn), {
          module: require(path.join(process.cwd(), 'apps/stats/input/rethinkdb')),
          table: 'logs_historical',
          type: 'day',
          // full_range: false,
          // requests: {
          range: {},
          once: {
            'id': 'once_range',
            // Range: 1585969203107 +'-'+ Date.now()+ '/*',
            query: {
              // 'index': 'host',
              'index': 'path',
              'q': [
                // { 'metadata': ['host', 'path'] } // 'path' ain't needed for first view (categories)
                { 'metadata': ['path'] } // 'path' ain't needed for first view (categories)
              ],
              'aggregation': 'distinct',
              'filter': [
                // "this.r.row('metadata').hasFields('host')"
                "this.r.row('metadata').hasFields('tag').and(this.r.row('metadata')('tag').contains('host').and( this.r.row('metadata')('path').eq('logs.educativa')))"
              ]
            },
            opt: {
              range:{
                start: 1585969203107,
                end: 1586055600972
              }
            }
          }
          // }
        }
      ),
      opts: {
        group_index: 'metadata.host'
      },
      output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
      filters: Array.clone(stats_filters),

    }

  ),

]


module.exports = pipelines
