'use strict'
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import IO from 'socket.io';
import Http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default class Express{
	constructor(config){
		this.config = config;
		let port = config.port ? config.port : 8080;
		let server = this.createHttpServer();
		this.io = IO(server);
		server.listen(port);
		L("EXPRESS_PORT:",port);
	}
	createHttpServer(){
		let self = this;
		var app = express();
		app.set('views', path.join(__dirname, '../views'));
		app.set('view engine', 'pug');

		app.use(express.json());
		app.use(express.urlencoded({ extended: false }));
		app.use(express.static(path.join(__dirname, 'public')));

		var indexRouter = express.Router();
		indexRouter.get('/', (req, res, next) => {
			res.render("index",{
				config:this.config
			});
		});
		app.use('/', indexRouter);

		// catch 404 and forward to error handler
		app.use(function(req, res, next) {
			next(createError(404));
		});
		// error handler
		app.use(function(err, req, res, next) {
			res.locals.message = err.message;
			res.locals.error = req.app.get('env') === 'development' ? err : {};
			res.status(err.status || 500);
			res.render('error');
		});
		return Http.createServer(app);
	};
}
