import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiUser, FiUsers, FiSettings } from "react-icons/fi";
import { useProfile } from "../../contexts/ProfileContext";

const ProfileSelector = () => {
  const { dependents, activeProfileId, setActiveProfileId, activeProfileName } =
    useProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-primary-300 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
      >
        <FiUsers className="text-primary-500" />
        Scanning for: <span className="font-semibold">{activeProfileName}</span>
        <FiChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveProfileId(null);
              setOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${
              !activeProfileId
                ? "text-primary-600 font-medium"
                : "text-gray-700 dark:text-gray-200"
            }`}
          >
            <FiUser /> Me
          </button>

          {dependents.map((dep) => (
            <button
              key={dep._id}
              onClick={() => {
                setActiveProfileId(dep._id);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                activeProfileId === dep._id
                  ? "text-primary-600 font-medium"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              <FiUser />
              {dep.name}
              {dep.relationship && (
                <span className="text-gray-400 dark:text-gray-300">
                  ({dep.relationship})
                </span>
              )}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-1 dark:border-gray-700">
            <Link
              to="/profiles"
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-gray-500 hover:bg-gray-50 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400"
            >
              <FiSettings /> Manage Profiles
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
