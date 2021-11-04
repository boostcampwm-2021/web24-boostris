import { fetchGithubUserData, fetchNaverUserData } from './userAPI';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface UserState {
  profile: { id: string | number | null; isOurUser: boolean };
  status: 'idle' | 'loading' | 'failed';
}

const initialState: UserState = {
  profile: { id: null, isOurUser: false },
  status: 'idle',
};

export const fetchGithubUser = createAsyncThunk(
  'user/fetchGithubUser',
  async (code: string) => {
    const response = await fetchGithubUserData(code);
    return response;
  }
);

export const fetchNaverUser = createAsyncThunk(
  'user/fetchNaverUser',
  async (accessToken: string) => {
    const response = await fetchNaverUserData(accessToken);
    return response;
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {},
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(fetchGithubUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGithubUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.profile = action.payload;
      })
      .addCase(fetchNaverUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNaverUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.profile = action.payload;
      });
  },
});

export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;