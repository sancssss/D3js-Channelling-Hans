#D3js-Channelling-Hans
Applied D3.js to achieve Hans Rosling's data visualisation. 
<br>
The visualisation based on the World Economic Forum Global Competitiveness Report http://reports.weforum.org/global-competitiveness-index-2017-2018/.
<br>
The missing data is replaced by the average value by using RapidMiner.
<br>
![img1](https://s3-eu-west-1.amazonaws.com/d3js-channelling-hans/2.png)
<br>
![img2](https://s3-eu-west-1.amazonaws.com/d3js-channelling-hans/1.png)
##Introduction
###Main Canvas
* Countries of the world described by GDP and Global Competitive Index mapped to x-axis and y-axis position respectively, each bubble represent a country.
* Different size of population ranges of the country has different colours (mapping colours to population).
* For those have huge popluation countries directly show the country name labels, while for the other countries, the country name will be displayed when the **Move Mouse Over** the bubble.
* Ability to view data for a particular year (2007 - 2017).
* Ability to animate the change in country statistics from year to year (2007 – 2017). By clicking the buttons to control animation status (**Play, Stop and Pause**).
* By pressing **Alt + Right Mouse Click** at the same time, the animation will be stopped, clicked country will show its bubble trace (The all of data of the clicked country from 2007 to 2017).

###Extra Canvas
* Add an extra connected visualisation that shows the individual pillars of the Global Competitiveness Index by line chart for a **clicked** country.
* Each turning point of the line represent a pillar of the GC index (from pillar 1 to pillar 12). The chart is updated as the year is changed.
* Users can **Select(Click)** one or multiple country bubbles to compare different countries individual pillars data (maximum 5 countries) in different years.
* All lines in the extra canvas is mapped to different colours for distinguishing different countries. The Country name and the index will show simultaneously.
* Users can click "**Reset Line Chart**" button to reset the extra canvas.

###Depolyment
* Deployed on Amazon S3: [Click here](https://s3-eu-west-1.amazonaws.com/d3js-channelling-hans/index.html)


