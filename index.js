//Canvas config
var margin = {top: 40, right: 80, bottom: 20, left: 50};
var width = 1000 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

//initial value
var displayYear = 2007;
var selectedCountry = "";
function yearFilter(value) {
	return (value['Year'] == displayYear);
}
function countryFilter(value) {
	return (value['Country'] == selectedCountry);
}

d3.select(".main")
	.append("mainCanvas")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.style("background", "aliceblue");

var rawDataset;
var filteredData, xScale, yScale, zScale, xAxis, yAxis, xValue, yValue, animation, intervalId;
d3.csv("http://localhost:8000/GCI_CompleteData4.csv")
	.then(function(data) {
		rawDataset = data;
		filteredData = rawDataset.filter(yearFilter);
		//get range of z,y,z dimensions
		xScale = d3.scaleSqrt()
			.domain([0, 158516])
			.range([0, width])
			.nice();
		yScale = d3.scaleSqrt()
			.domain([0, 5.857734475])
			.range([height, 0])
			.nice();			
		zScale = d3.scaleSqrt()
			.domain([0,1386395000])
			.range([0, 65])
			.nice();
		var xAxis = d3.axisBottom()
	            .scale(xScale);

	    var yAxis = d3.axisLeft()
	            .scale(yScale);
		//generate x axis 
		d3.select("mainCanvas")
			.select("g")
			.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(" + 0 + "," + height + ")")
			.call(xAxis)
		//generate y axis
		d3.select("mainCanvas")
			.select("g")
			.append("g")
			.attr("class", "y-axis")
			.call(yAxis);
		//generate nodes group space
		d3.select("mainCanvas")
			.select("g")
			.append("g")
			.attr("class", "nodes")
		// current year information
		d3.select("mainCanvas")
			.select("g")
			.append("text")
			.attr("class", "title")
			.text("Year: " + displayYear)
			.attr("transform", "translate(" + width/2 + "," + -20 + ")");
		//x axis label
		d3.select("mainCanvas")
			.select("g")
			.append("text")
			.attr("class", "x-axis-label")
			.text("GDP")
			.attr("transform", "translate(" + (width+15) + "," + (height+5) + ")");
		//y axis label
		d3.select("mainCanvas")
			.select("g")
			.append("text")
			.attr("class", "y-axis-label")
			.text("Global Competitiveness Index")
			.attr("transform", "translate(" + -10 + "," + -8 + ")")
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
		.transition()
		.duration(1500)
		.text("Year: " + displayYear);
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
	}
	d3.select(".nodes")
		.append("text")
		.text(d.Country)
		.attr("x", xScale(xValue[1]))
		.attr("y", yScale(yValue[1]))
		.style("font-size", "15pt")
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
	console.log("stop");
	window.clearInterval(intervalId);
	updateToYear(2007);
}

function pauseAnimation() {
	console.log("pause");
	window.clearInterval(intervalId);
}
