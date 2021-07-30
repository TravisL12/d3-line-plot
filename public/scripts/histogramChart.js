const mainWidth = 1000;
const mainHeight = 400;

const margin = { top: 30, right: 30, bottom: 30, left: 40 };
const height = mainHeight - margin.top - margin.bottom;
const width = mainWidth - margin.left - margin.right;

const svg = d3
  .select("#histogramChart")
  .append("svg")
  .attr("width", mainWidth)
  .attr("height", mainHeight)
  .attr("class", "histogram")
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

svg.append("g").attr("class", "bars");

const xScale = d3.scaleBand().range([0, width]).padding(0.2);
const xAxis = svg
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height})`);

const yScale = d3.scaleLinear().range([height, 0]);
const yAxis = svg.append("g").attr("class", "y-axis");

export const drawHistogramChart = (binData) => {
  const bins = d3
    .bin()
    .value((d) => d.amount)
    .thresholds(50);
  const data = bins(binData).filter((d) => d.length > 0);

  xScale.domain(Object.keys(data));
  xAxis
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .text((d) => +d + 1);

  yScale.domain([0, d3.max(data, (d) => d.length)]);
  yAxis.transition().call(d3.axisLeft(yScale));

  svg
    .selectAll(".bars")
    .selectAll(".bar")
    .data(data)
    .join(
      (enter) => {
        const g = enter.append("g").attr("class", "bar");

        g.append("rect")
          .attr("x", (_, i) => xScale(i))
          .attr("y", (d) => yScale(d.length))
          .attr("height", (d) => height - yScale(d.length))
          .attr("width", xScale.bandwidth())
          .attr("stroke-width", 1)
          .attr("stroke", "black")
          .attr("fill", "pink");

        return g;
      },
      (update) => {
        update
          .select("rect")
          .transition()
          .attr("x", (_, i) => xScale(i))
          .attr("y", (d) => yScale(d.length))
          .attr("height", (d) => height - yScale(d.length))
          .attr("width", xScale.bandwidth());
      }
    );
};
