// Initial Params. Making these variable global, that way can be accessed from anywhere in the code
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
let chartWidth, chartHeight, svgWidth, svgHeight;
var xAxis, yAxis, chartGroup, circlesGroup, svg;  
var margin = {top: 20, right: 40, bottom: 90, left: 100};

// function used for updating x-scale var upon click on axis label or within makeresizible function 
function xScale(data) {
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
// function tha renders AxisLabels, creating one group for xlabes and another for ylabels
function render_axislabels(){
    // Create group for two x-axis labels
    var labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`)
        .classed('xAxisGroup',true);
    labelsXGroup.append("text")
        .attr("y", 20).attr("x", 0)
        .attr("value", "poverty") // value to grab for event listener
        .attr("class", function(d){return chosenXAxis=='poverty' ? 'xAxis active':'xAxis inactive'})
        .text("In Poverty(%)");
    labelsXGroup.append("text")
        .attr("x", 0).attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .attr("class", function(d){return chosenXAxis=='age' ? 'xAxis active':'xAxis inactive'})
        .text("Age (Median)");
    labelsXGroup.append("text")
        .attr("x", 0).attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .attr("class", function(d){return chosenXAxis=='income' ? 'xAxis active':'xAxis inactive'})
        .text("House Income (Median)");
    // Create group for 3 Y-axis labels
    var labelsYGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)").attr("y", 0 - margin.left).attr("x", 0 - (chartHeight / 2))
        .classed('yAxisGroup',true);
    labelsYGroup.append("text")
        .attr("y", 0 - margin.left+50).attr("x", 0-(chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .attr("class", function(d){return chosenYAxis=='healthcare' ? 'yAxis active':'yAxis inactive'})
        .text("Lacks Healthcare (%)");
    labelsYGroup.append("text")
        .attr("y", 0 - margin.left+30).attr("x", 0-(chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .attr("class", function(d){return chosenYAxis=='smokes' ? 'yAxis active':'yAxis inactive'})
        .text("Smokes (%)");
    labelsYGroup.append("text")
        .attr("y", 0 - margin.left+10).attr("x", 0-(chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .attr("class", function(d){return chosenYAxis=='obesity' ? 'yAxis active':'yAxis inactive'})
        .text("Obese (%)");
}

function renderCircles(data,xLinearScale,yLinearScale) {
    // Dinamically creating a toolTip
    var toolTip = d3.tip().attr("class", "d3-tip").offset([80, -60])
    .html(d => `<strong>${(d.state)}</strong><br>${chosenXAxis}: ${d[chosenXAxis]}<br> ${chosenYAxis}: ${d[chosenYAxis]}`);
    d3.select('g').call(toolTip);

    circlesGroup = chartGroup.selectAll("circle").data(data).enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 5)
    .attr("class", "stateCircle");

    var text_group = chartGroup.append("g").selectAll("text").data(data).enter().append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis])+5)
    .classed("stateText",true).text(d => d.abbr);

    // Animating circles by increasing the radius size
    circlesGroup.transition()
        .duration(100) .delay(function(d,i){ return i * (120 / 4); })
        .attr('r', 17);
    // Updating ToolTip
    circlesGroup.on('mouseover', function(d, i){
        toolTip.show(d,this);
      })
      .on('mouseout', function(d, i){
        toolTip.hide(data);
      }); // the tooltip also works on the State abbreviations.
      text_group.on('mouseover', function(d, i){
        toolTip.show(d,this);
      })
      .on('mouseout', function(d, i){
        toolTip.hide(data);
      });
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
    svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append an SVG group
     chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.csv("../assets/data/data.csv").then(function(ucbData, err) {   //reading our csv file
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
        renderCircles(ucbData,xLinearScale,yLinearScale);
        render_axislabels(); // calling function to render the axis
        // When a new Axislabel is selected we will update the chose Axis
        d3.selectAll("g").selectAll('.xAxisGroup').selectAll('text').on('click', function(){
            chosenXAxis = d3.select(this).attr('value')
            makeResponsive()
        });
        // When a new Axislabel is selected we will update the chose Axis(y)
        d3.selectAll("g").selectAll('.yAxisGroup').selectAll('text').on('click', function(){
            chosenYAxis = d3.select(this).attr('value')
            makeResponsive()
        });
    });
}
// When the browser loads, makeResponsive() is called.
makeResponsive();
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);