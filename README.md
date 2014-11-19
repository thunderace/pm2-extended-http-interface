pm2-extended-http-interface
===========================

Extended HTTP interface to communicate with pm2

You can list stop and start/restart a pm2 process remotely

Run pm2-ext-http-interface on each pm2 host.

Start in foreground : node pm2-ext-http-interface.js -p XXXX
	the default port value is 9616
	
Start with pm2 : pm2 start pm2-ext-http-interface.js -- -p XXXX

