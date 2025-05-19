
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import '../App.css';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import { Typography, Paper, Container, Box, InputAdornment, Alert, Slide, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

axios.defaults.baseURL = "http://localhost:8080";

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

const WatermarkContainer = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  opacity: 0.03,
  pointerEvents: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '70%',
  height: 'auto',
  zIndex: 0
});

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

const Enquiry = () => {
  const categories = [
    { value: 'category1', label: 'BroadBand Connection' },
    { value: 'category2', label: 'TV SetupBox Connection' },
  ];
  
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    email: "",
    description: "",
    category: "",
    date: "",
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/engCreate", formData);
      if (response.data.success) {
        setSuccessMessage('Enquiry recorded successfully!');
        setErrorMessage('');
        setFormData({
          name: '',
          mobile: '',
          address: '',
          email: '',
          description: '',
          category: '',
          date: ''
        });
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.data.message || 'Failed to submit enquiry');
      }
    } catch(err) {
      console.log(err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md">
        <StyledPaper elevation={4}>
          <WatermarkContainer>
            <img src={'/logo.png'} alt="Watermark" style={{ width: '100%', height: 'auto' }} />
          </WatermarkContainer>
          
          <Box position="relative" zIndex={1}>
            <Typography 
              variant="h4" 
              align="center" 
              sx={{ 
                mb: 4, 
                color: '#002855', 
                fontWeight: 600,
                position: 'relative'
              }}
            >
              Customer Enquiry
            </Typography>
            
            {successMessage && (
              <Slide direction="down" in={!!successMessage} mountOnEnter unmountOnExit>
                <Alert 
                  icon={<CheckCircleIcon fontSize="inherit" />}
                  severity="success" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {successMessage}
                </Alert>
              </Slide>
            )}
            
            {errorMessage && (
              <Slide direction="down" in={!!errorMessage} mountOnEnter unmountOnExit>
                <Alert 
                  icon={<ErrorIcon fontSize="inherit" />}
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {errorMessage}
                </Alert>
              </Slide>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Name"
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
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
                    label="Category"
                    select
                    fullWidth
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {categories.map((option) => (
                      <MenuItem key={option.value} value={option.label}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Mobile"
                    name="mobile"
                    required
                    value={formData.mobile}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    fullWidth
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
                <Grid item xs={12}>
                  <StyledTextField
                    label="Description"
                    multiline
                    rows={4}
                    fullWidth
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <DescriptionIcon sx={{ color: '#0078D7' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                  <SubmitButton 
                    variant="contained" 
                    type="submit"
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  >
                    {loading ? 'Submitting...' : 'Submit Enquiry'}
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

export default Enquiry;
