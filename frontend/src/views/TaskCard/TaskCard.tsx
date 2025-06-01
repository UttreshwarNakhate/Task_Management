import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import BaseService from "../services/BaseService";

// Task interface
interface Task {
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  status: string;
}

const TaskCard = () => {
  // State variables for task details, user info, loading state, and updating state
  const [taskCard, setTaskCard] = useState<Task>({
    title: "",
    description: "",
    status: "",
  });
  const [userInfo, setUserInfo] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { taskId } = location.state;

  // Redux selector to get access accessToken
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Status colors mapping
  const statusColors: Record<string, string> = {
    Todo: "bg-blue-100 text-blue-600",
    InProgress: "bg-yellow-100 text-yellow-600",
    Completed: "bg-green-100 text-green-600",
  };

  // Fetch task details
  useEffect(() => {
    setLoading(true);
    fetchTaskDetails();
  }, [taskId]);

  // Function to fetch task details by ID
  const fetchTaskDetails = async () => {
    try {
      const response = await BaseService.get(`/getTaskById/${taskId}`);
      setLoading(false);
      setTaskCard(response.data.data);
    } catch (error) {
      setLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as AxiosError<any>;
      const message =
        err.response?.data?.error || "Error fetching task details";
      toast.error(message);
    }
  };

  // Fetch user info
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await BaseService.get("/me");
        setUserInfo(res.data.data);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as AxiosError<any>;
        const message =
          err.response?.data?.error || "Failed to fetch user profile";
        toast.error(message);
      }
    };
    fetchUserProfile();
  }, []);

  // Go back function
  const goBack = () => {
    navigate("/");
  };

  // Handle status change
  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setUpdating(true);
    const newStatus = e.target.value as Task["status"];

    try {
      const response = await BaseService.put(`/updateTask/${taskId}`, {
        status: newStatus,
      });
      const task = response.data.statusCode === 200;
      console.log(task);
      if (response.data.statusCode === 200) {
        console.log("Call is here");

        toast.success("Task status updated successfully");
        setUpdating(false);
        setTaskCard((prev) => ({ ...prev, status: newStatus }));
        // Wait 300ms before fetching
        setTimeout(() => {
          fetchTaskDetails();
        }, 1000);
      } else {
        setUpdating(false);
        toast.error("Error occured while updating status");
      }
    } catch (error) {
      setUpdating(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as AxiosError<any>;
      const message =
        err.response?.data?.error || "Failed to update task status";
      toast.error(message);
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl p-6 bg-white rounded-xl shadow-lg space-y-2">
          {/* Back Button */}
          <div className="flex justify-start">
            <Button
              variant="primary"
              onClick={goBack}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-1 rounded-lg"
            >
              ← Back
            </Button>
          </div>

          {/* Card Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700">
              📋 Task Details
            </h2>
          </div>

          {/* Card Content */}
          <div className="p-6 rounded-xl border bg-gray-50 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                {taskCard.title}
              </h3>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  statusColors[taskCard.status]
                }`}
              >
                {taskCard.status}
              </span>
            </div>

            <p className="text-gray-600">{taskCard.description}</p>

            {/* Timestamps */}
            <div className="text-sm text-gray-500 space-y-1">
              <div>
                🕒 Created:{" "}
                {taskCard.createdAt
                  ? new Date(taskCard.createdAt).toLocaleString()
                  : "N/A"}
              </div>
              <div>
                🔄 Updated:{" "}
                {taskCard.updatedAt
                  ? new Date(taskCard.updatedAt).toLocaleString()
                  : "N/A"}
              </div>
            </div>

            {/* Dropdown for Status Update */}
            <div className="flex justify-end">
              <div className="mt-4 w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Change Status
                </label>
                <select
                  value={taskCard.status}
                  onChange={handleStatusChange}
                  className="border w-full px-3 py-2 rounded-lg bg-white text-gray-700 focus:ring focus:border-blue-400"
                >
                  <option value="Todo">📌 Todo</option>
                  <option value="InProgress">🚧 In Progress</option>
                  <option value="Completed">✅ Completed</option>
                </select>
                {updating && (
                  <div className="flex items-center mt-2 text-sm text-blue-500">
                    <Spinner animation="grow" size="sm" className="mr-2" />{" "}
                    Updating...
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Updated By Info */}
          <div className="text-sm flex justify-end text-gray-600 mt-4">
            ✍️ Updated By: <strong>{userInfo?.username}</strong> <br />
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
