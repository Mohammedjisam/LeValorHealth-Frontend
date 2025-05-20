"use client";

import { useState, useEffect } from "react";
import adminAxiosInstance from "../../services/adminAxiosInstance";
import { FiSearch } from "react-icons/fi";

interface Receptionist {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isAdminVerified: boolean;
}

const ReceptionistList = () => {
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchReceptionists = async () => {
      try {
        setLoading(true);
        const response = await adminAxiosInstance.get("/receptionists");
        if (response.data.status) {
          setReceptionists(response.data.data);
        } else {
          setError("Failed to fetch receptionists");
        }
      } catch (error) {
        setError("An error occurred while fetching receptionists");
        console.error("Error fetching receptionists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceptionists();
  }, []);

  const filteredReceptionists = receptionists.filter(
    (receptionist) =>
      receptionist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receptionist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receptionist.phone.includes(searchQuery)
  );

  const handleToggleVerification = async (id: string) => {
    try {
      const response = await adminAxiosInstance.patch(`/receptionists/${id}/toggle`);
      if (response.data.status) {
        const updated = response.data.data;
        setReceptionists((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isAdminVerified: updated.isAdminVerified } : r))
        );
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-[#0f172a] text-gray-800 dark:text-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Receptionist Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage receptionist information</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400 dark:text-gray-300" />
          </div>
          <input
            type="text"
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search receptionists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-500/10 border border-red-400 dark:border-red-300 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
          <span>{error}</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {["ID", "Name", "Email", "Phone", "Status", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReceptionists.length > 0 ? (
                  filteredReceptionists.map((receptionist, index) => (
                    <tr key={receptionist._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">RC{String(index + 1).padStart(4, "0")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{receptionist.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{receptionist.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{receptionist.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            receptionist.isAdminVerified
                              ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                              : "bg-green-200 dark:bg-green-600 text-green-800 dark:text-green-100"
                          }`}
                        >
                          {receptionist.isAdminVerified ? "Active" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleToggleVerification(receptionist._id)}
                          className={`text-sm font-semibold px-3 py-1 rounded-full transition ${
                            receptionist.isAdminVerified
                              ? "bg-green-200 dark:bg-green-600 text-green-800 dark:text-green-100 hover:bg-green-300"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300"
                          }`}
                        >
                          {receptionist.isAdminVerified ? "Unapprove" : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No receptionists found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{filteredReceptionists.length}</span> of{" "}
                <span className="font-medium">{filteredReceptionists.length}</span> results
              </p>
              <nav className="mt-2 sm:mt-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-md">
                  &larr;
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  1
                </button>
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-md">
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistList;
