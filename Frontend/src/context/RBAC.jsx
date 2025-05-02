import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from './Usercontext';
import { useUser } from '@supabase/auth-helpers-react';

// Define the role hierarchy and permissions
const ROLES = {
  ADMIN: 'admin',
  EDIT: 'edit',
  VIEW_ONLY: 'view-only'
};

const PERMISSIONS = {
  VIEW_PROJECT: 'view_project',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  MANAGE_ROLES: 'manage_roles',
  CREATE_PROJECT: 'create_project',
  CREATE_TASK: 'create_task',
  EDIT_TASK: 'edit_task',
  DELETE_TASK: 'delete_task',
  MOVE_TASK: 'move_task',
  ARCHIVE_TASK: 'archive_task'
};

// Permission mapping based on roles
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.DELETE_PROJECT,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,
    PERMISSIONS.MOVE_TASK,
    PERMISSIONS.ARCHIVE_TASK
  ],
  [ROLES.EDIT]: [
    PERMISSIONS.VIEW_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,
    PERMISSIONS.MOVE_TASK,
    PERMISSIONS.ARCHIVE_TASK
  ],
  [ROLES.VIEW_ONLY]: [
    PERMISSIONS.VIEW_PROJECT,
    PERMISSIONS.CREATE_PROJECT
  ]
};

const BOOKING_PERMISSIONS = {
  CREATE_BOOKING: 'create_booking',
  EDIT_BOOKING: 'edit_booking',
  DELETE_BOOKING: 'delete_booking'
};

// เพิ่มใน ROLE_PERMISSIONS แต่ละ role
ROLE_PERMISSIONS[ROLES.ADMIN].push(
  BOOKING_PERMISSIONS.CREATE_BOOKING,
  BOOKING_PERMISSIONS.EDIT_BOOKING,
  BOOKING_PERMISSIONS.DELETE_BOOKING
);
ROLE_PERMISSIONS[ROLES.EDIT].push(
  BOOKING_PERMISSIONS.CREATE_BOOKING,
  BOOKING_PERMISSIONS.EDIT_BOOKING
);
ROLE_PERMISSIONS[ROLES.VIEW_ONLY].push(
  BOOKING_PERMISSIONS.CREATE_BOOKING
);

// Create the RBAC context
export const RBACContext = createContext();

export const RBACProvider = ({ children }) => {
  const { customUser } = useContext(UserContext);
  const supabaseUser = useUser(); // Get the Supabase user directly
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';

  useEffect(() => {
    // We'll load user roles across projects when the user context changes
    if (customUser && customUser.user_id) {
      fetchUserRoles();
    } else {
      setUserRoles({});
      setLoading(false);
    }
  }, [customUser]);

  const fetchUserRoles = async () => {
    if (!customUser || !customUser.user_id) return;

    try {
      setLoading(true);

      // Fetch all user's roles across projects
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${customUser.user_id}/roles`);

        if (response.data && response.data.success) {
          const roles = {};
          response.data.data.forEach(item => {
            roles[item.project_id] = item.role;
          });
          setUserRoles(roles);
        }
      } catch (error) {
        // If there's an error fetching roles (like 404 if the user hasn't created any projects yet),
        // just set an empty roles object instead of throwing an error
        console.log('No project roles found, user may be new:', error.message);
        setUserRoles({});
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch role for a specific project
  const fetchProjectRole = async (projectId) => {
    if (!customUser || !customUser.user_id || !projectId) return null;

    try {
      // First check if the user is the creator of the project
      try {
        const projectResponse = await axios.get(`${API_BASE_URL}/api/projects/${projectId}`);
        if (projectResponse.data && projectResponse.data.success) {
          const projectData = projectResponse.data.data;
          if (projectData.creator_id === customUser.user_id) {
            setUserRoles(prev => ({
              ...prev,
              [projectId]: ROLES.ADMIN // Project creators are always admins
            }));
            return ROLES.ADMIN;
          }
        }
      } catch (error) {
        console.log('Error checking if user is project creator:', error.message);
      }

      // Then check if the user is a member of the project
      try {
        const response = await axios.get(`${API_BASE_URL}/api/projects/${projectId}/users`);

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const userEntry = response.data.data.find(
            user => user.user_id === customUser.user_id
          );

          if (userEntry) {
            // Update the userRoles state with this new information
            setUserRoles(prev => ({
              ...prev,
              [projectId]: userEntry.role
            }));

            return userEntry.role;
          }
        }
      } catch (error) {
        console.log('Error checking if user is project member:', error.message);
      }
    } catch (error) {
      console.error(`Error fetching user role for project ${projectId}:`, error);
    }

    // If not a creator or member with a specific role, return null
    return null;
  };

  // Check if user has a specific permission for a project
  const hasPermission = (permission, projectId) => {
    if (!customUser) return false;

    // If the permission is CREATE_PROJECT, any authenticated user can do it
    if (permission === PERMISSIONS.CREATE_PROJECT) {
      return true;
    }

    // If we don't have the user's role for this project yet, 
    // fetch it (but don't wait for the result in this function)
    if (projectId && !userRoles[projectId]) {
      fetchProjectRole(projectId);
      return false; // Return false until we have the role
    }

    const userRole = userRoles[projectId] || null;

    // If user has no role in this project and isn't trying to create a project,
    // they don't have permission
    if (!userRole) return false;

    const permissions = ROLE_PERMISSIONS[userRole] || [];

    return permissions.includes(permission);
  };

  // Check if user is admin for a project
  const isAdmin = (projectId) => {
    if (!customUser) return false;
    return userRoles[projectId] === ROLES.ADMIN;
  };

  // Check if user can create projects (all authenticated users can)
  const canCreateProject = () => {
    return !!customUser; // Any authenticated user can create projects
  };

  // Check if user can edit a project
  const canEditProject = (projectId) => {
    return hasPermission(PERMISSIONS.EDIT_PROJECT, projectId);
  };

  // Check if user can delete a project
  const canDeleteProject = (projectId) => {
    return hasPermission(PERMISSIONS.DELETE_PROJECT, projectId);
  };

  // Check if user can manage roles
  const canManageRoles = (projectId) => {
    return hasPermission(PERMISSIONS.MANAGE_ROLES, projectId);
  };

  // Check if user can create tasks
  const canCreateTask = (projectId) => {
    return hasPermission(PERMISSIONS.CREATE_TASK, projectId);
  };

  // Check if user can edit tasks
  const canEditTask = (projectId) => {
    return hasPermission(PERMISSIONS.EDIT_TASK, projectId);
  };

  // Check if user can delete tasks
  const canDeleteTask = (projectId) => {
    return hasPermission(PERMISSIONS.DELETE_TASK, projectId);
  };

  // Check if user can move tasks
  const canMoveTask = (projectId) => {
    return hasPermission(PERMISSIONS.MOVE_TASK, projectId);
  };

  const canViewArchiveTask = (projectId) => {
    return hasPermission(PERMISSIONS.ARCHIVE_TASK, projectId);
  }

  const canCreateBooking = () => {
    return !!customUser; // Authenticated user can create booking
  };

  const canEditBooking = (bookingId, creatorId) => {
    if (!customUser) return false;
    return (
      creatorId === customUser.user_id ||
      hasPermission(BOOKING_PERMISSIONS.EDIT_BOOKING, bookingId)
    );
  };
  
  const canDeleteBooking = (bookingId, creatorId) => {
    if (!customUser) return false;
    return (
      creatorId === customUser.user_id || // ✅ ถ้าเป็นผู้สร้าง
      hasPermission(BOOKING_PERMISSIONS.DELETE_BOOKING, bookingId)
    );
  };

  return (
    <RBACContext.Provider
      value={{
        roles: ROLES,
        permissions: PERMISSIONS,
        userRoles,
        loading,
        hasPermission,
        isAdmin,
        canCreateProject,
        canEditProject,
        canDeleteProject,
        canManageRoles,
        canCreateTask,
        canEditTask,
        canDeleteTask,
        canMoveTask,
        fetchProjectRole,
        canViewArchiveTask,
        canCreateBooking,
        canEditBooking,
        canDeleteBooking
      }}
    >
      {children}
    </RBACContext.Provider>
  );
};

// Custom hook for using RBAC context
export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};