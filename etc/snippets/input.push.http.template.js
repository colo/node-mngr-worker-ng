module.exports = {
	push : {
		id: "localhost.http",
		conn: [
			{
				scheme: 'http',
				host:'127.0.0.1',
				port: 8082,
				module: require(path.join(process.cwd(), 'lib/pipeline/input/pusher/push/http')),
				load: []
			}
		],
	}
}

