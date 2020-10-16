/*
 * HEP-PUBSUB Interface Controller
 * (C) 2019 QXIP BV
 */

try {
  var config = require('./config.js');
} catch(e) { console.log('Missing config!',e); process.exit(1); }

var express = require('express');
const app = express();
const util = require('util')
const request = require('request');
var bodyParser = require("body-parser");
app.use(bodyParser.json());

var port = config.service.port;

const requestPromise = util.promisify(request);

// API SETTINGS
app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
});

// HEP Post Paths
app.post('/get/:id', async function (req, res) {
  var data = req.body;
  console.log('NEW API POST REQ', JSON.stringify(data));
  // API ban relay
  if (data.data.source_ip) {
    var banresponse = {};
    await Promise.all(data.data.source_ip.map(async (ip) => {
        if(ip == '127.0.0.1') return;
    	var APIURL = "https://apiban.org/api/"+config.apiban.key+"/check/"+ip;
    	const response = await requestPromise(APIURL);
	if (response.body) banresponse[ip] = JSON.parse(response.body);
    }));
    res.send(banresponse)
  } else { res.sendStatus(500); }
})

app.listen(port, () => console.log('API Server started',port))


// HEP PUBSUB Hooks
var api = config.backend;
const uuidv1 = require('uuid/v1');
var uuid = uuidv1();
var ttl = config.service.ttl;
var token = config.token;

var publish = function(){

  try {
    var settings = config.service;
    settings.uuid = uuid;
    const data = JSON.stringify(settings)
    const options = {
        url: api,
        method: 'POST',
        json: settings,
        headers: {
          'Auth-Token': token
        }
    }

    if (config.debug) console.log("Body:", JSON.stringify(options));

    request(options, function (error, response, body) {
        if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
            if (config.debug) {
                console.log("RESPONSE API:", body) // Print the shortened url.
            }
        } else {
            if (config.debug) {
                if(body && body.message) console.log('REGISTER API ERROR: ', body.message);
                else console.log('REGISTER UNKNOWN ERROR: ', error);
            }
        }
    });

  } catch(e) { console.error(e) }
}

/* REGISTER SERVICE w/ TTL REFRESH */
if (ttl) {
	publish();
	/* REGISTER LOOP */
	setInterval(function() {
	   publish()
	}, (.9 * ttl)*1000 );
}

/* END */


