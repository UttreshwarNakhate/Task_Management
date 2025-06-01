import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import axios, { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { signInSuccess } from "@/store/slices/auth/authSlice";
import Spinner from "react-bootstrap/Spinner";

const SignInForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loginResponse = await axios.post("/api/login", {
        email: formData.email,
        password: formData.password,
      });
      const loginInfo = loginResponse.data;
      console.log("Login response:", loginInfo.message);
      const { accessToken, refreshToken, user } = loginInfo.data;
      // Store tokens and user in Redux

      console.log("LoninResponse: ", loginResponse);

      if (loginInfo.statusCode === 200) {
        toast.success(loginInfo.message);
        dispatch(signInSuccess({ accessToken, refreshToken, user }));
        setLoading(false);
        navigate("/");
      } else {
        toast.error("Login failed!");
      }
    } catch (error) {
      setLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as AxiosError<any>;
      const message = err.response?.data?.error;
      toast.error(message);
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="bg-white p-4 rounded shadow"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4">Sign In</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-start w-100">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-start w-100">Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="d-grid">
            {loading && (
              <Spinner
                animation="border"
                variant="primary"
                className="mb-3 flex justify-content-center items-center mx-auto"
              />
            )}
            <Button variant="primary" type="submit">
              Login
            </Button>

            <p className="mt-4">
              If you don't have an account?{" "}
              <button className="text-blue-600" onClick={goToSignup}>
                SignUp
              </button>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SignInForm;
