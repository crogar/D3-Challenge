// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
// var selectedXAxis = "", selectedYAxis="";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,d3.max(hairData, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);
    return xLinearScale;
}
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.extent(data, d=> d[chosenYAxis])])
      .range([width, 0]);
    return yLinearScale;
}
// function used for updating Axis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
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
    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth*0.70;
    var svgHeight = window.innerHeight*0.60;

    var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
    };

    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.csv("../assets/data/data.csv").then(function(ucbData, err) {
        if (err) throw err;
          // parse data
          ucbData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.obesity = +data.smokes;
            data.obesity = +data.obesity;
        });
        console.log(ucbData)
    }).catch(function(error) {
      console.log(error);
    });
 
}

// When the browser loads, makeResponsive() is called.
makeResponsive();
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);