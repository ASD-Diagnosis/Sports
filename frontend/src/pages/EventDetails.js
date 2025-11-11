import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from "@mui/material";
import {
  Event,
  LocationOn,
  SportsSoccer,
  AccessTime,
  People,
  ConfirmationNumber,
  ShoppingCart,
} from "@mui/icons-material";
import { getEvent, reset } from "../redux/slices/eventSlice";
import { purchaseTicket } from "../redux/slices/ticketSlice";

const EventDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { currentEvent, isLoading, isError, message } = useSelector(
    (state) => state.events
  );
  const {
    isLoading: ticketLoading,
    isSuccess: ticketSuccess,
    message: ticketMessage,
  } = useSelector((state) => state.tickets);

  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(getEvent(id));
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch, id]);

  const handleBookingOpen = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setBookingDialog(true);
  };

  const handleBookingClose = () => {
    setBookingDialog(false);
    setSelectedCategory("");
    setQuantity(1);
  };

  const handleBookingSubmit = () => {
    if (!selectedCategory) {
      return;
    }

    const bookingData = {
      eventId: id,
      category: selectedCategory,
      quantity: parseInt(quantity),
      paymentMethod: "credit_card", // Default payment method
    };

    dispatch(purchaseTicket(bookingData));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "success";
      case "ongoing":
        return "warning";
      case "completed":
        return "default";
      default:
        return "default";
    }
  };

  const getAvailableSeats = (category) => {
    const totalSeats = category.totalSeats || 100;
    const bookedSeats = category.bookedSeats || 0;
    return totalSeats - bookedSeats;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isError || !currentEvent) {
    return (
      <Container maxWidth="lg">
        <Box py={8}>
          <Alert severity="error">{message || "Event not found"}</Alert>
        </Box>
      </Container>
    );
  }

  const selectedCategoryData = currentEvent.ticketCategories.find((cat) => {
    const key = cat.type ?? cat.name;
    return key === selectedCategory;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Event Header */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{ mr: 2, bgcolor: "primary.main", width: 56, height: 56 }}
                >
                  <SportsSoccer fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h3" component="h1" gutterBottom>
                    {currentEvent.title}
                  </Typography>
                  <Chip
                    label={currentEvent.status}
                    color={getStatusColor(currentEvent.status)}
                    sx={{ textTransform: "capitalize" }}
                  />
                </Box>
              </Box>

              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {currentEvent.sport.charAt(0).toUpperCase() +
                  currentEvent.sport.slice(1)}{" "}
                Match
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Typography variant="body1">
                  <Event sx={{ mr: 1, verticalAlign: "middle" }} />
                  {formatDate(currentEvent.date)}
                </Typography>
                <Typography variant="body1">
                  <AccessTime sx={{ mr: 1, verticalAlign: "middle" }} />
                  {formatTime(currentEvent.date)}
                </Typography>
                <Typography variant="body1">
                  <LocationOn sx={{ mr: 1, verticalAlign: "middle" }} />
                  {currentEvent.venue?.name}, {currentEvent.venue?.city}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                  From $
                  {Math.min(
                    ...currentEvent.ticketCategories.map((cat) => cat.price)
                  )}
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<ShoppingCart />}
                  onClick={handleBookingOpen}
                  disabled={currentEvent.status !== "upcoming"}
                >
                  {currentEvent.status === "upcoming"
                    ? "Book Tickets"
                    : "Event " + currentEvent.status}
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Event Details */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Description */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  About This Event
                </Typography>
                <Typography variant="body1" paragraph>
                  {currentEvent.description ||
                    "Experience an exciting sports event with top athletes competing at the highest level. Don't miss this opportunity to witness world-class sports action live!"}
                </Typography>
              </CardContent>
            </Card>

            {/* Venue Information */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Venue Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Venue Name"
                      secondary={currentEvent.venue?.name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Location"
                      secondary={`${currentEvent.venue?.address}, ${currentEvent.venue?.city}, ${currentEvent.venue?.country}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Capacity"
                      secondary={`${currentEvent.venue?.capacity} seats`}
                    />
                  </ListItem>
                  {currentEvent.venue?.facilities && (
                    <ListItem>
                      <ListItemText
                        primary="Facilities"
                        secondary={currentEvent.venue.facilities.join(", ")}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Ticket Categories */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Ticket Options
                </Typography>
                <List>
                  {currentEvent.ticketCategories.map((category) => {
                    const key = category.type ?? category.name;
                    return (
                      <ListItem key={key} divider>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ textTransform: "capitalize" }}
                              >
                                {key}
                              </Typography>
                              <Typography variant="h6" color="primary">
                                ${category.price}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                Available: {getAvailableSeats(category)} seats
                              </Typography>
                              {category.benefits && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {category.benefits.join(", ")}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Booking Dialog */}
        <Dialog
          open={bookingDialog}
          onClose={handleBookingClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Book Tickets</DialogTitle>
          <DialogContent>
            {ticketMessage && (
              <Alert
                severity={ticketSuccess ? "success" : "error"}
                sx={{ mb: 2 }}
              >
                {ticketMessage}
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Select Ticket Category
            </Typography>
            <RadioGroup
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              sx={{ mb: 3 }}
            >
              {currentEvent.ticketCategories.map((category) => {
                const key = category.type ?? category.name;
                return (
                  <Card key={key} sx={{ mb: 1 }}>
                    <CardContent sx={{ py: 2 }}>
                      <FormControlLabel
                        value={key}
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="subtitle1"
                                sx={{ textTransform: "capitalize" }}
                              >
                                {key}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Available: {getAvailableSeats(category)} seats
                              </Typography>
                            </Box>
                            <Typography variant="h6" color="primary">
                              ${category.price}
                            </Typography>
                          </Box>
                        }
                        sx={{ width: "100%", m: 0 }}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </RadioGroup>

            {selectedCategory && (
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                inputProps={{ min: 1, max: 10 }}
                sx={{ mb: 2 }}
              />
            )}

            {selectedCategoryData && (
              <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>
                    {quantity} x {selectedCategory} ticket
                    {quantity > 1 ? "s" : ""}
                  </Typography>
                  <Typography>
                    ${selectedCategoryData.price * quantity}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary">
                    ${selectedCategoryData.price * quantity}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleBookingClose}>Cancel</Button>
            <Button
              onClick={handleBookingSubmit}
              variant="contained"
              disabled={!selectedCategory || ticketLoading}
            >
              {ticketLoading ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default EventDetails;
