import React, { useEffect, useState } from 'react';
import { Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { backend } from '../../declarations/backend';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AggregatedData {
  avgWeight: number | null;
  avgHeartRate: number | null;
  avgSleepDuration: number | null;
}

const Dashboard: React.FC = () => {
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const { principal } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!principal) return;
      try {
        const result = await backend.getAggregatedData();
        setAggregatedData({
          avgWeight: result.avgWeight[0] ?? null,
          avgHeartRate: result.avgHeartRate[0] ?? null,
          avgSleepDuration: result.avgSleepDuration[0] ?? null,
        });
      } catch (error) {
        console.error('Error fetching aggregated data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [principal]);

  if (loading) {
    return <CircularProgress />;
  }

  const chartData = {
    labels: ['Weight', 'Heart Rate', 'Sleep Duration'],
    datasets: [
      {
        label: 'Average Values',
        data: [
          aggregatedData?.avgWeight ?? 0,
          aggregatedData?.avgHeartRate ?? 0,
          aggregatedData?.avgSleepDuration ?? 0,
        ],
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Average Metrics
          </Typography>
          <Typography>Weight: {aggregatedData?.avgWeight?.toFixed(2) ?? 'N/A'} kg</Typography>
          <Typography>Heart Rate: {aggregatedData?.avgHeartRate?.toFixed(2) ?? 'N/A'} bpm</Typography>
          <Typography>Sleep Duration: {aggregatedData?.avgSleepDuration?.toFixed(2) ?? 'N/A'} hours</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Overview Chart
          </Typography>
          <Line data={chartData} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
