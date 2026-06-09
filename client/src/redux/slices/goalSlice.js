import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { goalAPI } from '../../services/api';

export const fetchGoals = createAsyncThunk('goals/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await goalAPI.getAll(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch goals');
  }
});

export const createGoal = createAsyncThunk('goals/create', async (data, { rejectWithValue }) => {
  try {
    const res = await goalAPI.create(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to create goal');
  }
});

export const updateGoal = createAsyncThunk('goals/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await goalAPI.update(id, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update goal');
  }
});

export const deleteGoal = createAsyncThunk('goals/delete', async (id, { rejectWithValue }) => {
  try {
    await goalAPI.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete goal');
  }
});

export const addSavingsToGoal = createAsyncThunk('goals/addSavings', async ({ id, amount }, { rejectWithValue }) => {
  try {
    const res = await goalAPI.addSavings(id, { amount });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to add savings');
  }
});

const goalSlice = createSlice({
  name: 'goals',
  initialState: {
    list: [],
    summary: { totalGoals: 0, activeGoals: 0, completedGoals: 0, totalSaved: 0, totalTarget: 0, overallProgress: 0 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => { state.loading = true; })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.goals;
        state.summary = action.payload.summary;
      })
      .addCase(fetchGoals.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.list.push(action.payload.goal);
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        const idx = state.list.findIndex(g => g._id === action.payload.goal._id);
        if (idx !== -1) state.list[idx] = action.payload.goal;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.list = state.list.filter(g => g._id !== action.payload);
      })
      .addCase(addSavingsToGoal.fulfilled, (state, action) => {
        const idx = state.list.findIndex(g => g._id === action.payload.goal._id);
        if (idx !== -1) state.list[idx] = action.payload.goal;
      });
  },
});

export default goalSlice.reducer;
