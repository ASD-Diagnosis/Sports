import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  QRCode,
} from "@mui/material";
import {
  ConfirmationNumber,
  Event,
  LocationOn,
  AccessTime,
  Cancel,
  QrCode,
  Download,
} from "@mui/icons-material";
import {
  getUserTickets,
  cancelTicket,
  reset,
} from "../redux/slices/ticketSlice";

const Tickets = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [qrDialog, setQrDialog] = useState(false);

  const dispatch = useDispatch();
  const { tickets, isLoading, isError, message, pagination } = useSelector(
    (state) => state.tickets
  );

  useEffect(() => {
    dispatch(getUserTickets({ status: getStatusFilter(activeTab) }));

    return () => {
      dispatch(reset());
    };
  }, [dispatch, activeTab]);

  const getStatusFilter = (tabIndex) => {
    const filters = ["", "active", "used", "cancelled"];
    return filters[tabIndex];
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCancelClick = (ticket) => {
    setSelectedTicket(ticket);
    setCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    if (selectedTicket) {
      dispatch(cancelTicket(selectedTicket._id));
      setCancelDialog(false);
      setSelectedTicket(null);
    }
  };

  const handleQrClick = (ticket) => {
    setSelectedTicket(ticket);
    setQrDialog(true);
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "used":
        return "default";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const canCancelTicket = (ticket) => {
    const eventDate = new Date(ticket.event?.date);
    const now = new Date();
    const hoursBefore = (eventDate - now) / (1000 * 60 * 60);
    return ticket.status === "active" && hoursBefore > 24;
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom textAlign="center">
          My Tickets
        </Typography>

        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="ticket status tabs"
          >
            <Tab label="All Tickets" />
            <Tab label="Active" />
            <Tab label="Used" />
            <Tab label="Cancelled" />
          </Tabs>
        </Box>

        {/* Tickets Grid */}
        {tickets.length > 0 ? (
          <Grid container spacing={3}>
            {tickets.map((ticket) => (
              <Grid item xs={12} md={6} lg={4} key={ticket._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                        <ConfirmationNumber />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h2" noWrap>
                          {ticket.event?.title}
                        </Typography>
                        <Chip
                          label={ticket.status}
                          size="small"
                          color={getStatusColor(ticket.status)}
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
                      {formatDate(ticket.event?.date)}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      <AccessTime
                        sx={{ mr: 1, fontSize: 16, verticalAlign: "middle" }}
                      />
                      {formatTime(ticket.event?.date)}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      <LocationOn
                        sx={{ mr: 1, fontSize: 16, verticalAlign: "middle" }}
                      />
                      {ticket.event?.venue?.name}, {ticket.event?.venue?.city}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2">
                        Category: <strong>{ticket.category}</strong>
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{ticket.price}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Purchased: {formatDate(ticket.purchaseDate)}
                    </Typography>

                    {ticket.seatNumber && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Seat: <strong>{ticket.seatNumber}</strong>
                      </Typography>
                    )}
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {ticket.status === "active" && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<QrCode />}
                          onClick={() => handleQrClick(ticket)}
                          fullWidth
                        >
                          Show QR
                        </Button>
                      )}

                      {canCancelTicket(ticket) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleCancelClick(ticket)}
                          fullWidth
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box textAlign="center" py={8}>
            <ConfirmationNumber
              sx={{ fontSize: 64, color: "grey.400", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No tickets found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0
                ? "You haven't purchased any tickets yet."
                : `No ${getStatusFilter(activeTab)} tickets found.`}
            </Typography>
          </Box>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
          <DialogTitle>Cancel Ticket</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel your ticket for "
              {selectedTicket?.event?.title}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone. Cancellation is only allowed up to
              24 hours before the event.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialog(false)}>Keep Ticket</Button>
            <Button
              onClick={handleCancelConfirm}
              color="error"
              variant="contained"
            >
              Cancel Ticket
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog
          open={qrDialog}
          onClose={() => setQrDialog(false)}
          maxWidth="sm"
        >
          <DialogTitle>Ticket QR Code</DialogTitle>
          <DialogContent sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Show this QR code at the venue entrance
            </Typography>

            {selectedTicket?.qrCode ? (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "white",
                  borderRadius: 1,
                  display: "inline-block",
                }}
              >
                {/* QR Code would be rendered here - placeholder for now */}
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: "grey.100",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <QrCode sx={{ fontSize: 80, color: "grey.500" }} />
                  <Typography
                    variant="caption"
                    sx={{ position: "absolute", mt: 10 }}
                  >
                    QR Code
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography color="error">QR Code not available</Typography>
            )}

            <Typography variant="body2" sx={{ mt: 2 }}>
              Ticket ID: {selectedTicket?._id}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQrDialog(false)}>Close</Button>
            <Button startIcon={<Download />} variant="contained">
              Download
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Tickets;
