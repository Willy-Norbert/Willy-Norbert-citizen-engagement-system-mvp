
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import { Typography, IconButton, FormControl, InputLabel, Select, Box, Chip, Divider, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

axios.defaults.baseURL = "http://localhost:8080";

const UpdateForm = ({ name, mobile, category, description, status, _id, departmentId, statusUpdates = [], onClose }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token] = useState(localStorage.getItem('token'));

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const [formData, setFormData] = useState({
    name,
    mobile,
    category,
    description,
    status,
    _id,
    departmentId,
    message: '',
  });

  useEffect(() => {
    // Set authorization header
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/departments');
        if (response.data.success) {
          setDepartments(response.data.data);
          
          // If there's a departmentId, set the categories for that department
          if (departmentId) {
            const dept = response.data.data.find(d => d._id === departmentId);
            if (dept) {
              setCategories(dept.categories.map(cat => ({
                value: cat,
                label: cat
              })));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setError('Failed to load departments. Please try again.');
      }
    };
    
    fetchDepartments();
  }, [departmentId, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setFormData({ ...formData, departmentId: deptId });
    
    // Update categories when department changes
    const dept = departments.find(d => d._id === deptId);
    if (dept) {
      setCategories(dept.categories.map(cat => ({
        value: cat,
        label: cat
      })));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // First update the department assignment if it has changed
      if (departmentId !== formData.departmentId) {
        await axios.put(`/complaints/${formData._id}/assign`, {
          departmentId: formData.departmentId
        });
      }
      
      // Then update the status and add a comment
      const statusResponse = await axios.put(`/complaints/${formData._id}/status`, {
        status: formData.status,
        message: formData.message
      });
      
      setSuccess(statusResponse.data.message || 'Complaint updated successfully');
      
      // Wait a moment before closing to show success message
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show updated data
      }, 1500);
    } catch (error) {
      setError("Error updating complaint: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='FormcontainerUpdate'>
        <form onSubmit={handleSubmit}>
          <Typography variant='h5'>Update Complaint Status</Typography>
          <Grid container spacing={2}>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: '10px',
                right: '10px',
              }}
            >
              <CloseIcon />
            </IconButton>
            
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            
            {success && (
              <Grid item xs={12}>
                <Alert severity="success">{success}</Alert>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Complaint ID: {_id}
                </Typography>
                <Chip 
                  label={status} 
                  color={
                    status === 'resolved' ? 'success' : 
                    status === 'in-progress' ? 'primary' : 
                    status === 'rejected' ? 'error' : 
                    'default'
                  }
                  sx={{ mb: 2 }} 
                />
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Update Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Update Status"
                  required
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  name="departmentId"
                  value={formData.departmentId || ''}
                  onChange={handleDepartmentChange}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  required
                >
                  {categories.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Status Update Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
                margin="normal"
                placeholder="Provide details about this status update"
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                label="Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                margin="normal"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                InputProps={{ readOnly: true }}
              />
            </Grid>
            
            {statusUpdates && statusUpdates.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Status History
                </Typography>
                <Box sx={{ maxHeight: 150, overflowY: 'auto', p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                  {statusUpdates.map((update, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                        {update.status}
                      </Typography>
                      <Typography variant="body2" component="span" sx={{ mx: 1 }}>
                        - {update.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {update.timestamp && new Date(update.timestamp).toLocaleString()}
                      </Typography>
                      {index < statusUpdates.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ display: 'flex' }}>
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  margin: 'auto',
                  backgroundColor: '#242424',
                  '&:hover': {
                    backgroundColor: "#efefef",
                    boxShadow: "4px 1px 4px 1px rgba(0,0,0,0.15)",
                    color: '#242424'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Complaint'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </>
  );
};

export default UpdateForm;
