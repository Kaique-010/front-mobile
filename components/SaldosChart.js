import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function SaldosChart({ data, chartConfig }) {
  const chartData = {
    labels: data.map((item) => item.nome).slice(0, 6),
    datasets: [{ data: data.map((item) => Number(item.total)).slice(0, 6) }],
  };

  return (
    <BarChart
      data={chartData}
      width={screenWidth - 32}
      height={220}
      chartConfig={chartConfig}
      verticalLabelRotation={30}
      style={{ marginBottom: 20, borderRadius: 16 }}
    />
  );
}
