
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Paper, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, CircularProgress, Alert, Tab, Tabs, IconButton, Card,
  CardContent, AppBar, Toolbar, Avatar, Divider, MenuItem, Select,
  FormControl, InputLabel, LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import DoneIcon from '@mui/icons-material/Done';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BlockIcon from '@mui/icons-material/Block';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Navbar from '../Components/Navbar';
axios.defaults.baseURL = "https://willy-norbert-citizen-engagement-system.onrender.com/";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  overflow: 'hidden',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '16px',
  '&.MuiTableCell-head': {
    backgroundColor: '#002855',
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
  borderTop: `4px solid ${bordercolor || '#002855'}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
}));

const ActionButton = styled(Button)({
  borderRadius: '8px',
  fontWeight: '600',
  textTransform: 'none',
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState({
    complaints: true,
    users: true,
    departments: true
  });
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  
  // Department management states
  const [departmentDialog, setDepartmentDialog] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [editingDepartment, setEditingDepartment] = useState(null);

  // User management states
  const [userDialog, setUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'department',
    departmentId: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  
  // Complaint management states
  const [complaintDialog, setComplaintDialog] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintForm, setComplaintForm] = useState({
    status: '',
    departmentId: '',
    message: ''
  });

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
    if (!user || user.role !== 'admin') {
      // Redirect if not admin
      navigate('/login');
    } else {
      setUserData(user);
    }
  }, [navigate]);

  // Fetch complaints data
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('/complaints');
        if (response.data.success) {
          setComplaints(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
        setError("Failed to load complaints data");
      } finally {
        setLoading(prev => ({ ...prev, complaints: false }));
      }
    };

    if (userData) {
      fetchComplaints();
    }
  }, [userData]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users');
        if (response.data.success) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users data");
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };

    if (userData) {
      fetchUsers();
    }
  }, [userData]);

  // Fetch departments data
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/departments');
        if (response.data.success) {
          setDepartments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setError("Failed to load departments data");
      } finally {
        setLoading(prev => ({ ...prev, departments: false }));
      }
    };

    if (userData) {
      fetchDepartments();
    }
  }, [userData]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Department functions
  const handleOpenDepartmentDialog = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setDepartmentForm({
        name: department.name,
        description: department.description,
        contactEmail: department.contactEmail || '',
        contactPhone: department.contactPhone || ''
      });
    } else {
      setEditingDepartment(null);
      setDepartmentForm({
        name: '',
        description: '',
        contactEmail: '',
        contactPhone: ''
      });
    }
    setDepartmentDialog(true);
  };

  const handleDepartmentSubmit = async () => {
    try {
      if (!departmentForm.name || !departmentForm.description) {
        setError("Name and description are required!");
        return;
      }

      let response;
      if (editingDepartment) {
        response = await axios.put(`/departments/${editingDepartment._id}`, departmentForm);
      } else {
        response = await axios.post('/departments', departmentForm);
      }

      if (response.data.success) {
        // Refresh departments list
        const updatedDepartments = await axios.get('/departments');
        if (updatedDepartments.data.success) {
          setDepartments(updatedDepartments.data.data);
        }
        setDepartmentDialog(false);
      }
    } catch (error) {
      console.error("Error submitting department:", error);
      setError(error.response?.data?.message || "Failed to save department");
    }
  };

  // User functions
  const handleOpenUserDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        password: '',  // Don't populate password for security
        role: user.role,
        departmentId: user.departmentId || ''
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'department',
        departmentId: ''
      });
    }
    setUserDialog(true);
  };

  const handleUserSubmit = async () => {
    try {
      if (!userForm.name || !userForm.email || (!editingUser && !userForm.password)) {
        setError("Name, email, and password are required!");
        return;
      }

      // If role is department, check if departmentId is provided
      if (userForm.role === 'department' && !userForm.departmentId) {
        setError("Department selection is required for department users!");
        return;
      }

      let response;
      if (editingUser) {
        // Remove password if it's empty (no password change)
        const formData = { ...userForm };
        if (!formData.password.trim()) {
          delete formData.password;
        }
        response = await axios.put(`/users/${editingUser._id}`, formData);
      } else {
        response = await axios.post('/users', userForm);
      }

      if (response.data.success) {
        // Refresh users list
        const updatedUsers = await axios.get('/users');
        if (updatedUsers.data.success) {
          setUsers(updatedUsers.data.data);
        }
        setUserDialog(false);
      }
    } catch (error) {
      console.error("Error submitting user:", error);
      setError(error.response?.data?.message || "Failed to save user");
    }
  };

  // Complaint functions
  const handleOpenComplaintDialog = (complaint) => {
    setSelectedComplaint(complaint);
    setComplaintForm({
      status: complaint.status,
      departmentId: complaint.departmentId || '',
      message: ''
    });
    setComplaintDialog(true);
  };

  const handleComplaintSubmit = async () => {
    try {
      const response = await axios.put(
        `/complaints/${selectedComplaint._id}/assign`,
        {
          departmentId: complaintForm.departmentId,
          status: complaintForm.status,
          message: complaintForm.message
        }
      );

      if (response.data.success) {
        // Refresh complaints list
        const updatedComplaints = await axios.get('/complaints');
        if (updatedComplaints.data.success) {
          setComplaints(updatedComplaints.data.data);
        }
        setComplaintDialog(false);
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
      setError("Failed to update complaint");
    }
  };

  // Delete functions
  const confirmDelete = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      let endpoint;
      switch (deleteType) {
        case 'department':
          endpoint = `/departments/${itemToDelete._id}`;
          break;
        case 'user':
          endpoint = `/users/${itemToDelete._id}`;
          break;
        case 'complaint':
          endpoint = `/complaints/${itemToDelete._id}`;
          break;
        default:
          setDeleteDialog(false);
          return;
      }

      const response = await axios.delete(endpoint);

      if (response.data.success) {
        // Refresh data based on type
        switch (deleteType) {
          case 'department':
            setDepartments(departments.filter(d => d._id !== itemToDelete._id));
            break;
          case 'user':
            setUsers(users.filter(u => u._id !== itemToDelete._id));
            break;
          case 'complaint':
            setComplaints(complaints.filter(c => c._id !== itemToDelete._id));
            break;
          default:
            break;
        }
        setDeleteDialog(false);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setError(error.response?.data?.message || "Failed to delete item");
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

  // Summary counts
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'in-progress').length;
  const departmentUsers = users.filter(u => u.role === 'department').length;
  const citizenUsers = users.filter(u => u.role === 'citizen').length;

  return (
    <>
    <Navbar />

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }} className="dashboard-container">
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

        <StyledPaper sx={{ p: 3, mb: 4 }} className="fade-in">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#002855', fontWeight: 700 }}>
                Administration Dashboard
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Manage complaints, departments, and user accounts
              </Typography>
            </Box>
            <Box>
              <Button 
                component={Link}
                to="/dashboard"
                variant="outlined" 
                sx={{
                  mr: 2,
                  borderRadius: '8px',
                  borderColor: '#002855',
                  color: '#002855'
                }}
              >
                Classic Dashboard
              </Button>
              <Button 
                component={Link}
                to="/ComplaintGrid"
                variant="contained" 
                startIcon={<AssignmentIcon />}
                sx={{
                  borderRadius: '8px',
                  bgcolor: '#002855',
                  '&:hover': {
                    bgcolor: '#001c3d'
                  }
                }}
              >
                View Complaints
              </Button>
            </Box>
          </Box>
        </StyledPaper>

        <Grid container spacing={3} sx={{ mb: 4 }} className="fade-in">
          <Grid item xs={12} sm={6} lg={3}>
            <StyledCard bordercolor="#F57C00">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PendingIcon sx={{ color: '#F57C00', mr: 1 }} />
                  <Typography color="textSecondary" variant="body1">
                    Pending Complaints
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {pendingComplaints}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StyledCard bordercolor="#0277BD">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HourglassEmptyIcon sx={{ color: '#0277BD', mr: 1 }} />
                  <Typography color="textSecondary" variant="body1">
                    In Progress
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {inProgressComplaints}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StyledCard bordercolor="#2E7D32">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DoneIcon sx={{ color: '#2E7D32', mr: 1 }} />
                  <Typography color="textSecondary" variant="body1">
                    Resolved Complaints
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {resolvedComplaints}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StyledCard bordercolor="#6A1B9A">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ color: '#6A1B9A', mr: 1 }} />
                  <Typography color="textSecondary" variant="body1">
                    Total Departments
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {departments.length}
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
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  py: 2,
                  px: 3
                },
                '& .Mui-selected': {
                  color: '#002855'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#002855',
                  height: 3
                }
              }}
            >
              <Tab label="Complaints" icon={<AssignmentIcon />} iconPosition="start" />
              <Tab label="Departments" icon={<BusinessIcon />} iconPosition="start" />
              <Tab label="Users" icon={<PeopleIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {/* Complaints Tab */}
          {tabValue === 0 && (
            loading.complaints ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress sx={{ color: '#002855' }} />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>ID</StyledTableCell>
                        <StyledTableCell>Citizen</StyledTableCell>
                        <StyledTableCell>Category</StyledTableCell>
                        <StyledTableCell>Description</StyledTableCell>
                        <StyledTableCell>Department</StyledTableCell>
                        <StyledTableCell>Status</StyledTableCell>
                        <StyledTableCell align="center">Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {complaints.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1">No complaints found</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        complaints.map((complaint) => (
                          <TableRow 
                            key={complaint._id}
                            hover
                            sx={{ '&:hover': { backgroundColor: 'rgba(0, 40, 85, 0.04)' } }}
                          >
                            <TableCell>{complaint._id.substring(0, 8)}...</TableCell>
                            <TableCell>{complaint.name}</TableCell>
                            <TableCell>{complaint.category}</TableCell>
                            <TableCell className="description-cell">
                              {complaint.description}
                            </TableCell>
                            <TableCell>
                              {complaint.departmentId ? 
                                (typeof complaint.departmentId === 'object' ? 
                                  complaint.departmentId.name : 'Assigned') : 
                                'Not Assigned'}
                            </TableCell>
                            <TableCell>{renderStatusChip(complaint.status)}</TableCell>
                            <TableCell align="center">
                              <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                onClick={() => handleOpenComplaintDialog(complaint)}
                                startIcon={<EditIcon />}
                                sx={{ 
                                  mr: 1, 
                                  borderRadius: '6px',
                                  textTransform: 'none'
                                }}
                              >
                                Assign
                              </Button>
                              <IconButton
                                color="error"
                                onClick={() => confirmDelete(complaint, 'complaint')}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="body2" color="textSecondary">
                    {complaints.length} total complaints
                  </Typography>
                  <Button
                    component={Link}
                    to="/ComplaintGrid"
                    variant="text"
                    sx={{ color: '#002855', textTransform: 'none' }}
                  >
                    View All Complaints
                  </Button>
                </Box>
              </>
            )
          )}
          
          {/* Departments Tab */}
          {tabValue === 1 && (
            loading.departments ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress sx={{ color: '#002855' }} />
              </Box>
            ) : (
              <>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#002855' }}>
                    Department Management
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDepartmentDialog()}
                    sx={{
                      backgroundColor: '#002855',
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#001c3d',
                      }
                    }}
                  >
                    Add Department
                  </Button>
                </Box>
                <Divider />
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Name</StyledTableCell>
                        <StyledTableCell>Description</StyledTableCell>
                        <StyledTableCell>Contact Email</StyledTableCell>
                        <StyledTableCell>Contact Phone</StyledTableCell>
                        <StyledTableCell>Staff Count</StyledTableCell>
                        <StyledTableCell align="center">Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1">No departments found</Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => handleOpenDepartmentDialog()}
                              sx={{ mt: 2 }}
                            >
                              Add Department
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        departments.map((department) => (
                          <TableRow 
                            key={department._id}
                            hover
                            sx={{ '&:hover': { backgroundColor: 'rgba(0, 40, 85, 0.04)' } }}
                          >
                            <TableCell>
                              <Typography fontWeight={500}>{department.name}</Typography>
                            </TableCell>
                            <TableCell className="description-cell">
                              {department.description}
                            </TableCell>
                            <TableCell>{department.contactEmail || 'N/A'}</TableCell>
                            <TableCell>{department.contactPhone || 'N/A'}</TableCell>
                            <TableCell>
                              {users.filter(u => u.departmentId === department._id).length}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenDepartmentDialog(department)}
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => confirmDelete(department, 'department')}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )
          )}
          
          {/* Users Tab */}
          {tabValue === 2 && (
            loading.users ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress sx={{ color: '#002855' }} />
              </Box>
            ) : (
              <>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#002855' }}>
                      User Management
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {users.length} total users • {departmentUsers} department staff • {citizenUsers} citizens • {users.length - departmentUsers - citizenUsers} admins
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleOpenUserDialog()}
                    sx={{
                      backgroundColor: '#002855',
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#001c3d',
                      }
                    }}
                  >
                    Add User
                  </Button>
                </Box>
                <Divider />
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Name</StyledTableCell>
                        <StyledTableCell>Email</StyledTableCell>
                        <StyledTableCell>Role</StyledTableCell>
                        <StyledTableCell>Department</StyledTableCell>
                        <StyledTableCell>Created</StyledTableCell>
                        <StyledTableCell align="center">Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1">No users found</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => {
                          const department = departments.find(d => d._id === user.departmentId);
                          return (
                            <TableRow 
                              key={user._id}
                              hover
                              sx={{ '&:hover': { backgroundColor: 'rgba(0, 40, 85, 0.04)' } }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    mr: 1,
                                    bgcolor: user.role === 'admin' ? '#FFB81C' : 
                                             user.role === 'department' ? '#0078D7' : '#2E7D32'
                                  }}>
                                    {user.name?.charAt(0) || 'U'}
                                  </Avatar>
                                  <Typography fontWeight={500}>{user.name}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={user.role}
                                  size="small"
                                  sx={{
                                    bgcolor: user.role === 'admin' ? 'rgba(255, 184, 28, 0.1)' : 
                                            user.role === 'department' ? 'rgba(0, 120, 215, 0.1)' : 'rgba(46, 125, 50, 0.1)',
                                    color: user.role === 'admin' ? '#FFB81C' : 
                                           user.role === 'department' ? '#0078D7' : '#2E7D32',
                                    fontWeight: 500,
                                    borderRadius: '16px'
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {department ? department.name : (user.role === 'department' ? 'Unassigned' : 'N/A')}
                              </TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenUserDialog(user)}
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => confirmDelete(user, 'user')}
                                  size="small"
                                  disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )
          )}
        </StyledPaper>
      </Container>

      {/* Department Dialog */}
      <Dialog 
        open={departmentDialog} 
        onClose={() => setDepartmentDialog(false)}
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', pb: 2 }}>
          {editingDepartment ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Department Name"
            value={departmentForm.name}
            onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={departmentForm.description}
            onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
            required
          />
          <TextField
            fullWidth
            label="Contact Email"
            value={departmentForm.contactEmail}
            onChange={(e) => setDepartmentForm({ ...departmentForm, contactEmail: e.target.value })}
            margin="normal"
            variant="outlined"
            type="email"
          />
          <TextField
            fullWidth
            label="Contact Phone"
            value={departmentForm.contactPhone}
            onChange={(e) => setDepartmentForm({ ...departmentForm, contactPhone: e.target.value })}
            margin="normal"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDepartmentDialog(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDepartmentSubmit} 
            variant="contained" 
            sx={{ 
              borderRadius: '8px',
              bgcolor: '#002855',
              '&:hover': {
                bgcolor: '#001c3d'
              }
            }}
          >
            {editingDepartment ? 'Update' : 'Create'} Department
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Dialog */}
      <Dialog 
        open={userDialog} 
        onClose={() => setUserDialog(false)}
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', pb: 2 }}>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            fullWidth
            label="Name"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            label="Email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            margin="normal"
            variant="outlined"
            type="email"
            required
          />
          <TextField
            fullWidth
            label={editingUser ? "Password (leave blank to keep current)" : "Password"}
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            margin="normal"
            variant="outlined"
            type="password"
            required={!editingUser}
          />
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Role</InputLabel>
            <Select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="department">Department Staff</MenuItem>
              <MenuItem value="citizen">Citizen</MenuItem>
            </Select>
          </FormControl>
          {userForm.role === 'department' && (
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel>Department</InputLabel>
              <Select
                value={userForm.departmentId}
                onChange={(e) => setUserForm({ ...userForm, departmentId: e.target.value })}
                label="Department"
                required
              >
                <MenuItem value="">
                  <em>Select a department</em>
                </MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department._id} value={department._id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setUserDialog(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUserSubmit} 
            variant="contained" 
            sx={{ 
              borderRadius: '8px',
              bgcolor: '#002855',
              '&:hover': {
                bgcolor: '#001c3d'
              }
            }}
          >
            {editingUser ? 'Update' : 'Create'} User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Complaint Assignment Dialog */}
      <Dialog 
        open={complaintDialog} 
        onClose={() => setComplaintDialog(false)}
        PaperProps={{ style: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.1)', pb: 2 }}>
          Assign Complaint
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedComplaint && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Complaint: {selectedComplaint.category}
              </Typography>
              <Typography variant="body2" paragraph sx={{ mb: 3 }}>
                {selectedComplaint.description}
              </Typography>

              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Department</InputLabel>
                <Select
                  value={complaintForm.departmentId}
                  onChange={(e) => setComplaintForm({ ...complaintForm, departmentId: e.target.value })}
                  label="Department"
                  required
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {departments.map((department) => (
                    <MenuItem key={department._id} value={department._id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={complaintForm.status}
                  onChange={(e) => setComplaintForm({ ...complaintForm, status: e.target.value })}
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
                value={complaintForm.message}
                onChange={(e) => setComplaintForm({ ...complaintForm, message: e.target.value })}
                margin="normal"
                variant="outlined"
                multiline
                rows={3}
                placeholder="Add a comment about this assignment (optional)"
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setComplaintDialog(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleComplaintSubmit} 
            variant="contained" 
            sx={{ 
              borderRadius: '8px',
              bgcolor: '#002855',
              '&:hover': {
                bgcolor: '#001c3d'
              }
            }}
          >
            Assign Complaint
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
            {deleteType === 'department' && itemToDelete && (
              <Typography component="span" fontWeight="bold" display="block" mt={1}>
                "{itemToDelete.name}" department
              </Typography>
            )}
            {deleteType === 'user' && itemToDelete && (
              <Typography component="span" fontWeight="bold" display="block" mt={1}>
                User: {itemToDelete.name} ({itemToDelete.email})
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

export default AdminDashboard;
