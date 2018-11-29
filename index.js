//mainCanvas config
var margin = {top: 40, right: 400, bottom: 20, left: 50};//400 for the extra connected visualisation
var width = 1300- margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

//extraCanvas config
var eMargin = {top: 40, right: 10, bottom: 10, left: 10};
var eWidth = 400- eMargin.left - eMargin.right;
var eHeight = 600 - eMargin.top - eMargin.bottom;

//initial value
var displayYear = 2007;
var selectedCountry = "";//for country trace
var showLineCountries = [];//for extra canvas to show lines

function yearFilter(value) {
	return (value['Year'] == displayYear);
}
function countryFilter(value) {
	return (value['Country'] == selectedCountry);
}
function countriesFilter(value) {
	if (showLineCountries.indexOf(value['Country']) != -1) {
		return true;
	} else {
		return false;
	}
}


//main canvas for all bubble plots and axis
d3.select(".main")
	.append("mainCanvas")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.style("background", "aliceblue");
//extra canvas
d3.select("mainCanvas")
	.select("svg")
	.append("g")
	.attr("class", "extraCanvas")
	.attr("transform", "translate(" + (950+eMargin.left) + "," + eMargin.top + ")")
	.append("svg")
	.attr("width", eWidth + eMargin.left + eMargin.right)
	.attr("height", eHeight + eMargin.top + eMargin.bottom)
	.append("g")//1300-400=900for the extra
	//.style("background", "aliceblue").append("text").text("asadsasdsad").style("font-size", "28pt").style("stroke", "blue")

	//d3.select(".extraCanvas").select("g").append("circle").attr("r", "20").style("fill", "blue").attr("cx", "20").attr("cy", "20")


var rawDataset;
var filteredData, filteredYearCountryData, xScale, yScale, zScale, xAxis, yAxis, xValue, yValue, xScaleExtra, yScaleExtra, animation, intervalId;
d3.csv("http://localhost:8000/GCI_CompleteData2.csv")
	.then(function(data) {
		rawDataset = data;
		filteredData = rawDataset.filter(yearFilter);

		//get range of z,y,z dimensions for main canvas
		xScale = d3.scaleSqrt()
			.domain([0, 158516])
			.range([0, width])
			.nice();//for gdp
		yScale = d3.scaleSqrt()
			.domain([0, 5.857734475])
			.range([height, 0])
			.nice();//for index		
		zScale = d3.scaleSqrt()
			.domain([0,1386395000])
			.range([0, 65])
			.nice();//for population
		var xAxis = d3.axisBottom()
	            .scale(xScale);
	    var yAxis = d3.axisLeft()
	            .scale(yScale);

		//generate x axis for main canvas
		d3.select("mainCanvas")
			.select("g")
			.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(" + 0 + "," + height + ")")
			.call(xAxis)
		//generate y axis for main canvas
		d3.select("mainCanvas")
			.select("g")
			.append("g")
			.attr("class", "y-axis")
			.call(yAxis);
		//generate nodes group space for main canvas
		d3.select("mainCanvas")
			.select("g")
			.append("g")
			.attr("class", "nodes")
		// current year information for main canvas
		d3.select("mainCanvas")
			.select("g")
			.append("text")
			.attr("class", "title");
		//x axis label for main canvas
		d3.select("mainCanvas")
			.select("g")
			.append("text")
			.attr("class", "x-axis-label")
			.text("GDP")
			.attr("transform", "translate(" + (width+15) + "," + (height+5) + ")");
		//y axis label for main canvas
		d3.select("mainCanvas")
			.select("g")
			.append("text")
			.attr("class", "y-axis-label")
			.text("Global Competitiveness Index")
			.attr("transform", "translate(" + -10 + "," + -8 + ")")

		//------for extra canvas--------
		yScaleExtra = d3.scaleSqrt()
			.domain([0, 7])
			.range([eHeight-100, 0])
			.nice();//for index
		xScaleExtra = d3.scaleBand()
			.range([0,380]);//for index

		var xAxisExtra = d3.axisBottom(xScaleExtra);
	    var yAxisExtra = d3.axisRight().scale(yScaleExtra);
	    //------for extra canvas--------
	    //generate x axis for extra canvas
		d3.select(".extraCanvas")
			.select("g")
			.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(" + 0 + "," + (height-80) + ")")
			.call(xAxisExtra)
		//generate y axis for extra canvas
		d3.select(".extraCanvas")
			.select("g")
			.append("g")
			.attr("class", "y-axis")
			.call(yAxisExtra)
			.attr("transform", "translate(" +0 + "," + 10 + ")");
		//for lines
		d3.select(".extraCanvas")
			.select("g")
			.append("g")
			.attr("class", "lines")
	
		//set animation
			animation = function() {
				if(displayYear > 2017){
					displayYear = 2007;
				}
				console.log(displayYear)
				generateVis();
				displayYear = displayYear + 1;
			}
	 		intervalId = window.setInterval(animation, 1200);

	})

function generateVis() {
	d3.selectAll(".trace-nodes").remove();//remove all trace before starting
	filteredData = rawDataset.filter(yearFilter);
	var countryPoints = d3.select("mainCanvas")
		.select(".nodes")
		.selectAll("g")
		.data(filteredData, function(d) { return d.Country })
		.on("mouseover", handleMouseover)//display the label of a country
		.on("mouseout", handleMouseout)//remove the label of a country
		.on("click", handleClick)//generate the trace or remove the trace

	//enter
	var newCountryPoints = countryPoints.enter()
	var nodeEnter = newCountryPoints.append("g")
    nodeEnter.append("circle")
    nodeEnter.append("text")
	countryPoints = newCountryPoints.merge(countryPoints)

	countryPoints.select("circle")
		.transition()
		.duration(1500)
		.attr("r", function(d) { return zScale(d.Population)})
    	.attr("transform",function(d) { return "translate("+xScale(d.GDP)+","+yScale(d.Global_Competitiveness_Index)+")"})
		.style("fill", function(d) { return circleColourBySize(zScale(d.Population)) })
		.style("opacity", 0.6)
		.style("stroke", "black")
		.style("stroke-width", "0.5")

	countryPoints.select("text")
		.transition()
		.duration(1500)
		.text(function(d) {
			//if the population is big enough, then show country label
			if(zScale(d.Population) > 18)
				return d.Country;
		})
		.attr("transform",function(d) { return "translate("+xScale(d.GDP)+","+yScale(d.Global_Competitiveness_Index)+")"})
		.style("font-size",  function(d) { return zScale(d.Population)/3 + "pt" })
		.style("opacity", 0.6);

	d3.select("mainCanvas")
		.select(".title")
		.attr("x", width/4)
		.attr("y", height-100)
		.attr("style", "moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;")
		.style("font-size", "150pt")
		.style("opacity", 0.3)
		.text(displayYear);

	filteredYearCountryData = rawDataset.filter(yearFilter).filter(countriesFilter);//filtered data from showLineCountries
	var lineFunc = d3.line()
			.x(function(d) { return d.x })
			.y(function(d) { return d.y });

	var lineHandledData = [];
	for (var i = 0; i < filteredYearCountryData.length; i++) {//extract 12 pillars data 
		var countryData = filteredYearCountryData[i];
		var lineData = [];
		var ithAttr = 1;//control the loop
		console.log("countryData"+ countryData)
		for(attr in countryData) {
			if(ithAttr > 2) {
				var newObj = {};
				newObj.x = (ithAttr-2)*(eWidth/14);
				newObj.y = yScaleExtra(countryData[attr]);
				lineData.push(newObj);
			}
			if(ithAttr == 14) {
				break;
			}
			ithAttr++;
		}
		console.log("linedata"+lineData)
		lineHandledData.push(lineData);
	}
	console.log("handed data lists" + lineHandledData);
	var linesSvg = d3.select(".extraCanvas").select(".lines").selectAll("path")
		.data(lineHandledData);

	linesSvg.enter()
		.append("path")
		.transition()
		.duration(1300)
		.attr("d", function(d, i) {return lineFunc(lineHandledData[i])})
		.attr("stroke", "blue")
		.attr("fill", "none")
		.attr("transform", "translate(" +0 + "," + 10 + ")");
	linesSvg.transition()
		.duration(1500)
		.attr("d", function(d, i) {return lineFunc(lineHandledData[i])});

	//exit
 	countryPoints.exit()
 	 	.transition()
 	 	.duration(500)
 		.style("fill", "red")
 		.remove();
}

function circleColourBySize(size) {
	if(size > 35) {
		return "#3366cc";
	} else if (size > 25) {
		return "#dc3912";
	} else if (size > 15) {
		return "#ff9900";
	} else if (size > 5) {
		return "#109618";
	} else {
		return "#dd4477";
	}
}

//add the country label when move mouse on a bubble
function handleMouseover(d) {
	console.log(d.Country)
	//if the population is big enough, then show country label
	if(zScale(d.Population) <= 18){
		d3.select(this).select("text")
		.text(function(d) { return d.Country; })
		.attr("transform",function(d) { return "translate("+xScale(d.GDP)+","+yScale(d.Global_Competitiveness_Index)+")"})
		.style("font-size",  "18pt")
	}
}
//remove the country label when move mouse on a bubble
function handleMouseout(d) {
	console.log(d.Country)
	if(zScale(d.Population) <= 18){
		d3.select(this).select("text")
		.text("")//set empty label
	}	
}
//obtain a countrys' data from 2007 to 2017
function handleClick(d) {
	//draw trace when press alt + click
	if(d3.event.altKey == 1) {
		pauseAnimation();//stop the animation;
		selectedCountry = d.Country;
		var filteredCountryData = rawDataset.filter(countryFilter);
		console.log(filteredCountryData);
		var countryPoints = d3.select(".nodes").selectAll("g");
		
		countryPoints.select("circle")
		.style("opacity", 0.3);//set all of nodes to be more transparent

		countryPoints.select("text")
		.style("opacity", 0.3);//set all of nodes to be more transparent
		xValue = filteredCountryData.map(function(d){return d.GDP});
		yValue = filteredCountryData.map(function(d){return d.Global_Competitiveness_Index});
		zValue = filteredCountryData.map(function(d){return d.Population});
		for (var i = 0; i < xValue.length; i++) {
			d3.select(".nodes")
				.append("circle")
				.attr("r",zScale(zValue[i]))
				.attr("cx", xScale(xValue[i]))
				.attr("cy", yScale(yValue[i]))
				.style("fill", circleColourBySize(zScale(zValue[i])))
				.style("opacity", 0.7)
				.style("stroke", "black")
				.style("stroke-width", "0.5")
				.attr("class", "trace-nodes");
		}
		d3.select(".nodes")
			.append("text")
			.text(d.Country)
			.attr("x", xScale(xValue[1]))
			.attr("y", yScale(yValue[1]))
			.attr("class", "trace-nodes")
			.style("font-size", "15pt");
	} else {
		showLineCountries.push(d.Country);
		generateVis();
	}
}

function updateToYear(year) {
	displayYear = year;
	generateVis();
	pauseAnimation();
}

function startAnimation() {
	if(intervalId != null) {
		intervalId = window.setInterval(animation ,1200);
	}
}

function stopAnimation() {
	if(intervalId != null) {
		console.log("stop");
		window.clearInterval(intervalId);
		updateToYear(2007);
	}
}

function pauseAnimation() {
	if(intervalId != null) {
		console.log("pause");
		window.clearInterval(intervalId);
	}
}
