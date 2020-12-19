// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 110, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


// append the canvas object to the body of the page
var canvas = d3.select("#top10")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

var hours_cv = d3.select("#hours")
            .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");


// Parse the Data
d3.json("./data/full_story.json", function(data) {

  makeBarChart(data);
  makeDatesThing(data);

})

function makeDatesThing(data){
  const parser = d3.timeParse("%Y-%m-%d %H:%M");
  const hours = data.map(d => parser(d.endTime).getHours())
  const gr_hours = _.countBy(hours)

  const hist = Object.keys(gr_hours).map(d => {
    const aux = {};
    aux.bin = d;
    aux.count = gr_hours[d];
    return aux;
  })


  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(hist.map(d => d.bin))
    .padding(0.2);

  hours_cv.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
  
  var y = d3.scaleLinear()
    .domain([0, d3.max(hist.map(d => d.count)) + 5 * 10])
    .range([ height, 0]);

  hours_cv.append("g")
    .call(d3.axisLeft(y));

  // tooltip
  var tooltip = d3.select("#hours")
              .append("span")
              .style("opacity", 0)
              .attr("class", "tooltip")
              .style("background-color", "black")
              .style("color", "white")
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

  // X axis
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(top_10.map(function(d) { return d.artistName; }))
    .padding(0.2);

  canvas.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(top_10.map(d => d.count)) + 5 * 10])
    .range([ height, 0]);

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