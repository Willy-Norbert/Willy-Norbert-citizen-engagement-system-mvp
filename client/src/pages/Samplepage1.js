
import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import { 
  TextField, Button, Grid, MenuItem, Typography, Alert, 
  CircularProgress, Paper, Box, InputLabel, Select, 
  FormControl, InputAdornment, Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';

axios.defaults.baseURL = "https://willy-norbert-citizen-engagement-system.onrender.com/";

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
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

const StyledFormControl = styled(FormControl)({
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

const Sample = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    category: '',
    description: '',
  });

  // Check authentication and set authorization header
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUserData(user);
      
      // Pre-fill name and mobile if available
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          mobile: user.mobile || '',
        }));
      }
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/departments/categories/all');
        if (response.data.success && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load complaint categories. Please try again later.");
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post("/complaints", formData);
      
      if (response.data.success) {
        setSuccess("Complaint submitted successfully!");
        
        // Reset form
        setFormData({
          name: userData?.name || '',
          mobile: userData?.mobile || '',
          category: '',
          description: '',
        });
        
        // Redirect to the tracking page for the new complaint
        setTimeout(() => {
          navigate(`/ComplaintTracking/${response.data.data._id}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setError(error.response?.data?.message || "Failed to submit complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md">
        <StyledPaper>
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
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
              Submit a Complaint
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
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Full Name"
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Mobile Number"
                    name="mobile"
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <StyledFormControl fullWidth>
                    <InputLabel id="category-label">Complaint Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      label="Complaint Category"
                      required
                      disabled={loading || categories.length === 0}
                      startAdornment={
                        <InputAdornment position="start">
                          <CategoryIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      }
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </StyledFormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <StyledTextField
                    label="Complaint Description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Please provide as much detail as possible about your complaint"
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <DescriptionIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <SubmitButton
                    type="submit"
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  >
                    {loading ? 'Submitting...' : 'Submit Complaint'}
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

export default Sample;
