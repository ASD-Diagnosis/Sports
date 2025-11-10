import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Event,
  People,
  ConfirmationNumber,
  TrendingUp,
  Add,
  Edit,
  Delete,
  SportsSoccer,
} from '@mui/icons-material';
import { getEvents, createEvent, updateEvent, deleteEvent, reset } from '../redux/slices/eventSlice';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [eventDialog, setEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    sport: '',
    date: '',
    venue: '',
    description: '',
    ticketCategories: [{ type: 'bleachers', price: 0, totalSeats: 100 }],
  });

  const dispatch = useDispatch();
  const { events, isLoading, isError, message } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(getEvents({ limit: 50 })); // Get all events for admin

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      sport: '',
      date: '',
      venue: '',
      description: '',
      ticketCategories: [{ type: 'bleachers', price: 0, totalSeats: 100 }],
    });
    setEventDialog(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      sport: event.sport,
      date: event.date,
      venue: event.venue,
      description: event.description,
      ticketCategories: event.ticketCategories,
    });
    setEventDialog(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      dispatch(deleteEvent(eventId));
    }
  };

  const handleEventSubmit = () => {
    if (editingEvent) {
      dispatch(updateEvent({ id: editingEvent._id, eventData: eventForm }));
    } else {
      dispatch(createEvent(eventForm));
    }
    setEventDialog(false);
  };

  const handleFormChange = (field, value) => {
    setEventForm({
      ...eventForm,
      [field]: value,
    });
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...eventForm.ticketCategories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setEventForm({
      ...eventForm,
      ticketCategories: updatedCategories,
    });
  };

  const addCategory = () => {
    setEventForm({
      ...eventForm,
      ticketCategories: [...eventForm.ticketCategories, { type: 'vip', price: 0, totalSeats: 50 }],
    });
  };

  const removeCategory = (index) => {
    const updatedCategories = eventForm.ticketCategories.filter((_, i) => i !== index);
    setEventForm({
      ...eventForm,
      ticketCategories: updatedCategories,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'success';
      case 'ongoing':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Mock statistics - in a real app, these would come from an API
  const stats = {
    totalEvents: events.length,
    totalTickets: events.reduce((sum, event) => sum + event.totalTicketsSold || 0, 0),
    totalRevenue: events.reduce((sum, event) => sum + (event.totalRevenue || 0), 0),
    upcomingEvents: events.filter(event => event.status === 'upcoming').length,
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <Event />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.totalEvents}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Events
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'success.main' }}>
                    <ConfirmationNumber />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.totalTickets}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tickets Sold
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'warning.main' }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">${stats.totalRevenue}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'info.main' }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="h4">{stats.upcomingEvents}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming Events
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Events Management" />
            <Tab label="Sales Analytics" />
          </Tabs>
        </Box>

        {/* Events Management Tab */}
        {activeTab === 0 && (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Events Management</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleCreateEvent}>
                Create Event
              </Button>
            </Box>

            {isError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {message}
              </Alert>
            )}

            {isLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Sport</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Tickets Sold</TableCell>
                      <TableCell>Revenue</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                              <SportsSoccer fontSize="small" />
                            </Avatar>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {event.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{event.sport}</TableCell>
                        <TableCell>{formatDate(event.date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={event.status}
                            size="small"
                            color={getStatusColor(event.status)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>{event.totalTicketsSold || 0}</TableCell>
                        <TableCell>${event.totalRevenue || 0}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleEditEvent(event)}
                            sx={{ mr: 1 }}
                          >
                            <Edit fontSize="small" />
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteEvent(event._id)}
                          >
                            <Delete fontSize="small" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Sales Analytics Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Sales Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Detailed sales analytics and reporting features would be implemented here.
            </Typography>
          </Box>
        )}

        {/* Event Dialog */}
        <Dialog open={eventDialog} onClose={() => setEventDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={eventForm.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Sport"
                  value={eventForm.sport}
                  onChange={(e) => handleFormChange('sport', e.target.value)}
                >
                  <MenuItem value="football">Football</MenuItem>
                  <MenuItem value="cricket">Cricket</MenuItem>
                  <MenuItem value="basketball">Basketball</MenuItem>
                  <MenuItem value="tennis">Tennis</MenuItem>
                  <MenuItem value="baseball">Baseball</MenuItem>
                  <MenuItem value="hockey">Hockey</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date & Time"
                  type="datetime-local"
                  value={eventForm.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Venue"
                  value={eventForm.venue}
                  onChange={(e) => handleFormChange('venue', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={eventForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </Grid>

              {/* Ticket Categories */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Ticket Categories
                </Typography>
                {eventForm.ticketCategories.map((category, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          select
                          label="Type"
                          value={category.type}
                          onChange={(e) => handleCategoryChange(index, 'type', e.target.value)}
                        >
                          <MenuItem value="bleachers">Bleachers</MenuItem>
                          <MenuItem value="vip">VIP</MenuItem>
                          <MenuItem value="premium">Premium</MenuItem>
                          <MenuItem value="box">Box</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Price"
                          type="number"
                          value={category.price}
                          onChange={(e) => handleCategoryChange(index, 'price', parseFloat(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Total Seats"
                          type="number"
                          value={category.totalSeats}
                          onChange={(e) => handleCategoryChange(index, 'totalSeats', parseInt(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Button
                          color="error"
                          onClick={() => removeCategory(index)}
                          disabled={eventForm.ticketCategories.length === 1}
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Button onClick={addCategory}>Add Category</Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEventDialog(false)}>Cancel</Button>
            <Button onClick={handleEventSubmit} variant="contained">
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
