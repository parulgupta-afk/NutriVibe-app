import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { productApi } from "../api/products";
import { mealApi } from "../api/meals";
import { hydrationApi, streakApi } from "../api/hydration";
import {
  FiTrendingUp,
  FiShield,
  FiClock,
  FiCalendar,
  FiActivity,
  FiBarChart2,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiTrash2,
  FiFilter,
  FiUsers,
  FiDroplet,
  FiCamera,
  FiPlus,
} from "react-icons/fi";
import { format } from "date-fns";
import ProductImage from "../components/common/ProductImage";
import { downloadLogsCsv } from "../utils/exportCsv";

const Dashboard = () => {
  const { user } = useAuth();
  const { dependents } = useProfile();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clearing, setClearing] = useState(false);

  // Which profile's data to VIEW in the dashboard. This is independent
  // from the "scanning for" selector — undefined means "everyone
  // combined", null means "just the account owner", or a dependent's id.
  const [viewProfileId, setViewProfileId] = useState(undefined);

  // Filter state — clicking a Safe/Caution/Unsafe card shows every
  // matching item for the selected day, not just the last 5
  const [activeFilter, setActiveFilter] = useState(null); // 'Safe' | 'Caution' | 'Unsafe' | null
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [logSearch, setLogSearch] = useState("");
  const [wellness, setWellness] = useState({
    calories: 0,
    calorieGoal: 2000,
    waterMl: 0,
    waterGoal: 2000,
    mealStreak: 0,
    waterStreak: 0,
  });

  useEffect(() => {
    loadTrackingData();
    setActiveFilter(null);
    setFilteredLogs([]);
  }, [selectedDate, viewProfileId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mealRes, hydRes, streakRes] = await Promise.all([
          mealApi.getToday().catch(() => null),
          hydrationApi.getToday().catch(() => null),
          streakApi.get().catch(() => null),
        ]);
        if (cancelled) return;
        setWellness({
          calories: mealRes?.data?.dailyTotals?.calories || 0,
          calorieGoal: 2000,
          waterMl: hydRes?.data?.totalMl || 0,
          waterGoal: hydRes?.data?.goalMl || 2000,
          mealStreak: streakRes?.data?.mealLogging?.current || 0,
          waterStreak: streakRes?.data?.hydration?.current || 0,
        });
      } catch {
        /* non-blocking */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadTrackingData = async () => {
    setLoading(true);
    try {
      // Use toISOString's date portion (always UTC) rather than
      // date-fns' local-timezone `format`, so this always matches
      // the exact calendar day picked in the native date input —
      // regardless of the browser's local timezone offset.
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await productApi.getDailyTracking(
        dateStr,
        viewProfileId,
      );
      setTrackingData(response.data);
    } catch (error) {
      console.error("Error loading tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredLogs = async (level) => {
    setFilterLoading(true);
    try {
      // Build boundaries directly in UTC, matching the same approach
      // as loadTrackingData — no local-timezone setHours() involved.
      const dateStr = selectedDate.toISOString().split("T")[0];
      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

      const params = {
        riskLevel: level,
        startDate: dayStart.toISOString(),
        endDate: dayEnd.toISOString(),
        limit: 100,
      };
      if (viewProfileId !== undefined) {
        params.profileId = viewProfileId === null ? "null" : viewProfileId;
      }

      const response = await productApi.getTrackingHistory(params);
      setFilteredLogs(response.data || []);
    } catch (error) {
      console.error("Error loading filtered logs:", error);
      setFilteredLogs([]);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleFilterClick = async (level) => {
    // Clicking the same card again clears the filter
    if (activeFilter === level) {
      setActiveFilter(null);
      setFilteredLogs([]);
      return;
    }

    setActiveFilter(level);
    await fetchFilteredLogs(level);
  };

  const handleClearLogs = async () => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const confirmed = window.confirm(
      `Clear all logs for ${format(selectedDate, "MMM d, yyyy")}? This clears logs for everyone, not just the selected profile view. This cannot be undone.`,
    );
    if (!confirmed) return;

    setClearing(true);
    try {
      await productApi.clearLogs(dateStr);
      setActiveFilter(null);
      setFilteredLogs([]);
      await loadTrackingData();
    } catch (error) {
      console.error("Error clearing logs:", error);
      alert("Failed to clear logs. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteEntry = async (logId) => {
    const confirmed = window.confirm("Delete this logged item?");
    if (!confirmed) return;

    try {
      await productApi.deleteLog(logId);
      // Refresh whichever views are currently showing data
      await loadTrackingData();
      if (activeFilter) {
        await fetchFilteredLogs(activeFilter); // refresh, don't toggle
      }
    } catch (error) {
      console.error("Error deleting log entry:", error);
      alert("Failed to delete this entry. Please try again.");
    }
  };

  const stats = [
    {
      key: "Safe",
      icon: <FiShield className="text-green-500" />,
      label: "Safe Products",
      value: trackingData?.safeCount || 0,
      color: "bg-green-50 border-green-200",
      activeColor: "ring-2 ring-green-400",
    },
    {
      key: "Caution",
      icon: <FiAlertCircle className="text-yellow-500" />,
      label: "Caution",
      value: trackingData?.cautionCount || 0,
      color: "bg-yellow-50 border-yellow-200",
      activeColor: "ring-2 ring-yellow-400",
    },
    {
      key: "Unsafe",
      icon: <FiX className="text-red-500" />,
      label: "Unsafe",
      value: trackingData?.unsafeCount || 0,
      color: "bg-red-50 border-red-200",
      activeColor: "ring-2 ring-red-400",
    },
    {
      key: null,
      icon: <FiActivity className="text-primary-500" />,
      label: "Total Scans",
      value: trackingData?.totalScans || 0,
      color: "bg-primary-50 border-primary-200",
      activeColor: "",
    },
  ];

  const recentLogs = trackingData?.recentLogs || [];
  const filteredRecentLogs = logSearch.trim()
    ? recentLogs.filter((log) => {
        const q = logSearch.toLowerCase();
        return (
          (log.productName || "").toLowerCase().includes(q) ||
          (log.riskLevel || "").toLowerCase().includes(q) ||
          (log.profileName || "").toLowerCase().includes(q)
        );
      })
    : recentLogs;

  const filterColorClasses = {
    Safe: "text-green-700 bg-green-50 border-green-200",
    Caution: "text-yellow-700 bg-yellow-50 border-yellow-200",
    Unsafe: "text-red-700 bg-red-50 border-red-200",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Food safety, nutrition &amp; wellness at a glance
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="input-field w-auto"
          />
          <button
            onClick={handleClearLogs}
            disabled={clearing || !trackingData?.totalScans}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            title="Clear all logs for this day"
          >
            <FiTrash2 />
            {clearing ? "Clearing..." : "Clear Log"}
          </button>
        </div>
      </div>

      {/* Family profile filter — only shown once there's at least one dependent */}
      {dependents.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <FiUsers className="text-gray-400 dark:text-gray-300" />
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Showing:
          </label>
          <select
            value={
              viewProfileId === undefined
                ? "all"
                : viewProfileId === null
                  ? "me"
                  : viewProfileId
            }
            onChange={(e) => {
              const val = e.target.value;
              setViewProfileId(
                val === "all" ? undefined : val === "me" ? null : val,
              );
            }}
            className="input-field w-auto text-sm py-1.5"
          >
            <option value="all">All Profiles (combined)</option>
            <option value="me">Me ({user?.name})</option>
            {dependents.map((dep) => (
              <option key={dep._id} value={dep._id}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quick actions + wellness (NutriVibe 2.0) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Link
          to="/scanner"
          className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-400 transition"
        >
          <FiCamera className="text-primary-600 text-lg" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Scan Food</span>
        </Link>
        <Link
          to="/nutrition"
          className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-400 transition"
        >
          <FiPlus className="text-primary-600 text-lg" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Log Meal</span>
        </Link>
        <Link
          to="/hydration"
          className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-sky-400 transition"
        >
          <FiDroplet className="text-sky-500 text-lg" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Add Water</span>
        </Link>
        <Link
          to="/nutrition"
          className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-400 transition"
        >
          <FiActivity className="text-orange-500 text-lg" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {Math.round(wellness.calories)} / {wellness.calorieGoal} kcal
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800">
          <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">Today&apos;s calories</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {Math.round(wellness.calories)} <span className="text-sm font-normal text-gray-500">/ {wellness.calorieGoal}</span>
          </p>
        </div>
        <div className="card bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800">
          <p className="text-xs text-sky-700 dark:text-sky-300 font-medium">Hydration</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {wellness.waterMl} <span className="text-sm font-normal text-gray-500">/ {wellness.waterGoal} ml</span>
          </p>
        </div>
        <div className="card bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800">
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Streaks</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            🔥 {wellness.mealStreak} meal · 💧 {wellness.waterStreak} water
          </p>
        </div>
      </div>

      {/* Stats Cards — Safe / Caution / Unsafe are clickable filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        {stats.map((stat, index) => {
          const clickable = stat.key !== null;
          return (
            <div
              key={index}
              onClick={
                clickable ? () => handleFilterClick(stat.key) : undefined
              }
              className={`card ${stat.color} ${clickable ? "cursor-pointer transition-shadow hover:shadow-md" : ""} ${
                activeFilter === stat.key ? stat.activeColor : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {stat.icon}
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 flex items-center gap-1">
        <FiFilter className="inline" /> Click Safe, Caution, or Unsafe to see
        every item in that category for this day
      </p>

      {/* Filtered results panel — shown only when a stat card is active */}
      {activeFilter && (
        <div className={`card mb-8 border ${filterColorClasses[activeFilter]}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              All "{activeFilter}" items — {format(selectedDate, "MMM d, yyyy")}
            </h2>
            <button
              onClick={() => {
                setActiveFilter(null);
                setFilteredLogs([]);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear filter
            </button>
          </div>

          {filterLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const image = log.product?.images?.[0];
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={image}
                        alt={log.productName}
                        size={40}
                        rounded="rounded-md"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {log.productName}
                          {log.profileName && (
                            <span className="ml-2 text-xs font-normal text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                              {log.profileName}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(log.createdAt), "h:mm a")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteEntry(log.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete this entry"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500 dark:text-gray-400">
              No "{activeFilter}" items logged on this day
            </p>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FiClock className="text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Logs
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search logs..."
                aria-label="Search recent logs"
                className="input-field text-sm py-1.5 px-3 w-40"
              />
              <button
                type="button"
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => {
                  const dateStr = selectedDate.toISOString().split("T")[0];
                  const source = activeFilter ? filteredLogs : recentLogs;
                  if (!source.length) return;
                  downloadLogsCsv(source, dateStr);
                }}
                disabled={!(activeFilter ? filteredLogs : recentLogs).length}
              >
                Export CSV
              </button>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredRecentLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredRecentLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <ProductImage
                      src={log.productImage}
                      alt={log.productName}
                      size={40}
                      rounded="rounded-md"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {log.productName}
                        {log.profileName && (
                          <span className="ml-2 text-xs font-normal text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                            {log.profileName}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(log.createdAt), "h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.riskLevel === "Safe"
                          ? "bg-green-100 text-green-700"
                          : log.riskLevel === "Caution"
                            ? "bg-yellow-100 text-yellow-700"
                            : log.riskLevel === "Unsafe"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {log.riskLevel}
                    </span>
                    <button
                      onClick={() => handleDeleteEntry(log.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete this entry"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FiActivity className="text-3xl mx-auto mb-2 text-gray-300 dark:text-gray-500" />
              <p>
                {logSearch.trim()
                  ? "No logs match your search"
                  : "No scans logged yet today"}
              </p>
              <p className="text-sm">
                {logSearch.trim()
                  ? "Try a different name or safety level"
                  : "Scan a product to start tracking"}
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Safety Breakdown
            </h2>
          </div>
          <div className="space-y-4">
            {stats.slice(0, 3).map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <span className="text-gray-700 dark:text-gray-200">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        index === 0
                          ? "bg-green-500"
                          : index === 1
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${(stat.value / (trackingData?.totalScans || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
