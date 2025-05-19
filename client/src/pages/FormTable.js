
import React from 'react';
import { Box, Typography, TextField, Button, Paper, Container, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';

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
  marginBottom: '20px',
  '& label.Mui-focused': {
    color: '#0078D7',
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#0078D7',
    },
    '&:hover fieldset': {
      borderColor: '#0078D7',
    },
    borderRadius: '8px',
  },
});

const SubmitButton = styled(Button)({
  backgroundColor: '#002855',
  color: 'white',
  fontWeight: '600',
  padding: '12px 32px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#001c3d',
    boxShadow: '0 4px 8px rgba(0, 40, 85, 0.2)',
  },
});

const FormTable = ({handleSubmit, handleChange, rest}) => {
  return (
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
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              textAlign: 'center', 
              color: '#002855',
              fontWeight: 600,
              mb: 4,
              position: 'relative'
            }}
          >
            Update Form
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <StyledTextField
              label="Name"
              name="name"
              value={rest.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#0078D7' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <StyledTextField
              label="Email"
              type="email"
              name="email"
              value={rest.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#0078D7' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <StyledTextField
              label="Mobile"
              name="mobile"
              type="number"
              value={rest.mobile}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: '#0078D7' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <SubmitButton 
                type="submit" 
                variant="contained"
                endIcon={<SendIcon />}
              >
                Submit
              </SubmitButton>
            </Box>
          </form>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default FormTable;
