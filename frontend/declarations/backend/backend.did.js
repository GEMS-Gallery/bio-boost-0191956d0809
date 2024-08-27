export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const WorkoutType = IDL.Variant({
    'Weightlifting' : IDL.Null,
    'Hiit' : IDL.Null,
    'Liit' : IDL.Null,
    'Other' : IDL.Null,
    'Cardio' : IDL.Null,
  });
  const Time = IDL.Int;
  const BiometricData = IDL.Record({
    'weight' : IDL.Opt(IDL.Float64),
    'heartRate' : IDL.Opt(IDL.Float64),
    'timestamp' : Time,
    'sleepDuration' : IDL.Opt(IDL.Float64),
  });
  const Workout = IDL.Record({
    'startTime' : Time,
    'endTime' : Time,
    'caloriesBurned' : IDL.Float64,
    'workoutType' : WorkoutType,
  });
  return IDL.Service({
    'addBiometricData' : IDL.Func(
        [IDL.Opt(IDL.Float64), IDL.Opt(IDL.Float64), IDL.Opt(IDL.Float64)],
        [Result],
        [],
      ),
    'addWorkout' : IDL.Func(
        [WorkoutType, Time, Time, IDL.Float64],
        [Result],
        [],
      ),
    'getAggregatedData' : IDL.Func(
        [],
        [
          IDL.Record({
            'avgWeight' : IDL.Opt(IDL.Float64),
            'avgSleepDuration' : IDL.Opt(IDL.Float64),
            'avgHeartRate' : IDL.Opt(IDL.Float64),
          }),
        ],
        ['query'],
      ),
    'getBiometricData' : IDL.Func(
        [Time, Time],
        [IDL.Vec(BiometricData)],
        ['query'],
      ),
    'getLatestBiometricData' : IDL.Func(
        [],
        [IDL.Opt(BiometricData)],
        ['query'],
      ),
    'getWorkouts' : IDL.Func([], [IDL.Vec(Workout)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
