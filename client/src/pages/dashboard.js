import React, { useEffect, useState } from 'react'
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { Link } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import Card from '../Components/Card';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { CSVLink } from 'react-csv';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import HelpIcon from '@mui/icons-material/Help';
import UpdateForm from '../Components/UpdateForm';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Button } from '@mui/material';

axios.defaults.baseURL = "http://localhost:8080"

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
    
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const Dashboard = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  // Fetch complaints data
  const [dataFetch, setDataFetch] = useState([]);

  const fetchdata = async () => {
    try {
      const response = await axios.get("/com");
      setDataFetch(response.data.data);
      setCount(response.data.data.length);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
   
  useEffect(() => {
    fetchdata();
  }, []);
  
  // Excel export functionality
  const ExportButton = ({ data }) => {
    const headers = [
      { label: 'Complaint No', key: 'complaintNo' },
      { label: 'Name', key: 'name' },
      { label: 'Type Of Complaint', key: 'category' },
      { label: 'Mobile', key: 'mobile' },
      { label: 'Date of the Complaint', key: 'date' },
      { label: 'Description', key: 'description' },
      { label: 'Status', key: 'status' },
    ];

    const csvData = data.map((row, index) => ({
      complaintNo: index + 1,
      name: row.name,
      category: row.category,
      mobile: row.mobile,
      date: row.date,
      description: row.description,
      status: row.status,
    }));
     
    return (
      <CSVLink data={csvData} headers={headers} style={{
        textDecoration:"none",
        color:"#1a9979",
        fontSize:'12px',
        backgroundColor:"#fffff",
        borderRadius:"5px",
        display:'flex',
        alignItems:'center',
        margin:'0 5px 0 5px'
      }} filename="complaints.csv">
        Export CSV <FileDownloadIcon />
      </CSVLink>
    );
  };
  
  // Complaint update modal
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (rowData) => {
    setSelectedRowData(rowData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchdata(); // Refresh data after modal is closed
  };
   
  // Delete complaint
  const deleteComplaint = async (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      const data = await axios.delete("/comDelete/" + id);
      alert(data.data.message);
      if (data.data.success)
        fetchdata();
    }
  };
  
  // Fetch registered users
  const [regDataFetch, setregDataFetch] = useState([]);
  const [ucount, setucount] = useState(0);
  
  const regfetchdata = async () => {
    try {
      const response = await axios.get("/users");
      setregDataFetch(response.data.data);
      setucount(response.data.data.length);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
    
  useEffect(() => {
    regfetchdata();
    resFetchData();
  }, []);

  // Fetch resolved complaints
  const [resCount, setresCount] = useState(0);
  const resFetchData = async () => {
    try {
      const response = await axios.get('/resolvedComp');
      setresCount(response.data.data.length);
    } catch (error) {
      console.error("Error fetching resolved complaints:", error);
    }
  };

  // Function to seed initial departments
  const seedDepartments = async () => {
    try {
      const response = await axios.post('/seed/departments');
      if (response.data.success) {
        alert('Default departments have been added successfully!');
      } else {
        alert('Failed to add default departments.');
      }
    } catch (error) {
      console.error('Error seeding departments:', error);
      alert('An error occurred while adding default departments.');
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{
        backgroundColor: "#242424"
      }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Citizen Engagement System
          </Typography>
          <Button 
            variant="outlined" 
            color="inherit" 
            component={Link} 
            to="/admin"
            startIcon={<AdminPanelSettingsIcon />}
            sx={{ ml: 2 }}
          >
            Admin Dashboard
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ 
            display: 'block',
            '&:hover': {
              borderRadius: '10px',
              backgroundColor: '#efefef',
              color: '#242424',
            }
          }}>
            <IconButton
              component={Link}
              to="/register"
              sx={{
                minHeight: 48,
                justifyContent: 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: "transparent"
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                }}
              >
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Register" sx={{ opacity: 1 }} />
            </IconButton>
          </ListItem>

          <ListItem disablePadding sx={{ 
            display: 'block',
            '&:hover': {
              borderRadius: '10px',
              backgroundColor: '#efefef',
              color: '#242424',
            }
          }}>
            <IconButton
              component={Link}
              to="/Sample"
              sx={{
                minHeight: 48,
                justifyContent: 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: "transparent"
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                }}
              >
                <ReportProblemIcon />
              </ListItemIcon>
              <ListItemText primary="Complaint" sx={{ opacity: 1 }} />
            </IconButton>
          </ListItem>
          
          <ListItem disablePadding sx={{ 
            display: 'block',
            '&:hover': {
              borderRadius: '10px',
              backgroundColor: '#efefef',
              color: '#242424',
            }
          }}>
            <IconButton
              component={Link}
              to="/Enquiry"
              sx={{
                minHeight: 48,
                justifyContent: 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: "transparent"
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                }}
              >
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="Enquiry" sx={{ opacity: 1 }} />
            </IconButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ 
            display: 'block',
            '&:hover': {
              borderRadius: '10px',
              backgroundColor: '#efefef',
              color: '#242424',
            }
          }}>
            <IconButton
              component={Link}
              to="/ComplaintGrid"
              sx={{
                minHeight: 48,
                justifyContent: 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: "transparent"
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                }}
              >
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="All Complaints" sx={{ opacity: 1 }} />
            </IconButton>
          </ListItem>

          <ListItem disablePadding sx={{ 
            display: 'block',
            '&:hover': {
              borderRadius: '10px',
              backgroundColor: '#efefef',
              color: '#242424',
            }
          }}>
            <IconButton
              component={Link}
              to="/admin"
              sx={{
                minHeight: 48,
                justifyContent: 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: "transparent"
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                  justifyContent: 'center',
                }}
              >
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Admin Dashboard" sx={{ opacity: 1 }} />
            </IconButton>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        
        {/* Setup Notice - Only show once */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            Welcome to the Citizen Engagement System
          </Typography>
          <Typography variant="body1" paragraph>
            Before using the system, you'll need to set up the departments that will handle different types of complaints.
          </Typography>
          <Button 
            variant="contained" 
            onClick={seedDepartments}
            sx={{ 
              mr: 2,
              backgroundColor: '#242424',
              '&:hover': {
                backgroundColor: '#444444'
              }
            }}
          >
            Initialize Default Departments
          </Button>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/admin"
          >
            Go to Admin Dashboard
          </Button>
        </Paper>
        
        <Stack direction="row" spacing={3} style={{
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <Card
            title="Total Complaints"
            description={count}
            className="custom-card"
            borderColor="#FF0000"
          />
          <Card
            title="Resolved Complaints"
            description={resCount}
            className="another-card"
            borderColor="#00FF00"
          />
          <Card
            title="Registered Users"
            description={ucount}
            borderColor="#71b9f6"
          />
        </Stack>

        <Stack direction="row" spacing={2} sx={{
          display: "flex",
          justifyContent: "space-evenly",
          flexWrap: "wrap"
        }}>
          <div style={{ minWidth: "300px", flexGrow: 1, maxWidth: "700px", marginBottom: "20px" }}>
            <Typography variant="h4" gutterBottom>
              Complaints
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="complaints table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Name</TableCell>
                    <TableCell align="center">Type Of Complaint</TableCell>
                    <TableCell align="center">Mobile</TableCell>
                    <TableCell align="center">Date of the Complaint</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataFetch.filter(row => row.status === 'unresolved' || row.status === 'pending').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No active complaints</TableCell>
                    </TableRow>
                  ) : (
                    dataFetch
                      .filter(row => row.status === 'unresolved' || row.status === 'pending')
                      .map((row) => (
                        <TableRow
                          key={row._id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell align="center">{row.name}</TableCell>
                          <TableCell align="center">{row.category}</TableCell>
                          <TableCell align="center">{row.mobile}</TableCell>
                          <TableCell align="center">
                            {new Date(row.date).toDateString()}
                          </TableCell>
                          <TableCell align="center">{row.status}</TableCell>
                          <TableCell align="center">
                            <IconButton color="primary" onClick={() => handleEditClick(row)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="secondary" onClick={() => deleteComplaint(row._id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
              <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <ExportButton data={dataFetch} />
              </Box>
            </TableContainer>
          </div>

          <div style={{ minWidth: "300px", flexGrow: 1, maxWidth: "700px" }}>
            <Typography variant="h4" gutterBottom>
              Registered Users
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Name</TableCell>
                    <TableCell align="center">Email</TableCell>
                    <TableCell align="center">Mobile</TableCell>
                    <TableCell align="center">Alt. Number</TableCell>
                    <TableCell align="center">Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {regDataFetch.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No registered users</TableCell>
                    </TableRow>
                  ) : (
                    regDataFetch.map((row) => (
                      <TableRow
                        key={row._id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell align="center">{row.name}</TableCell>
                        <TableCell align="center">{row.email}</TableCell>
                        <TableCell align="center">{row.mobile}</TableCell>
                        <TableCell align="center">{row.alternate}</TableCell>
                        <TableCell align="center">{row.address}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Stack>

        {isModalOpen && selectedRowData && (
          <UpdateForm {...selectedRowData} onClose={handleCloseModal} />
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
