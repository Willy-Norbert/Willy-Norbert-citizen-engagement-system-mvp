
import React from 'react';
import { Alert, Box, Typography, Paper, Button, Stack } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const ProjectSetupWarning = () => {
  return (
    <Box sx={{ mt: 2, p: 2, maxWidth: '800px', mx: 'auto' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          backgroundColor: '#fff',
          borderLeft: '4px solid #FFB81C',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WarningIcon sx={{ color: '#FFB81C', mr: 1, fontSize: '2rem' }} />
            <Typography variant="h5" sx={{ color: '#002855', fontWeight: 600 }}>
              Project Configuration Required
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph sx={{ color: '#555' }}>
            This project is missing critical configuration files:
          </Typography>
          
          <Stack spacing={2} sx={{ mb: 3, pl: 2 }}>
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: '4px', borderLeft: '3px solid #0078D7' }}>
              <Typography sx={{ fontWeight: 500 }}>
                <strong>package.json</strong> - Required for project dependencies and scripts
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: '4px', borderLeft: '3px solid #0078D7' }}>
              <Typography sx={{ fontWeight: 500 }}>
                <strong>index.html</strong> - Required for the application's HTML entry point
              </Typography>
            </Box>
            
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: '4px', borderLeft: '3px solid #0078D7' }}>
              <Typography sx={{ fontWeight: 500 }}>
                <strong>vite.config.js</strong> - Required for build configurations
              </Typography>
            </Box>
          </Stack>
          
          <Typography variant="body1" sx={{ mt: 2, mb: 3, color: '#555' }}>
            While the UI has been redesigned, these files are necessary for the application to function properly in preview mode.
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              sx={{ 
                textTransform: 'none', 
                backgroundColor: '#002855',
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: '#001c3d',
                }
              }}
              onClick={() => alert("Please create the required configuration files in your project's root directory.")}
            >
              How to Fix This Issue
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectSetupWarning;
