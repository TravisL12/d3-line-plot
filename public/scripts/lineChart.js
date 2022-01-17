import { restartDay } from "./application.js";
import { drawHistogramChart } from "./histogramChart.js";

// https://www.d3-graph-gallery.com/graph/line_brushZoom.html
const viewWidth = 1000;
const viewHeight = 500;

const margin = { top: 10, right: 30, bottom: 30, left: 40 };
const width = viewWidth - margin.left - margin.right;
const height = viewHeight - margin.top - margin.bottom;

const svg = d3
  .select("#lineChart")
  .append("svg")
  .attr("width", viewWidth)
  .attr("height", viewHeight)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xScale = d3.scaleTime().range([0, width]);
const xAxis = svg.append("g").attr("transform", `translate(0, ${height})`);

const yScale = d3.scaleLinear().range([height, 0]);
const yAxis = svg.append("g").attr("class", "y-axis");

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

// Create the line variable: where both the line and the brush take place
const line = svg.append("g").attr("clip-path", "url(#clip)");

function updateLine(duration = 250) {
  line
    .select(".line")
    .transition()
    .duration(duration)
    .attr(
      "d",
      d3
        .line()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.amount))
    );
}

function setDomains(data) {
  xScale.domain(d3.extent(data, (d) => d.date));
  xAxis.transition().call(d3.axisBottom(xScale));

  yScale.domain([0, d3.max(data, (d) => d.amount)]);
  svg.select(".y-axis").transition().call(d3.axisLeft(yScale));
}

export function drawLineChart(data) {
  drawHistogramChart(data);

  // Add the line
  line
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5);

  // Add brushing
  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("end", updateChart);

  line.append("g").attr("class", "brush").call(brush);
  setDomains(data);
  updateLine();

  function updateChart(event) {
    const extent = event.selection;

    if (extent) {
      const [xMin, xMax] = extent.map((val) => restartDay(xScale.invert(val)));
      const yMin = data.findIndex((d) => d.date.getTime() >= xMin.getTime());
      const yMax = data.findIndex((d) => d.date.getTime() >= xMax.getTime());
      const dates = data.filter(
        (d) => d.date >= data[yMin].date && d.date <= data[yMax].date
      );
      drawHistogramChart(dates);
      xScale.domain([xMin, xMax]);
      yScale.domain([0, d3.max(dates, (d) => d.amount)]);

      xAxis.transition().duration(1000).call(d3.axisBottom(xScale));
      yAxis.transition().call(d3.axisLeft(yScale));

      line.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }

    updateLine(1000);
  }

  // If user double click, reinitialize the chart
  svg.on("dblclick", () => {
    setDomains(data);
    drawHistogramChart(data);
    updateLine();
  });
}
