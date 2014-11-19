//
// PM2 Monit and Server web interface
// Disserve JSON in light way
// by Strzelewicz Alexandre
//

var http  = require('http');
var os    = require('os');
var Satan = require('./lib/Satan');
var urlT  = require('url');
var util = require('util');
var queryString = require( "querystring" );
var version = require('./package.json').version;


var program = require('commander');

program.version('0.0.1')
	.option('-p, --port <web port>', 'Web port')
	.parse(process.argv);

if (!program.port) {
	program.port = 9616;
}

//
// Usually it would be is started in the parent process already,
// but if I run "node HttpInterface" directly, I would probably
// like it to be not daemonized
Satan.start(true);

function callback(res, err, data) {
	var data;
	if (err) {
	  console.log(util.inspect(err.message, {depth: null }));
		data = {error: err.message};
	} else {
		data = {
		      	error: 0,
		      	data: data
		      };
	}
	res.statusCode = 200;
  	res.write(JSON.stringify(data));
  	return res.end();
}

function error(res, errorString) {
	var data = {
		error : 1,
		data : errorString
	};
	res.statusCode = 200;
	res.write(JSON.stringify(data));
	return res.end();
}

http.createServer(function (req, res) {
  // Add CORS headers to allow browsers to fetch data directly
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // We always send json
  res.setHeader('Content-Type','application/json');

  var url = urlT.parse(req.url);
  var path = urlT.parse(req.url).pathname;
  console.log('Access on PM2 monit point %s', path);

  switch(path) {
  	case '/version':
      var data = {
        name: 'pm2-ext-http-interface',
        version: version
      };
      res.statusCode = 200;
      res.write(JSON.stringify(data));
      return res.end();
	  break;
  	case '/stop':
  		if (url.query) {
  		  var data = queryString.parse( url.query );
  		  var pm_id = data.pm_id;
	      Satan.executeRemote('stopProcessId', parseInt(pm_id),  function(err, data_proc) {
  		  		callback(res, err, data_proc);
		    });
	      } else {
	      	return error(res, 'missing id');
	      }
  		break;
  	case '/restart':
  		if (url.query) {
  		  var data = queryString.parse( url.query );
  		  var pm_id = data.pm_id;
	      Satan.executeRemote('restartProcessId', {id: parseInt(pm_id)},  function(err, data_proc) {
  		  		callback(res, err, data_proc);
		    });
	      } else {
	      	return error(res, 'missing id');
	      }
  		break;
    case '/' :
    // Main monit route
    Satan.executeRemote('getMonitorData', {}, function(err, data_proc) {
      var data = {
        system_info: { hostname: os.hostname(),
                       uptime: os.uptime()
                     },
        monit: { loadavg: os.loadavg(),
                 total_mem: os.totalmem(),
                 free_mem: os.freemem(),
                 cpu: os.cpus(),
                 interfaces: os.networkInterfaces()
               },
        processes: data_proc
      };

      res.statusCode = 200;
      res.write(JSON.stringify(data));
      return res.end();
    });
    break;
  default:
    // 404
    res.statusCode = 404;
    res.write(JSON.stringify({err : '404'}));
    return res.end();
  }
}).listen(9616);
