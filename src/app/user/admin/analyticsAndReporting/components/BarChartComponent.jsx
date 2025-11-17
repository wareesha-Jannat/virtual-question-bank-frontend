import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export const BarChartComponent = ({data})=>{
  const defaultData = [
    { label: "Category A", value: 0 },
    { label: "Category B", value: 0 },
    { label: "Category C", value: 0 },
    { label: "Category D", value: 0 },
    { label: "Category E", value: 0 },
  ];

  // Use default data if no data is provided or if data is empty
  const chartData = data && data.length > 0 ? data : defaultData;
    return(
<ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
    )
}