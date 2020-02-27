// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

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

// Initial Params
var chosenXAxis = "age";
var chosenYAxis = "smokes";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
      d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderTexts(txtGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  txtGroup.transition()
    .duration(1000)
    .attr("x", d=>newXScale(d[chosenXAxis]))
    .attr("y", d=>newYScale(d[chosenYAxis]))
  return txtGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "age") {
    var xlabel = "Age: ";
  }
  else if (chosenXAxis === "income") {
    var xlabel = "Income: $";
  }
  else {
    var xlabel = "Poverty: ";
  }

  if (chosenYAxis === "smokes") {
    var ylabel = "Smokes: ";
  }
  else if (chosenYAxis === "obesity") {
    var ylabel = "Obesity: ";
  }
  else {
    var ylabel = "Healthcare: ";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      console.log(d.abbr)
      if (chosenXAxis === "age" || chosenXAxis === "income") {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]} <br>${ylabel} ${d[chosenYAxis]}%`)
      }
      else {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}% <br>${ylabel} ${d[chosenYAxis]}%`)
      }
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this)
    d3.select(this).style("stroke", "black");
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data, this)
      d3.select(this).style("stroke", "white");
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(healthData, err) {
  if (err) throw err; 

  // parse data
  healthData.forEach(function(data) {
    data.age = +data.age;
    data.income = +data.income;
    data.poverty = +data.poverty;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  // add a variable for the circle with and enter and and then select and append so the data is only once
  // Define the data for the circles + text
  var circles = chartGroup.selectAll("g circle")
    .data(healthData)
    .enter()
    .append("g");

  var circlesGroup = circles.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .classed("stateCircle", true)
    .attr("opacity", ".5");

  var txtGroup = circles.append("text")
    .text(d => d.abbr)
    .style("font-size", "10px")
    .attr("x", d=>xLinearScale(d[chosenXAxis]))
    .attr("y", d=>yLinearScale(d[chosenYAxis]))
    .classed("stateText", true)
    .style("font-weight", "800")


    // Create group for  2 x- axis labels
  var labelsXGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
  var ageLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Age average");

  var incomeLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  var povertyLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("Poverty (%)");

  var labelsYGroup = chartGroup.append("g")
    .attr("transform", `translate(${0-margin.left/4}, ${height/2})`);

  var smokesLabel = labelsYGroup.append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("transform", "rotate(-90)")
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokes (%)");

  var obeseLabel = labelsYGroup.append("text")
    .attr("x", 0)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  var healthcareLabel = labelsYGroup.append("text")
    .attr("x", 0)
    .attr("y", -60)
    .attr("transform", "rotate(-90)")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsXGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        // console.log (`x value ${chosenXAxis}`)

        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        txtGroup = renderTexts(txtGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else   {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
     }

    });

    labelsYGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      // y axis
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;
        // console.log (`y value ${chosenYAxis}`)

        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        txtGroup = renderTexts(txtGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // changes classes to change bold text
        if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else   {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
