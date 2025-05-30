import axios, { AxiosRequestConfig } from "axios";
import { store } from "@/store";
import { signInSuccess, signOutSuccess } from "@/store/slices/auth/authSlice";

const unauthorizedCode = [401, 403];

const BaseService = axios.create({
  timeout: 60000,
  baseURL: "/api",
});

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Request interceptor to add access token to headers
BaseService.interceptors.request.use(
  (config) => {
    
    const { accessToken } = store.getState().auth;
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh automatically
BaseService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;
    const originalRequest = error.config as CustomAxiosRequestConfig;

    console.log("Response response:", response);

    if (
      response &&
      unauthorizedCode.includes(response.status) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const { refreshToken, user } = store.getState().auth;
        console.log("refresh token: ", refreshToken)


      if (refreshToken) {
        try {
          // Call refresh token API (no headers, no body)
          const resp = await axios.post("/api/refresh-token", { refreshToken });    

          console.log("Refresh token response:", resp.data);
            const tokenResponse = resp.data;
            console.log("Token response:", tokenResponse.data);
          if (tokenResponse.statusCode === 200 && tokenResponse.data) {
            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
              user: updatedUser,
            } = tokenResponse.data;

            // Update store with new tokens
            store.dispatch(
              signInSuccess({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: updatedUser || user!,
              })
            );

            // Update Authorization header for original request
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newAccessToken}`,
            };

            // Retry original request with new token
            return BaseService(originalRequest);
          } else {
            store.dispatch(signOutSuccess());
            return Promise.reject(error);
          }
        } catch (refreshError) {
          store.dispatch(signOutSuccess());
          return Promise.reject(refreshError);
        }
      } else {
        store.dispatch(signOutSuccess());
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default BaseService;
