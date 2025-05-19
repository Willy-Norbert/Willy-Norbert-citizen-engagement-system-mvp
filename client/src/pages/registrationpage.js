
import React, {useState, useEffect} from 'react';
import Navbar from '../Components/Navbar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Typography, Paper, Container, Box, InputAdornment, Alert, Slide } from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LockIcon from '@mui/icons-material/Lock';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

axios.defaults.baseURL="http://localhost:8080";

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '#fff',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #002855, #0078D7)'
  }
}));

const StyledTextField = styled(TextField)({
  marginBottom: '16px',
  '& label.Mui-focused': {
    color: '#0078D7',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '&.Mui-focused fieldset': {
      borderColor: '#0078D7',
    },
    '&:hover fieldset': {
      borderColor: '#0078D7',
    },
  },
});

const SubmitButton = styled(Button)({
  backgroundColor: '#002855',
  color: 'white',
  fontWeight: '600',
  padding: '12px 30px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#001c3d',
    boxShadow: '0 4px 8px rgba(0, 40, 85, 0.2)',
  },
});

const Register = () => {
  const [connectionStatus, setConnectionStatus] = useState('⏳ Checking connection...');
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    email: "",
    alternate: "",
    date: "",
    password: "",
    role: "citizen" // Default role
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Test backend connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Attempting to connect to backend at:', axios.defaults.baseURL + '/api/ping');
        const response = await axios.get('/api/ping');
        console.log('Backend connection test response:', response.data);
        setConnectionStatus('✅ Connected to backend');
      } catch (err) {
        console.error('Backend connection test failed:', err.message);
        setConnectionStatus('❌ Cannot connect to backend - ' + (err.message || 'Unknown error'));
      }
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending registration request to:", "/api/auth/register");
      console.log("Form data:", formData);
      
      // Using the correct endpoint that matches the backend route
      const response = await axios.post("/api/auth/register", formData);
      
      console.log("Registration response:", response.data);
      
      if (response.data.success) {
        setSuccess("Registered Successfully.");
        setFormData({
          name: "",
          mobile: "",
          address: "",
          email: "",
          alternate: "",
          date: "",
          password: "",
          role: "citizen"
        });
        setError('');
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      setSuccess('');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Navbar/>
      <Container maxWidth="md">
        <StyledPaper elevation={4}>
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            to:'/',
            transform: 'translate(-50%, -50%)',
            opacity: 0.03,
            pointerEvents: 'none',
            width: '70%'
          }}>
            <img src="/logo.png" alt="Logo watermark" style={{ width: '100%', height: 'auto' }} />
          </Box>
          
          <Box position="relative" zIndex={1}>
            <Typography 
              variant="h4" 
              align="center" 
              sx={{ 
                mb: 3, 
                color: '#002855', 
                fontWeight: 600
              }}
            >
              Customer Registration
            </Typography>
            
            <Typography 
              align="center"
              color={connectionStatus.includes('✅') ? 'success.main' : 'error.main'}
              sx={{ 
                mt: 1, 
                mb: 2,
                fontSize: '0.9rem',
                backgroundColor: connectionStatus.includes('✅') ? 'rgba(46, 125, 50, 0.1)' : 'rgba(198, 40, 40, 0.1)',
                py: 0.5,
                px: 2,
                borderRadius: '20px',
                display: 'inline-block'
              }}
            >
              {connectionStatus}
            </Typography>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                {success}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <StyledTextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <StyledTextField
                    label="Mobile"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <StyledTextField
                    label="Alternate Mobile"
                    name="alternate"
                    required
                    value={formData.alternate}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <StyledTextField
                    label="Address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <StyledTextField
                    label="Email"
                    type='email'
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <StyledTextField
                    label="Password"
                    type='password'
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <StyledTextField
                    type='date'
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    label="Date"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 2
                }}>
                  <SubmitButton 
                    variant="contained" 
                    type="submit"
                    endIcon={<AppRegistrationIcon />}
                  >
                    Register
                  </SubmitButton>
                </Grid>
              </Grid>
            </form>
          </Box>
        </StyledPaper>
      </Container>
    </>
  );
};

export default Register;
