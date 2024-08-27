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

interface BiometricData {
  weight: number | null;
  heartRate: number | null;
  sleepDuration: number | null;
  timestamp: bigint;
}

const Trends: React.FC = () => {
  const [biometricData, setBiometricData] = useState<BiometricData[]>([]);
  const [loading, setLoading] = useState(true);
  const { principal } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!principal) return;
      try {
        const endTime = BigInt(Date.now() * 1000000);
        const startTime = endTime - BigInt(30 * 24 * 60 * 60 * 1000000000); // 30 days ago
        const result = await backend.getBiometricData(startTime, endTime);
        setBiometricData(result);
      } catch (error) {
        console.error('Error fetching biometric data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [principal]);

  if (loading) {
    return <CircularProgress />;
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const chartData = {
    labels: biometricData.map((data) => formatDate(data.timestamp)),
    datasets: [
      {
        label: 'Weight (kg)',
        data: biometricData.map((data) => data.weight ?? null),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Heart Rate (bpm)',
        data: biometricData.map((data) => data.heartRate ?? null),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Sleep Duration (hours)',
        data: biometricData.map((data) => data.sleepDuration ?? null),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Biometric Data Trends',
      },
    },
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Trends
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Line options={options} data={chartData} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Trends;
