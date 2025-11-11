import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
} from "@mui/material";
import {
  SportsSoccer,
  Event,
  ConfirmationNumber,
  Star,
  TrendingUp,
} from "@mui/icons-material";
import { getEvents } from "../redux/slices/eventSlice";
import { green, red } from "@mui/material/colors";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { events, isLoading } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Get upcoming events for homepage
    dispatch(getEvents({ limit: 6, sort: "date", upcoming: true }));
  }, [dispatch]);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Welcome to Sports Tickets
          </Typography>
          <Typography variant="h5" component="p" gutterBottom>
            Discover and book tickets for the best sports events in your area
          </Typography>
          <Typography
            variant="h5"
            component="p"
            gutterBottom
            sx={{ color: red[500] }}
          >
            If data is not loading, wait for 45 seconds for server to boot up.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/events")}
              sx={{
                mr: 2,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              Browse Events
            </Button>
            {!user && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/register")}
                sx={{
                  color: "white",
                  borderColor: "white",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Join Now
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Upcoming Events Section */}
      <Box sx={{ backgroundColor: "#f5f5f5", py: 8 }}>
        <Container>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
          >
            Upcoming Events
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Don't miss out on these exciting matches
          </Typography>

          {isLoading ? (
            <Typography textAlign="center">Loading events...</Typography>
          ) : events.length > 0 ? (
            <Grid container spacing={3}>
              {events.slice(0, 3).map((event) => (
                <Grid item xs={12} md={4} key={event._id}>
                  <Card
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.3s ease-in-out",
                      },
                    }}
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                          <SportsSoccer />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="h3">
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.sport}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <Event
                          sx={{ mr: 1, fontSize: 16, verticalAlign: "middle" }}
                        />
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {event.venue?.name}, {event.venue?.city}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {event.ticketCategories.map((category) => (
                          <Chip
                            key={category.type}
                            label={`${category.type}: ₹${category.price}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </CardContent>

                    <CardActions>
                      <Button size="small" color="primary">
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography textAlign="center" color="text.secondary">
              No upcoming events at the moment.
            </Typography>
          )}

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/events")}
            >
              View All Events
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
