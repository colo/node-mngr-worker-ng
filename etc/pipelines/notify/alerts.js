const path = require('path')

const conn = require('../../default.conn')()
const telegram = require('../../telegram')

let pipelines = [


    require(path.join(process.cwd(), 'apps/notify/alerts/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'educativa'}),
        output: telegram,
        // filters: Array.clone(periodical_stats_filters_full_range),
        // type: 'minute'
      }
    ),

]


module.exports = pipelines
