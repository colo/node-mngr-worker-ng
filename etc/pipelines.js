const path = require('path')

const conn = require('./default.conn')()
const redis = require('./default.redis')
const bbb_conn = require('./bbb.conn.js')()
const frontail = require('./default.frontail')
const http_os = require('./http.os')
const munin = require('./munin')
const telegram = require('./telegram')
const http_ui = require('./http.ui')

/**
* data format
**/
// const periodical_data_format_filters_changes = [
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
//   // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_data_format'))
// ]

/**
* ML tests
**/
// const periodical_training_filters_carrot = [
//   // require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
//   // require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_periodical_build_lasts')),
//   // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_hour_historical_ranges')),
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_train-carrot'))
// ]
//
// const periodical_training_filters_changes = [
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
//   require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_train-written_docs-os_stats'))
// ]


/**
* stat - changes
**/
/**
const periodical_stats_filters_changes = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_changes_build_buffer')),
  // require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_buffer_create_stats'))
]
**/

/**
* stat
**/
/**
const periodical_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_periodical_build_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]
const hour_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_periodical_build_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_hour_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]
const day_stats_filters = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_periodical_build_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_day_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]
**/
/**
* stat - full range
**/
/**
const periodical_stats_filters_full_range = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_once_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_minute_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]

const hour_stats_filters_full_range = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_once_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_hour_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]

const day_stats_filters_full_range = [
  require(path.join(process.cwd(), 'apps/stat-changes/filters/00_from_once_get_lasts')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/01_from_lasts_get_day_historical_ranges')),
  require(path.join(process.cwd(), 'apps/stat-changes/filters/02_from_ranges_create_stats'))
]
**/
/**
* purge
**/
/**
const periodical_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_hour')),
]

const minute_purge_filters = [
  require(path.join(process.cwd(), 'apps/purge/filters/00_from_default_query_delete_until_last_day')),
]
**/
let pipelines = [


    // require(path.join(process.cwd(), 'apps/notify/alerts/pipeline'))(
    //   {
    //     input: Object.merge(Object.clone(conn), {table: 'educativa'}),
    //     output: telegram,
    //     // filters: Array.clone(periodical_stats_filters_full_range),
    //     // type: 'minute'
    //   }
    // ),



    // require(path.join(process.cwd(), 'apps/ui/pipeline'))(http_ui),


    // require(path.join(process.cwd(), 'apps/ui/pipeline'))(conn),

    // require(path.join(process.cwd(), 'apps/os/alerts/pipeline')),

    /**
    * BrainJS
    **/
    // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    //   {
    //     input: Object.merge(
    //       Object.clone(conn),
    //       {
    //         table: 'os',
    //         type: 'minute',
    //         full_range: false,
    //         requests: {
    //           req : {
    //             'id': 'changes',
    //             'index': false,
    //             'filter': [
    //               { 'metadata': { 'host': 'elk' } },
    //               "this.r.row('metadata')('path').eq('os.cpus')" +
    //               ".or(this.r.row('metadata')('path').eq('os.blockdevices.vda3.time'))" +
    //               ".or(this.r.row('metadata')('path').eq('os.blockdevices.vda3.sectors'))" +
    //               ".or(this.r.row('metadata')('path').eq('os.rethinkdb.server.written_docs'))" +
    //               ".or(this.r.row('metadata')('path').eq('os.rethinkdb.server.read_docs'))"
    //             ]
    //           }
    //         }
    //       }
    //     ),
    //     output: Object.merge(Object.clone(conn), {table: 'ml'}),
    //     filters: Array.clone(periodical_training_filters_changes),
    //
    //
    //   }//
    // ),

    /**
    * Carrot
    **/
    // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
    //   {
    //     input: Object.merge(
    //       Object.clone(conn),
    //       {
    //         table: 'os',
    //         type: 'hour',
    //         full_range: false,
    //         requests: {
    //           req : {
    //             'id': 'periodical',
    //             'index': false,
    //             query: {
    //               'q': [
    //                 'data',
    //                 { 'metadata': ['path', 'timestamp', 'host'] }
    //               ],
    //               'transformation': [
    //                 {
    //                   'orderBy': { 'index': 'r.desc(timestamp)' }
    //                 }
    //               ],
    //               'filter': [
    //                 { 'metadata': { 'host': 'elk' } },
    //                 "this.r.row('metadata')('path').eq('os.cpus')" +
    //                 ".or(this.r.row('metadata')('path').eq('os.blockdevices.vda3.time'))" +
    //                 ".or(this.r.row('metadata')('path').eq('os.blockdevices.vda3.sectors'))" +
    //                 ".or(this.r.row('metadata')('path').eq('os.rethinkdb.server.written_docs'))" +
    //                 ".or(this.r.row('metadata')('path').eq('os.rethinkdb.server.read_docs'))"
    //               ]
    //             }
    //
    //           }
    //         }
    //       }
    //     ),
    //     output: Object.merge(Object.clone(conn), {table: 'ml'}),
    //     filters: Array.clone(periodical_training_filters_carrot),
    //
    //
    //   }//
    // ),


        /**
        * OS tabular
        **/
        // require(path.join(process.cwd(), 'apps/stat-changes/periodical/pipeline'))(
        //   {
        //     input: Object.merge(Object.clone(conn), {table: 'os'}),
        //     output: Object.merge(Object.clone(conn), {table: 'os_tabular'}),
        //     filters: Array.clone(periodical_data_format_filters_changes),
        //     type: 'inmediate',
        //     opts: { format: 'tabular' }
        //     // full_range: false
        //   }
        // ),
        //
        // require(path.join(process.cwd(), 'apps/purge/periodical/pipeline'))(
        //   {
        //     input: Object.merge(Object.clone(conn), {table: 'os_tabular'}),
        //     output: Object.merge(Object.clone(conn), {table: 'os_tabular'}),
        //     filters: Array.clone(periodical_purge_filters),
        //     type: 'periodical'
        //   }
        // ),




]


module.exports = pipelines
