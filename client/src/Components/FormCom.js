
import React, { useState, useEffect } from 'react'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import '../App.css';
import axios from 'axios';
import Navbar from './Navbar';
import { Typography, CircularProgress, Snackbar, Alert, FormControl, InputLabel, Select } from '@mui/material';
axios.defaults.baseURL = "http://localhost:8080";

const FormCom = () => {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    name: '',
    mobile: '',
    description: '',
    date: '',
    priority: 'medium'
  });

  useEffect(() => {
    // Fetch departments when component mounts
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/departments');
        if (response.data.success) {
          setDepartments(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load departments. Please try again later.',
          severity: 'error'
        });
      }
    };
    
    fetchDepartments();
  }, []);

  useEffect(() => {
    // Update categories when department changes
    if (selectedDepartment) {
      const dept = departments.find(d => d._id === selectedDepartment);
      if (dept) {
        setCategories(dept.categories.map((cat, index) => ({
          value: `category${index + 1}`,
          label: cat
        })));
        
        // Reset category selection when department changes
        setFormData(prev => ({ ...prev, category: '' }));
      }
    }
  }, [selectedDepartment, departments]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/comCreate", formData);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Complaint registered successfully! You can track its status using your mobile number.",
          severity: "success"
        });
        
        // Reset form after successful submission
        setFormData({
          title: '',
          category: '',
          name: '',
          mobile: '',
          description: '',
          date: '',
          priority: 'medium'
        });
        setSelectedDepartment('');
      } else {
        throw new Error(response.data.message || "Failed to register complaint");
      }
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to register complaint. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const priorityLevels = [
    { value: 'low', label: 'Low - Not urgent' },
    { value: 'medium', label: 'Medium - Needs attention' },
    { value: 'high', label: 'High - Urgent issue' },
    { value: 'urgent', label: 'Urgent - Critical situation' }
  ];

  return (
    <>
      <Navbar />
      <div className='Formcontainer'>
        <form onSubmit={handleSubmit}>
          <Typography variant='h5'>
            Citizen Complaint Form
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Complaint Title"
                fullWidth
                margin="normal"
                name='title'
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  label="Department"
                  required
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category"
                select
                fullWidth
                margin="normal"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={!selectedDepartment}
              >
                {categories.map((option) => (
                  <MenuItem key={option.value} value={option.label}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Priority"
                select
                fullWidth
                margin="normal"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                {priorityLevels.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                multiline
                rows={4}
                fullWidth
                margin="normal"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Please provide detailed information about your complaint"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                type='date'
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
                label="Date of Occurrence"
                InputLabelProps={{ shrink: true }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Your complaint will be routed to the appropriate department based on the category selected.
              </Typography>
            </Grid>
            <Grid item xs={12} sx={{
              display: 'flex'
            }}>
              <Button 
                variant="contained" 
                type='submit' 
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Complaint'}
              </Button>
            </Grid>
          </Grid>
        </form>
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </>
  )
}

export default FormCom
