'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ExamResultDistributionChart = ({ data }) => {
  // Define colors for the pie chart
  const COLORS = ['#36A2EB', '#FF6384'];
  // Default data if no data is passed as a prop or if data is empty
  const defaultData = [
    { name: 'Passed', value: 70 },
    { name: 'Failed', value: 30 },
  ];

  // Use default data if no data is provided or data is empty
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div>
      <h3>Exam Results Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Legend layout='horizontal' align='center' verticalAlign='top' iconType='rect' iconSize={20} wrapperStyle={{ lineHeight: '20px' }} />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={110}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'antiquewhite' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};



export default ExamResultDistributionChart;
