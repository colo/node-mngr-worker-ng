module.exports = {
	poll: {
		id: "localhost.cradle",
		conn: [
			{
				scheme: 'cradle',
				host:'127.0.0.1',
				port: 5984 , db: 'dashboard',
				module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/http')),
				load: []
			}
		],
		requests: {
			periodical: 1000,
		},
	},
};
