
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider,
  Badge,
  Container,
  Popover,
  Paper,
  CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AnnouncementIcon from '@mui/icons-material/Announcement';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch notifications when user loads
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Fetch notifications every minute for updates
  useEffect(() => {
    if (user) {
      const intervalId = setInterval(fetchUnreadCount, 60000); // Fetch count every minute
      return () => clearInterval(intervalId);
    }
  }, [user]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    setIsLoadingNotifications(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      } else {
        console.error('Error fetching notifications:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Fetch only unread count (for periodic updates)
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notification count');

      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Mark notifications as read
  const markAsRead = async (ids = null) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/notifications/mark-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notificationIds: ids // If null, mark all as read
        })
      });

      if (!response.ok) throw new Error('Failed to mark notifications as read');

      const data = await response.json();
      if (data.success) {
        // Update local state
        if (ids) {
          setNotifications(prev => 
            prev.map(n => 
              ids.includes(n._id) ? { ...n, isRead: true } : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - ids.length));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark this specific notification as read
    if (!notification.isRead) {
      markAsRead([notification._id]);
    }

    // Navigate based on notification type
    if (notification.type === 'complaint' || notification.type === 'status-update') {
      closeNotificationMenu();
      if (notification.relatedId) {
        navigate(`/ComplaintTracking/${notification.relatedId}`);
      } else {
        navigate('/ComplaintGrid');
      }
    } else if (notification.type === 'announcement') {
      closeNotificationMenu();
      navigate('/');
    }
  };

  // Handle notification menu
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    // Fetch latest notifications when menu is opened
    fetchNotifications();
  };

  const closeNotificationMenu = () => {
    setNotificationAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    await markAsRead(); // No IDs means mark all as read
  };

  // Handle user menu opening
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle user menu closing
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    handleMenuClose();
    navigate('/login');
  };

  // Toggle drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Get appropriate dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'citizen':
        return '/citizen-dashboard';
      case 'admin':
        return '/admin';
      case 'department':
        return '/department-dashboard';
      default:
        return '/dashboard';
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      text: 'Home',
      icon: <HomeIcon />,
      path: '/'
    },
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: getDashboardLink()
    },
    {
      text: 'Complaints',
      icon: <AssignmentIcon />,
      path: '/ComplaintGrid'
    },
    {
      text: 'Enquiry',
      icon: <HelpIcon />,
      path: '/Enquiry'
    }
  ];

  // Add role-specific menu items
  if (user?.role === 'admin') {
    menuItems.push({
      text: 'Admin Panel',
      icon: <AdminPanelSettingsIcon />,
      path: '/admin'
    });
  }

  if (user?.role === 'department') {
    menuItems.push({
      text: 'Announcements',
      icon: <AnnouncementIcon />,
      path: '/department-dashboard'
    });
  }

  const drawerContent = (
    <Box
      sx={{ width: 280 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        backgroundColor: '#002855',
        color: 'white'
      }}>
        <Avatar 
          sx={{ 
            width: 70, 
            height: 70, 
            bgcolor: '#FFB81C',
            color: '#002855',
            mb: 2,
            fontSize: '1.8rem',
            fontWeight: 700 
          }}
        >
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="h6" fontWeight={600}>
          {user?.name || 'Guest'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, textTransform: 'capitalize' }}>
          {user?.role || 'Not logged in'}
        </Typography>
      </Box>
      
      <List sx={{ py: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path}
            key={item.text} 
            selected={isActive(item.path)}
            sx={{
              py: 1.5,
              px: 3,
              backgroundColor: isActive(item.path) ? 'rgba(0, 120, 215, 0.1)' : 'transparent',
              borderLeft: isActive(item.path) ? '4px solid #002855' : '4px solid transparent',
              '&:hover': {
                backgroundColor: 'rgba(0, 120, 215, 0.05)',
              },
              '& .MuiListItemIcon-root': {
                minWidth: 40
              }
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? '#002855' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: isActive(item.path) ? 600 : 400
                }
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      {user && (
        <List>
          <ListItem 
            button 
            component={Link} 
            to="/profile"
            sx={{
              py: 1.5,
              px: 3,
              '& .MuiListItemIcon-root': {
                minWidth: 40
              }
            }}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </ListItem>
          
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 3,
              color: '#c62828',
              '& .MuiListItemIcon-root': {
                minWidth: 40,
                color: '#c62828'
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      )}
    </Box>
  );

  // Determine notification tooltip text
  const getNotificationTooltip = () => {
    if (unreadCount === 0) return 'No new notifications';
    return `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`;
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: '#002855', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0 } }}>
            {isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'white',
              }}
            >
              <Box 
                component="img" 
                src="/logo.png"
                alt="Logo"
                sx={{ 
                  height: 40, 
                  mr: 1,
                  display: { xs: 'none', sm: 'block' }
                }}
              />
              <Typography 
                variant="h6"
                sx={{ 
                  flexGrow: 1,
                  fontWeight: 700,
                  letterSpacing: '0.5px'
                }}
              >
              </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {menuItems.map((item) => (
                  <Button 
                    key={item.text}
                    component={Link} 
                    to={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    sx={{ 
                      mx: 0.5,
                      px: 2,
                      py: 1,
                      borderRadius: '8px',
                      position: 'relative',
                      fontWeight: isActive(item.path) ? 600 : 400,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      },
                      ...(isActive(item.path) ? {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 6,
                          left: '25%',
                          width: '50%',
                          height: 3,
                          borderRadius: '3px',
                          backgroundColor: '#FFB81C'
                        }
                      } : {})
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
            
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <IconButton 
                  color="inherit" 
                  sx={{ mx: 1, position: 'relative' }}
                  onClick={handleNotificationMenuOpen}
                  aria-label={getNotificationTooltip()}
                  aria-owns={Boolean(notificationAnchorEl) ? 'notification-menu' : undefined}
                  aria-haspopup="true"
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                
                <Button 
                  color="inherit" 
                  startIcon={
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: '#FFB81C', 
                        color: '#002855',
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                  }
                  onClick={handleMenuOpen}
                  sx={{ 
                    ml: 1,
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  endIcon={<i className="fas fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>}
                >
                  {!isMobile && (
                    <Box sx={{ textAlign: 'left', ml: 1 }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.2, fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9, textTransform: 'capitalize' }}>
                        {user.role}
                      </Typography>
                    </Box>
                  )}
                </Button>

                {/* Notifications Menu */}
                <Popover
                  id="notification-menu"
                  open={Boolean(notificationAnchorEl)}
                  anchorEl={notificationAnchorEl}
                  onClose={closeNotificationMenu}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      width: 320,
                      maxHeight: 420,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    px: 2, 
                    py: 1.5,
                    bgcolor: '#002855',
                    color: 'white'
                  }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Notifications
                    </Typography>
                    {unreadCount > 0 && (
                      <Button 
                        size="small" 
                        onClick={handleMarkAllRead}
                        sx={{ 
                          color: '#FFB81C',
                          textTransform: 'none',
                          '&:hover': { 
                            bgcolor: 'rgba(255, 255, 255, 0.1)' 
                          } 
                        }}
                      >
                        Mark all read
                      </Button>
                    )}
                  </Box>
                  
                  <Divider />
                  
                  {isLoadingNotifications ? (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      p: 3
                    }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : notifications.length > 0 ? (
                    <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
                      {notifications.map(notification => (
                        <MenuItem 
                          key={notification._id} 
                          onClick={() => handleNotificationClick(notification)}
                          sx={{ 
                            px: 2,
                            py: 1.5,
                            borderLeft: notification.isRead ? 'none' : '3px solid #FFB81C',
                            bgcolor: notification.isRead ? 'inherit' : 'rgba(255, 184, 28, 0.05)',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: notification.isRead ? 400 : 600,
                                fontSize: '0.875rem'
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.8125rem',
                                mt: 0.5,
                                lineHeight: 1.4
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'text.disabled',
                                display: 'block',
                                mt: 0.5
                              }}
                            >
                              {new Date(notification.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No notifications yet
                      </Typography>
                    </Box>
                  )}
                </Popover>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#002855',
                        width: 50,
                        height: 50,
                        fontSize: '1.5rem'
                      }}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" textTransform="capitalize">
                        {user.role}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <MenuItem component={Link} to={getDashboardLink()} onClick={handleMenuClose}>
                    <ListItemIcon>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    Dashboard
                  </MenuItem>
                  <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ color: '#c62828' }}
                  >
                    <ListItemIcon sx={{ color: '#c62828' }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  sx={{ borderRadius: '8px' }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained"
                  component={Link} 
                  to="/register"
                  sx={{ 
                    ml: 1, 
                    borderRadius: '8px',
                    bgcolor: '#FFB81C',
                    color: '#002855',
                    '&:hover': {
                      bgcolor: '#e5a50d'
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderRadius: '0 12px 12px 0'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
