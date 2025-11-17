'use client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const UserActivityChart = ({ data }) => {
  const defaultData = [
    { name: "Monday", examTaken: 0 },
    { name: "Tuesday", examTaken: 0 },
    { name: "Wednesday", examTaken: 0 },
    { name: "Thursday", examTaken: 0 },
    { name: "Friday", examTaken: 0 },
    { name: "Saturday", examTaken: 0 },
    { name: "Sunday", examTaken: 0 },
  ];

  // Use default data if no data is provided or data is empty
  const chartData = data && data.length > 0 ? data : defaultData;
  return (
    <div>
      <h3>User Activity (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ right: 30 }}>
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="top"
            iconType="rect"
            iconSize={20}
            wrapperStyle={{ lineHeight: "40px" }}
          />
          <Line type="monotone" dataKey="examTaken" activeDot={{ r: 8 }} />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={"preserveStartEnd"} />
          <YAxis />
          <Tooltip contentStyle={{ backgroundColor: "antiquewhite" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};


export default UserActivityChart;
