module.exports = {
		
	id: null,
	conn: [],
	
	connect_retry_count: 5,
	connect_retry_periodical: 5000,
	
	requests: {
		periodical: 1000,
	},
	
	docs:{
		buffer_size: 10,
		timer: 5, //seconds
	}

};
