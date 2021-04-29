'use strict'

module.exports = {
	poll: {
		id: "remote.imap",
		conn: [
			Object.merge(
				{
					module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/imap')),
					load: [],
				},
				require('../devel/imap.infraestructura')
			)
		],
		connect_retry_count: 5,
		connect_retry_periodical: 5000,
		requests: {
			periodical: 2000,
		},
	},
};

