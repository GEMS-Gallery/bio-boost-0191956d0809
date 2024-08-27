import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { backend } from '../../declarations/backend';
import { useAuth } from '../context/AuthContext';

interface WorkoutFormData {
  workoutType: string;
  startTime: string;
  endTime: string;
  caloriesBurned: string;
}

interface Workout {
  workoutType: { [key: string]: null };
  startTime: bigint;
  endTime: bigint;
  caloriesBurned: number;
}

const workoutTypes = ['Hiit', 'Cardio', 'Weightlifting', 'Liit', 'Other'];

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
      console.log('Fetched workouts:', result);
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Add Workout
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
                        {workoutTypes.map(type => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
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
    </Grid>
  );
};

export default Workouts;
