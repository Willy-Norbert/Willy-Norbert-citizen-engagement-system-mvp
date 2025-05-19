
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  TextField, Button, Box, Typography, Container, Paper, 
  Tabs, Tab, Alert, InputAdornment, IconButton
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

axios.defaults.baseURL = "http://localhost:8080";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen', // Default role
    mobile: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', loginData);
      if (res.data.success) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.token);
        setSuccess('Login successful!');
        
        // Redirect based on role
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else if (res.data.user.role === 'department') {
          navigate('/department-dashboard');
        } else {
          navigate('/citizen-dashboard');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const res = await axios.post('/auth/register', registerData);
      if (res.data.success) {
        setSuccess('Registration successful! You can now login.');
        setActiveTab(0); // Switch to login tab
        setRegisterData({
          name: '',
          email: '',
          password: '',
          role: 'citizen',
          mobile: '',
          address: '',
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          mt: 8,
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
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
    
        <img src="/logo.png" alt="Logo watermark"  style={{ width: '100%', height: 'auto' }} />
        </Box>
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 3 
            }}
          >
            <img 
              src="/logo.png" 
              alt="Citizen Voice Logo" 
              style={{ height: '60px', marginRight: '15px' }} 
            />
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#002855',
                  mb: 0.5
                }}
              >
                Citizen Voice
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#666' }}>
                Your voice matters
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            mb: 3,
            bgcolor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem'
                },
                '& .Mui-selected': {
                  color: '#002855',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#0078D7',
                  height: 3
                }
              }}
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {activeTab === 0 ? (
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={loginData.email}
                onChange={handleLoginChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#0078D7' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#0078D7',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0078D7',
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={loginData.password}
                onChange={handleLoginChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#0078D7' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#0078D7',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0078D7',
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.2,
                  backgroundColor: '#002855',
                  '&:hover': {
                    backgroundColor: '#001c3d',
                    boxShadow: '0 4px 8px rgba(0, 40, 85, 0.2)',
                  },
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              >
                Sign In
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="name"
                label="Full Name"
                id="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#0078D7' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#0078D7',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0078D7',
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#0078D7' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#0078D7',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0078D7',
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#0078D7' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#0078D7',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0078D7',
                  },
                }}
              />
              <TextField
                margin="normal"
                fullWidth
                name="mobile"
                label="Mobile Number"
                id="mobile"
                value={registerData.mobile}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: '#0078D7' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#0078D7',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0078D7',
                  },
                }}
              />
              <TextField
                margin="normal"
                fullWidth
                name="address"
                label="Address"
                id="address"
                value={registerData.address}
                onChange={handleRegisterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon sx={{ color: '#0078D7' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#0078D7',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0078D7',
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.2,
                  backgroundColor: '#002855',
                  '&:hover': {
                    backgroundColor: '#001c3d',
                    boxShadow: '0 4px 8px rgba(0, 40, 85, 0.2)',
                  },
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
