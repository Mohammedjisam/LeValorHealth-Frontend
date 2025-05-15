"use client";

import { useState, useEffect } from "react";
import adminAxiosInstance from "../../services/adminAxiosInstance";
import { FiSearch } from "react-icons/fi";

interface Pdeo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isAdminVerified: boolean;
}

const PdeoList = () => {
  const [pdeos, setPdeos] = useState<Pdeo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPdeos = async () => {
      try {
        setLoading(true);
        const response = await adminAxiosInstance.get("/scanner");
        if (response.data.status) {
          setPdeos(response.data.data);
        } else {
          setError("Failed to fetch PDEOs");
        }
      } catch (error) {
        setError("An error occurred while fetching PDEOs");
        console.error("Error fetching PDEOs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPdeos();
  }, []);

  const filteredPdeos = pdeos.filter(
    (pdeo) =>
      pdeo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdeo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdeo.phone.includes(searchQuery)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPdeos = filteredPdeos.slice(startIndex, endIndex);

  const handleToggleVerification = async (id: string) => {
    try {
      const response = await adminAxiosInstance.patch(`/scanner/${id}/toggle`);
      if (response.data.status) {
        const updated = response.data.data;
        setPdeos((prev) =>
          prev.map((r) =>
            r._id === id ? { ...r, isAdminVerified: updated.isAdminVerified } : r
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Prescription Data Entry Operators
        </h1>
        <p className="text-gray-600">Manage PDEO verification</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search PDEOs..."
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPdeos.length > 0 ? (
                  paginatedPdeos.map((pdeo, index) => (
                    <tr key={pdeo._id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        PDEO{String(startIndex + index + 1).padStart(4, "0")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{pdeo.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{pdeo.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{pdeo.phone}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pdeo.isAdminVerified ? "bg-gray-200 text-gray-800" : "bg-green-200 text-green-800"}`}>
                          {pdeo.isAdminVerified ? "Active" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => handleToggleVerification(pdeo._id)}
                          className={`text-sm font-semibold px-3 py-1 rounded-full transition ${pdeo.isAdminVerified ? "bg-green-200 text-green-800 hover:bg-green-300" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                        >
                          {pdeo.isAdminVerified ? "Unapprove" : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No PDEOs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredPdeos.length)}</span> of <span className="font-medium">{filteredPdeos.length}</span> results
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  &larr;
                </button>
                {[...Array(Math.ceil(filteredPdeos.length / itemsPerPage)).keys()].map((page) => (
                  <button
                    key={page + 1}
                    onClick={() => setCurrentPage(page + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page + 1 ? "bg-white-500 text-gray-800 border-black-500" : "bg-white text-gray-700 border-black-100 hover:bg-gray-50"}`}
                  >
                    {page + 1}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((prev) => prev + 1)} disabled={endIndex >= filteredPdeos.length} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
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

export default PdeoList;
