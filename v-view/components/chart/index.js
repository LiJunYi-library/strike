import { requireVueFilesCom } from "@rainbow_ljy/v-hooks";

const elements = requireVueFilesCom(require.context("./elements", true, /\.(vue|tsx|jsx)$/), {
  name: "RChart",
  useUnDefault: false,
});

console.log(Object.keys(elements).join(","));

export const {
  RChartAnnular,
  RChartCake,
  RChartData,
  RChart,
  RChartLinear,
  RChartSerieAnnular,
  RChartSerieAvg,
  RChartSerieCake,
  RChartSerieCount,
  RChartSerie,
  RChartSerieMoney,
  RChartSerieLinear,
  RChartSerieMoneyLinear,
  RChartSerieTreeCake,
  RChartXaxi,
  RChartYaxi,
} = elements;
