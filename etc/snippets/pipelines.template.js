module.exports = [
	 {
		 input: [
			{
				poll: {
					type: {},
				},
				push : {
					type: {},
				}
			}
		 ],
		 filters: [
				function(doc, opts, next){
					next(doc);
				}
			],
			output: [
				{
					type: {
					},
				},
				function(doc){}
			]
	 }
]
