import React, { useEffect, useState } from 'react';
import { Typography, Paper, CircularProgress } from '@mui/material';
import { backend } from '../../declarations/backend';
import DataTable from 'react-data-table-component';
import { useAuth } from '../context/AuthContext';

interface BiometricData {
  weight: number | null;
  heartRate: number | null;
  sleepDuration: number | null;
  timestamp: bigint;
}

const History: React.FC = () => {
  const [biometricData, setBiometricData] = useState<BiometricData[]>([]);
  const [loading, setLoading] = useState(true);
  const { principal } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!principal) return;
      try {
        const endTime = BigInt(Date.now() * 1000000);
        const startTime = BigInt(0); // Fetch all data
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

  const columns = [
    {
      name: 'Date',
      selector: (row: BiometricData) => new Date(Number(row.timestamp) / 1000000).toLocaleString(),
      sortable: true,
    },
    {
      name: 'Weight (kg)',
      selector: (row: BiometricData) => row.weight?.toFixed(2) ?? 'N/A',
      sortable: true,
    },
    {
      name: 'Heart Rate (bpm)',
      selector: (row: BiometricData) => row.heartRate?.toFixed(2) ?? 'N/A',
      sortable: true,
    },
    {
      name: 'Sleep Duration (hours)',
      selector: (row: BiometricData) => row.sleepDuration?.toFixed(2) ?? 'N/A',
      sortable: true,
    },
  ];

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        History
      </Typography>
      <Paper>
        <DataTable
          columns={columns}
          data={biometricData}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 30, 50]}
          striped
          highlightOnHover
        />
      </Paper>
    </>
  );
};

export default History;
