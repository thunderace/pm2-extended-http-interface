var request = require('request');


//request({url:'http://192.168.1.230:9616/stop?pm_id=1', oauth:{}, json:true}, function (error, response, data) {
request({url:'http://192.168.1.230:9616/restart?pm_id=1', oauth:{}, json:true}, function (error, response, data) {
//request({url:'http://192.168.1.230:9616/', oauth:{}, json:true}, function (error, response, data) {
	if (!error && response.statusCode == 200) {
		console.log(data);
	} else {
		console.log('error ' + error );
	}
});
