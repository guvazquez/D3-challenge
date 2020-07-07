// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 100,
  bottom: 120,
  left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

function toogleLables(activeLabel, inactive1, inactive2){
  activeLabel
      .classed("inactive",false)
      .classed("active", true)
  inactive1
      .classed("inactive",true)
      .classed("active", false)
  inactive2
      .classed("inactive",true)
      .classed("active", false)
}

function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height,0]);
  return yLinearScale;
}

function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderyAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

function renderlables(stateLabelsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  stateLabelsGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]))
    .attr("dy", d => newYScale(d[chosenYAxis]));
  return stateLabelsGroup;
}

function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
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

d3.csv("./assets/data/data.csv").then(function(censusData) {
  censusData.forEach (function(data){
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.age = +data.age;
    data.smokes = +data.smokes;
  });

  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "10")
    .attr("class", "stateCircle")
  
  var stateLabelsGroup = chartGroup.selectAll("text")
    .data(censusData)
    .enter()
    .append("text")
    .text(d=>d.abbr)
    .attr("dx", d => xLinearScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d[chosenYAxis]))
    .attr("class", "stateText")
    .attr("alignment-baseline", "central")

  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
    
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  var toolTip = d3.select("body")
    .append("div")
    .classed("d3-tip", true);

  var xLabel = "poverty"
  var yLabel = "Obesity"
  var xLabelUnit = "%"
  var yLabelUnit = "%"

  stateLabelsGroup.on("mouseover", function (d) {
    toolTip
      .style("display", "block")
      .html(`<h5>${d.state}</h5> <strong>${xLabel}</strong>: ${d[chosenXAxis]}${xLabelUnit} <br> <strong>${yLabel}</strong>: ${d[chosenYAxis]}${yLabelUnit}`)
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY+ "px");
    })
    .on("mouseout", function(){
      toolTip.style("display", "none");
    });
    
  var YlabelsGroup = chartGroup.append("g")

  var obesityLabel = YlabelsGroup.append("text")  
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 20)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "active")
    .text("Obese (%)")
    .attr("value", "obesity");

  var smokesLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "inactive")
    .text("Smokes (%)")
    .attr("value", "smokes");

  var healthLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 60)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "inactive")
    .text("Lacks HealthCare(%)")
    .attr("value", "healthcare");;

  var XlabelsGroup = chartGroup.append("g")
  var povertyLabel = XlabelsGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
    .attr("class", "active")
    .text("In Poverty (%)")
    .attr("value", "poverty");;

  var ageLabel = XlabelsGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 40})`)
    .attr("class", "inactive")
    .text("Age (Median)")
    .attr("value", "age");;

  var incomeLabel = XlabelsGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 60})`)
    .attr("class", "inactive")
    .text("Household Income (Median)")
    .attr("value", "income");

  XlabelsGroup.selectAll("text")
    .on("click", function(){
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis){
        chosenXAxis = value;
        switch (chosenXAxis){
          case "poverty":
            xLabel = "Poverty";
            xLabelUnit = "%"
            toogleLables(povertyLabel, incomeLabel, ageLabel)
            break;
          case "age":
            xLabel = "Age";
            xLabelUnit = ""
            toogleLables(ageLabel, povertyLabel, incomeLabel)
            break;
          case "income":
            xLabel = "Income";
            xLabelUnit = ""
            toogleLables(incomeLabel, ageLabel, povertyLabel)
            break;
        }
        xLinearScale = xScale(censusData, chosenXAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        stateLabelsGroup = renderlables(stateLabelsGroup,xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);
        xAxis = renderAxes(xLinearScale, xAxis);
      }
    })
  YlabelsGroup.selectAll("text")
    .on("click", function(){
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis){
        chosenYAxis = value;
        switch (chosenYAxis){
          case "obesity":
            yLabel = "Obesity";
            yLabelUnit = "%"
            toogleLables(obesityLabel, smokesLabel, healthLabel)
            break;
          case "smokes":
            yLabel = "Smokes";
            yLabelUnit = "%"
            toogleLables(smokesLabel, obesityLabel, healthLabel)
            break;
          case "healthcare":
            yLabel = "Healthcare"
            yLabelUnit = "%"
            toogleLables( healthLabel, smokesLabel, obesityLabel)
          break;
        };
        yLinearScale = yScale(censusData, chosenYAxis);
        yAxis = renderyAxes(yLinearScale, yAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        stateLabelsGroup = renderlables(stateLabelsGroup,xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);
      }
    })
  }).catch(function(error) {
    console.log(error);
});