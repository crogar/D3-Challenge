// Initial Params. Making these variable global, that way can be accessed from anywhere in the code
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
let chartWidth, chartHeight, svgWidth, svgHeight;
var xAxis, yAxis, chartGroup, circlesGroup;  
var margin = {top: 20, right: 40, bottom: 80, left: 30};

// function used for updating x-scale var upon click on axis label or within makeresizible function 
function xScale(data) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,d3.max(data, d => d[chosenXAxis]) * 1.1])
      .range([0, chartWidth]);
    return xLinearScale;
}
function yScale(data) { // function used for updating y-scale var upon click on axis label or within makeresizible function 
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[chosenYAxis])+2])
        .range([chartHeight, 0]);
    return yLinearScale;
}
// function used for updating Axis var upon click on axis label or resizing event
function renderAxes(xLinearScale, yLinearScale) {
    var bottomAxis = d3.axisBottom(xLinearScale);
     xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .transition()
    .duration(1500)
    .call(bottomAxis);
    var leftAxis = d3.axisLeft(yLinearScale);
    yAxis = chartGroup.append("g")
    .transition()
    .duration(1500)
    .call(leftAxis);
}

function render_axislabels(){
    // Create group for two x-axis labels
    var labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
    labelsXGroup.append("text")
        .attr("x", 0).attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty(%)");
    labelsXGroup.append("text")
        .attr("x", 0).attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
    labelsXGroup.append("text")
        .attr("x", 0).attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("House Income (Median)");

    // Create group for two x-axis labels
    chartGroup.append("text")
        .attr("transform", `translate(${chartMargin.left - 0}, ${chartHeight * 0.63}) rotate(-90)`)
        .classed("inactive", true)
        .attr("class", "axis_label y_axis_label text")
        .attr("fill", "pink")
        .attr("opacity", ".5")
        .text("Lacks Healthcare (%)");

}

function renderCircles(data,xLinearScale,yLinearScale,onResize) {
    circlesGroup = chartGroup.selectAll("circle").data(data).enter()
    .append("circle")
    .transition().duration(function(d){return onResize ? 0 : 1000;})
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 17)
    .attr("class", "stateCircle");
}
function updateToolTip(chosenXAxis, circlesGroup) {
    var label;
    if (chosenXAxis === "hair_length") {
      label = "Hair Length:";
    }
    else {
      label = "# of Albums:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }

function makeResponsive() {
    // if the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    // SVG wrapper dimensions are determined by the current width and height of the browser window.
    svgWidth = window.innerWidth*0.75;
    svgHeight = window.innerHeight*0.8;

     chartWidth = svgWidth - margin.left - margin.right;
     chartHeight = svgHeight - margin.top - margin.bottom;
    // Create an SVG wrapper, append an SVG group that will hold our chart,and shift the latter by left and top margins.
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append an SVG group
     chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.csv("../assets/data/data.csv").then(function(ucbData, err) {
        if (err) throw err;
          // parse data
          ucbData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
            data.healthcare = +data.healthcare;
        });
        // Creating Linear Scales
        var xLinearScale = xScale(ucbData);
        var yLinearScale = yScale(ucbData);
        // Rendering both Axis
        renderAxes(xLinearScale,yLinearScale)
        // append initial circles
        renderCircles(ucbData,xLinearScale,yLinearScale,true);
        chartGroup.append("g").selectAll("text").data(ucbData).enter().append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis])+3)
        .classed("stateText",true).text(d => d.abbr);

        render_axislabels();
    }).catch(function(error) {
      console.log(error);
    });
}
// When the browser loads, makeResponsive() is called.
makeResponsive();
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);