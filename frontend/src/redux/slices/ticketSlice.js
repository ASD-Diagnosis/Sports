import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://sports-96de.onrender.com/api";

// Get user tickets
export const getUserTickets = createAsyncThunk(
  "tickets/getUserTickets",
  async (params = {}, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(
        `${API_URL}/tickets?${queryString}`,
        config
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single ticket
export const getTicket = createAsyncThunk(
  "tickets/getTicket",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/tickets/${id}`, config);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Purchase ticket
export const purchaseTicket = createAsyncThunk(
  "tickets/purchaseTicket",
  async (ticketData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/tickets`,
        ticketData,
        config
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Cancel ticket
export const cancelTicket = createAsyncThunk(
  "tickets/cancelTicket",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `${API_URL}/tickets/${id}/cancel`,
        {},
        config
      );
      return { id, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Validate ticket (Admin only)
export const validateTicket = createAsyncThunk(
  "tickets/validateTicket",
  async (qrCode, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/tickets/validate`,
        { qrCode },
        config
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const ticketSlice = createSlice({
  name: "tickets",
  initialState: {
    tickets: [],
    currentTicket: null,
    validationResult: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  },
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    clearValidationResult: (state) => {
      state.validationResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get User Tickets
      .addCase(getUserTickets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tickets = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.tickets = [];
      })
      // Get Ticket
      .addCase(getTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentTicket = action.payload;
      })
      .addCase(getTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentTicket = null;
      })
      // Purchase Ticket
      .addCase(purchaseTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(purchaseTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        // Optionally add the new tickets to the list
        if (action.payload.data) {
          state.tickets.unshift(...action.payload.data);
        }
      })
      .addCase(purchaseTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Cancel Ticket
      .addCase(cancelTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        // Update ticket status in the list
        const index = state.tickets.findIndex(
          (ticket) => ticket._id === action.payload.id
        );
        if (index !== -1) {
          state.tickets[index].status = "cancelled";
        }
      })
      .addCase(cancelTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Validate Ticket
      .addCase(validateTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(validateTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.validationResult = action.payload;
      })
      .addCase(validateTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.validationResult = null;
      });
  },
});

export const { reset, clearCurrentTicket, clearValidationResult } =
  ticketSlice.actions;
export default ticketSlice.reducer;
