import AsyncStorage from '@react-native-async-storage/async-storage';
import * as actionTypes from './actionTypes';

export interface AppState { user: Object, users: Array<Object>,networkStatus:Boolean, loading: Boolean, error: any, token:any};

const getInitialState=async()=>{
  const user = await AsyncStorage.getItem('user')||{};
  const users = await AsyncStorage.getItem('users')||[];
  const token = await AsyncStorage.getItem('token')||'';
  return {user,users,token,networkStatus:false,loading: false, error: null}
}

const reducer = (state = getInitialState(), { type, payload }: { type: string; payload: any }) => {
  switch (type) {
    case actionTypes.LOADING_REQUEST: return { ...state, loading: true };
    case actionTypes.LOADING_SUCCESS: return { ...state, loading: false };
    case actionTypes.LOGIN_REQUEST: return { ...state, loading: true };
    case actionTypes.LOGIN_SUCCESS: return { ...state, token: payload, loading: false };
    case actionTypes.LOGIN_FAILURE: return { ...state, error: payload, loading: false };
    case actionTypes.SIGNUP_REQUEST: return { ...state, loading: true };
    case actionTypes.SIGNUP_SUCCESS: return { ...state, token: payload, loading: false };
    case actionTypes.SIGNUP_FAILURE: return { ...state, error: payload, loading: false };
    case actionTypes.GET_NETWORK_STATUS_SUCCESS: return { ...state, networkStatus: payload};
    case actionTypes.GET_TOKEN_SUCCESS: return { ...state, token: payload, loading: false };
    case actionTypes.GET_USER_DETAILS_REQUEST: return { ...state, loading: true };
    case actionTypes.GET_USER_DETAILS_SUCCESS: return { ...state, user: payload, loading: false };
    case actionTypes.GET_USER_DETAILS_FAILURE: return { ...state, error: payload, loading: false };
    case actionTypes.GET_USERS_DETAILS_REQUEST: return { ...state, loading: true };
    case actionTypes.GET_USERS_DETAILS_SUCCESS: return { ...state, users: payload, loading: false };
    case actionTypes.GET_USERS_DETAILS_FAILURE: return { ...state, error: payload, loading: false };
    case actionTypes.UPDATE_USER_DETAILS_REQUEST: return { ...state, loading: true };
    case actionTypes.UPDATE_USER_DETAILS_SUCCESS: return { ...state, user: payload, loading: false };
    case actionTypes.UPDATE_USER_DETAILS_FAILURE: return { ...state, error: payload, loading: false };
    case actionTypes.USER_REPORT_REQUEST: return { ...state,loading: true };
    case actionTypes.USER_REPORT_SUCCESS: return { ...state,loading: false };
    case actionTypes.USER_REPORT_FAILURE: return { ...state,error:payload,loading:false};
    case actionTypes.GET_USER_LOCATION_BOTH_REQUESTS_REQUEST: return { ...state, loading: true };
    case actionTypes.GET_USER_LOCATION_BOTH_REQUESTS_SUCCESS: return { ...state, locationRequests: payload.locationRequests, locationApprovedRequests: payload.locationApprovedRequests, loading: false };
    case actionTypes.GET_USER_LOCATION_BOTH_REQUESTS_FAILURE: return { ...state, error: payload, loading: false };
    case actionTypes.LOGOUT: return getInitialState();
    default: return state;
  }
};

export default reducer;