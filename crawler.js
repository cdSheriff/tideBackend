const fetch = require('node-fetch')



//////////////////////// JSDOM VERSION /////////////////////////
// const JSDOM = require('jsdom').JSDOM

// // let selector = 'ul > li > a'
// // let url = 'https://en.wikipedia.org/wiki/List_of_baked_goods'

// let selector = 'tr > th'
// let url = 'http://www.bom.gov.au/australia/tides/print.php?aac=SA_TP036&type=tide&date=29-1-2019&region=SA&tz=Australia/Adelaide&tz_js=ACDT&days=7'

// fetch(url)
// 	.then(resp => resp.text())
// 	.then(text => {
// 		// console.log(text)
// 		let dom = new JSDOM(text)
// 		let { document } = dom.window;
// 		let list = [...document.querySelectorAll(selector)]
// 			.map(a => a.textContent)
// 		console.log(list)
// 	}) 



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

regexIt()
// testReg()