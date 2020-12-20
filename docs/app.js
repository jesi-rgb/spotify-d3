// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 110, left: 60}
    // width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const fullParser = d3.timeParse("%Y-%m-%d %H:%M");
const noTimeParser = d3.timeParse("%Y-%m-%d");

var top10chartDiv = document.getElementById("top10-chart");
var top10width = top10chartDiv.clientWidth;

var hourChartDiv = document.getElementById("hours-chart");
var hourWidth = hourChartDiv.clientWidth;

var yearChartDiv = document.getElementById("year-chart");
var yearWidth = yearChartDiv.clientWidth;


// append the canvas object to the body of the page
var canvas = d3.select("#top10-chart")
            .append("svg")
              // .attr("width", width + margin.left + margin.right)
              // .attr("height", height + margin.top + margin.bottom)
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", "0 0 960 500")
            .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

var hours_cv = d3.select("#hours-chart")
            .append("svg")
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", "0 0 960 500")
            .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

var yearDensity_cv = d3.select("#year-chart")
            .append("svg")
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", "0 0 960 500")
            .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");


// Parse the Data
d3.json("./data/full_story.json", function(data) {

  makeBarChart(data);
  listeningDensityPerDay(data);
  yearDensity(data);

})

function yearDensity(data){
  
  const gr_days = _.countBy(data, d => {
    var noTime = d.endTime.split(' ')[0]
    var parsed = noTimeParser(noTime);
    return parsed;
  });


  const gr_days_arr = Object.keys(gr_days).map(d => {
    const aux = {};
    var auxDate = new Date(d);
    if(auxDate > new Date("2020-01-01")){
      aux.date = new Date(d);
      aux.count = gr_days[d];
    }
    return aux;
  })



  var x = d3.scaleTime()
        .domain(d3.extent(gr_days_arr, d => d.date))
        .range([ 0, yearWidth ])
        .nice();

        
  yearDensity_cv.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
        
  var y = d3.scaleLinear()
        .domain([0, d3.max(gr_days_arr, d => +d.count)])
        .range([ height, 0 ])
        .nice();
        
  yearDensity_cv.append("g")
                .call(d3.axisLeft(y));


  var line = d3.line()
    .defined(d => !isNaN(d.count))
    .x(d => x(d.date))
    .y(d => y(d.count))


    // TEXT ANNOTATION
  var bisect = d3.bisector(function(d) { return d.date; }).left;

  // var focus = yearDensity_cv
  //   .append('g')
  //   .append('circle')
  //     .style("fill", "none")
  //     .attr("stroke", "black")
  //     .attr('r', 8.5)
  //     .style("opacity", 0)

  var focusText = d3.select("#year-tooltip")
          .append("span")
          .append('text')
            .style("opacity", 0)
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle")


    function mouseover() {
      // focus.style("opacity", 1)
      focusText.style("opacity",1)
    }
          
    function mousemove() {
      // recover coordinate we need
      var x0 = x.invert(d3.mouse(this)[0]);
      var i = bisect(gr_days_arr, x0, 1);
      selectedData = gr_days_arr[i];

      focusText
        .html("Count: " + selectedData.count)
    }
    function mouseout() {
      // focus.style("opacity", 0)
      focusText.style("opacity", 0)
    }


  yearDensity_cv.append("path")
        .datum(gr_days_arr)
          .attr('id', "yearLine")
          .attr("fill", "none")
          .attr("stroke-width", 1.5)
          .attr('stroke', "red")
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("d", line)

  yearDensity_cv.append('rect')
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr('width', yearWidth)
          .attr('height', height)
          .on('mouseover', mouseover)
          .on('mousemove', mousemove)
          .on('mouseout', mouseout);

  

}

function listeningDensityPerDay(data){
  const hours = data.map(d => fullParser(d.endTime).getHours())
  const gr_hours = _.countBy(hours)

  const hist = Object.keys(gr_hours).map(d => {
    const aux = {};
    aux.bin = d;
    aux.count = gr_hours[d];
    return aux;
  })

  hours_cv.append("text")
        .attr("x", (hourWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text("Listening density per hour");

  var x = d3.scaleBand()
    .range([ 0, hourWidth ])
    .domain(hist.map(d => d.bin))
    .padding(0.2);

  hours_cv.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    
  
  var y = d3.scaleLinear()
    .domain([0, d3.max(hist.map(d => d.count))])
    .range([ height, 0])
    .nice();

  hours_cv.append("g")
    .call(d3.axisLeft(y));

  // tooltip
  var tooltip = d3.select("#hours-tooltip")
              .append("span")
              .style("opacity", 0)
              .attr("class", "tooltip")
              // .style("background-color", "black")
              // .style("color", "white")
              .style("border-radius", "5px")
              .style("padding", "10px")

  var showTooltip = function(d) {
    tooltip
      .transition()
      .duration(100)
      .style("opacity", 1)

    tooltip
      .html("Count: " + d.count)
  }

  var hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(100)
      .style("opacity", 0)
  }

  hours_cv.selectAll("mybar")
    .data(hist)
    .enter()
    .append("rect")
      .attr("x", d => x(d.bin))
      .attr("y", d => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.count))
      .on("mouseover", showTooltip )
      .on("mouseleave", hideTooltip )

}

function makeBarChart(data){
  const groups = _.countBy(data, "artistName");

  const group_arr = Object.keys(groups).map(d => {
    const aux = {};
    aux.artistName = d;
    aux.count = groups[d];
    return aux
  })

  const sorted = _.orderBy(group_arr, "count", ['desc'])
  
  // TOP 10 ARTISTS IN THIS FILE
  const top_10 = sorted.slice(0, 10);

  canvas.append("text")
      .attr("x", (top10width / 2))             
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .text("Top 10 Artists");

  // X axis
  var x = d3.scaleBand()
    .range([ 0, top10width ])
    .domain(top_10.map(function(d) { return d.artistName; }))
    .padding(0.2)

  canvas.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(top_10.map(d => d.count)) + 5 * 10])
    .range([ height, 0])
    .nice();

  canvas.append("g")
    .call(d3.axisLeft(y));

  // // Bars
  canvas.selectAll("mybar")
    .data(top_10)
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.artistName); })
      .attr("y", function(d) { return y(d.count); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.count); })

}