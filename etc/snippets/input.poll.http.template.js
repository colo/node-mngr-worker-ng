module.exports = {
	poll: {
		id: "localhost.http",
		conn: [
			{
				scheme: 'http',
				host:'127.0.0.1',
				port: 8081,
				module: require(path.join(process.cwd(), 'lib/pipeline/input/poller/poll/http')),
				load: []
			}
		],
		requests: {
			periodical: 1000,
		},
	},
};
