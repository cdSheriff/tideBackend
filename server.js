//server.js
const http = require('http'),
      url = require('url'),
      fetch = require('node-fetch'),
      JSDOM = require('jsdom').JSDOM

serveTides = function (request,response){
	let q = url.parse(request.url, true);
	if(q.pathname === '/'){
		response.writeHead(200,{'Content-Type':'text/plain'});
		response.write('Entering the realm');
	}
	else if(q.pathname === '/tides'){
		response.writeHead(200,{'Content-Type':'text/plain'});
		response.write('Tide path');
		locName(q.query.ID).then(resp => console.log('got this back: ' + resp))
	}
	else{
		response.writeHead(404,{'Content-Type':'text/plain'});
		response.write('Error page');
	}
	response.end();
},

server = http.createServer(serveTides);
server.listen(3000,()=>{
	console.log('Node server created at port 3000');
});

function locName(ID) {
	let url = 'http://www.bom.gov.au/australia/tides/print.php?aac=' + ID + '&type=tide&tz=Australia/Adelaide&tz_js=ACDT'

	return fetch(url)
		.then(resp => resp.text())
		.then(text => {
			let dom = new JSDOM(text)
			let location = dom.window.document.querySelector("h2").textContent
			return location.split('–')[0].slice(0,-1)
		})

}