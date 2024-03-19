import axios from 'axios';
import * as actionTypes from './actionTypes';
import { url } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodedType } from '../types';
import jwtDecode from 'jwt-decode';

const loadingRequest = () => ({ type: actionTypes.LOADING_REQUEST })
const loadingSuccess = () => ({ type: actionTypes.LOADING_SUCCESS })

const getNetworkStatusSuccess = (payload: Boolean) => ({ type: actionTypes.GET_NETWORK_STATUS_SUCCESS, payload })

const getTokenSuccess = (payload: String) => ({ type: actionTypes.GET_TOKEN_SUCCESS, payload })

const SignupRequest = () => ({ type: actionTypes.SIGNUP_REQUEST })
const SignupSuccess = (payload: Object) => ({ type: actionTypes.SIGNUP_SUCCESS, payload })
const SignupFailure = (payload: any) => ({ type: actionTypes.SIGNUP_FAILURE, payload })

const loginRequest = () => ({ type: actionTypes.LOGIN_REQUEST })
const loginSuccess = (payload: Object) => ({ type: actionTypes.LOGIN_SUCCESS, payload })
const loginFailure = (payload: any) => ({ type: actionTypes.LOGIN_FAILURE, payload })

const getUserDetailsRequest = () => ({ type: actionTypes.GET_USER_DETAILS_REQUEST })
const getUserDetailsSuccess = (payload: Object) => ({ type: actionTypes.GET_USER_DETAILS_SUCCESS, payload })
const getUserDetailsFailure = (payload: any) => ({ type: actionTypes.GET_USER_DETAILS_FAILURE, payload })

const UserReportRequest = () => ({ type: actionTypes.USER_REPORT_REQUEST })
const UserReportSuccess = (payload: Object) => ({ type: actionTypes.USER_REPORT_SUCCESS, payload })
const UserReportFailure = (payload: any) => ({ type: actionTypes.USER_REPORT_FAILURE, payload })

const getUsersDetailsRequest = () => ({ type: actionTypes.GET_USERS_DETAILS_REQUEST })
const getUsersDetailsSuccess = (payload: Object) => ({ type: actionTypes.GET_USERS_DETAILS_SUCCESS, payload })
const getUsersDetailsFailure = (payload: any) => ({ type: actionTypes.GET_USERS_DETAILS_FAILURE, payload })

const updateUserDetailsRequest = () => ({ type: actionTypes.UPDATE_USER_DETAILS_REQUEST })
const updateUserDetailsSuccess = (payload: Object) => ({ type: actionTypes.UPDATE_USER_DETAILS_SUCCESS, payload })
const updateUserDetailsFailure = (payload: any) => ({ type: actionTypes.UPDATE_USER_DETAILS_FAILURE, payload })

const logoutRequest = () => ({ type: actionTypes.LOGOUT })

export const loadingRequestAction = (dispatch: any) => {
    dispatch(loadingRequest());
}

export const loadingSuccessAction = (dispatch: any) => {
    dispatch(loadingSuccess());
}

export const getNetworkStatusAction = (status: Boolean, dispatch: any) => {
    dispatch(getNetworkStatusSuccess(status))
}

export const getTokenAction = (token: any, dispatch: any) => {
    dispatch(getTokenSuccess(token))
}

export const signupAction = async (user: Object, dispatch: any) => {
    dispatch(SignupRequest());
    try {
        const {data} = await axios.post(`${url}/users/add`, user);
        await AsyncStorage.setItem('token', data?.token);
        dispatch(SignupSuccess(data?.token));
        return data;
    } catch (error) {
        console.log('error',error)
        dispatch(SignupFailure(error))
        throw error;
    }
}

export const loginAction = async (user: Object, dispatch: any) => {
    dispatch(loginRequest());
    try {
        const { data } = await axios.post(`${url}/users/login`, user);
        if(!(data.msg=="User not found"))await AsyncStorage.setItem('token', data?.token);
        dispatch(loginSuccess(data?.token));
        return data;
    } catch (error) {
        dispatch(loginFailure(error))
        throw error;
    }
}

export const logoutAction = async (dispatch: any) => {
    try {
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('user')
        await AsyncStorage.removeItem('users')
        dispatch(logoutRequest());
        return null;
    } catch (error) {
        throw error;
    }
}

export const setOffileStatusAction = async (userId: String) => {
    const { data } = await axios.patch(`${url}/users/logout/${userId}`);
    return data;
}

export const getUserDetailsAction = async (dispatch: any) => {
    dispatch(getUserDetailsRequest());
    try {
        const decodedToken: decodedType = jwtDecode(await AsyncStorage.getItem('token') || '');
        const { data } = await axios.get(`${url}/users/${decodedToken.userId}`);
        const { data: u } = data;
        dispatch(getUserDetailsSuccess(u));
        return u;
    }catch(error){
        dispatch(getUserDetailsFailure(error));
        throw error;
    }
}

export const getUsersDetailsAction = async (dispatch: any) => {
    dispatch(getUsersDetailsRequest());
    let token;
    try {
        token = await AsyncStorage.getItem('token');
        const { data } = await axios.get(`${url}/users`, { headers: { token } });
        const { data: users } = data;
        dispatch(getUsersDetailsSuccess(users));
        return users;
    } catch (error) {
        console.log('error', error)
        dispatch(getUsersDetailsFailure(error));
        throw error;
    }
}

export const updateUserDetailsAction = async (userId: any, updateObj: Object, dispatch: any) => {
    dispatch(updateUserDetailsRequest());
    let token = await AsyncStorage.getItem('token');
    try {
        const { data } = await axios.patch(`${url}/users/update/${userId}`, updateObj, { headers: { token } });
        dispatch(updateUserDetailsSuccess(data?.data));
        return data?.data;
    } catch (error) {
        console.log('error', error)
        dispatch(updateUserDetailsFailure(error));
        throw error;
    }
}

export const userReportAction = async (report: Object, dispatch: any) => {
    dispatch(UserReportRequest());
    let token;
    try {
        token = await AsyncStorage.getItem('token');
        const { data } = await axios.post(`${url}/reports/add`, report, { headers: { token } });
        dispatch(UserReportSuccess(data))
        return data;
    } catch (error) {
        dispatch(UserReportFailure(error))
        throw error;
    }
}


export const userCallAction = async (callee: Object) => {
    let token;
    try {
        token = await AsyncStorage.getItem('token');
     const { data } = await axios.post(`${url}/calls/add`, { callee }, { headers: { token } });
     return data;
    } catch (error) {
    //    console.log(error);
    }
}

export const userKycAction = async (videoLink: Object) => {
    try {
        const { data } = await axios.post(`${url}/users/kyc`, { videoLink });
        return data;
    } catch (error) {
        console.log('error in kyc action',error)
        throw error;
    }
}