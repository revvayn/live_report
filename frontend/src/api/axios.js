import axios from "axios";

const getBaseURL = () => {
  if (window.location.hostname === "localhost") {
    return "http://localhost:5000/api";
  } else {
    return `http://${window.location.hostname}:5000/api`;
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

export default api;
