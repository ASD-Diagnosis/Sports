import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://sports-96de.onrender.com";

// Get events
export const getEvents = createAsyncThunk(
  "events/getEvents",
  async (params = {}, thunkAPI) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}/events?${queryString}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single event
export const getEvent = createAsyncThunk(
  "events/getEvent",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/events/${id}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create event (Admin only)
export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${API_URL}/events`, eventData, config);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update event (Admin only)
export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, eventData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(
        `${API_URL}/events/${id}`,
        eventData,
        config
      );
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete event (Admin only)
export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`${API_URL}/events/${id}`, config);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get event stats (Admin only)
export const getEventStats = createAsyncThunk(
  "events/getEventStats",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/events/${id}/stats`, config);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState: {
    events: [],
    currentEvent: null,
    eventStats: null,
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
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    clearEventStats: (state) => {
      state.eventStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Events
      .addCase(getEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.events = [];
      })
      // Get Event
      .addCase(getEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentEvent = action.payload;
      })
      .addCase(getEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.currentEvent = null;
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.events.findIndex(
          (event) => event._id === action.payload._id
        );
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        if (
          state.currentEvent &&
          state.currentEvent._id === action.payload._id
        ) {
          state.currentEvent = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events = state.events.filter(
          (event) => event._id !== action.payload
        );
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get Event Stats
      .addCase(getEventStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEventStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.eventStats = action.payload;
      })
      .addCase(getEventStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.eventStats = null;
      });
  },
});

export const { reset, clearCurrentEvent, clearEventStats } = eventSlice.actions;
export default eventSlice.reducer;
