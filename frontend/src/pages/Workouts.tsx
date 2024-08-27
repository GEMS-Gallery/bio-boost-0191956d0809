import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { backend } from '../../declarations/backend';
import { useAuth } from '../context/AuthContext';
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

interface WorkoutFormData {
  workoutType: string;
  startTime: string;
  endTime: string;
  caloriesBurned: string;
}

interface Workout {
  workoutType: string;
  startTime: bigint;
  endTime: bigint;
  caloriesBurned: number;
}

const Workouts: React.FC = () => {
  const { control, handleSubmit, reset } = useForm<WorkoutFormData>();
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { principal } = useAuth();

  useEffect(() => {
    fetchWorkouts();
  }, [principal]);

  const fetchWorkouts = async () => {
    if (!principal) return;
    try {
      const result = await backend.getWorkouts();
      setWorkouts(result);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const onSubmit = async (data: WorkoutFormData) => {
    if (!principal) return;
    setLoading(true);
    try {
      const result = await backend.addWorkout(
        { [data.workoutType]: null },
        BigInt(new Date(data.startTime).getTime() * 1000000),
        BigInt(new Date(data.endTime).getTime() * 1000000),
        parseFloat(data.caloriesBurned)
      );
      console.log('Workout added:', result);
      reset();
      fetchWorkouts();
    } catch (error) {
      console.error('Error adding workout:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Workouts
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="workoutType"
                  control={control}
                  defaultValue=""
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Workout Type</InputLabel>
                      <Select {...field} label="Workout Type">
                        <MenuItem value="Hiit">HIIT</MenuItem>
                        <MenuItem value="Cardio">Cardio</MenuItem>
                        <MenuItem value="Weightlifting">Weightlifting</MenuItem>
                        <MenuItem value="Liit">LIIT</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="startTime"
                  control={control}
                  defaultValue=""
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Time"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="endTime"
                  control={control}
                  defaultValue=""
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Time"
                      type="datetime-local"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="caloriesBurned"
                  control={control}
                  defaultValue=""
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Calories Burned"
                      type="number"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Add Workout'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Cumulative Calories Burned
          </Typography>
          <Line data={cumulativeCaloriesData} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Calories Burned per Workout
          </Typography>
          <Bar data={caloriesPerWorkoutData} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Workouts;
