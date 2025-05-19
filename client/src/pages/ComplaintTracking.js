
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Stepper, Step, StepLabel, 
  StepContent, Chip, Button, Grid, Divider, LinearProgress,
  Card, CardContent, Alert, List, ListItem, ListItemText,
  TextField, Rating, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Avatar
} from '@mui/material';
import axios from 'axios';
import Navbar from '../Components/Navbar';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DoneIcon from '@mui/icons-material/Done';
import PendingIcon from '@mui/icons-material/Pending';
import BuildIcon from '@mui/icons-material/Build';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

axios.defaults.baseURL = "http://localhost:8080";

const ComplaintTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  
  // Set authorization header for all requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      navigate('/login');
    }
  }, [navigate]);
  
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await axios.get(`/complaints/${id}`);
        if (response.data.success) {
          setComplaint(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching complaint:", error);
        setError("Failed to load complaint details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchComplaint();
    }
  }, [id, feedbackSuccess]);
  
  // Calculate status step
  const getStatusStep = (status) => {
    switch(status) {
      case 'pending': return 0;
      case 'in-progress': return 1;
      case 'resolved': return 2;
      case 'rejected': return 3;
      default: return 0;
    }
  };
  
  // Format timestamp
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f57f17';
      case 'in-progress': return '#1565c0';
      case 'resolved': return '#2e7d32';
      case 'rejected': return '#c62828';
      default: return '#757575';
    }
  };
  
  // Get status chip
  const getStatusChip = (status) => {
    switch(status) {
      case 'pending':
        return <Chip label="Pending" className="status-chip status-pending" />;
      case 'in-progress':
        return <Chip label="In Progress" className="status-chip status-in-progress" />;
      case 'resolved':
        return <Chip label="Resolved" className="status-chip status-resolved" />;
      case 'rejected':
        return <Chip label="Rejected" className="status-chip status-rejected" />;
      default:
        return <Chip label={status} />;
    }
  };

  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    try {
      setSubmitLoading(true);
      
      const response = await axios.post(`/complaints/${id}/feedback`, {
        feedback,
        rating
      });
      
      if (response.data.success) {
        setFeedbackSuccess(true);
        setFeedbackOpen(false);
        setFeedback('');
        setRating(0);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Check if the user has already submitted feedback
  const hasSubmittedFeedback = () => {
    if (!complaint || !complaint.statusUpdates) return false;
    
    return complaint.statusUpdates.some(update => 
      update.message && update.message.startsWith('Citizen Feedback:')
    );
  };
  
  // Check if user is a citizen and can provide feedback on this resolved complaint
  const canProvideFeedback = () => {
    if (!complaint) return false;
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    return (
      user.role === 'citizen' && 
      complaint.status === 'resolved' &&
      !hasSubmittedFeedback()
    );
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper sx={{ p: 3, borderRadius: '12px' }}>
            <Typography variant="h5" gutterBottom>Loading Complaint Details</Typography>
            <LinearProgress sx={{ borderRadius: '4px' }} />
          </Paper>
        </Container>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>
          <Button 
            component={Link} 
            to="/ComplaintGrid" 
            sx={{ mt: 2 }}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back to Complaints
          </Button>
        </Container>
      </>
    );
  }
  
  if (!complaint) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="warning" sx={{ borderRadius: '8px' }}>Complaint not found</Alert>
          <Button 
            component={Link} 
            to="/ComplaintGrid" 
            sx={{ mt: 2 }}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back to Complaints
          </Button>
        </Container>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
          position: 'relative'
        }} className="fade-in">
          <Box>
            <Typography variant="h4" sx={{ color: '#002855', fontWeight: 700 }}>
              Complaint Tracking
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              ID: {complaint._id}
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            component={Link}
            to="/ComplaintGrid"
            startIcon={<ArrowBackIcon />}
            sx={{
              borderRadius: '8px',
              borderColor: '#002855',
              color: '#002855',
              '&:hover': {
                borderColor: '#001c3d',
                backgroundColor: 'rgba(0, 40, 85, 0.04)'
              }
            }}
          >
            Back to Complaints
          </Button>
          
          {/* Subtle watermark */}
          <Box 
            component="img" 
            src="/path-to-your-logo.png" 
            alt="Logo Watermark" 
            className="watermark"
          />
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Card elevation={2} sx={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-3px)'
              }
            }} className="slide-in">
              <Box sx={{ 
                bgcolor: '#002855', 
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AssignmentIcon />
                <Typography variant="h6">
                  Complaint Information
                </Typography>
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                <Box mb={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Status
                  </Typography>
                  <Box>
                    {getStatusChip(complaint.status)}
                  </Box>
                </Box>
                
                <Box mb={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Category
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {complaint.category}
                  </Typography>
                </Box>
                
                <Box mb={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Submitted On
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(complaint.createdAt)}
                  </Typography>
                </Box>
                
                <Box mb={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Assigned Department
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {complaint.departmentId ? complaint.departmentId.name : 'Not assigned yet'}
                  </Typography>
                </Box>
                
                <Box mb={3}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Description
                  </Typography>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      bgcolor: 'rgba(0, 0, 0, 0.02)', 
                      borderRadius: '8px',
                      mt: 1
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {complaint.description}
                    </Typography>
                  </Paper>
                </Box>
              </CardContent>
              
              <Divider />
              
              <Box p={3}>
                <Box mt={1} display="flex" flexDirection="column" gap={2}>
                  {canProvideFeedback() && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={() => setFeedbackOpen(true)}
                      startIcon={<FeedbackIcon />}
                      sx={{
                        borderRadius: '8px',
                        py: 1.5,
                        bgcolor: '#002855',
                        '&:hover': {
                          bgcolor: '#001c3d',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 40, 85, 0.2)'
                        }
                      }}
                    >
                      Provide Feedback
                    </Button>
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Card elevation={2} sx={{ 
              borderRadius: '16px', 
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
              }
            }} className="fade-in">
              <Box sx={{ 
                bgcolor: '#0078D7', 
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AccessTimeIcon />
                <Typography variant="h6">
                  Tracking Progress
                </Typography>
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Stepper activeStep={getStatusStep(complaint.status)} orientation="vertical">
                  <Step key="submitted">
                    <StepLabel 
                      StepIconProps={{
                        icon: <AssignmentIcon />,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        Complaint Submitted
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography>Your complaint has been received and will be reviewed shortly.</Typography>
                    </StepContent>
                  </Step>
                  
                  <Step key="in-progress">
                    <StepLabel
                      StepIconProps={{
                        icon: <BuildIcon />,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        In Progress
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography>Your complaint is being processed by the appropriate department.</Typography>
                    </StepContent>
                  </Step>
                  
                  <Step key="resolved">
                    <StepLabel
                      StepIconProps={{
                        icon: <DoneIcon />,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        Resolution
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography>Your complaint has been resolved.</Typography>
                    </StepContent>
                  </Step>
                  
                  {complaint.status === 'rejected' && (
                    <Step key="rejected">
                      <StepLabel 
                        error
                        StepIconProps={{
                          icon: <CancelIcon />,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          Rejected
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography>Your complaint has been rejected.</Typography>
                      </StepContent>
                    </Step>
                  )}
                </Stepper>
                
                <Box mt={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <AccessTimeIcon sx={{ color: '#0078D7', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#002855' }}>
                      Status Updates
                    </Typography>
                  </Box>
                  
                  {complaint.statusUpdates?.length > 0 ? (
                    <List sx={{ 
                      bgcolor: 'background.paper',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 0, 0, 0.08)'
                    }}>
                      {complaint.statusUpdates.map((update, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && <Divider component="li" />}
                          <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                            <ListItemText
                              primary={
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Typography variant="subtitle1" fontWeight={500}>
                                    {update.message}
                                  </Typography>
                                  <Chip 
                                    label={update.status} 
                                    size="small" 
                                    sx={{ 
                                      backgroundColor: getStatusColor(update.status) + '20',
                                      color: getStatusColor(update.status),
                                      fontWeight: 500
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem', bgcolor: '#0078D7' }}>
                                    {update.updatedBy?.name?.charAt(0) || 'S'}
                                  </Avatar>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {update.updatedBy?.name || 'System'} - {formatDate(update.timestamp)}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        bgcolor: 'rgba(0, 0, 0, 0.02)', 
                        borderRadius: '8px',
                        textAlign: 'center' 
                      }}
                    >
                      <Typography color="textSecondary">No updates available yet.</Typography>
                    </Paper>
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
        
        {/* Feedback Dialog */}
        <Dialog 
          open={feedbackOpen} 
          onClose={() => setFeedbackOpen(false)}
          PaperProps={{
            sx: { borderRadius: '12px' }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#0078D7',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <FeedbackIcon />
            Provide Feedback
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <DialogContentText>
              Your complaint has been resolved. We would appreciate your feedback on how it was handled.
            </DialogContentText>
            
            <Box mt={3} mb={2}>
              <Typography component="legend" fontWeight={500}>Rate your experience</Typography>
              <Rating
                name="feedback-rating"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue || 0);
                }}
                sx={{ 
                  fontSize: '2rem',
                  mt: 1,
                  '& .MuiRating-iconFilled': {
                    color: '#FFB81C',
                  }
                }}
              />
            </Box>
            
            <TextField
              autoFocus
              margin="dense"
              id="feedback"
              label="Your Feedback"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px'
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button 
              onClick={() => setFeedbackOpen(false)}
              variant="outlined"
              sx={{ borderRadius: '8px' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitFeedback} 
              variant="contained" 
              color="primary"
              disabled={!feedback.trim() || submitLoading}
              sx={{ 
                borderRadius: '8px',
                bgcolor: '#002855',
                '&:hover': {
                  bgcolor: '#001c3d'
                }
              }}
            >
              {submitLoading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ComplaintTracking;
