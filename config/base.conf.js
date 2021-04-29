'use strict'

require('http').globalAgent.maxSockets = Infinity
require('https').globalAgent.maxSockets = Infinity

const App = require('../modules/node-express-app'),
			os = require('os'),
			path = require('path'),
			bodyParser = require('body-parser'),
			//multer = require('multer'), // v1.0.5
			//upload = multer(), // for parsing multipart/form-data
			cors = require('cors');

module.exports = new Class({
  Extends: App,

	app: null,
  logger: null,
  authorization:null,
  authentication: null,
  //poll_app: null,
  pipelines: [],

  options: {

		// pipelines: null,

	  /**
	   * @poller
	   * */
		//clients: null,
		/**
	   * @poller
	   * */

		id: os.hostname(),
		path: '/',

		// authentication: {
		// 	users : [
		// 			{ id: 1, username: 'anonymous' , role: 'anonymous', password: ''}
		// 	],
		// },
		//
		// logs: null,

		//authorization: {
			//config: path.join(__dirname,'./rbac.json'),
		//},

		params: {
			event: /exit|resume|suspend|once|range/
		},

		middlewares: [
			bodyParser.json(),
			bodyParser.urlencoded({ extended: true }),
			cors({
				'exposedHeaders': ['Link', 'Content-Range']
			})
	  ],

		api: {

			version: '1.0.0',


			routes: {
				get: [
					{
						path: 'pollers',
						callbacks: ['pollers'],
						version: '',
					},
					{
						path: 'events/:event',
						callbacks: ['events'],
						version: '',
					},
					{
						path: 'events',
						callbacks: ['events'],
						version: '',
					},
					{
						path: '',
						callbacks: ['get'],
						version: '',
					},
				],
				all: [
					{
						path: '',
						callbacks: ['404'],
						version: '',
					},
				]
			},

		},
  },



});
