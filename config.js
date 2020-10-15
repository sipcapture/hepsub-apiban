var config = {
  backend: "http://HOMER_IP_HERE:HOMER_PORT_HERE/api/v3/agent/subscribe",
  token: "021d7d1d-005f-4ad6-b339-eb7f5846d682",
  apiban: {
	"key" : "APIBAN_KEY_HERE"
  },
  service: {
	"uuid": Math.random().toString(36).substring(7),
	"host":"LOCAL_IP_HERE",
	"port": 18088,
	"protocol": "http",
	"path": "/get",
	"type": "ip",
	"ttl": 300,
	"node": "apiban-endpoint",
	"gid": 10
  },
  "debug": true
};

module.exports = config;
