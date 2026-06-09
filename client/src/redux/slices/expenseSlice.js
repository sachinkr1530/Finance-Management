import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { expenseAPI } from '../../services/api';

export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await expenseAPI.getAll(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch expenses');
  }
});

export const addExpense = createAsyncThunk('expenses/add', async (data, { rejectWithValue }) => {
  try {
    const res = await expenseAPI.add(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to add expense');
  }
});

export const updateExpense = createAsyncThunk('expenses/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await expenseAPI.update(id, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to update expense');
  }
});

export const deleteExpense = createAsyncThunk('expenses/delete', async (id, { rejectWithValue }) => {
  try {
    await expenseAPI.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to delete expense');
  }
});

export const fetchExpenseStats = createAsyncThunk('expenses/fetchStats', async (params, { rejectWithValue }) => {
  try {
    const res = await expenseAPI.getStats(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to fetch stats');
  }
});

const expenseSlice = createSlice({
  name: 'expenses',
  initialState: {
    list: [],
    stats: null,
    categoryTotals: [],
    totalAmount: 0,
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    loading: false,
    error: null,
    filters: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      category: '',
      search: '',
      sortBy: 'date',
      sortOrder: 'desc',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        category: '',
        search: '',
        sortBy: 'date',
        sortOrder: 'desc',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => { state.loading = true; })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.expenses;
        state.categoryTotals = action.payload.categoryTotals;
        state.totalAmount = action.payload.totalAmount;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.list.unshift(action.payload.expense);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const idx = state.list.findIndex(e => e._id === action.payload.expense._id);
        if (idx !== -1) state.list[idx] = action.payload.expense;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.list = state.list.filter(e => e._id !== action.payload);
      })
      .addCase(fetchExpenseStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      });
  },
});

export const { setFilters, clearFilters } = expenseSlice.actions;
export default expenseSlice.reducer;
