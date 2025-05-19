
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Typography, Container, Grid, Paper, Button, 
  Tab, Tabs, Card, CardContent, CardActions, 
  Divider, CircularProgress, Alert, Chip,
  List, ListItem, ListItemText, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Avatar, IconButton
} from '@mui/material';
import axios from 'axios';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DoneIcon from '@mui/icons-material/Done';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';

import Navbar from '../Components/Navbar';

axios.defaults.baseURL = "https://willy-norbert-citizen-engagement-system.onrender.com/";

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Set authorization header for all requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Load user data from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'citizen') {
      // Redirect if not citizen user
      navigate('/login');
    } else {
      setUserData(user);
    }
  }, [navigate]);

  // Fetch complaints for the citizen
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/complaints');
        if (response.data.success) {
          setComplaints(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
        setError("Failed to load your complaints");
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchComplaints();
    }
  }, [userData]);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get('/announcements');
        if (response.data.success) {
          setAnnouncements(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
        setError("Failed to load announcements");
      }
    };

    fetchAnnouncements();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // View complaint details
  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setViewDialog(true);
  };

  // Submit feedback on a resolved complaint
  const handleFeedbackSubmit = async () => {
    try {
      if (!selectedComplaint || !feedback.trim()) return;
      
      const response = await axios.post(`/complaints/${selectedComplaint._id}/comment`, {
        message: `Citizen Feedback: ${feedback}`
      });
      
      if (response.data.success) {
        setFeedbackDialog(false);
        setFeedback('');
        
        // Update the complaint in the local state
        const updatedComplaints = complaints.map(c => 
          c._id === selectedComplaint._id 
            ? { 
                ...c, 
                statusUpdates: [...(c.statusUpdates || []), { 
                  message: `Citizen Feedback: ${feedback}`,
                  timestamp: new Date()
                }]
              } 
            : c
        );
        
        setComplaints(updatedComplaints);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback");
    }
  };

  // Create a new complaint
  const handleNewComplaint = () => {
    navigate('/Sample'); // Redirect to complaint form page
  };

  // Logout handling
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Status chip renderer
  const renderStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" color="warning" size="small" />;
      case 'in-progress':
        return <Chip icon={<HourglassEmptyIcon />} label="In Progress" color="info" size="small" />;
      case 'resolved':
        return <Chip icon={<DoneIcon />} label="Resolved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label={status} />;
    }
  };

  // Filter complaints based on tab
  const getFilteredComplaints = () => {
    switch (tabValue) {
      case 0: // All
        return complaints;
      case 1: // Pending
        return complaints.filter(c => c.status === 'pending');
      case 2: // In Progress
        return complaints.filter(c => c.status === 'in-progress');
      case 3: // Resolved
        return complaints.filter(c => c.status === 'resolved');
      default:
        return complaints;
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          position: 'relative'
        }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#002855', fontWeight: 700 }} className="fade-in">
              Citizen Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" className="slide-in">
              Welcome back, {userData?.name || 'Citizen'}
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(198, 40, 40, 0.04)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Logout
          </Button>
          
          {/* Subtle watermark */}
          <Box 
            component="img" 
            src="/logo.png" 
            alt="Logo Watermark" 
            className="watermark"
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

        {/* Summary Cards */}
        <Grid container spacing={3} className="fade-in">
          <Grid item xs={12} md={4}>
            <Card className="dashboard-card">
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#0078D7', mr: 2 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Typography color="textSecondary" variant="h6">
                    Total Complaints
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {complaints.length}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  All complaints submitted by you
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="text" 
                  component={Link}
                  to="/ComplaintGrid"
                  sx={{ color: '#0078D7' }}
                >
                  View All Complaints
                </Button>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="dashboard-card" sx={{ borderTop: '4px solid #0277BD' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#0277BD', mr: 2 }}>
                    <HourglassEmptyIcon />
                  </Avatar>
                  <Typography color="textSecondary" variant="h6">
                    In Progress
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {complaints.filter(c => c.status === 'in-progress').length}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Complaints being processed
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="text" 
                  onClick={() => setTabValue(2)}
                  sx={{ color: '#0277BD' }}
                >
                  View In-Progress
                </Button>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="dashboard-card" sx={{ borderTop: '4px solid #2E7D32' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#2E7D32', mr: 2 }}>
                    <DoneIcon />
                  </Avatar>
                  <Typography color="textSecondary" variant="h6">
                    Resolved
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {complaints.filter(c => c.status === 'resolved').length}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Successfully resolved complaints
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="text" 
                  onClick={() => setTabValue(3)}
                  sx={{ color: '#2E7D32' }}
                >
                  View Resolved
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ color: '#002855', fontWeight: 600 }}>
            Quick Actions
          </Typography>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 4 }} className="slide-in">
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth
              variant="contained" 
              color="primary" 
              startIcon={<FeedbackIcon />}
              onClick={handleNewComplaint}
              sx={{
                py: 2,
                borderRadius: '10px',
                backgroundColor: '#002855',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#001c3d',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 20px rgba(0, 40, 85, 0.3)'
                }
              }}
            >
              New Complaint
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth
              variant="outlined" 
              startIcon={<AnnouncementIcon />}
              onClick={() => setTabValue(4)}
              sx={{
                py: 2,
                borderRadius: '10px',
                borderColor: '#FFB81C',
                color: '#FFB81C',
                '&:hover': {
                  borderColor: '#e39700',
                  backgroundColor: 'rgba(255, 184, 28, 0.04)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 20px rgba(255, 184, 28, 0.2)'
                }
              }}
            >
              Announcements
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth
              variant="outlined" 
              startIcon={<DashboardIcon />}
              component={Link}
              to="/ComplaintGrid"
              sx={{
                py: 2,
                borderRadius: '10px',
                borderColor: '#0078D7',
                color: '#0078D7',
                '&:hover': {
                  borderColor: '#005ea8',
                  backgroundColor: 'rgba(0, 120, 215, 0.04)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 20px rgba(0, 120, 215, 0.2)'
                }
              }}
            >
              View All Complaints
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              fullWidth
              variant="outlined" 
              color="secondary"
              component={Link}
              to="/profile"
              sx={{
                py: 2,
                borderRadius: '10px',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 20px rgba(156, 39, 176, 0.2)'
                }
              }}
            >
              My Profile
            </Button>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ 
          width: '100%', 
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }} className="fade-in">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              '& .MuiTabs-indicator': {
                height: '3px',
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab 
              label="All Complaints" 
              icon={<AssignmentIcon />} 
              iconPosition="start"
              sx={{ 
                fontWeight: 600,
                minHeight: '64px',
                textTransform: 'none'
              }} 
            />
            <Tab 
              label="Pending" 
              icon={<PendingIcon />} 
              iconPosition="start"
              sx={{ 
                fontWeight: 600,
                minHeight: '64px',
                textTransform: 'none'
              }} 
            />
            <Tab 
              label="In Progress" 
              icon={<HourglassEmptyIcon />} 
              iconPosition="start"
              sx={{ 
                fontWeight: 600,
                minHeight: '64px',
                textTransform: 'none'
              }} 
            />
            <Tab 
              label="Resolved" 
              icon={<DoneIcon />} 
              iconPosition="start"
              sx={{ 
                fontWeight: 600,
                minHeight: '64px',
                textTransform: 'none'
              }} 
            />
            <Tab 
              label="Announcements" 
              icon={<AnnouncementIcon />} 
              iconPosition="start"
              sx={{ 
                fontWeight: 600,
                minHeight: '64px',
                textTransform: 'none'
              }} 
            />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {/* Loading State */}
            {loading && tabValue < 4 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress sx={{ color: '#0078D7' }} />
              </Box>
            )}

            {/* Tabs 0-3: Complaints Lists */}
            {tabValue < 4 && !loading && getFilteredComplaints().length === 0 && (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="body1">No complaints found in this category.</Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<FeedbackIcon />}
                  onClick={handleNewComplaint}
                  sx={{ mt: 2 }}
                >
                  Submit New Complaint
                </Button>
              </Box>
            )}

            {tabValue < 4 && !loading && getFilteredComplaints().map((complaint) => (
              <Card key={complaint._id} sx={{ mb: 2, borderRadius: '10px', overflow: 'hidden' }} className="slide-in">
                <CardContent sx={{ pb: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6">{complaint.category}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Submitted on {new Date(complaint.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      {renderStatusChip(complaint.status)}
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {complaint.description?.length > 100 
                      ? `${complaint.description.substring(0, 100)}...` 
                      : complaint.description}
                  </Typography>
                  
                  {complaint.departmentId && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Assigned to: {complaint.departmentId.name || 'Department'}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ pt: 0, pb: 2, px: 2, justifyContent: 'flex-end' }}>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewComplaint(complaint)}
                    sx={{ 
                      mr: 1,
                      '&:hover': { backgroundColor: 'rgba(0, 120, 215, 0.04)' }
                    }}
                  >
                    View Details
                  </Button>
                  
                  {complaint.status === 'resolved' && (
                    <Button 
                      size="small" 
                      startIcon={<FeedbackIcon />}
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setFeedbackDialog(true);
                      }}
                      sx={{ 
                        mr: 1,
                        color: '#2E7D32',
                        '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.04)' }
                      }}
                    >
                      Add Feedback
                    </Button>
                  )}
                  
                  <Button 
                    size="small" 
                    component={Link}
                    to={`/ComplaintTracking/${complaint._id}`}
                    startIcon={<AssignmentIcon />}
                    variant="contained"
                    color="primary"
                    sx={{ 
                      borderRadius: '8px',
                      textTransform: 'none'
                    }}
                  >
                    Track Progress
                  </Button>
                </CardActions>
              </Card>
            ))}

            {/* Tab 4: Announcements */}
            {tabValue === 4 && (
              <Box className="fade-in">
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AnnouncementIcon sx={{ color: '#FFB81C', mr: 1 }} />
                  <Typography variant="h6">
                    Public Announcements
                  </Typography>
                </Box>
                
                {announcements.length === 0 ? (
                  <Box sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="body1">No announcements available at this time.</Typography>
                  </Box>
                ) : (
                  <List sx={{ 
                    bgcolor: 'background.paper',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    {announcements.map((announcement, index) => (
                      <React.Fragment key={announcement._id}>
                        <ListItem 
                          alignItems="flex-start"
                          sx={{ 
                            p: 3,
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } 
                          }}
                        >
                          <ListItemIcon sx={{ mt: 1 }}>
                            <NotificationsIcon sx={{ color: '#FFB81C' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#002855', mb: 1 }}>
                                {announcement.title}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    color: 'text.primary', 
                                    mb: 2,
                                    whiteSpace: 'pre-line' 
                                  }}
                                >
                                  {announcement.content}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Posted by: {announcement.departmentId?.name || 'Department'} • {new Date(announcement.publishDate || announcement.createdAt).toLocaleDateString()}
                                  </Typography>
                                  {announcement.publishDate && new Date(announcement.publishDate) > new Date() && (
                                    <Chip 
                                      label="New" 
                                      size="small"
                                      color="primary"
                                      sx={{ fontWeight: 600 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < announcements.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* View Complaint Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflowY: 'auto'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#002855', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center',
          gap: 1
        }}>
          <AssignmentIcon />
          Complaint Details
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedComplaint && (
            <>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Category:</Typography>
                    <Typography variant="body1" gutterBottom fontWeight={500}>{selectedComplaint.category}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
                    <Box>{renderStatusChip(selectedComplaint.status)}</Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Submitted On:</Typography>
                    <Typography variant="body1" gutterBottom fontWeight={500}>
                      {new Date(selectedComplaint.date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Department:</Typography>
                    <Typography variant="body1" gutterBottom fontWeight={500}>
                      {selectedComplaint.departmentId?.name || 'Not assigned yet'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Description:</Typography>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        mt: 1, 
                        bgcolor: 'rgba(0, 0, 0, 0.02)', 
                        borderRadius: '8px' 
                      }}
                    >
                      <Typography variant="body1">
                        {selectedComplaint.description}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider />
              
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#002855', fontWeight: 600 }}>
                  Status Updates
                </Typography>
                
                {selectedComplaint.statusUpdates?.length > 0 ? (
                  <List sx={{ bgcolor: 'background.paper', borderRadius: '8px' }}>
                    {selectedComplaint.statusUpdates.map((update, index) => (
                      <ListItem key={index} sx={{ py: 2 }}>
                        <ListItemText
                          primary={update.message}
                          secondary={update.timestamp && new Date(update.timestamp).toLocaleString()}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: 500
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">No status updates available.</Typography>
                )}
                
                {selectedComplaint.status === 'resolved' && (
                  <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Button 
                      variant="contained" 
                      startIcon={<FeedbackIcon />}
                      onClick={() => {
                        setViewDialog(false);
                        setFeedbackDialog(true);
                      }}
                      sx={{
                        bgcolor: '#2E7D32',
                        '&:hover': {
                          bgcolor: '#1b5e20'
                        }
                      }}
                    >
                      Add Feedback
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button 
            onClick={() => setViewDialog(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Close
          </Button>
          <Button 
            color="primary" 
            variant="contained"
            component={Link}
            to={`/ComplaintTracking/${selectedComplaint?._id}`}
            sx={{ borderRadius: '8px' }}
            startIcon={<AssignmentIcon />}
          >
            Track Progress
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog 
        open={feedbackDialog} 
        onClose={() => setFeedbackDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#2E7D32', color: 'white' }}>
          Provide Feedback
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <DialogContentText>
            Please share your feedback on how your complaint was handled. This helps us improve our services.
          </DialogContentText>
          <textarea
            style={{ 
              width: '100%', 
              minHeight: '120px', 
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Your feedback..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setFeedbackDialog(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleFeedbackSubmit} 
            color="success" 
            variant="contained"
            sx={{ borderRadius: '8px' }}
            disabled={!feedback.trim()}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CitizenDashboard;
