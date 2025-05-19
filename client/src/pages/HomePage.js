
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Paper, useMediaQuery, useTheme } from '@mui/material';


const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{
      minHeight: '100vh',
      position: 'relative',
      backgroundColor: '#f5f7fa',
      overflow: 'hidden'
    }}>
      {/* Logo watermark */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.05,
          zIndex: 0,
          pointerEvents: 'none',
          width: isMobile ? '90%' : '50%',
          height: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <img src={'/logo.png'} alt="Watermark" style={{ width: '100%', height: 'auto' }} />
      </Box>

      {/* Header */}
      <Box 
        sx={{ 
          backgroundColor: '#002855',
          color: 'white',
          padding: '1rem 0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={8} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src={'/logo.png'} // Ensure this path is correct
                  alt="Citizen Voice Logo" 
                  style={{ height: '40px', marginRight: '10px' }} 
                />
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                  Citizen Voice
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4} sm={6} md={8} sx={{ textAlign: 'right' }}>
              <Button 
                component={Link} 
                to="/login" 
                variant="contained" 
                sx={{
                  backgroundColor: '#FFB81C',
                  color: '#002855',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#e6a619',
                  }
                }}
              >
                Login
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

   
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                color: '#002855',
                mb: 2
              }}
            >
              Your Voice Matters
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              sx={{ 
                color: '#555', 
                mb: 4,
                lineHeight: 1.6
              }}
            >
              A seamless platform connecting citizens with government departments for efficient complaint management and resolution.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button 
                  component={Link} 
                  to="/Enquiry" 
                  fullWidth
                  variant="contained" 
                  size="large"
                  sx={{
                    backgroundColor: '#0078D7',
                    '&:hover': {
                      backgroundColor: '#0062b1',
                    },
                    py: 1.5
                  }}
                >
                  Submit Complaint
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button 
                  component={Link} 
                  to="/ComplaintGrid" 
                  fullWidth
                  variant="outlined" 
                  size="large"
                  sx={{
                    borderColor: '#0078D7',
                    color: '#0078D7',
                    '&:hover': {
                      borderColor: '#0062b1',
                      backgroundColor: 'rgba(0, 120, 215, 0.04)',
                    },
                    py: 1.5
                  }}
                >
                  Track Complaint
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              component="img"
              src="https://www.budgetgorillatrekking.com/wp-content/uploads/2024/10/Visit-the-batwa-tribe.jpg"
              alt="Customer service representative"
              sx={{
                width: '100%',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ backgroundColor: '#f0f5ff', py: 6, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            component="h2" 
            align="center" 
            sx={{ 
              fontWeight: 700, 
              color: '#002855',
              mb: 6
            }}
          >
            How It Works
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: "Submit Your Complaint",
                description: "Fill out a simple form with details about your issue or inquiry."
              },
              {
                title: "Track Progress",
                description: "Monitor the status of your complaint with our real-time tracking system."
              },
              {
                title: "Get Resolution",
                description: "Receive updates and resolution from the appropriate department."
              }
            ].map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 4, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderTop: `4px solid ${index === 0 ? '#FFB81C' : index === 1 ? '#0078D7' : '#002855'}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      color: index === 0 ? '#FFB81C' : index === 1 ? '#0078D7' : '#002855'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            fontWeight: 700, 
            color: '#002855',
            mb: 3
          }}
        >
          Ready to be heard?
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#555', 
            mb: 4,
            mx: 'auto',
            maxWidth: '600px'
          }}
        >
          Join thousands of citizens who are making their communities better through active participation and feedback.
        </Typography>
        <Button 
          component={Link} 
          to="/login" 
          variant="contained" 
          size="large"
          sx={{
            backgroundColor: '#FFB81C',
            color: '#002855',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            '&:hover': {
              backgroundColor: '#e6a619',
            }
          }}
        >
          Register Now
        </Button>
      </Container>

      {/* Footer */}
      <Box 
        sx={{ 
          backgroundColor: '#002855',
          color: 'white',
          py: 4,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                © 2025 Citizen Voice. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' }}}>
              <Typography variant="body2">
                A platform for citizen engagement and complaint management
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
