import "./App.css";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TaskCard from "./views/TaskCard";
import TaskInfo from "./views/TaskInfo";
import ProtectedRoute from "./components/ProtectedRoute";
import SignInForm from "./views/auth/SignIn";
import SignUp from "./views/auth/SignUp";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<SignInForm />} />
         <Route path="/signup" element={<SignUp />} /> 
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TaskInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/taskCard"
          element={
            <ProtectedRoute>
              <TaskCard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
