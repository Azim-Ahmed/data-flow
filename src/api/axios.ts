import axios, { AxiosInstance, AxiosResponse } from "axios";



const createApiInstance = (baseURL?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    async (config) => {
    
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (response?.data?.message) {
        // TODO: Show success message
      }
      return response.data;
    },
    async (error) => {
      if (error.response?.data?.message) {
        // TODO: Show error message
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        // window.location.reload()
      }
      return Promise.reject(error.response?.data);
    }
  );

  return instance;
};


const nextApi = createApiInstance();

export {  nextApi };
