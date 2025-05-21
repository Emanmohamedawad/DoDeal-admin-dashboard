import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const AUTH_HEADER = {
  headers: {
    Authorization:
      "Bearer eyJ0eXAiOiAiSldUIiwgInR5cGUiOiAiQmVhcmVyIiwgInZhbCI6ICIxMjM0NS1hYmNkLWVmZ2gtMTIzNC01Njc4OTAifQ==",
  },
};

const API_BASE_URL = "/api/proxy";

export const fetchUsers = createAsyncThunk<User[]>("users/fetch", async () => {
  const response = await axios.get<User[]>(`${API_BASE_URL}/users`);
  return response.data;
});

export const createUser = createAsyncThunk<User, Omit<User, "id">>(
  "users/create",
  async (data) => {
    const response = await axios.post<User>(
      `${API_BASE_URL}/users`,
      data,
      AUTH_HEADER
    );
    return response.data;
  }
);

export const editUser = createAsyncThunk<
  User,
  { id: number; data: Partial<User> }
>("users/edit", async ({ id, data }) => {
  const response = await axios.put<User>(
    `${API_BASE_URL}/users/${id}`,
    data,
    AUTH_HEADER
  );
  return response.data;
});

export interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  list: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  list: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(editUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(editUser.fulfilled, (state, action) => {
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(editUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
