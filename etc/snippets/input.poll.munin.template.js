module.exports = {
	poll: {
		id: "remote.munin",
		conn: [
			{
				scheme: 'munin',
				host:'127.0.0.1',
				port: 4949,
				module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/munin')),
				load: [],
			}
		],
		connect_retry_count: 5,
		connect_retry_periodical: 5000,
		requests: {
			periodical: 2000,
		},
	}
};
