import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IApp {
   mode : "Work" | "Break" | "Prepare" | undefined
}

const initialState: IApp = {
   mode : "Prepare"
}

const AppState = createSlice({
   name : "app",
   initialState,
   reducers : {
      setMode(state, payload: PayloadAction<IApp['mode']>) {
         state.mode = payload.payload
      }
   }
})

const store = configureStore({
   reducer : {
      app : AppState.reducer
   }
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const { setMode } = AppState.actions
export default store