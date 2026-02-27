// NMKRSPVLIDATA_XCEL_DOWNLOAD
// Contest Performance Download Component
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

const ContestPerformanceDownload = ({ contestId, contestTitle }) => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Load performance summary
  const loadPerformanceSummary = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/admin/contests/${contestId}/performance`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setPerformanceData(response.data);
        toast.success('Performance data loaded!');
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast.error('Failed to load performance data');
    }
  };

  // Sync performance data
  const syncPerformanceData = async () => {
    try {
      setSyncing(true);
      const response = await axios.post(
        `${API_BASE}/api/admin/contests/${contestId}/performance/sync`,
        {},
        { withCredentials: true }
      );
      
      if (response.data.success) {
        toast.success('Performance data synced successfully!');
        await loadPerformanceSummary();
      }
    } catch (error) {
      console.error('Error syncing performance data:', error);
      toast.error('Failed to sync performance data');
    } finally {
      setSyncing(false);
    }
  };

  // Download Excel file
  const downloadExcel = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(
        `${API_BASE}/api/admin/contests/${contestId}/performance/download`,
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contestTitle.replace(/[^a-z0-9]/gi, '_')}_Performance_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download Excel file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg border-2 border-green-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📊 Performance Reports
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Download detailed performance data and analytics
          </p>
        </div>
      </div>

      {/* Performance Summary */}
      {performanceData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-4 mb-4 border-2 border-gray-200"
        >
          <h3 className="font-bold text-gray-800 mb-3">Contest Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {performanceData.summary.totalRegistered}
              </div>
              <div className="text-xs text-gray-600">Registered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {performanceData.summary.totalCompleted}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {performanceData.summary.totalPartialCompletion}
              </div>
              <div className="text-xs text-gray-600">Partial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {performanceData.summary.averageScore}
              </div>
              <div className="text-xs text-gray-600">Avg Score</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Load Summary Button */}
        <button
          onClick={loadPerformanceSummary}
          disabled={loading || syncing}
          className="px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
        >
          <span className="text-2xl">📊</span>
          <span>Load Summary</span>
        </button>

        {/* Sync Data Button */}
        <button
          onClick={syncPerformanceData}
          disabled={loading || syncing}
          className="px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
        >
          {syncing ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">🔄</span>
              <span>Sync Data</span>
            </>
          )}
        </button>

        {/* Download Excel Button */}
        <button
          onClick={downloadExcel}
          disabled={loading || syncing}
          className="px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">📥</span>
              <span>Download Excel</span>
            </>
          )}
        </button>
      </div>

      {/* Info Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-white p-4 rounded-lg border-2 border-blue-100">
          <div className="font-bold text-blue-600 mb-1">📋 Overall Performance</div>
          <p className="text-gray-600 text-xs">
            Complete summary with ranks, scores, and completion status
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border-2 border-green-100">
          <div className="font-bold text-green-600 mb-1">📝 Question-wise Details</div>
          <p className="text-gray-600 text-xs">
            Individual question marks, attempts, and test case results
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border-2 border-purple-100">
          <div className="font-bold text-purple-600 mb-1">📈 Contest Statistics</div>
          <p className="text-gray-600 text-xs">
            Aggregated metrics and performance analytics
          </p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
          💡 How to Use
        </h4>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li><strong>Load Summary:</strong> View performance statistics in the dashboard</li>
          <li><strong>Sync Data:</strong> Update performance tracking with latest submissions</li>
          <li><strong>Download Excel:</strong> Get comprehensive report with all metrics</li>
        </ol>
      </div>
    </motion.div>
  );
};

export default ContestPerformanceDownload;
