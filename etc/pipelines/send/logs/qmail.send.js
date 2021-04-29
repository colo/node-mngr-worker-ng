const path = require('path')

const conn = require('../../../default.conn')()
const http_receiver = require('../../http.receiver')

const os = require('os')

let pipelines = [

  /**
  * Logs
  **/
  // require(path.join(process.cwd(), 'apps/logs/qmail/send/pipeline'))(
  //   {
  //     input: {
  //       file: path.join(process.cwd(), 'devel/var/log/qmail/current'),
  //       stdin: false,
  //       // domain: 'ID',
  //     },
  //     output: conn,
  //     opts: {
  //       type: 'qmail.send',
  //       hostname: os.hostname()
  //     }
  //   }
  // ),


]

/**
* load all access log from dir (production)
**/

const glob = require('glob')
// const DIR = path.join(process.cwd(), 'devel/var/log/qmail/')
const DIR = '/var/log/qmail/'

const files = glob.sync('current', {
  'cwd': DIR
})

Array.each(files, function(file){
  /**
  * Logs
  **/

  pipelines.push(
    require(path.join(process.cwd(), 'apps/logs/qmail/send/pipeline-send-remote'))(
      {
        input: {
          file: path.join(DIR, file),
          stdin: false,
          // domain: domain
        },
        output: http_receiver,
        opts: {
          type: 'qmail.send',
          hostname: os.hostname()
        }
      }



    )
  )
})

module.exports = pipelines
