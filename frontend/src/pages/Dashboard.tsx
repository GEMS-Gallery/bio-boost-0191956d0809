import React, { useEffect, useState } from 'react';
import { Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { backend } from '../../declarations/backend';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AggregatedData {
  avgWeight: number | null;
  avgHeartRate: number | null;
  avgSleepDuration: number | null;
}

interface Workout {
  workoutType: { [key: string]: null };
  startTime: bigint;
  endTime: bigint;
  caloriesBurned: number;
}

const workoutTypes = ['Hiit', 'Cardio', 'Weightlifting', 'Liit', 'Other'];

const Dashboard: React.FC = () => {
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const { principal } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!principal) return;
      try {
        const [aggregatedResult, workoutsResult] = await Promise.all([
          backend.getAggregatedData(),
          backend.getWorkouts()
        ]);
        setAggregatedData({
          avgWeight: aggregatedResult.avgWeight[0] ?? null,
          avgHeartRate: aggregatedResult.avgHeartRate[0] ?? null,
          avgSleepDuration: aggregatedResult.avgSleepDuration[0] ?? null,
        });
        setWorkouts(workoutsResult);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [principal]);

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

  const cumulativeCaloriesData = {
    labels: workouts.map((workout, index) => `Workout ${index + 1}`),
    datasets: [
      {
        label: 'Cumulative Calories Burned',
        data: workouts.reduce((acc, workout, index) => {
          const prevTotal = index > 0 ? acc[index - 1] : 0;
          return [...acc, prevTotal + workout.caloriesBurned];
        }, [] as number[]),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const caloriesPerWorkoutData = {
    labels: workouts.map((workout, index) => `Workout ${index + 1}`),
    datasets: [
      {
        label: 'Calories Burned per Workout',
        data: workouts.map(workout => workout.caloriesBurned),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const initialWorkoutTypeCounts = workoutTypes.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<string, number>);

  const workoutTypeCounts = workouts.reduce((acc, workout) => {
    const type = Object.keys(workout.workoutType)[0];
    if (workoutTypes.includes(type)) {
      acc[type] = (acc[type] || 0) + 1;
    } else {
      acc['Other'] = (acc['Other'] || 0) + 1;
    }
    return acc;
  }, {...initialWorkoutTypeCounts});

  const workoutTypeCountsData = {
    labels: workoutTypes,
    datasets: [
      {
        label: 'Number of Workouts by Type',
        data: workoutTypes.map(type => workoutTypeCounts[type] || 0),
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
      },
    ],
  };

  if (loading) {
    return <CircularProgress />;
  }

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
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Cumulative Calories Burned
          </Typography>
          {workouts.length > 0 ? (
            <Line data={cumulativeCaloriesData} />
          ) : (
            <Typography>No workout data available</Typography>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Calories Burned per Workout
          </Typography>
          {workouts.length > 0 ? (
            <Bar data={caloriesPerWorkoutData} />
          ) : (
            <Typography>No workout data available</Typography>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Number of Workouts by Type
          </Typography>
          {Object.values(workoutTypeCounts).some(count => count > 0) ? (
            <Bar data={workoutTypeCountsData} />
          ) : (
            <Typography>No workout data available</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
