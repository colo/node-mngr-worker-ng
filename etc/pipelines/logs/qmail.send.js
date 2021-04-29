const path = require('path')

const conn = require('../../default.conn')()

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
const DIR = path.join(process.cwd(), 'devel/var/log/qmail/')
// const DIR = '/var/log/qmail/'

const files = glob.sync('current', {
  'cwd': DIR
})

Array.each(files, function(file){
  /**
  * Logs
  **/

  // let domain = file.replace('.log', '')
  // domain = domain.replace('access.log', '')
  // domain = (domain === '') ? os.hostname() : domain

  pipelines.push(
    require(path.join(process.cwd(), 'apps/logs/qmail/send/pipeline'))(
      {
        input: {
          file: path.join(DIR, file),
          stdin: false,
          // domain: domain
        },
        output: conn,
        opts: {
          type: 'qmail.send',
          hostname: os.hostname()
        }
      }



    )
  )
})

module.exports = pipelines
