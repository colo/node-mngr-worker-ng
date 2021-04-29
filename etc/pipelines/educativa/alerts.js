const path = require('path')

const conn = require('../../default.conn')()

let pipelines = [

    require(path.join(process.cwd(), 'apps/educativa/alerts/vhosts/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'educativa'}),
        output: Object.merge(Object.clone(conn), {table: 'educativa'}),
        // filters: Array.clone(periodical_stats_filters_full_range),
        // type: 'minute'
      }
    ),

]


module.exports = pipelines
