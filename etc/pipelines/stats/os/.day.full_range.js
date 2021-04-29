const path = require('path')

const conn = require('../../../default.conn')()

const day_stats_filters_full_range = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_once_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_day_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]


let pipelines = [


  /**
  * Logs Stats (full_range)
  **/


  require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    {
      input: Object.merge(
        Object.clone(conn), {
          index: 'path',
          table: 'os_historical',
          type: 'day',
          full_range: true,
          requests: {
            req : {
              'id': 'once',
              // query: {
              //   distinct: {
              //     domains: "('metadata')('domain')"
              //   }
              // }
            }
          }

        }
      ),
      output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
      filters: Array.clone(day_stats_filters_full_range),

    }
  ),


]


module.exports = pipelines
