const path = require('path')

const conn = require('./default.conn')()
const redis = require('./default.redis')
const bbb_conn = require('./bbb.conn.js')()
const frontail = require('./default.frontail')
const http_os = require('./http.os')
const munin = require('./munin')
const telegram = require('./telegram')
const avoid_notify = require('./avoid_notify')
const http_ui = require('./http.ui')

const periodical_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat/filters/00_from_default_query_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat/filters/02_from_ranges_create_stats'))
]

const hour_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat/filters/00_from_default_query_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat/filters/01_from_lasts_get_hour_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat/filters/02_from_ranges_create_stats'))
]

const periodical_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_hour')),
]

const minute_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_day')),
]

module.exports = [
    //require('./local/munin.js'),

    //require(path.join(process.cwd(), 'apps/bbb/pipeline'))(bbb_conn),
    require(path.join(process.cwd(), 'apps/ui/pipeline'))(http_ui),


    require(path.join(process.cwd(), 'apps/vhosts/pipeline'))(http_os, conn),

    require(path.join(process.cwd(), 'apps/educativa/checks/vhosts/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'vhosts'}),
        output: Object.merge(Object.clone(conn), {table: 'educativa'}),
        // filters: Array.clone(periodical_stats_filters),
        // type: 'minute'
      }
    ),

    require(path.join(process.cwd(), 'apps/educativa/alerts/vhosts/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'educativa'}),
        output: Object.merge(Object.clone(conn), {table: 'educativa'}),
        // filters: Array.clone(periodical_stats_filters),
        // type: 'minute'
      }
    ),

    require(path.join(process.cwd(), 'apps/educativa/purge/all/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'educativa'}),
        output: Object.merge(Object.clone(conn), {table: 'educativa'}),
        filters: Array.clone([
          require(path.join(process.cwd(), 'apps/educativa/purge/filters/00_from_default_query_delete_until_last_hour')),
        ]),
        type: 'check'
      }
    ),

    require(path.join(process.cwd(), 'apps/notify/alerts/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'educativa'}),
        output: telegram,
        avoid_notify: avoid_notify.educativa
        // filters: Array.clone(periodical_stats_filters),
        // type: 'minute'
      }
    ),



    require(path.join(process.cwd(), 'apps/os/pipeline'))(http_os, conn),

    // require(path.join(process.cwd(), 'apps/logs/nginx/pipeline'))(frontail, SITE_URL, conn),
    require(path.join(process.cwd(), 'apps/logs/nginx/pipeline'))(
      path.join(process.cwd(), 'file_path'),
      SITE_URL,
      conn
    ),

    require(path.join(process.cwd(), 'apps/munin/pipeline'))(munin, conn),

    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'os'}),
        output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        filters: Array.clone(periodical_stats_filters),
        type: 'minute'
      }
    ),


    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'logs'}),
        output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
        filters: Array.clone(periodical_stats_filters),
        type: 'minute',
        full_range: true
      }
    ),

    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'munin'}),
        output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
        filters: Array.clone(periodical_stats_filters),
        type: 'minute'
      }
    ),

    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        filters: Array.clone(hour_stats_filters),
        type: 'hour'
      }
    ),

    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
        output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
        filters: Array.clone(hour_stats_filters),
        type: 'hour'
      }
    ),

    require(path.join(process.cwd(), 'apps/stat/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
        output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
        filters: Array.clone(hour_stats_filters),
        type: 'hour',
        full_range: true
      }
    ),

    /**
    * Purge - periodicals
    **/
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'os'}),
        output: Object.merge(Object.clone(conn), {table: 'os'}),
        filters: Array.clone(periodical_purge_filters),
        type: 'periodical'
      }
    ),
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'munin'}),
        output: Object.merge(Object.clone(conn), {table: 'munin'}),
        filters: Array.clone(periodical_purge_filters),
        type: 'periodical'
      }
    ),
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'logs'}),
        output: Object.merge(Object.clone(conn), {table: 'logs'}),
        filters: Array.clone(periodical_purge_filters),
        type: 'periodical'
      }
    ),

    /**
    * Purge - minute
    **/

    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        output: Object.merge(Object.clone(conn), {table: 'os_historical'}),
        filters: Array.clone(minute_purge_filters),
        type: 'minute'
      }
    ),
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
        output: Object.merge(Object.clone(conn), {table: 'logs_historical'}),
        filters: Array.clone(minute_purge_filters),
        type: 'minute'
      }
    ),
    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
      {
        input: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
        output: Object.merge(Object.clone(conn), {table: 'munin_historical'}),
        filters: Array.clone(minute_purge_filters),
        type: 'minute'
      }
    ),


    /**
    require(path.join(process.cwd(), 'apps/ui/pipeline'))(conn),

    require(path.join(process.cwd(), 'apps/historical/minute/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/historical/hour/pipeline'))(conn),

    require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/purge/historical/pipeline'))(conn),
    require(path.join(process.cwd(), 'apps/purge/ui/pipeline'))(conn, redis),
    **/

    // require(path.join(process.cwd(), 'apps/os/alerts/pipeline')),
]
