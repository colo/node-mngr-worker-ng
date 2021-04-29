const path = require('path')

const conn = require('../../../default.conn')()
const historical = require('../../../default.conn')()
/**
* purge
**/
const periodical_purge_filters = [
  //require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_hour')),
    require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_15_mins')),
]

const minute_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_day')),
]

const hour_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_week')),
]

const day_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_month')),
]

let pipelines = [

    /**
    * OS Purge - day
    **/
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(
          Object.clone(historical), {
            table: 'os_historical',
            type: 'day',
            full_range: true,
            requests: {
              req : {
                query: {
                  'q': [
                    {'metadata': ['timestamp', 'type']},
                  ],
                  'transformation': [
                    {
                      'orderBy': { 'index': 'r.asc(timestamp)' }
                    },
                    { 'limit': 1 }
                  ],
                  'filter': [
                    "r.row('metadata')('type').eq('day')"
                  ]
                },
                'id': 'periodical',
              }
            }
          }
        ),
        output: Object.merge(Object.clone(historical), {table: 'os_historical'}),
        filters: Array.clone(day_purge_filters),

      }

    ),


]


module.exports = pipelines
