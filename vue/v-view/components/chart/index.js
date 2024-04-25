import { requireVueFilesCom } from "@rainbow_ljy/v-hooks";

const elements = requireVueFilesCom(require.context("./elements", true, /\.(vue|tsx|jsx)$/), {
  name: "RChart",
});

// console.log(elements);
console.log(Object.keys(elements).join(","));

export const {
  RChartAnnular,
  RChartBubble,
  RChartCake,
  RChartData,
  RChartHoc,
  RChartmerge,
  RChart,
  RChartLinear,
  RChartSerieLinear,
  RChartSerieAnnular,
  RChartSerieAvg,
  RChartSerieBubble,
  RChartSerieCake,
  RChartSerieCount,
  RChartSerieHoc,
  RChartSerie,
  RChartSerieMoney,
  RChartSerieMoneyLinear,
  RChartSerieTreeCake,
  RChartXaxiBubble,
  RChartXaxiHoc,
  RChartXaxi,
  RChartYaxiBubble,
  RChartYaxiHoc,
  RChartYaxi,
} = elements;
