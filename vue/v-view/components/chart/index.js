import { requireVueFilesCom } from "@rainbow_ljy/v-hooks";

const elements = requireVueFilesCom(require.context("./elements", true, /\.(vue|tsx|jsx)$/), {
  name: "RChart",
});

// console.log(elements);
// console.log(Object.keys(elements).join(","));

export const {
  RChartAnnular,
  RChartCake,
  RChartData,
  RChartHoc,
  RChartmerge,
  RChart,
  RChartLinear,
  RChartSerieLinear,
  RChartSerieAnnular,
  RChartSerieAvg,
  RChartSerieCake,
  RChartSerieCount,
  RChartSerieHoc,
  RChartSerie,
  RChartSerieMoney,
  RChartSerieMoneyLinear,
  RChartSerieTreeCake,
  RChartXaxiHoc,
  RChartXaxi,
  RChartYaxiHoc,
  RChartYaxi,
} = elements;
