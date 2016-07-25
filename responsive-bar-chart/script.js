window.onload = function() {

  var container = document.getElementById("chart");

  // Mike Bostock "margin conventions"
  var margin = {top: 20, right: 20, bottom: 10, left: 60},
      width = container.clientWidth - margin.left - margin.right,
      height = container.clientHeight - margin.top - margin.bottom;

  var x = d3.scale.ordinal();

  var y = d3.scale.linear();

  // the final line sets the transform on <g>, not on <svg>
  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("g")
    .append("text") // just for the title (ticks are automatic)
    .attr("class", "y label")
    .attr("transform", "rotate(-90)") // rotate the text!
    .attr("y", -30)
    .style("text-anchor", "end")
    .text("Frequency");

  d3.tsv("data.tsv", type, function(error, data) {

    redraw(data);

    window.addEventListener("resize", function() {
      redraw(data);
    });

  });

  function type(d) {
    // + coerces to a Number from a String (or anything)
    d.frequency = +d.frequency;
    return d;
  }

  function redraw(data) {

    width = container.clientWidth - margin.left - margin.right;
    height = container.clientHeight - margin.top - margin.bottom;

    d3.select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    x
      .rangeRoundBands([0, width], .1)
      .domain(data.map(function(d) { return d.letter; }));

    y
      .range([height, 0])
      .domain([0, d3.max(data, function(d) { return d.frequency; })]);

    // THIS IS THE ACTUAL WORK!
    var bars = svg.selectAll(".bar")
      .data(data, function(d) { return d.letter; });

    // data that needs DOM = enter() (a set/selection, not an event!)
    bars.enter().append("rect")
      .attr("class", "bar")
      .attr("y", y(0))
      .attr("height", height - y(0));

    bars.exit()
      .transition()
        .duration(300)
      .attr("y", y(0))
      .attr("height", height - y(0))
      .style('fill-opacity', 1e-6)
      .remove();

    // the "UPDATE" set:
    bars.attr("x", function(d) { return x(d.letter); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.frequency); })
      .attr("height", function(d) { return height - y(d.frequency); });

    // D3 Axis - renders a d3 scale in SVG
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("top");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
      .ticks(Math.floor(Math.max(height / 50)), "%")
      .tickSize(-width);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,0)");

    svg.append("g")
        .attr("class", "y axis");

    svg.select(".x.axis")
      .attr("transform", "translate(0,0)")
      .call(xAxis);

    svg.select(".y.axis")
      .call(yAxis);

  }

};