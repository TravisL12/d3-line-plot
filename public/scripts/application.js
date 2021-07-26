import { drawHistogramChart } from "./histogramChart.js";
import { drawLineChart } from "./lineChart.js";

export const restartDay = (date) => {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

d3.csv("public/spending.csv").then((rows) => {
  const cumData = rows.reduce((acc, d, i) => {
    const date = d3.timeParse("%m/%d/%Y")(d.date);
    const amount = i > 0 ? +d.amount + acc[acc.length - 1].amount : +d.amount;
    return [...acc, { ...d, date, amount }];
  }, []);

  const data = rows
    .map((d) => {
      const date = d3.timeParse("%m/%d/%Y")(d.date);
      const amount = +d.amount;
      return { ...d, date, amount };
    })
    .filter(({ amount }) => amount > 0);

  const bins = d3
    .bin()
    .value((d) => d.amount)
    .thresholds(500);
  const binsData = bins(data).filter((d) => d.length > 0);

  drawLineChart(data);
  drawHistogramChart(binsData);
});
