import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Search,
  Event,
  LocationOn,
  SportsSoccer,
  FilterList,
} from "@mui/icons-material";
import { getEvents, reset } from "../redux/slices/eventSlice";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { events, isLoading, pagination } = useSelector(
    (state) => state.events
  );

  const sports = [
    "football",
    "cricket",
    "basketball",
    "tennis",
    "baseball",
    "hockey",
  ];

  useEffect(() => {
    const params = {
      page,
      limit: 12,
      search: searchTerm,
      sport: sportFilter,
      date: dateFilter,
    };

    dispatch(getEvents(params));

    return () => {
      dispatch(reset());
    };
  }, [dispatch, searchTerm, sportFilter, dateFilter, page]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleSportChange = (e) => {
    setSportFilter(e.target.value);
    setPage(1);
  };

  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSportFilter("");
    setDateFilter("");
    setPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Typography variant="h3" component="h1" gutterBottom textAlign="center">
          Sports Events
        </Typography>
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Discover and book tickets for exciting sports matches
        </Typography>

        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search events..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sport</InputLabel>
                <Select
                  value={sportFilter}
                  label="Sport"
                  onChange={handleSportChange}
                >
                  <MenuItem value="">
                    <em>All Sports</em>
                  </MenuItem>
                  {sports.map((sport) => (
                    <MenuItem key={sport} value={sport}>
                      {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={dateFilter}
                onChange={handleDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={clearFilters}
                  fullWidth
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Events Grid */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : events.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} lg={4} key={event._id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                          <SportsSoccer />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="h2" noWrap>
                            {event.title}
                          </Typography>
                          <Chip
                            label={event.status}
                            size="small"
                            color={getStatusColor(event.status)}
                            sx={{ textTransform: "capitalize" }}
                          />
                        </Box>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        <Event
                          sx={{ mr: 1, fontSize: 16, verticalAlign: "middle" }}
                        />
                        {formatDate(event.date)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        <LocationOn
                          sx={{ mr: 1, fontSize: 16, verticalAlign: "middle" }}
                        />
                        {event.venue?.name}, {event.venue?.city}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Sport:{" "}
                        {event.sport.charAt(0).toUpperCase() +
                          event.sport.slice(1)}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {event.ticketCategories.slice(0, 2).map((category) => (
                          <Chip
                            key={category.type}
                            label={`${category.type}: ₹${category.price}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {event.ticketCategories.length > 2 && (
                          <Chip
                            label={`+${event.ticketCategories.length - 2} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>

                    <CardActions>
                      <Button size="small" color="primary">
                        View Details
                      </Button>
                      <Button size="small" color="secondary">
                        Book Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={pagination.pages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        ) : (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No events found matching your criteria.
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Events;
