
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, TextField, InputAdornment, IconButton, 
  MenuItem, Select, FormControl, InputLabel, Button, Alert, CircularProgress,
  Container, Card, CardContent, Grid, AppBar, Toolbar, Avatar, Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DoneIcon from '@mui/icons-material/Done';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

axios.defaults.baseURL = "http://localhost:8080";

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

const StyledFormControl = styled(FormControl)({
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

const ActionButton = styled(Button)({
  borderRadius: '8px',
  fontWeight: '600',
  textTransform: 'none',
});

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

const ComplaintGrid = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  // Check authentication and set authorization header
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUserData(user);
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('/complaints');
        if (response.data.success) {
          setComplaints(response.data.data);
          setFilteredComplaints(response.data.data);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(response.data.data.map(c => c.category))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
        setError("Failed to load complaints. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchComplaints();
    }
  }, [userData]);

  // Filter complaints
  useEffect(() => {
    let filtered = [...complaints];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(complaint => 
        complaint.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === categoryFilter);
    }
    
    setFilteredComplaints(filtered);
  }, [searchQuery, statusFilter, categoryFilter, complaints]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Render status chip
  const renderStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" className="status-chip status-pending" />;
      case 'in-progress':
        return <Chip icon={<HourglassEmptyIcon />} label="In Progress" className="status-chip status-in-progress" />;
      case 'resolved':
        return <Chip icon={<DoneIcon />} label="Resolved" className="status-chip status-resolved" />;
      case 'rejected':
        return <Chip label="Rejected" className="status-chip status-rejected" />;
      default:
        return <Chip label={status} />;
    }
  };

  // Get appropriate dashboard link based on user role
  const getDashboardLink = () => {
    if (!userData) return '/';
    
    switch (userData.role) {
      case 'admin':
        return '/admin';
      case 'department':
        return '/department-dashboard';
      case 'citizen':
        return '/citizen-dashboard';
      default:
        return '/';
    }
  };

  return (
    <>
      <Navbar />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} className="dashboard-container">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center', 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
          position: 'relative'
        }}>
          <Box className="fade-in">
            <Typography variant="h4" sx={{ color: '#002855', fontWeight: 700 }}>
              My Complaints
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track all your submitted complaints
            </Typography>
          </Box>
          
          <Box>
            <ActionButton 
              variant="outlined" 
              component={Link}
              to={getDashboardLink()}
              sx={{
                borderRadius: '8px',
                borderColor: '#002855',
                color: '#002855',
                mr: 2,
                '&:hover': {
                  borderColor: "#001c3d",
                  backgroundColor: 'rgba(0, 40, 85, 0.04)'
                }
              }}
            >
              Dashboard
            </ActionButton>
            
            <ActionButton 
              variant="contained" 
              component={Link}
              to="/Sample"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: '#002855',
                '&:hover': {
                  backgroundColor: "#001c3d",
                  boxShadow: '0 4px 8px rgba(0, 40, 85, 0.2)',
                  transform: 'translateY(-2px)'
                },
                px: 3,
                py: 1.5
              }}
              className="slide-in"
            >
              New Complaint
            </ActionButton>
          </Box>
        </Box>
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }} className="fade-in">
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard bordercolor="#0078D7">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ color: '#0078D7', mr: 1 }} />
                  <Typography color="textSecondary" variant="body1">
                    Total
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {complaints.length}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
        
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
        
        <StyledPaper sx={{ mb: 4 }} className="slide-in">
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            p: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
            backgroundColor: '#f5f5f7',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
          }}>
            <TextField
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#0078D7' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                flexGrow: 1,
                minWidth: '200px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }
              }}
            />
            
            <StyledFormControl sx={{ minWidth: 150 }}>
              <InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Status
                </Box>
              </InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </StyledFormControl>
            
            <StyledFormControl sx={{ minWidth: 180 }}>
              <InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterListIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Category
                </Box>
              </InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </Box>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress sx={{ color: '#0078D7' }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>ID</StyledTableCell>
                    <StyledTableCell>Category</StyledTableCell>
                    <StyledTableCell>Description</StyledTableCell>
                    <StyledTableCell>Date</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Department</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                          <Typography variant="h6" color="textSecondary" gutterBottom>
                            No complaints found
                          </Typography>
                          <Button 
                            variant="contained" 
                            component={Link}
                            to="/Sample"
                            startIcon={<AddIcon />}
                            sx={{ 
                              mt: 2,
                              bgcolor: '#002855',
                              '&:hover': {
                                bgcolor: '#001c3d'
                              },
                              borderRadius: '8px'
                            }}
                          >
                            Submit New Complaint
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <TableRow 
                        key={complaint._id} 
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(0, 120, 215, 0.04)'
                          }
                        }}
                      >
                        <TableCell>{complaint._id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {complaint.category}
                          </Typography>
                        </TableCell>
                        <TableCell className="description-cell">
                          {complaint.description}
                        </TableCell>
                        <TableCell>
                          {new Date(complaint.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{renderStatusChip(complaint.status)}</TableCell>
                        <TableCell>
                          {complaint.departmentId ? 
                            (typeof complaint.departmentId === 'object' ? 
                              complaint.departmentId.name : 'Assigned') : 
                            'Not Assigned'}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            component={Link}
                            to={`/ComplaintTracking/${complaint._id}`}
                            variant="contained"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            sx={{ 
                              backgroundColor: '#0078D7',
                              borderRadius: '6px',
                              textTransform: 'none',
                              '&:hover': {
                                backgroundColor: '#0067be',
                              } 
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </StyledPaper>
      </Container>
    </>
  );
};

export default ComplaintGrid;
