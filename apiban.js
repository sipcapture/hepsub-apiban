/*
 * HEP-PUBSUB Interface Controller
 * (C) 2019 QXIP BV
 */

try {
  var config = require('./config.js');
} catch(e) { console.log('Missing config!',e); process.exit(1); }

const { isIP } = require('node:net');

var LRU = require('lru');
var cache = new LRU({ max: 1000, maxAge: 3600000 });

var express = require('express');
const app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json());

var port = config.service.port;

function apibanCheckUrl(ip) {
  if (typeof ip !== 'string' || ip === '127.0.0.1' || isIP(ip) === 0) {
    return null;
  }
  const key = encodeURIComponent(String(config.apiban.key));
  const address = encodeURIComponent(ip);
  return new URL('/api/' + key + '/check/' + address, 'https://apiban.org').href;
}

// API SETTINGS
app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
});

// HEP Post Paths
app.post('/get/:id', async function (req, res) {
  var data = req.body;
  if (config.debug) console.log('NEW API POST REQ', JSON.stringify(data));
  // API ban relay
  if (data.data.source_ip) {

    var banresponse = {};

    await Promise.all(data.data.source_ip.map(async (ip) => {
    	const APIURL = apibanCheckUrl(ip);
    	if (!APIURL) return;
    	var cached = cache.get(ip);
    	if (cached) {
		if(config.debug) console.log('Returning cached result for ip:',ip);
		banresponse[ip] = JSON.parse(cached);
	} else {
		if (config.debug) console.log('Returning lookup for ip:',ip);
    		const response = await fetch(APIURL);
    		const body = await response.text();
		if (body) banresponse[ip] = JSON.parse(body);
		cache.set(ip, body);
	}
    }));
    res.send(banresponse)
  } else { res.sendStatus(500); }
})

app.listen(port, () => console.log('API Server started',port))


// HEP PUBSUB Hooks
var api = config.backend;
const { v1: uuidv1 } = require('uuid');
var uuid = uuidv1();
var ttl = config.service.ttl;
var token = config.token;

var publish = function(){

  try {
    var settings = config.service;
    settings.uuid = uuid;
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Auth-Token': token
        },
        body: JSON.stringify(settings)
    }

    if (config.debug) console.log("Body:", JSON.stringify({ url: api, ...options }));

    fetch(api, options).then(async function (response) {
        if (response.status === 200 || response.status === 201) {
            if (config.debug) {
                const body = await response.json().catch(function () { return null; });
                console.log("RESPONSE API:", body)
            }
        } else if (config.debug) {
            const body = await response.json().catch(function () { return null; });
            if (body && body.message) console.log('REGISTER API ERROR: ', body.message);
            else console.log('REGISTER UNKNOWN ERROR: ', response.status);
        }
    }).catch(function (error) {
        if (config.debug) console.log('REGISTER UNKNOWN ERROR: ', error);
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


