import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { dependentApi } from '../api/dependents';

const ProfileContext = createContext();

const STORAGE_KEY = 'nutrivibe_active_profile_id';

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [dependents, setDependents] = useState([]);
  const [activeProfileId, setActiveProfileIdState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || null
  );
  const [loadingDependents, setLoadingDependents] = useState(false);

  const refreshDependents = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingDependents(true);
    try {
      const response = await dependentApi.getDependents();
      setDependents(response.data || []);
    } catch (error) {
      console.error('Error loading dependent profiles:', error);
    } finally {
      setLoadingDependents(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshDependents();
    } else {
      setDependents([]);
      setActiveProfileIdState(null);
    }
  }, [isAuthenticated, refreshDependents]);

  // If the previously-selected profile got deleted, fall back to "Me"
  useEffect(() => {
    if (activeProfileId && dependents.length > 0) {
      const stillExists = dependents.some(d => d._id === activeProfileId);
      if (!stillExists) {
        setActiveProfileIdState(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [dependents, activeProfileId]);

  const setActiveProfileId = (id) => {
    setActiveProfileIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const activeProfile = activeProfileId
    ? dependents.find(d => d._id === activeProfileId) || null
    : null;

  const activeProfileName = activeProfile ? activeProfile.name : (user?.name || 'Me');

  const value = {
    dependents,
    loadingDependents,
    refreshDependents,
    activeProfileId,
    setActiveProfileId,
    activeProfile,
    activeProfileName,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};