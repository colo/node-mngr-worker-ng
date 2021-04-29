module.exports = {
 input: [
	require('./snippets/input.poll.munin.template'),
 ],
 filters: [
		require('./snippets/filter.sanitize.template'),
	],
	output: [
		require('./snippets/output.stdout.template'),
	]
}
