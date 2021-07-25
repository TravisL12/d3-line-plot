// https://www.d3-graph-gallery.com/graph/line_brushZoom.html

// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 };
const width = 1200 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

const restartDay = (date) => {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

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
  const amount = +d.amount;
  return { date, amount };
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
    .domain([0, d3.max(data, (d) => d.amount)])
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
    .data([data])
    .attr("class", "line") // I add the class line to be able to modify this line later on.
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.amount))
    );

  // Add the brushing
  line.append("g").attr("class", "brush").call(brush);

  function updateLine(duration = 250) {
    line
      .select(".line")
      .transition()
      .duration(duration)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.date))
          .y((d) => y(d.amount))
      );
  }

  // A function that update the chart for given boundaries
  function updateChart() {
    // What are the selected boundaries?
    extent = d3.event.selection;

    if (extent) {
      const [xMin, xMax] = extent.map((val) => restartDay(x.invert(val)));
      x.domain([xMin, xMax]);

      const yMin = data.findIndex((d) => d.date.getTime() >= xMin.getTime());
      const yMax = data.findIndex((d) => d.date.getTime() >= xMax.getTime());
      const dates = data.filter(
        (d) => d.date >= data[yMin].date && d.date <= data[yMax].date
      );

      y.domain([0, d3.max(dates, (d) => d.amount)]);
      svg.select(".y-axis").transition().call(d3.axisLeft(y));
      line.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }

    // Update axis and line position
    xAxis.transition().duration(1000).call(d3.axisBottom(x));
    updateLine(1000);
  }

  // If user double click, reinitialize the chart
  svg.on("dblclick", () => {
    x.domain(d3.extent(data, (d) => d.date));
    xAxis.transition().call(d3.axisBottom(x));

    y.domain([0, d3.max(data, (d) => d.amount)]);
    svg.select(".y-axis").transition().call(d3.axisLeft(y));
    updateLine();
  });
}
