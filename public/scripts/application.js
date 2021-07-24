// https://www.d3-graph-gallery.com/graph/line_brushZoom.html

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 };
const width = 1200 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
// original: https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv
d3.csv("public/spending.csv", parseData, operateData);

function parseData(d) {
  const date = d3.timeParse("%m/%d/%Y")(d.date);
  const value = d.amount;
  return { date, value };
}

function operateData(data) {
  // Add X axis
  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, width]);
  xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.value)])
    .range([height, 0]);
  yAxis = svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

  // Add a clipPath: everything out of this area won't be drawn.
  svg
    .append("defs")
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

  // Add brushing
  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("end", updateChart);

  // Create the line variable: where both the line and the brush take place
  const line = svg.append("g").attr("clip-path", "url(#clip)");

  // Add the line
  line
    .append("path")
    .datum(data)
    .attr("class", "line") // I add the class line to be able to modify this line later on.
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.value))
    );

  // Add the brushing
  line.append("g").attr("class", "brush").call(brush);

  // A function that update the chart for given boundaries
  function updateChart() {
    // What are the selected boundaries?
    extent = d3.event.selection;

    if (extent) {
      const [xMin, xMax] = extent.map((val) => x.invert(val));
      x.domain([xMin, xMax]);

      xMin.setHours(0);
      xMin.setMinutes(0);
      xMin.setSeconds(0);
      xMin.setMilliseconds(0);

      xMax.setHours(0);
      xMax.setMinutes(0);
      xMax.setSeconds(0);
      xMax.setMilliseconds(0);

      const yMin = data.findIndex((d) => d.date.getTime() >= xMin.getTime());
      const yMax = data.findIndex((d) => d.date.getTime() >= xMax.getTime());
      const dates = data.filter(
        (d) => d.date >= data[yMin].date && d.date <= data[yMax].date
      );
      const max = d3.max(dates, (d) => +d.value);

      y.domain([0, max]);
      svg.select(".y-axis").transition().call(d3.axisLeft(y));
      line.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }

    // Update axis and line position
    xAxis.transition().duration(1000).call(d3.axisBottom(x));
    line
      .select(".line")
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.date))
          .y((d) => y(d.value))
      );
  }

  // If user double click, reinitialize the chart
  svg.on("dblclick", () => {
    x.domain(d3.extent(data, (d) => d.date));
    xAxis.transition().call(d3.axisBottom(x));
    y.domain([0, d3.max(data, (d) => +d.value)]);
    svg.select(".y-axis").transition().call(d3.axisLeft(y));
    line
      .select(".line")
      .transition()
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.date))
          .y((d) => y(d.value))
      );
  });
}
