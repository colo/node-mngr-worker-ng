const path = require('path')

// const conn = require('../../../default.conn')()
const conn = require('../../../servers/carina.conn')()

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
          table: 'os_historical',
          type: 'hour',
          full_range: false,
          // requests: {
          range: {},
          periodical: {
            'id': 'periodical',
            query: {
              'index': 'host',
              'q': [
                // { 'metadata': ['host', 'path'] } // 'path' ain't needed for first view (categories)
                // { 'metadata': ['path'] } // 'path' ain't needed for first view (categories)
                { 'metadata': ['host'] } // 'path' ain't needed for first view (categories)
              ],
              'aggregation': 'distinct',
              'filter': [
                "this.r.row('metadata')('path').ne('os')"
              ]
            }
          }
          // }
        }
      ),
      opts: {
        group_index: 'metadata.host'
      },
      output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
      filters: Array.clone(stats_filters),

    }

  ),

]


module.exports = pipelines


// const hour_stats_filters = [
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_periodical_build_lasts')),
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_hour_historical_ranges')),
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
// ]
//
//
// let pipelines = [
//
//
//   /**
//   * Logs Stats (periodical)
//   **/
//   require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
//     {
//       input: Object.merge(
//         Object.clone(conn), {
//           table: 'os_historical',
//           type: 'hour',
//           full_range: false,
//           requests: {
//             req : {
//               // query: {
//               //   index: 'path',
//               // },
//               'id': 'periodical',
//             }
//           }
//         }
//       ),
//       output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
//       filters: Array.clone(hour_stats_filters),
//
//     }
//
//   ),
//
// ]
//
//
// module.exports = pipelines
