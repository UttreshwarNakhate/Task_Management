import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import { Bounce, ToastContainer, toast } from "react-toastify";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { CiCircleInfo } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import { FiLogOut } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { signOutSuccess } from "@/store/slices/auth/authSlice";
import BaseService from "@/views/services/BaseService";

// interface for task response data
interface Task {
  _id: string;
  title: string;
  description: string;
  status: "Todo" | "InProgress" | "completed";
  createdAt: string;
  updatedAt: string;
}

const TaskInfoTable = () => {
  // State variables for managing task data, pagination, modals, search, and form data
  const [modalShow, setModalShow] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [openEditModel, setEditOpenModel] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updateTaskInfo, setUpdateTaskInfo] = useState<Task | null>(null);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState(false);
  const [notTasks, setNoTasks] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Todo",
  });

  // Initialize the useNavigate hook for navigation
  const navigate = useNavigate();

  // Redux dispatch function to dispatch actions
  const dispatch = useDispatch();

  // Redux selector to get access accessToken
  const userId = useSelector((state: RootState) => state?.auth?.user?.id);

  // Fetch tasks when the component mounts or when pagination, page size, or status filter changes
  useEffect(() => {
    fetchTasks(currentPage);
  }, [currentPage, pageSize, statusFilter]);

  // Handle search when searchQuery or task list changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, taskList]);

  // Function to fetch tasks from the API
  const fetchTasks = async (page: number) => {
    try {
      setNoTasks('')
      const response = await BaseService.get(`/getTasks`, {
        params: {
          page,
          limit: pageSize,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
      });
      // Access the tasks array from the correct path
      const tasks = response.data.data.tasks;
      setLoading(false);
      if (tasks.length !== 0) {
        setTaskList(tasks);
        setTotalPages(response.data.data.totalPages);
        setFilteredTasks(tasks);
      } else {
        setNoTasks("No tasks found. Please create a task first.");
        setLoading(false);
        toast.error("No tasks found. Please create a task first.");
      }
    } catch (error) {
      setLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as AxiosError<any>;
      const message = err.response?.data?.error;
      toast.error(message);
    }
  };

  // Function to handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredTasks(taskList);
    } else {
      const filtered = taskList.filter(
        (task) =>
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          task.status.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  };

  // Handle input changes for the form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle search when searchQuery or task list changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, taskList]);

  // Default form state for resetting the form
  const defaultFormState = {
    title: "",
    description: "",
    status: "Todo",
  };

  // Function to handle form submission for adding a new task
  const createTask = async () => {
    try {
      setCreateLoading(true);
      const response = await BaseService.post(`/createTask`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      const tasks = response.data;
      if (tasks.statusCode === 201) {
        setCreateLoading(false);
        setFormData(defaultFormState);
        fetchTasks(currentPage); // Refresh the list
        toast.success(tasks.message);
        setModalShow(false);
      } else {
        setCreateLoading(false);
        setFormData(defaultFormState);
        toast.error("Failed to add task!");
      }
    } catch (error) {
      setCreateLoading(false);
      setFormData(defaultFormState);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as AxiosError<any>;
      const message = err.response?.data?.error || "An error occurred while adding the task.";
      toast.error(message);
    }
    setModalShow(false);
  };

  // Function to handle input changes for editing task data
  const handleEditInputChange = (e: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = e.target;
    setUpdateTaskInfo((prev) => ({ ...prev!, [name]: value }));
  };

  // Function to fetch specific task's data for editing
  const editTask = async (taskId: string) => {
    try {
      const response = await BaseService.get(`/getTaskById/${taskId}`);
      console.log("Response from API:", response.data);
      const task = response.data.data;
      console.log("Task data:", task);
      if (task) {
        setUpdateTaskInfo(task);
        setEditOpenModel(true);
      } else {
        console.error("No data found in response");
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as AxiosError<any>;
      const message = err.response?.data?.error ||"Error updating task";
      toast.error(message);
    }
  };

  // Function to update task data
  const updateTask = async () => {
    try {
      setUpdating(true);

      const response = await BaseService.put(
        `/updateTask/${updateTaskInfo?._id}`,
        updateTaskInfo
      );
      console.log("Response from API:", response.data);
      const task = response.data;
      console.log("Updated task data:", task.statusCode);

      if (task.statusCode === 200) {
        setUpdating(false);
        toast.success(task.message);
        setEditOpenModel(false);
        fetchTasks(currentPage); // Refresh the list
      } else {
        setUpdating(false);
        toast.error("Failed to update task!");
      }
    } catch (error) {
      setUpdating(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as AxiosError<any>;
      const message = err.response?.data?.error || 'An error occurred while updating the task.';
      toast.error(message);
    }
  };

  // Function to confirm task deletion
  const confirmDeleteTask = (id: string) => {
    setDeleteTaskId(id);
    setShowDeleteModal(true);
  };

  // Function to delete a task
  const deleteTask = async () => {
    try {
      setDeleteLoading(true);
      const response = await BaseService.delete(`/deleteTask/${deleteTaskId}`);
      const task = response.data;
      if (task.statusCode === 200) {
        setDeleteLoading(false);
        toast.success(response.data.message);
        fetchTasks(currentPage);
        setShowDeleteModal(false);
      } else {
        setDeleteLoading(false);
        toast.error("Failed to delete task!");
      }
    } catch (error) {
      setDeleteLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as AxiosError<any>;
      const message = err.response?.data?.error || "An error occurred while deleting the task.";
      toast.error(message);
     }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const response = await BaseService.post("/logout", {});

      const logoutResponse = response.data;
      console.log("Logout response data:", logoutResponse.statusCode);

      if (logoutResponse.statusCode === 200) {
        toast.success("Logout successful!");
        setTimeout(() => {
          dispatch(signOutSuccess());
          navigate("/login");
        }, 1000);
      } else {
        toast.warning("Server responded but logout might have failed.");
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as AxiosError<any>;
      const message = err.response?.data?.error || 'Failed to log out from server.';
      toast.error(message);
    }
  };

  // Function to redirect to the card details page
  const redirectToTaskDetails = (id: string) => {
    navigate("/taskCard", {
      state: {
        taskId: id,
      },
    });
  };

  return (
    <>
      {/* React tost container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      {/* Container is used to show table */}
      <div className="container mx-auto p-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow"
        >
          <FiLogOut className="text-xl" />
          Logout
        </button>
        <div className="flex justify-between my-2">
          <input
            type="search"
            placeholder="Search..."
            className="border-1 px-4 my-2 rounded-lg text-black"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <div className="flex justify-end my-auto p-2 bg-gray-300 rounded-md">
            <Form.Select
              className="w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Todo">Todo</option>
              <option value="InProgress">In-Progress</option>
              <option value="Completed">Completed</option>
            </Form.Select>
          </div>
          <Button
            variant="primary"
            onClick={() => setModalShow(true)}
            className="border-1 px-4 py-2 cursor-pointer rounded-lg bg-sky-300 text-white"
          >
            Create New Task
          </Button>
        </div>
        {/* Show the task details list int the table view */}
        <div className="flex flex-col justify-center">
          <Table
            striped
            bordered
            hover
            className="shadow-lg rounded-lg text-center"
          >
            {loading ? (
              <div className="flex justify-center items-center h-20 mx-auto my-auto">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <>
                <thead className="bg-blue-500 text-white text-lg">
                  <tr>
                    <th className="px-4 py-3">Sr. No.</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Staus</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks ? (
                    filteredTasks.map((task, index) => (
                      <tr key={task._id} className="border-b hover:bg-gray-100">
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4">{task.title}</td>
                        <td className="px-6 py-4">{task.description}</td>
                        <td className="px-6 py-4">{task.status}</td>
                        <td className="px-6 py-4">
                          <Button
                            variant="primary"
                            className="border-1 cursor-pointer px-4 py-1 rounded-lg bg-cyan-300 text-white"
                            onClick={() => redirectToTaskDetails(task._id)}
                          >
                            View
                          </Button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-between">
                            <Button
                              variant="primary"
                              className="border-1 cursor-pointer px-4 py-1 rounded-lg bg-cyan-300 text-white"
                              onClick={() => editTask(task._id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              className="border-1 cursor-pointer px-4 py-1 rounded-lg bg-cyan-300 text-white"
                              onClick={() => confirmDeleteTask(task._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-red-500">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </>
            )}
          </Table>

          {/*Tasks Not found message */}
          <span className="text-gray-500 my-4 w-fit bg-gray-200 p-2 rounded-xl font-semibold text-base">
            {notTasks}
          </span>

          <div className="flex justify-between">
            {/* Perpage records */}
            <div className="flex justify-start my-auto p-2 bg-gray-300 rounded-md">
              <Form.Select
                aria-label="Default select example"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value="10">10/page</option>
                <option value="25">25/page</option>
                <option value="50">50/page</option>
                <option value="75">75/page</option>
                <option value="100">100/page</option>
              </Form.Select>
            </div>
            {/* Pagination buttons */}
            <div className="d-flex gap-2 p-2 bg-gray-300 rounded-md">
              <Button
                variant="info"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="border-1 cursor-pointer px-4 py-1 rounded-lg bg-cyan-300 text-black"
              >
                First
              </Button>
              <Button
                variant="info"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-1 cursor-pointer px-4 py-1 rounded-lg bg-cyan-300 text-black"
              >
                Previous
              </Button>
              <span className="border-1 cursor-pointer px-4 py-1 rounded-md bg-cyan-300 text-black">
                {currentPage}
              </span>
              <Button
                variant="info"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="border-1 cursor-pointer px-4 py-1 rounded-lg bg-cyan-300 text-black"
              >
                Next
              </Button>
              <Button
                variant="info"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="border-1 cursor-pointer px-4 py-1 rounded-lg bg-cyan-300 text-black"
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Model to add task info */}
      <Modal
        size="md"
        centered
        show={modalShow}
        onHide={() => setModalShow(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Task</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="Please enter title"
                value={formData.title}
                onChange={handleChange}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                placeholder="Please enter description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        {createLoading && (
          <div className="flex justify-center items-center">
            <Spinner animation="border" variant="primary" />
          </div>
        )}
        <Modal.Footer>
          <Button variant="danger" onClick={() => setModalShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={createTask}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Model to update task info */}
      <Modal
        size="lg"
        centered
        show={openEditModel}
        onHide={() => setEditOpenModel(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Task Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={updateTaskInfo?.title || ""}
                onChange={handleEditInputChange}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={updateTaskInfo?.description || ""}
                onChange={handleEditInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {updating && (
            <div className="flex justify-center items-center h-0 mx-auto my-auto">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          <Button variant="primary" onClick={updateTask}>
            Update
          </Button>
          <Button variant="danger" onClick={() => setEditOpenModel(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Model to delete the task info */}
      <Modal
        size="md"
        centered
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col justify-center items-center">
            <CiCircleInfo color="orange" className="text-center" size={40} />
            <span className="text-md font-semibold text-gray-500 text-center">
              Are you sure
            </span>
            <p className="text-sm text-center my-2">
              If you delete this task then this actione can not be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {deleteLoading && (
            <div className="flex justify-center items-center h-0">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
          <Button variant="primary" onClick={deleteTask}>
            Yes, delete it!
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TaskInfoTable;
