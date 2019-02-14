const fetch = require('node-fetch')
const JSDOM = require('jsdom').JSDOM
const http = require('http')
const fs = require('fs')

function getAllStations() {
	// http://www.bom.gov.au/australia/tides/#!
	let url = 'https://en.wikipedia.org/wiki/List_of_baked_goods'
	// let url = "http://www.bom.gov.au/australia/tides/#!"
	let selector = 'ul > li > a'

	fetch(url)
		.then(resp => resp.text)
		.then(text => {
			// console.log(text)
			let dom = new JSDOM(text)
			let { document } = dom.window;
			let list = [...document.querySelectorAll(selector)]
				.map(a => a.textContent)
			console.log(list)
		})
}

//////////////////////// JSDOM VERSION /////////////////////////

let selector = 'ul > li > a'
// let url = 'https://en.wikipedia.org/wiki/List_of_baked_goods'
let url = "http://www.bom.gov.au/australia/tides/#!"


// let selector = 'tr > th'
// let url = 'http://www.bom.gov.au/australia/tides/print.php?aac=SA_TP036&type=tide&date=29-1-2019&region=SA&tz=Australia/Adelaide&tz_js=ACDT&days=7'

fetch(url)
	.then(resp => resp.text())
	.then(text => {
		let dom = new JSDOM(text)
		let { document } = dom.window;
		let subDoc = document.getElementById('location-list')
		let list = [...subDoc.querySelectorAll(selector)]
			.map(a => [a.textContent, a.getAttribute('id')])
		// return list
		// fs.writeFile('stations.txt', list, (err) => {
		// 	if (err) throw err;
		// 	console.log('saved the list')
		// })

		let regionKeys = []
		let regions = {}
		// let tideZones = {
		// 	'NSW': '',
		// 	'VIC': '',
		// 	'QLD': '',
		// 	'WA': '',
		// 	'SA': '',
		// 	'TAS': '',
		// 	'NT': '',
		// 	'INT': ''
		// }
		// console.log(regionKeys.includes(list[0][1].split('_')[0]))
		for (let i = 0; i < list.length; i++) {
			if (list[i][1].split('_')[0] == 'stream') {
				continue
			} else if (regionKeys.includes(list[i][1].split('_')[0]) == false) {
				regionKeys.push(list[i][1].split('_')[0])
				regions[list[i][1].split('_')[0]] = {[list[i][0]]: [list[i][1], 'tz']}
				console.log('added')
			} else {
				regions[list[i][1].split('_')[0]][list[i][0]] = [list[i][1], 'tz']
			}
		}
		// let regionWrite = 'const regions = ' + JSON.stringify(regions)
		// fs.writeFile('stations.json', regionWrite, (err) => {
		fs.writeFile('stations.json', JSON.stringify(regions), (err) => {
			if (err) throw err;
			console.log('saved the list')
		})

		console.log(regions)
	})
	// .then(list => {
	// 	let regions = []
	// 	for (let i = 0; i < list.length; i++) {
	// 		if (regions.includes(list[i][1].split('_')[0]) == false) {
	// 			regions.push(list[i][1].split('_')[0])
	// 		}
	// 	}
	// 	console.log(regions)
	// })



//////////////////////// RAW ///////////////////////////////
function regexIt() {
	// let url = 'http://www.bom.gov.au/australia/tides/print.php?aac=SA_TP036&type=tide&date=29-1-2019&region=SA&tz=Australia/Adelaide&tz_js=ACDT&days=7'
	let url = 'http://www.bom.gov.au/australia/tides/print.php?aac=SA_TP036&type=tide&region=SA&tz=Australia/Adelaide&tz_js=ACDT&days=7'
	// let regex = /Bureau([\s\S]*)Meteorology/m
	let test = 'Bureau of \n Meteorology'
	let regex = /(?=\<h3\>)([\s\S]*?)\<\/tbody\>/mg
	let tides = []

	fetch(url)
		.then(resp => resp.text())
		.then(text => {
			do {
				m = regex.exec(text);
				if (m) {
					// console.log(m[1])
					let parsedTides = parseDay(m[1])
					for (let i = 0; i < parsedTides.length; i++) {
						tides.push(parsedTides[i])
					}
					// let temp = {}
					// for (let i = 0; i < parsedTides[1].length; i++) {
					// 	temp = Object.assign({'way': parsedTides[1][i][0], 'time': parsedTides[1][i][1]})
					// }
					// tides[parsedTides[0]] = parsedTides[1]
					// console.log(tides)
				}
			} while (m)
			console.log(tides)
		})
	// console.log(tides)
}

function locName() {
	let url = 'http://www.bom.gov.au/australia/tides/print.php?aac=SA_TP036&type=tide&tz=Australia/Adelaide&tz_js=ACDT'
	// let regex = /Bureau([\s\S]*)Meteorology/m
	let selector = 'h2'
	let regex = /(?=\<h3\>)([\s\S]*?)\<\/tbody\>/mg
	let tides = []

	fetch(url)
		.then(resp => resp.text())
		.then(text => {
			let dom = new JSDOM(text)
			let location = dom.window.document.querySelector("h2").textContent
			console.log(location.split('–')[0].slice(0,-1))
		})
}

function testStation() {
	let url = 'http://www.bom.gov.au/australia/tides/print.php?aac=SA_TP067&type=tide&tz=Australia/Adelaide&tz_js=ACDT'

	fetch(url)
		.then(resp => resp.text())
		.then(text => {
			if (text.includes('result-error')) {
				console.log('Bad station!!')
			} else {
				console.log('station is fine')
			}
		})
}


function parseDay(m, method = false) {
	// only look at tr > th (this may be a good use of JSDOM if it can return whole element, not just innter text)
	// alternatively, only keep a tr if it has a th with class = 'instance/s' or 'instance high/low-tide'
	// lets do both ways because f it
	let tidesArray = []
	let temp
	// let tidesArray2 = []
	// let tidesJSON = {}
	if (method == false) {
		let dayReg = /\<h3\>(.*)\<\/h3\>/
		let headerReg = /\<tr\>([\s\S]*?)\<\/tr\>/mg
		let wayReg = /instance\s(.*)\"\>/
		let timeReg = /local\=\"([\s\S]*?)\+/

		// var day = dayReg.exec(m)[1]
		// days.push[day]
		// tidesJSON[dayReg.exec(m)[1]] = {}
		// console.log(tidesJSON)

		// tidesArray.push(dayReg.exec(m)[1])
		// console.log(headerReg.exec(m[1]))
		do {
			n = headerReg.exec(m)
			// console.log(n)
			if (n && n[1].includes('instance ')) {
				// console.log(n[1])
				// console.log(wayReg.exec(n[1])[1])
				// console.log(n[1])
				// console.log(timeReg.exec(n[1])[1])
				// tidesJSON[dayReg.exec(m)[1]] = {'way': wayReg.exec(n[1])[1], 'time': timeReg.exec(n[1])[1]}
				temp = timeReg.exec(n[1])[1].replace(/-|:/g,'').slice(0,-2)
				if (wayReg.exec(n[1])[1].includes('high')) {
					temp = temp + 'H'
					// console.log(temp)
				} else {
					temp = temp + 'L'
				}
				tidesArray.push(temp)
				// tidesArray.push({'way': wayReg.exec(n[1])[1], 'time': timeReg.exec(n[1])[1]})
				// tidesArray2.push({'day': day, 'way': wayReg.exec(n[1])[1], 'time': timeReg.exec(n[1])[1]})
			}
		} while (n)
	} else {
		console.log('t/f error')
	}
	// console.log(tidesArray)
	// console.log(tidesJSON)
	// console.log(tidesArray2)
	return tidesArray
}




function testReg() {
	const people = '- Bob (vegetarian)\n- Billa (vegan)\n- Francis\n- Elli (vegetarian)\n- Fred (vegan)'
	let regex = /-\s(\w+?)\s(?=\(vegan\))/g;
	let result = regex.exec(people);
	console.log(result)
}

// getAllStations()
// testReg()