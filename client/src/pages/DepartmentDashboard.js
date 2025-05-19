
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, Typography, Container, Paper, Grid, Tabs, Tab, 
  Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, TextField, 
  CircularProgress, Alert, IconButton, Card, CardContent,
  List, ListItem, ListItemText, FormControl, InputLabel,
  Select, MenuItem, Divider, AppBar, Toolbar, Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import CommentIcon from '@mui/icons-material/Comment';
import DoneIcon from '@mui/icons-material/Done';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BlockIcon from '@mui/icons-material/Block';
import AddIcon from '@mui/icons-material/Add';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Navbar from '../Components/Navbar';
axios.defaults.baseURL = "http://localhost:8080";
// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  overflow: 'hidden',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '16px',
  '&.MuiTableCell-head': {
    backgroundColor: '#0078D7',
    color: '#ffffff',
    fontWeight: 600,
  },
}));

const StyledCard = styled(Card)(({ theme, bordercolor }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderTop: `4px solid ${bordercolor || '#0078D7'}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
}));

const DepartmentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState(null);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [error, setError] = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', message: '' });
  const [commentDialog, setCommentDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    expiryDate: '',
    visibility: 'public'
  });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const navigate = useNavigate();

  // Set authorization header for all requests
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Load user data from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'department') {
      // Redirect if not department user
      navigate('/login');
    } else {
      setUserData(user);
      // Fetch department info
      if (user.departmentId) {
        fetchDepartmentInfo(user.departmentId);
      }
    }
  }, [navigate]);

  // Fetch department info
  const fetchDepartmentInfo = async (departmentId) => {
    try {
      const response = await axios.get(`/departments/${departmentId}`);
      if (response.data.success) {
        setDepartmentInfo(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching department info:", error);
      setError("Failed to load department information");
    }
  };

  // Fetch complaints assigned to this department
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
        setError("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    if (userData && userData.departmentId) {
      fetchComplaints();
    }
  }, [userData]);

  // Fetch department announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        if (userData && userData.departmentId) {
          const response = await axios.get(`/announcements?departmentId=${userData.departmentId}`);
          if (response.data.success) {
            setAnnouncements(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, [userData]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open status update dialog
  const handleStatusUpdate = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusUpdate({ status: complaint.status, message: '' });
    setStatusDialog(true);
  };

  // Open comment dialog
  const handleOpenCommentDialog = (complaint) => {
    setSelectedComplaint(complaint);
    setComment('');
    setCommentDialog(true);
  };

  // Submit status update
  const submitStatusUpdate = async () => {
    try {
      const response = await axios.put(
        `/complaints/${selectedComplaint._id}/status`,
        statusUpdate
      );
      
      if (response.data.success) {
        // Refresh complaints
        const updatedComplaints = complaints.map(c => 
          c._id === selectedComplaint._id ? { ...c, status: statusUpdate.status } : c
        );
        setComplaints(updatedComplaints);
        setStatusDialog(false);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update complaint status");
    }
  };

  // Submit comment
  const submitComment = async () => {
    try {
      const response = await axios.post(
        `/complaints/${selectedComplaint._id}/comment`,
        { message: comment }
      );
      
      if (response.data.success) {
        setCommentDialog(false);
        // Refresh the complaint data
        const updatedComplaints = [...complaints];
        const index = updatedComplaints.findIndex(c => c._id === selectedComplaint._id);
        if (index !== -1) {
          // Add the comment to status updates (simplified approach)
          if (!updatedComplaints[index].statusUpdates) {
            updatedComplaints[index].statusUpdates = [];
          }
          updatedComplaints[index].statusUpdates.push({
            message: comment,
            timestamp: new Date()
          });
          setComplaints(updatedComplaints);
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment");
    }
  };

  // Create or update announcement
  const handleAnnouncementSubmit = async () => {
    try {
      if (!newAnnouncement.title || !newAnnouncement.content) {
        setError("Title and content are required");
        return;
      }
      
      let response;
      
      if (editingAnnouncement) {
        // Update existing announcement
        response = await axios.put(
          `/announcements/${editingAnnouncement._id}`,
          newAnnouncement
        );
      } else {
        // Create new announcement
        response = await axios.post(
          '/announcements',
          newAnnouncement
        );
      }
      
      if (response.data.success) {
        setAnnouncementDialog(false);
        
        // Reset form
        setNewAnnouncement({
          title: '',
          content: '',
          expiryDate: '',
          visibility: 'public'
        });
        
        setEditingAnnouncement(null);
        
        // Refresh announcements
        const announcementsResponse = await axios.get(`/announcements?departmentId=${userData.departmentId}`);
        if (announcementsResponse.data.success) {
          setAnnouncements(announcementsResponse.data.data);
        }
      }
    } catch (error) {
      console.error("Error with announcement:", error);
      setError(error.response?.data?.message || "Error processing announcement");
    }
  };

  // Edit announcement
  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate).toISOString().split('T')[0] : '',
      visibility: announcement.visibility || 'public'
    });
    setAnnouncementDialog(true);
  };

  // Delete confirmation dialog
  const confirmDelete = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialog(true);
  };

  // Handle delete operation
  const handleDelete = async () => {
    try {
      if (!itemToDelete || !deleteType) {
        setDeleteDialog(false);
        return;
      }
      
      if (deleteType === 'announcement') {
        const response = await axios.delete(`/announcements/${itemToDelete._id}`);
        
        if (response.data.success) {
          // Remove from list
          setAnnouncements(announcements.filter(a => a._id !== itemToDelete._id));
        }
      }
      
      setDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Filter complaints based on tab
  const filteredComplaints = () => {
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

  // Render status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" color="warning" size="small" className="status-chip status-pending" />;
      case 'in-progress':
        return <Chip icon={<HourglassEmptyIcon />} label="In Progress" color="info" size="small" className="status-chip status-in-progress" />;
      case 'resolved':
        return <Chip icon={<DoneIcon />} label="Resolved" color="success" size="small" className="status-chip status-resolved" />;
      case 'rejected':
        return <Chip icon={<BlockIcon />} label="Rejected" color="error" size="small" className="status-chip status-rejected" />;
      default:
        return <Chip label={status} />;
    }
  };

  return (
    <>
  <Navbar />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} className="dashboard-container">
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
        
        {departmentInfo && (
          <StyledPaper sx={{ p: 3, mb: 4 }} className="fade-in">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" gutterBottom sx={{ color: '#002855', fontWeight: 700 }}>
                  {departmentInfo.name} Department
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {departmentInfo.description}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                component={Link}
                to="/ComplaintGrid"
                startIcon={<AssignmentIcon />}
                sx={{
                  backgroundColor: '#0078D7',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: "#0067be",
                    boxShadow: '0 4px 8px rgba(0, 120, 215, 0.2)',
                    transform: 'translateY(-2px)'
                  },
                }}
              >
                View All Complaints
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Contact: {departmentInfo.contactEmail || 'N/A'} | {departmentInfo.contactPhone || 'N/A'}
              </Typography>
            </Box>
          </StyledPaper>
        )}
        
        <Grid container spacing={3} sx={{ mb: 4 }} className="fade-in">
          <Grid item xs={12} md={3}>
            <StyledCard bordercolor="#0078D7">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ color: '#0078D7', mr: 1 }} />
                  <Typography color="textSecondary" variant="body1">
                    Total Assigned
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {complaints.length}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StyledCard bordercolor="#F57C00">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PendingIcon sx={{ color: '#F57C00', mr: 1 }} />
                  <Typography color="textSecondary" variant="body1">
                    Pending
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {complaints.filter(c => c.status === 'pending').length}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StyledCard bordercolor="#0277BD">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HourglassEmptyIcon sx={{ color: '#0277BD', mr: 1 }} />
                  <Typography color="textSecondary" variant="body1">
                    In Progress
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {complaints.filter(c => c.status === 'in-progress').length}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StyledCard bordercolor="#2E7D32">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DoneIcon sx={{ color: '#2E7D32', mr: 1 }} />
                  <Typography color="textSecondary" variant="body1">
                    Resolved
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {complaints.filter(c => c.status === 'resolved').length}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
        
        <StyledPaper sx={{ mb: 4 }} className="slide-in">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="complaint tabs"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  py: 2,
                  px: 3
                },
                '& .Mui-selected': {
                  color: '#0078D7'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#0078D7',
                  height: 3
                }
              }}
            >
              <Tab label="All Complaints" icon={<AssignmentIcon />} iconPosition="start" />
              <Tab label="Pending" icon={<PendingIcon />} iconPosition="start" />
              <Tab label="In Progress" icon={<HourglassEmptyIcon />} iconPosition="start" />
              <Tab label="Resolved" icon={<DoneIcon />} iconPosition="start" />
              <Tab label="Announcements" icon={<AnnouncementIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {/* Complaints Tabs (0-3) */}
          {tabValue <= 3 && (
            loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress sx={{ color: '#0078D7' }} />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>ID</StyledTableCell>
                      <StyledTableCell>Citizen</StyledTableCell>
                      <StyledTableCell>Category</StyledTableCell>
                      <StyledTableCell>Description</StyledTableCell>
                      <StyledTableCell>Date</StyledTableCell>
                      <StyledTableCell>Status</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredComplaints().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1">No complaints found in this category</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredComplaints().map((complaint) => (
                        <TableRow 
                          key={complaint._id}
                          hover
                          sx={{ '&:hover': { backgroundColor: 'rgba(0, 120, 215, 0.04)' } }}
                        >
                          <TableCell>{complaint._id.substring(0, 8)}...</TableCell>
                          <TableCell>{complaint.name}</TableCell>
                          <TableCell>{complaint.category}</TableCell>
                          <TableCell className="description-cell">
                            {complaint.description}
                          </TableCell>
                          <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                          <TableCell>{renderStatusChip(complaint.status)}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleStatusUpdate(complaint)}
                              sx={{ 
                                mr: 1, 
                                borderRadius: '6px',
                                borderColor: '#0078D7',
                                color: '#0078D7',
                                '&:hover': {
                                  borderColor: '#0067be',
                                  backgroundColor: 'rgba(0, 120, 215, 0.04)'
                                }
                              }}
                            >
                              Update
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<CommentIcon />}
                              onClick={() => handleOpenCommentDialog(complaint)}
                              sx={{ 
                                borderRadius: '6px',
                                borderColor: '#F57C00',
                                color: '#F57C00',
                                '&:hover': {
                                  borderColor: '#E65100',
                                  backgroundColor: 'rgba(245, 124, 0, 0.04)'
                                }
                              }}
                            >
                              Comment
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
          
          {/* Announcements Tab (4) */}
          {tabValue === 4 && (
            <>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#002855' }}>
                  Department Announcements
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setNewAnnouncement({
                      title: '',
                      content: '',
                      expiryDate: '',
                      visibility: 'public'
                    });
                    setAnnouncementDialog(true);
                  }}
                  sx={{
                    backgroundColor: '#0078D7',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: "#0067be",
                      boxShadow: '0 4px 8px rgba(0, 120, 215, 0.2)'
                    }
                  }}
                >
                  New Announcement
                </Button>
              </Box>
              
              <Divider />
              
              {announcements.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <AnnouncementIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No Announcements Yet
                  </Typography>
                  <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 500, mx: 'auto' }}>
                    Create announcements to keep citizens informed about important updates, events, or changes.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {announcements.map((announcement) => (
                    <React.Fragment key={announcement._id}>
                      <ListItem
                        sx={{ px: 3, py: 2 }}
                        secondaryAction={
                          <Box>
                            <IconButton 
                              edge="end" 
                              aria-label="edit"
                              onClick={() => handleEditAnnouncement(announcement)}
                              sx={{ color: '#0078D7' }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              aria-label="delete"
                              onClick={() => confirmDelete(announcement, 'announcement')}
                              sx={{ color: '#d32f2f' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6" sx={{ color: '#002855', fontWeight: 600 }}>
                                {announcement.title}
                              </Typography>
                              <Chip 
                                label={announcement.visibility === 'public' ? 'Public' : 'Department Only'} 
                                size="small"
                                color={announcement.visibility === 'public' ? 'success' : 'default'}
                                sx={{ borderRadius: '16px' }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography 
                                component="span" 
                                variant="body1" 
                                sx={{ display: 'block', my: 1 }}
                              >
                                {announcement.content}
                              </Typography>
                              <Typography 
                                component="span" 
                                variant="caption" 
                                color="text.secondary"
                              >
                                Published: {new Date(announcement.publishDate || announcement.createdAt).toLocaleString()}
                                {announcement.expiryDate && (
                                  ` • Expires: ${new Date(announcement.expiryDate).toLocaleString()}`
                                )}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </>
          )}
        </StyledPaper>
      </Container>
      
      {/* Status Update Dialog */}
      <Dialog 
        open={statusDialog} 
        onClose={() => setStatusDialog(false)}
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', pb: 2 }}>
          Update Complaint Status
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Update the status for this complaint and provide details about the change.
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Comment"
              multiline
              rows={4}
              value={statusUpdate.message}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, message: e.target.value })}
              variant="outlined"
              placeholder="Add details about this status change"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setStatusDialog(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitStatusUpdate} 
            variant="contained" 
            sx={{ 
              borderRadius: '8px',
              bgcolor: '#0078D7',
              '&:hover': {
                bgcolor: '#0067be'
              }
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Comment Dialog */}
      <Dialog 
        open={commentDialog} 
        onClose={() => setCommentDialog(false)}
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', pb: 2 }}>
          Add Comment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Add a comment to this complaint. The comment will be visible to all users.
          </DialogContentText>
          <TextField
            fullWidth
            label="Comment"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            placeholder="Enter your comment"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setCommentDialog(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitComment} 
            variant="contained"
            disabled={!comment.trim()}
            sx={{ 
              borderRadius: '8px',
              bgcolor: '#0078D7',
              '&:hover': {
                bgcolor: '#0067be'
              }
            }}
          >
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog 
        open={announcementDialog} 
        onClose={() => setAnnouncementDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', pb: 2 }}>
          {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={6}
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                required
                variant="outlined"
                placeholder="Write the announcement content here..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Expiry Date (Optional)"
                type="date"
                fullWidth
                value={newAnnouncement.expiryDate}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expiryDate: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={newAnnouncement.visibility}
                  label="Visibility"
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, visibility: e.target.value })}
                >
                  <MenuItem value="public">Public (All Citizens)</MenuItem>
                  <MenuItem value="department-only">Department Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setAnnouncementDialog(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAnnouncementSubmit} 
            variant="contained" 
            sx={{ 
              borderRadius: '8px',
              bgcolor: '#0078D7',
              '&:hover': {
                bgcolor: '#0067be'
              }
            }}
            disabled={!newAnnouncement.title || !newAnnouncement.content}
          >
            {editingAnnouncement ? 'Update' : 'Publish'} Announcement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog} 
        onClose={() => setDeleteDialog(false)}
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', pb: 2 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText>
            Are you sure you want to delete this {deleteType}?
            {deleteType === 'announcement' && itemToDelete && (
              <Typography component="span" fontWeight="bold" display="block" mt={1}>
                "{itemToDelete.title}"
              </Typography>
            )}
          </DialogContentText>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialog(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            sx={{ borderRadius: '8px' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DepartmentDashboard;
