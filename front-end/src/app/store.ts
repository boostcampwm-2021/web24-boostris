import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import userReducer from '../features/user/userSlice';
import socketReducer from '../features/socket/socketSlice';
import friendReducer from '../features/friend/friendSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    socket: socketReducer,
    friend: friendReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
