import React from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Welcome to Health Tracker
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={login}
            sx={{ mt: 3, mb: 2 }}
          >
            Login with Internet Identity
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
