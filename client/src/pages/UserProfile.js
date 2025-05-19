
import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  FormGroup
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState({
    inApp: {
      enabled: true,
      statusUpdates: true,
      announcements: true,
      comments: true
    },
    email: {
      enabled: true,
      statusUpdates: true,
      announcements: true,
      comments: true
    }
  });

  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchNotificationPreferences();
  }, []);

  // Fetch user's notification preferences
  const fetchNotificationPreferences = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://willy-norbert-citizen-engagement-system.onrender.com/complaints/notifications/detailed-preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notification preferences');

      const data = await response.json();
      if (data.success && data.preferences) {
        setNotificationPrefs(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      showFeedback('Error fetching notification settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save notification preferences
  const saveNotificationPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://willy-norbert-citizen-engagement-system.onrender.com/complaints/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          preferences: notificationPrefs
        })
      });

      if (!response.ok) throw new Error('Failed to update notification preferences');

      const data = await response.json();
      if (data.success) {
        showFeedback('Notification settings updated successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to update notification preferences');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      showFeedback(`Error: ${error.message}`, 'error');
    }
  };

  // Handle notification settings change
  const handleNotificationChange = (channel, setting) => (event) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [setting]: event.target.checked
      }
    }));
  };

  // Show feedback toast
  const showFeedback = (message, severity = 'info') => {
    setFeedback({
      open: true,
      message,
      severity
    });
  };

  // Close feedback toast
  const closeFeedback = () => {
    setFeedback(prev => ({
      ...prev,
      open: false
    }));
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5">Please log in to view your profile</Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 4 }}>
          User Profile
        </Typography>
        
        <Grid container spacing={4}>
          {/* Left column - User info */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: '#002855', 
                    color: 'white',
                    width: 100, 
                    height: 100,
                    fontSize: '2.5rem',
                    mb: 2
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h5" fontWeight={600}>
                  {user.name}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{
                    bgcolor: '#f5f5f5',
                    px: 2,
                    py: 0.5,
                    mt: 1,
                    borderRadius: 20,
                    textTransform: 'capitalize'
                  }}
                >
                  {user.role}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ color: '#666', mr: 2 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {user.name}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ color: '#666', mr: 2 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ color: '#666', mr: 2 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Mobile Number
                    </Typography>
                    <Typography variant="body1">
                      {user.mobile || 'Not provided'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationOnIcon sx={{ color: '#666', mr: 2, mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {user.address || 'Not provided'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right column - Notification preferences */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0}
              sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                bgcolor: '#002855', 
                color: 'white', 
                px: 3, 
                py: 2, 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <NotificationsActiveIcon sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Notification Settings
                </Typography>
              </Box>
              
              <Box sx={{ p: 3 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      In-App Notifications
                    </Typography>
                    
                    <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                      <CardContent>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={notificationPrefs.inApp.enabled} 
                                onChange={handleNotificationChange('inApp', 'enabled')}
                                color="primary"
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body1">Enable In-App Notifications</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Receive notifications in the application
                                </Typography>
                              </Box>
                            }
                          />
                        </FormGroup>

                        <Divider sx={{ my: 2 }} />
                        
                        <FormGroup sx={{ ml: 2, opacity: notificationPrefs.inApp.enabled ? 1 : 0.5 }}>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={notificationPrefs.inApp.statusUpdates} 
                                onChange={handleNotificationChange('inApp', 'statusUpdates')}
                                disabled={!notificationPrefs.inApp.enabled}
                                color="primary"
                              />
                            }
                            label="Status updates on complaints"
                          />
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={notificationPrefs.inApp.comments} 
                                onChange={handleNotificationChange('inApp', 'comments')}
                                disabled={!notificationPrefs.inApp.enabled}
                                color="primary"
                              />
                            }
                            label="New comments on complaints"
                          />
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={notificationPrefs.inApp.announcements} 
                                onChange={handleNotificationChange('inApp', 'announcements')}
                                disabled={!notificationPrefs.inApp.enabled}
                                color="primary"
                              />
                            }
                            label="System announcements"
                          />
                        </FormGroup>
                      </CardContent>
                    </Card>

                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      Email Notifications
                    </Typography>
                    
                    <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                      <CardContent>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={notificationPrefs.email.enabled} 
                                onChange={handleNotificationChange('email', 'enabled')}
                                color="primary"
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body1">Enable Email Notifications</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Receive notifications via email at {user.email}
                                </Typography>
                              </Box>
                            }
                          />
                        </FormGroup>

                        <Divider sx={{ my: 2 }} />
                        
                        <FormGroup sx={{ ml: 2, opacity: notificationPrefs.email.enabled ? 1 : 0.5 }}>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={notificationPrefs.email.statusUpdates} 
                                onChange={handleNotificationChange('email', 'statusUpdates')}
                                disabled={!notificationPrefs.email.enabled}
                                color="primary"
                              />
                            }
                            label="Status updates on complaints"
                          />
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={notificationPrefs.email.comments} 
                                onChange={handleNotificationChange('email', 'comments')}
                                disabled={!notificationPrefs.email.enabled}
                                color="primary"
                              />
                            }
                            label="New comments on complaints"
                          />
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={notificationPrefs.email.announcements} 
                                onChange={handleNotificationChange('email', 'announcements')}
                                disabled={!notificationPrefs.email.enabled}
                                color="primary"
                              />
                            }
                            label="System announcements"
                          />
                        </FormGroup>
                      </CardContent>
                    </Card>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button 
                        variant="contained" 
                        onClick={saveNotificationPreferences}
                        sx={{
                          bgcolor: '#002855',
                          '&:hover': {
                            bgcolor: '#001c3d'
                          },
                          px: 4
                        }}
                      >
                        Save Settings
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={closeFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeFeedback} severity={feedback.severity} sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserProfile;
