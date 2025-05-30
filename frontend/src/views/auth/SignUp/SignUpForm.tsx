import React, { useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Navigate to login page
  const goToLogin = () => {
    navigate("/login");
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/register", formData);

      console.log("Registration response:", response.data.statusCode);
      const userData = response.data;
      console.log("User data:", userData);

      if (userData.statusCode === 201) {
        toast.success(userData.message);
        navigate("/login");
      } else {
        toast.error("Registration failed!");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const message =
        error.response?.data?.message ||
        "An error occurred during registration.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="bg-white p-4 rounded shadow"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4">Sign Up</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-start w-100">Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

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
                className="mb-3 mx-auto"
              />
            )}
            <Button variant="primary" type="submit">
              Sign Up
            </Button>

            <p className="mt-4 text-center">
              Already have an account?{" "}
              <button
                className="btn btn-link p-0 text-decoration-none"
                onClick={goToLogin}
              >
                Login
              </button>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SignUpForm;
