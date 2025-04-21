import axios from "axios";

export const fetchDashboardData = async () => {
  const response = await axios.get("http://192.168.0.13:8000/api/dashboard/");
  return response.data;
};
