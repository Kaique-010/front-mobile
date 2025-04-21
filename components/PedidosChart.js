import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function PedidosChart({ data, chartConfig }) {
  const pieData = data.map((item, index) => ({
    name: item.cliente,
    population: Number(item.total),
    color: ["#00bfff", "#1e90ff", "#4169e1", "#4682b4", "#5f9ea0"][index % 5],
    legendFontColor: "#fff",
    legendFontSize: 14,
  }));

  return (
    <PieChart
      data={pieData}
      width={screenWidth - 32}
      height={220}
      chartConfig={chartConfig}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
      style={{ marginBottom: 20, borderRadius: 16 }}
    />
  );
}
