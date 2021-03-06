var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var app = express();
var User = require('./app/model/user');
var Audio = require('./app/model/audio')(app);
var users = require('./app/routes/user')(app);
var crudRouter = require('./app/routes/crudRouter');
var auth = require('./app/routes/auth.js');
var conf = require('./config');
require('./app/auth/jwt.strategy')(app);
var userGroups = require('./app/model/userGroups');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');

var mongoose = require('mongoose');
mongoose.connect(conf.dataBase);

app.use(bodyParser());

app.use(function (req, res, next) {
	res.set('Access-Control-Allow-Origin','*');
	res.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
	res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

	if ('OPTIONS' == req.method) {
		res.send(200);
	} else {
		next();
	}
});

app.listen(process.env.PORT || 8080);

app.get('/', function (req, res) {
	res.json({ok:'ok'});
});

app.get('/api', function(req, res) {
	res.status(200).json({message: 'Server running'});
});

app.use('/api/auth',auth);
app.use('/api/users', users);

app.use('/api/users', crudRouter(User, {noAuth: ['get','post']}));
app.use('/api/userGroups', crudRouter(userGroups, {noAuth: []}));
app.use('/api/audios', crudRouter(Audio, {noAuth: ['get']}));

app.use('/api/uploads', express.static('uploads'));
app.use('/api/json', express.static('json'));


app.post('/api/upload',multipartMiddleware, function(req, resp) {
    console.log(req.body, req.files.file);

    fs.createReadStream(req.files.file.path).pipe(fs.createWriteStream(__dirname+'/uploads/music/'+req.files.file.name));
    resp.json({status: 'ok'});
});