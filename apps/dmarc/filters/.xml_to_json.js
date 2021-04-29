'use strict'

let debug = require('debug')('Server:Apps:Dmarc:Filters:xml_to_json');
let debug_internals = require('debug')('Server:Apps:Dmarc:Filters:xml_to_json:Internals');

const path = require('path'),
      ETC =  process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), '/etc/')
      : path.join(process.cwd(), '/devel/etc/')

// const sanitize_filter = require(path.join(ETC, 'snippets/filter.sanitize.rethinkdb.template')),
      // data_formater_filter = require(path.join(ETC, 'snippets/filter.data_formater')),
      // compress_filter = require(path.join(ETC, 'snippets/filter.zlib.compress'))

const round = require(path.join(process.cwd(), 'libs/time/round'))

const convert = require('xml-js')

module.exports = function(doc, opts, next, pipeline){
	let { id, req, type, input } = opts
	// debug('4rd filter', doc)
	// process.exit(1)
	try {
		let report = convert.xml2js(doc, {compact: true})
		let report_template = {
			report: {
				org: (report.feedback.report_metadata.org_name) ? report.feedback.report_metadata.org_name._text : undefined,
				email: (report.feedback.report_metadata.email) ? report.feedback.report_metadata.email._text : undefined,
				'extra_contact_info': (report.feedback.report_metadata.extra_contact_info) ? report.feedback.report_metadata.extra_contact_info._text : undefined,
				id: (report.feedback.report_metadata.report_id) ? report.feedback.report_metadata.report_id._text: undefined,
				range: (report.feedback.report_metadata.date_range)
					? {start: report.feedback.report_metadata.date_range.begin._text * 1000, end: report.feedback.report_metadata.date_range.end._text * 1000}
					: {start: round.roundHours(Date.now()), end: round.roundMinutes(Date.now())}
			},
			// policy: {
			// 	domain: (report.feedback.policy_published.domain) ? report.feedback.policy_published.domain._text : undefined,
			// 	adkim: (report.feedback.policy_published.adkim) ? report.feedback.policy_published.adkim._text : undefined,
			// 	aspf: report.feedback.policy_published.aspf._text,
			// 	p: report.feedback.policy_published.p._text,
			// 	sp: report.feedback.policy_published.sp._text,
			// },
			policy: undefined,
			records: undefined,
		}

		let record_template = {
			count: undefined,
			policy: {
				disposition: undefined,
				dkim: undefined,
				spf: undefined,
			},
			identifiers: {},
			results: {},
		}

		Object.each(report.feedback.policy_published, function(policy, key){
			if(report_template.policy === undefined) report_template.policy = {}
			report_template.policy[key] = policy._text
		})

		const add_record = function(record){
			let template = Object.clone(record_template)
			let ip = record.row.source_ip._text
			template.count = record.row.count._text * 1
			// template.policy = {
			// 	disposition: record.row.policy_evaluated.disposition._text,
			// 	dkim: record.row.policy_evaluated.dkim._text,
			// 	spf: record.row.policy_evaluated.spf._text,
			// }
			Object.each(record.row.policy_evaluated, function(policy, key){
				template.policy[key] = policy._text
			})

			Object.each(record.identifiers, function(identifier, key){
				template.identifiers[key] = identifier._text
			})

			Object.each(record.auth_results, function(result, key){
				if(!template.results[key]) template.results[key] = {}
				Object.each(result, function(data, prop){
					template.results[key][prop] = data._text
				})

			})

			if(report_template.records === undefined) report_template.records = {}
			report_template.records[ip] = template
		}

		if(Array.isArray(report.feedback.record)){
			Array.each(report.feedback.record, function(record){
				add_record(record)
			})
		}
		else{
			add_record(report.feedback.record)
		}

		// debug('report %O %O', report, report_template)
		// process.exit(1)
		next(report_template, opts, next, pipeline)
	}
	catch (e) {
		debug('err', e)
		// process.exit(1)
		next(undefined, opts, next, pipeline)
	}


}
