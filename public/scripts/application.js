import { drawHistogramChart } from "./histogramChart.js";
import { drawLineChart } from "./lineChart.js";

export const restartDay = (date) => {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

// original: https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv
// d3.csv("public/spending.csv").then((rows) => {
d3.csv(
  "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv"
).then((rows) => {
  // const cumData = rows.reduce((acc, d, i) => {
  //   const date = d3.timeParse("%m/%d/%Y")(d.date);
  //   const amount = i > 0 ? +d.amount + acc[acc.length - 1].amount : +d.amount;
  //   return [...acc, { ...d, date, amount }];
  // }, []);

  const data = rows.map((d) => {
    const date = d3.timeParse("%Y-%m-%d")(d.date);
    const amount = +d.value;
    return { date, amount };
  });
  // .filter(({ amount }) => amount > 0);
  console.log(data);
  drawLineChart(data, drawHistogramChart);
});
