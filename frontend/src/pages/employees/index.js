import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
  Mail,
  Briefcase,
  Building2,
} from "lucide-react";
import axios from "axios";

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    status: "active",
  });

  // Fetch employees
  useEffect(() => {
    getEmployees();
  }, []);

  // Filter employees based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query) ||
          emp.role.toLowerCase().includes(query)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const getEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/employee/getAllEmployees"
      );
      if (!response.data.success) {
        throw new Error(`Failed to fetch employees: ${response?.status}`);
      }
      const data = response.data.dbResponse.result;
      console.log(data);
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCurrentEmployee(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      role: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      role: employee.role,
      status: employee.status,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEmployee(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      role: "",
      status: "active",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      if (currentEmployee) {
        // Update existing employee
        const response = await axios.put(
          `http://localhost:5000/api/employee/updateEmployee/${currentEmployee.id}`,
          formData
        );
        if (!response.data.success) {
          throw new Error(`Failed to update employee: ${response.status}`);
        }
      } else {
        // Create new employee
        const response = await axios.post(
          "http://localhost:5000/api/employee/addEmployee",
          formData
        );
        if (!response.data.success) {
          throw new Error(`Failed to create employee: ${response.status}`);
        }
      }
      await getEmployees();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (employeeId) => {
    setDeleteEmployeeId(employeeId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteEmployeeId(null);
  };

  const handleDelete = async () => {
    setError(null);
    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:5000/api/employee/deleteEmployee/${deleteEmployeeId}`);
      if (!response.data.success) {
        throw new Error(`Failed to delete employee: ${response.status}`);
      }
      await getEmployees();
      handleCloseDeleteModal();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#121212] font-['Nanum_Gothic']">
      {/* Header */}
      <header
        className="bg-white dark:bg-[#1E1E1E] border-b border-[#EDF0F4] dark:border-[#333333] px-6 py-4"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#4F8BFF] dark:bg-[#5B94FF] rounded-lg flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <h1 className="text-[#07111F] dark:text-[#E5E5E5] font-['Lato'] font-extrabold text-2xl">
              Employee Management
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8A94A7] dark:text-[#808080]"
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E1E6ED] dark:border-[#404040] rounded-lg text-sm text-[#07111F] dark:text-[#E5E5E5] placeholder-[#8A94A7] dark:placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF] dark:focus:ring-[#5B94FF] focus:border-[#4F8BFF] dark:focus:border-[#5B94FF]"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center px-4 py-2 bg-[#4F8BFF] dark:bg-[#5B94FF] text-white rounded-lg hover:bg-[#3D6FE5] dark:hover:bg-[#4F8BFF] active:bg-[#2A5CC7] dark:active:bg-[#3D6FE5] transition-colors"
          >
            <Plus size={18} className="mr-2" />
            <span className="text-sm font-medium">Add Employee</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-[#FFEDED] dark:bg-[#2A0A0A] border border-[#E12929] dark:border-[#DC2626] rounded-lg text-[#C71414] dark:text-[#FF6B6B]">
            {error}
          </div>
        )}

        {/* Employee Table */}
        <div
          className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#EDF0F4] dark:border-[#333333] overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#FAFBFC] dark:bg-[#2A2A2A] border-b border-[#EDF0F4] dark:border-[#333333]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8A94A7] dark:text-[#A0A0A0] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8A94A7] dark:text-[#A0A0A0] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8A94A7] dark:text-[#A0A0A0] uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8A94A7] dark:text-[#A0A0A0] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8A94A7] dark:text-[#A0A0A0] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8A94A7] dark:text-[#A0A0A0] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#1E1E1E] divide-y divide-[#EDF0F4] dark:divide-[#333333]">
                {loading && filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-[#8A94A7] dark:text-[#A0A0A0]">
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-[#8A94A7] dark:text-[#A0A0A0]">
                        No employees found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-[#F7F9FC] dark:hover:bg-[#262626] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-[#07111F] dark:text-[#E5E5E5] font-medium">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#536081] dark:text-[#B0B0B0]">
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#07111F] dark:text-[#E5E5E5]">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#07111F] dark:text-[#E5E5E5]">
                        {employee.role}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            employee.status === "active"
                              ? "text-[#0E9250] dark:text-[#4ADE80] border-[#50C878] dark:border-[#22C55E] bg-[#EAF9F0] dark:bg-[#0A2A1A]"
                              : "text-[#C71414] dark:text-[#FF6B6B] border-[#E12929] dark:border-[#DC2626] bg-[#FFEDED] dark:bg-[#2A0A0A]"
                          }`}
                        >
                          {employee.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(employee)}
                            className="p-2 rounded hover:bg-[#F1F5FF] dark:hover:bg-[#2A2A2A] active:bg-[#E8F0FF] dark:active:bg-[#333333] transition-colors"
                            title="Edit employee"
                          >
                            <Edit2
                              size={16}
                              className="text-[#4F8BFF] dark:text-[#5B94FF]"
                            />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(employee.id)}
                            className="p-2 rounded hover:bg-[#FFEDED] dark:hover:bg-[#2A0A0A] active:bg-[#FFE0E0] dark:active:bg-[#331111] transition-colors"
                            title="Delete employee"
                          >
                            <Trash2
                              size={16}
                              className="text-[#E12929] dark:text-[#FF6B6B]"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          //   className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4"
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div
            className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#EDF0F4] dark:border-[#333333] w-full max-w-md relative"
            style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)", zIndex: 10000 }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDF0F4] dark:border-[#333333]">
              <h2 className="text-[#07111F] dark:text-[#E5E5E5] font-['Lato'] font-bold text-xl">
                {currentEmployee ? "Edit Employee" : "Add Employee"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded hover:bg-[#F5F7FB] dark:hover:bg-[#333333] transition-colors"
              >
                <X size={20} className="text-[#536081] dark:text-[#A0A0A0]" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#07111F] dark:text-[#E5E5E5] mb-2">
                  <Users size={16} className="inline mr-2" />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E1E6ED] dark:border-[#404040] rounded-lg text-sm text-[#07111F] dark:text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF] dark:focus:ring-[#5B94FF] focus:border-[#4F8BFF] dark:focus:border-[#5B94FF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#07111F] dark:text-[#E5E5E5] mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E1E6ED] dark:border-[#404040] rounded-lg text-sm text-[#07111F] dark:text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF] dark:focus:ring-[#5B94FF] focus:border-[#4F8BFF] dark:focus:border-[#5B94FF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#07111F] dark:text-[#E5E5E5] mb-2">
                  <Building2 size={16} className="inline mr-2" />
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E1E6ED] dark:border-[#404040] rounded-lg text-sm text-[#07111F] dark:text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF] dark:focus:ring-[#5B94FF] focus:border-[#4F8BFF] dark:focus:border-[#5B94FF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#07111F] dark:text-[#E5E5E5] mb-2">
                  <Briefcase size={16} className="inline mr-2" />
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E1E6ED] dark:border-[#404040] rounded-lg text-sm text-[#07111F] dark:text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF] dark:focus:ring-[#5B94FF] focus:border-[#4F8BFF] dark:focus:border-[#5B94FF]"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-[#07111F] dark:text-[#E5E5E5] mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E1E6ED] dark:border-[#404040] rounded-lg text-sm text-[#07111F] dark:text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#4F8BFF] dark:focus:ring-[#5B94FF] focus:border-[#4F8BFF] dark:focus:border-[#5B94FF] relative z-10"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E1E6ED] dark:border-[#404040] rounded-lg text-sm text-[#536081] dark:text-[#A0A0A0] hover:bg-[#F5F7FB] dark:hover:bg-[#333333] active:bg-[#E8F0FF] dark:active:bg-[#404040] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#4F8BFF] dark:bg-[#5B94FF] text-white rounded-lg hover:bg-[#3D6FE5] dark:hover:bg-[#4F8BFF] active:bg-[#2A5CC7] dark:active:bg-[#3D6FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Saving..."
                    : currentEmployee
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div
            className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#EDF0F4] dark:border-[#333333] w-full max-w-sm"
            style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          >
            <div className="p-6">
              <h2 className="text-[#07111F] dark:text-[#E5E5E5] font-['Lato'] font-bold text-xl mb-4">
                Delete Employee
              </h2>
              <p className="text-[#536081] dark:text-[#B0B0B0] text-sm mb-6">
                Are you sure you want to delete this employee? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 bg-white dark:bg-[#2A2A2A] border border-[#E1E6ED] dark:border-[#404040] rounded-lg text-sm text-[#536081] dark:text-[#A0A0A0] hover:bg-[#F5F7FB] dark:hover:bg-[#333333] active:bg-[#E8F0FF] dark:active:bg-[#404040] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-[#E12929] dark:bg-[#DC2626] text-white rounded-lg hover:bg-[#C71414] dark:hover:bg-[#B91C1C] active:bg-[#B01212] dark:active:bg-[#991B1B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
