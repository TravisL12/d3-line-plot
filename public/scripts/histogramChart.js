// https://www.d3-graph-gallery.com/graph/line_brushZoom.html
const mainWidth = 600;
const mainHeight = 300;

const margin = { top: 10, right: 30, bottom: 30, left: 60 };
const height = mainHeight - margin.top - margin.bottom;
const width = mainWidth - margin.left - margin.right;

const svg = d3
  .select("#histogramChart")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "histogram");

svg
  .append("g")
  .attr("class", "bars")
  .attr("transform", `translate(${margin.left})`);

const xScale = d3.scaleBand().range([0, width]).padding(0.2);
const xAxis = svg
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(${margin.left}, ${height})`);

const yScale = d3.scaleLinear().range([height, 0]);
const yAxis = svg
  .append("g")
  .attr("class", "y-axis")
  .attr("transform", `translate(${margin.left})`);

export const drawHistogramChart = (data) => {
  xScale.domain(Object.keys(data));
  xAxis.call(d3.axisBottom(xScale));

  yScale.domain([0, 1000]);
  yAxis.transition().call(d3.axisLeft(yScale));

  svg
    .selectAll(".bars")
    .selectAll(".bar")
    .data(data)
    .join((enter) => {
      const g = enter.append("g").attr("class", "bar");

      g.append("rect")
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => height - yScale(d.length))
        .attr("x", (_, i) => xScale(i))
        .attr("y", (d) => yScale(d.length))
        .attr("fill", "black");

      return g;
    });
};
