var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000
var server = http.createServer(app)
var CryptoJS = require("crypto-js")
var bodyParser = require('body-parser')


var loki = require('lokijs')
var db = new loki('database/browsers.json')
var visiteurs = null

db.loadDatabase({}, function () {
   visiteurs = db.getCollection('users')
  	if(!visiteurs){
  		visiteurs = db.addCollection('users')
  	}
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}))

// parse application/json
app.use(bodyParser.json()) // to support JSON-encoded bodies

var Logger = function(level) {

	this.levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR']


	this.log = function(l, data) {

		if (data instanceof Object) {
			data = JSON.stringify(data)
		}

		console.log("[" + l + "] " + data)
	}

	this.d = function(data) {
		if (this.level == 0) {
			this.log('DEBUG', data);
		}
	}

	this.i = function(data) {
		if (this.level <= 1) {
			this.log('INFO', data);
		}
	}

	this.w = function(data) {
		if (this.level <= 2) {
			this.log('WARNING', data);
		}
	}

	this.e = function(data) {
		if (this.level <= 3) {
			this.log('ERROR', data);
		}
	}

	//init

	if (this.levels.indexOf(level) == -1) {
		this.level = 0
	} else {
		this.level = this.levels.indexOf(level)
	}

	this.log('INFO', "Log level set to " + this.levels[this.level])

}

var log = new Logger('DEBUG')

app.get('/all', function(req, res) {
	var data = visiteurs.find({})
	res.json(data)
})

app.post('/unique', function(req, res) {

	var headers = req.headers

	var data = req.body.fingerprint

	var valeur = data

	var cle = CryptoJS.SHA256(valeur).toString()

	var result = {
		cle: {
			data: cle,
			size: Buffer.byteLength(cle, 'utf8')
		},
		valeur: {
			data: valeur,
			size: Buffer.byteLength(valeur, 'utf8')
		}
	}

	var existe = visiteurs.find({
		'cle': cle
	})

	if (existe.length > 0) {
		//result = 'Déjà venu !<br>Info : '+cle+' ('+(Buffer.byteLength(cle, 'utf8'))+' bits) : '+valeur+' ('+(Buffer.byteLength(valeur, 'utf8'))+' bits)'
		console.log('Deja venu')
		result.unique = false
	} else {
		visiteurs.insert({cle: cle,valeur: JSON.parse(valeur)})
		db.saveDatabase()
		//result = 'Nouveau visiteur !<br>Info : '+cle+' : '+valeur
		console.log('Nouveau visiteur');
		result.unique = true
	}

	res.json(result)
});

var options = {
	root: __dirname + '/public/',
	dotfiles: 'deny',
	headers: {
		'x-timestamp': Date.now(),
		'x-sent': true
	}
};

app.get('/', function(req, res) {

	res.sendFile('index.html', options, function(err) {
		if (err) {
			console.log(err);
			res.status(err.status).end();
		}
	});
})

//serve static files
app.use(express.static(__dirname + "/public/"))

server.listen(port)

console.log("http server listening on %d", port)