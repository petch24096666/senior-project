import React, { useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from '../../../context/Usercontext';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';
import { useRBAC } from '../../../context/RBAC';
import TeamMemberDropdown from './TeamMemberDropdown'; // แก้ path ให้ตรง
import ArchiveModal from './ArchiveModal'; // แก้ path ให้ตรง
// Custom CSS keyframes for animations
const fadeInKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const BookingPage = () => {
  // ดึงข้อมูลผู้ใช้จาก context
  const ctx = useContext(UserContext);
  if (!ctx || !ctx.customUser) {
    return <div>Please log in to view your projects.</div>;
  }
  const currentUserId = ctx.customUser.user_id;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
  // Project data
  const [booking, setBooking] = useState([]);
  // State variables
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [menuOpenId, setMenuOpenId] = useState(null);
  // ดึงผู้ใช้ทั้งหมด (ใช้ใน dropdown หากจำเป็น)
  const [allUsers, setAllUsers] = useState([]);
  // ปรับ state ใหม่ ไม่รวม tasks fields และ description
  const [newBooking, setNewBooking] = useState({
    booking_id: '',
    booking_title: '',
    booking_description: '',
    booking_type: '',
    booking_startdate: '', // 👈 ใหม่
    booking_enddate: '',   // 👈 ใหม่
    booking_starttime: '',
    booking_endtime: '',
    booking_status: '',
    team: [],
    booking_image: null,
    booking_image_preview: null
  });

  // Stats state
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedTasks: '0/0',
    highPriorityCount: 0,
    dueThisWeek: 0
  });
  const { canCreateBooking, canEditBooking, canDeleteBooking } = useRBAC();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
  const showNotification = (msg, type = 'info') => setNotification({ open: true, message: msg, type });
  const handleCloseNotification = () => setNotification(prev => ({ ...prev, open: false }));
  const [selectedType, setSelectedType] = useState('');
  const [customType, setCustomType] = useState('');

  useEffect(() => {
    // Sync selectedType จาก state จริง
    if (!isEditMode) {
      setSelectedType(newBooking.booking_type);
    } else {
      setSelectedType(editingBooking?.booking_type || '');
    }
  }, [newBooking.booking_type, editingBooking?.booking_type, isEditMode]);

  const handleTypeSelect = (type) => {
    console.log("Selected type:", type); // ✅ ดูว่าเรียกจริงไหม
    setSelectedType(type);

    if (type !== 'Other') {
      setCustomType('');
    }

    if (isEditMode) {
      setEditingBooking(prev => ({
        ...prev,
        booking_type: type
      }));
    } else {
      setNewBooking(prev => ({
        ...prev,
        booking_type: type
      }));
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Meeting Rooms': { bg: '#3b82f6', text: '#1e40af', light: '#dbeafe' },
      Workstations: { bg: '#22c55e', text: '#065f46', light: '#dcfce7' },
      Computer: { bg: '#8b5cf6', text: '#4c1d95', light: '#ede9fe' },
    };
    return colors[type] || { bg: '#9ca3af', text: '#374151', light: '#f3f4f6' };
  };

  const typeOptions = [
    { label: 'Meeting Rooms', value: 'Meeting Rooms' },
    { label: 'Workstations', value: 'Workstations' },
    { label: 'Computer', value: 'Computer' }
  ];

  // Fetch projects
  const fetchProjectsAndCounts = useCallback(async () => {
    try {
      setLoading(true);
      const projRes = await axios.get(`http://localhost:8081/api/booking?userId=${currentUserId}`);
      const bookingData = projRes.data.data.map(p => ({
        ...p,
        startdate: (p.booking_startdate || '').split(' ')[0],
        duedate: (p.booking_enddate || '').split(' ')[0],
        tasks: 0,
        totalTasks: 0
      }));
      const countsRes = await axios.get(`http://localhost:8081/api/booking/taskCounts?userId=${currentUserId}`);
      const counts = Array.isArray(countsRes.data.data) ? countsRes.data.data : [];
      const merged = bookingData.map(b => {
        const c = counts.find(x => x.booking_id === b.booking_id_id);
        return {
          ...b,
          totalTasks: c?.totalTasks || 0,
          tasks: c?.tasksCompleted || 0
        };
      });
      console.log("Merged bookings:", merged);
      setBooking(merged);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load projects", 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // 2) เรียกใน useEffect พร้อม polling
  useEffect(() => {
    fetchProjectsAndCounts();
    const intervalId = setInterval(fetchProjectsAndCounts, 30000);
    return () => clearInterval(intervalId);
  }, [fetchProjectsAndCounts]);

  // Memoized filter function
  const filterProjects = useCallback(() => {
    let filtered = [...booking];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(booking => {
        return booking.title.toLowerCase().includes(term) ||
          booking.category.toLowerCase().includes(term) ||
          (booking.team && booking.team.some(member => member.toLowerCase().includes(term)));
      });
    }

    setFilteredProjects(filtered);
  }, [booking, searchTerm, selectedCategory]);

  // Run filter and update stats when projects change
  useEffect(() => {
    filterProjects();
    updateStats();
  }, [filterProjects, booking]);

  // Add this useEffect to handle clicks outside the menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuOpenId && !event.target.closest('.project-menu-button')) {
        setMenuOpenId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);

  // Handle search input keypress
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      filterProjects();
    }
  };

  const handleProjectRestored = () => {
    fetchProjectsAndCounts();
  };
  // Update dashboard statistics
  const updateStats = useCallback(() => {
    const totalProjects = booking.length;
    // เนื่องจาก tasks จะถูกรับค่ามาจาก Kanban ในอนาคต เราจึงใช้ค่า default 0
    const completedTasks = booking.reduce((sum, project) => sum + (project.tasks || 0), 0);
    const totalTasks = booking.reduce((sum, project) => sum + (project.totalTasks || 0), 0);
    const completedTasksString = `${completedTasks}/${totalTasks}`;

    const highPriorityCount = booking.filter(project => project.priority === 'high').length;

    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    const dueThisWeek = booking.filter(project => {
      const dueDate = new Date(project.duedate);
      return dueDate >= today && dueDate <= oneWeekLater;
    }).length;

    setStats({
      totalProjects,
      completedTasks: completedTasksString,
      highPriorityCount,
      dueThisWeek
    });
  }, [booking]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No Due Date';
    const date = dayjs(dateString);
    if (!date.isValid()) return 'No Due Date';
    return date.format('MMM D, YYYY'); // Apr 30, 2025
  };


  // Capitalize first letter
  const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Generate team avatars for grid view
  const generateAvatars = (team, category) => {
    const maxDisplayed = 3;
    const displayedTeam = team.slice(0, maxDisplayed);
    const extraMembers = team.length > maxDisplayed ? team.length - maxDisplayed : 0;

    return (
      <>
        {displayedTeam.map((member, index) => (
          <div
            key={index}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              marginLeft: index === 0 ? '0' : '-8px',
              transition: 'transform 0.2s',
              backgroundColor: getCategoryColor(category, 'bg'),
              color: getCategoryColor(category, 'text'),
              zIndex: displayedTeam.length - index
            }}
          >
            {member.charAt(0)}
          </div>
        ))}
        {extraMembers > 0 && (
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              marginLeft: '-8px',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              zIndex: 0
            }}
          >
            +{extraMembers}
          </div>
        )}
      </>
    );
  };

  // Generate team avatars for list view
  const generateListAvatars = (team, category) => {
    const maxDisplayed = 2;
    const displayedTeam = team.slice(0, maxDisplayed);
    const extraMembers = team.length > maxDisplayed ? team.length - maxDisplayed : 0;

    return (
      <>
        {displayedTeam.map((member, index) => (
          <div
            key={index}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              marginLeft: index === 0 ? '0' : '-6px',
              backgroundColor: getCategoryColor(category, 'bg'),
              color: getCategoryColor(category, 'text'),
              zIndex: displayedTeam.length - index
            }}
          >
            {member.charAt(0)}
          </div>
        ))}
        {extraMembers > 0 && (
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              marginLeft: '-6px',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              zIndex: 0
            }}
          >
            +{extraMembers}
          </div>
        )}
      </>
    );
  };

  // Get color based on category
  const getCategoryColor = (category, type) => {
    const colors = {
      design: { bg: '#eff0ff', text: '#4f46e5', header: '#4f46e5' },
      development: { bg: '#e0f7ff', text: '#0ea5e9', header: '#0ea5e9' },
      marketing: { bg: '#f3f0ff', text: '#8b5cf6', header: '#8b5cf6' },
      operations: { bg: '#fce7f3', text: '#ec4899', header: '#ec4899' }
    };
    return colors[category] ? colors[category][type] : '#cbd5e0';
  };

  // Get priority badge styles
  const getPriorityStyles = (priority) => {
    const styles = {
      high: {
        bg: '#FEE2E2',
        text: '#DC2626',
        dotColor: '#DC2626' // Add dot color property
      },
      medium: {
        bg: '#FEF3C7',
        text: '#D97706',
        dotColor: '#D97706'
      },
      low: {
        bg: '#ECFDF5',
        text: '#059669',
        dotColor: '#059669'
      }
    };
    return styles[priority] || { bg: '#E5E7EB', text: '#4B5563', dotColor: '#4B5563' };
  };


  const handleProjectClick = (projectId) => {
    console.log("Navigating to Kanban board with projectId:", projectId);
    navigate(`/task/${projectId}`);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id } = e.target;
    let value = e.target.value;
    if (e.target.multiple) {
      value = Array.from(e.target.selectedOptions, option => option.value);
    }
    const mapping = {
      bookingTitle: 'booking_title',
      bookingDescription: 'booking_description',
      bookingStartDate: 'booking_startdate',
      bookingEndDate: 'booking_enddate',
      bookingStartTime: 'booking_starttime',
      bookingEndTime: 'booking_endtime',
      bookingStatus: 'booking_status',
      bookingType: 'booking_type',
      bookingTeam: 'team'
    };
    const field = mapping[id];
    if (field) {
      if (isEditMode) {
        setEditingBooking(prev => ({ ...prev, [field]: value }));
      } else {
        setNewBooking(prev => ({ ...prev, [field]: value }));
      }
    }
  };


  // Validate form before saving
  const validateForm = () => {
    const booking = isEditMode ? editingBooking : newBooking;

    console.log("Validating Booking:", booking); // ✅ เพิ่มบรรทัดนี้ดูค่าจริง

    const {
      booking_title,
      booking_type,
      booking_startdate,
      booking_enddate,
      booking_starttime,
      booking_endtime
    } = booking;

    if (
      !booking_title ||
      !booking_type ||
      !booking_startdate ||
      !booking_enddate ||
      !booking_starttime ||
      !booking_endtime
    ) {
      alert('Please fill out all required fields');
      return false;
    }

    return true;
  };

  // Save new project
  // ตัวอย่างส่วนของ saveProject ใน ProjectDashboard.jsx
  // Save new project
  const saveBooking = () => {
    if (!validateForm()) return;
    const newId = uuidv4();

    let teamMembers = [];
    if (newBooking.team && newBooking.team.length > 0) {
      teamMembers = newBooking.team.map(email => ({ email: email.trim(), role: 'view-only' }));
    }

    const creatorEmail = ctx.customUser.email;
    const isCreatorInTeam = teamMembers.some(member => member.email === creatorEmail);

    if (!isCreatorInTeam) {
      teamMembers.push({ email: creatorEmail, role: 'admin' });
    } else {
      teamMembers = teamMembers.map(member =>
        member.email === creatorEmail ? { ...member, role: 'admin' } : member
      );
    }

    const bookingData = new FormData(); // ✅ ใช้ FormData

    bookingData.append('booking_id', newId); // ✅ ใช้ newId แทน
    bookingData.append('booking_title', newBooking.booking_title);
    bookingData.append('booking_description', newBooking.booking_description);
    bookingData.append('booking_type', newBooking.booking_type || selectedType || customType);
    bookingData.append('booking_startdate', newBooking.booking_startdate); // ✅ แยก start
    bookingData.append('booking_enddate', newBooking.booking_enddate);     // ✅ แยก end
    bookingData.append('booking_starttime', newBooking.booking_starttime);
    bookingData.append('booking_endtime', newBooking.booking_endtime);
    bookingData.append('booking_status', newBooking.booking_status);
    //bookingData.append('creator_id', currentUserId);
    bookingData.team = JSON.stringify(teamMembers);

    if (newBooking.booking_image) {
      bookingData.append('booking_image', newBooking.booking_image);
    }

    bookingData.append('team', JSON.stringify(teamMembers));

    fetch(`${API_BASE_URL}/api/booking`, {
      method: 'POST',
      body: bookingData
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText); // 🛑 กรณี response ไม่ใช่ JSON
        }
        return response.json();
      })
      .then(result => {
        if (result.success) {
          showNotification("Booking saved successfully!", 'success'); // ✅ แจ้งเตือนสำเร็จ
          closeModal(); // ✅ ปิด modal ทันทีเมื่อบันทึกเสร็จ
          fetchProjectsAndCounts(); // ✅ ดึงข้อมูลใหม่
        } else {
          showNotification("Error: " + result.error, "error");
        }
      })
      .catch(error => {
        console.error("Booking creation failed:", error);
        showNotification("Error: " + error.message, "error");
      });
  };


  /*const bookingData = {
    booking_id: newBooking.booking_id,
    booking_title: newBooking.booking_title,
    booking_description: newBooking.booking_description,
    booking_type: newBooking.booking_type,
    booking_starttime: newBooking.booking_starttime,
    booking_endtime: newBooking.booking_endtime,
    booking_status: newBooking.booking_status,
    booking_date: JSON.stringify(newBooking.booking_date),
    team: teamMembers,
    creator_id: currentUserId
  };*/

  const handleEditBooking = async (booking) => {
    try {
      const res = await axios.get(`http://localhost:8081/api/booking/${booking.booking_id}`);
      const data = res.data.data;
      const teamArray = Array.isArray(data.team) ? data.team.map(m => m.email) : [];
      setEditingBooking({
        booking_id: data.booking_id,
        booking_title: data.booking_title,
        booking_description: data.booking_description,
        booking_type: data.booking_type,
        booking_startdate: data.booking_startdate,
        booking_enddate: data.booking_enddate,
        booking_starttime: data.booking_starttime,
        booking_endtime: data.booking_endtime,
        booking_status: data.booking_status,
        team: teamArray,
        booking_image: null, // ไว้รองรับรูปใหม่ที่เลือก
        booking_image_preview: `${API_BASE_URL}/uploads/${data.booking_image}` // ✅ หรือ path ที่ backend ให้มา
      });
      setIsEditMode(true);
      setShowModal(true);
    } catch (err) {
      showNotification("Cannot load project details", 'error');
    }
  };

  // Delete project functionality
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const initiateDelete = (id) => {
    setBookingToDelete(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    if (bookingToDelete) {
      fetch(`http://localhost:8081/api/booking/${bookingToDelete}`, {
        method: "DELETE"
      })
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            setBooking(prev => prev.filter(booking => booking.booking_id !== bookingToDelete));
          } else {
            console.error("Delete error:", result.error);
          }
        })
        .catch(error => console.error("Error deleting booking:", error))
        .finally(() => {
          setShowDeletePopup(false);
          setBookingToDelete(null);
        });
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setBookingToDelete(null);
  };

  const updateBooking = () => {
    if (!validateForm()) return;

    let teamMembers = [];
    if (editingBooking.team && editingBooking.team.length > 0) {
      teamMembers = editingBooking.team.map(email => ({
        email: email.trim(),
        role: 'view-only'
      }));
    }

    const creatorEmail = ctx.customUser.email;
    const isCreatorInTeam = teamMembers.some(m => m.email === creatorEmail);

    if (!isCreatorInTeam) {
      showNotification("Project creator cannot be removed from the team.", 'warning');
      teamMembers.push({ email: creatorEmail, role: 'admin' });
    } else {
      teamMembers = teamMembers.map(member =>
        member.email === creatorEmail
          ? { ...member, role: 'admin' }
          : member
      );
    }

    // ✅ ใช้ FormData สำหรับส่งข้อมูล + ไฟล์รูป
    const bookingData = new FormData();
    bookingData.append('booking_id', editingBooking.booking_id);
    bookingData.append('booking_title', editingBooking.booking_title);
    bookingData.append('booking_description', editingBooking.booking_description);
    bookingData.append('booking_type', editingBooking.booking_type);
    bookingData.append('booking_startdate', editingBooking.booking_startdate);
    bookingData.append('booking_enddate', editingBooking.booking_enddate);
    bookingData.append('booking_starttime', editingBooking.booking_starttime);
    bookingData.append('booking_endtime', editingBooking.booking_endtime);
    bookingData.append('booking_status', editingBooking.booking_status);
    bookingData.append('creator_id', currentUserId);
    bookingData.append('team', JSON.stringify(teamMembers));

    // ✅ แนบไฟล์รูปถ้ามีการอัปเดต
    if (editingBooking.booking_image) {
      bookingData.append('booking_image', editingBooking.booking_image);
    }

    fetch(`${API_BASE_URL}/api/booking/${editingBooking.booking_id}`, {
      method: "PUT",
      body: bookingData
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          showNotification("Project updated successfully!", 'success');
          closeModal();
          fetchProjectsAndCounts();
        } else {
          showNotification("Error updating project: " + result.error, 'error');
        }
      })
      .catch(error => {
        console.error("Error:", error);
        showNotification("Error updating project. Please try again.", 'error');
      });
  };


  // Open/close modal functions
  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);

    setSelectedType('');
    setCustomType('');
    // Reset form state
    if (isEditMode) {
      setEditingBooking(null);
    } else {
      setNewBooking({
        booking_id: uuidv4(),
        booking_title: '',
        booking_description: '',
        booking_type: '',
        booking_startdate: '',
        booking_enddate: '',
        booking_starttime: '',
        booking_endtime: '',
        booking_status: '',
        team: [],
        booking_image: null,
        booking_image_preview: null
      });
    }
  };


  // Render grid view
  const renderGridView = () => {
    if (!booking || booking.length === 0) {
      return (
        <div style={{
          gridColumn: '1 / -1',
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{
            color: '#4a5568',
            fontSize: '18px',
            marginBottom: '12px'
          }}>No bookings found</h3>
          <p style={{
            color: '#718096',
            marginBottom: '24px'
          }}>Try adjusting your search or filter criteria</p>
          <button
            onClick={resetFilters}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Reset Filters
          </button>
        </div>
      );
    }

    return booking.map(item => {
      const typeStyle = getTypeColor(item.booking_type || '');
      const formattedDate = formatDate(item.booking_startdate);
      const imageUrl = item.booking_image ? `${API_BASE_URL}/uploads/${item.booking_image}` : null;

      return (
        <div
          key={item.booking_id}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            padding: '20px',
            borderTop: `6px solid ${typeStyle.bg}`,
            transition: 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {canEditBooking(booking.booking_id) && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Edit button clicked for booking:", booking);
                    handleEditBooking(booking);
                  }}
                  style={{
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#EDF2F7',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => initiateDelete(item.booking_id)}
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FEE2E2',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Booking"
              style={{
                width: '100%',
                height: '160px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginTop: '12px',
                marginBottom: '16px'
              }}
            />
          )}
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', margin: 0 }}>
            {item.booking_title}
          </h3>
          <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '16px', marginBottom: '16px' }}>
            {item.booking_description}
          </p>
          <div style={{
            display: 'inline-flex',
            padding: '5px 12px',
            borderRadius: '50px',
            fontSize: '13px',
            fontWeight: 500,
            backgroundColor: typeStyle.light,
            color: typeStyle.text,
            width: 'fit-content',
            marginBottom: '16px'
          }}>
            {item.booking_type}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
            <button
              onClick={() => console.log(`Booking ${item.booking_id}`)}
              style={{
                padding: '10px 100px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            >
              Book Now
            </button>
          </div>
        </div>
      );
    });
  };

  // Render list view (ไม่ซ้ำกับ grid มากนัก)
  const renderListView = () => {
    if (filteredBooking.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ color: '#4a5568', fontSize: '18px', marginBottom: '12px' }}>No projects found</h3>
          <p style={{ color: '#718096', marginBottom: '24px' }}>Try adjusting your search or filter criteria</p>
          <button
            onClick={resetFilters}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Reset Filters
          </button>
        </div>
      );
    }

    return filteredBooking.map(booking => {
      const progress = Math.round((project.tasks / project.totalTasks) * 100);
      const formattedDate = formatDate(project.duedate);
      const priorityStyles = getPriorityStyles(project.priority);
      return (
        <div
          key={booking.booking_id}
          onClick={() => handleProjectClick(booking.booking_id)}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            animation: 'fadeIn 0.5s ease-out'
          }}
        >
          <div style={{
            width: '12px',
            height: '30px',
            borderRadius: '6px',
            backgroundColor: getCategoryColor(project.category, 'header')
          }}>
          </div>
          <h3 style={{ fontWeight: 600, fontSize: '16px', flex: 1 }}>
            {project.title}
          </h3>
          <span style={{
            padding: '4px 12px',
            borderRadius: '50px',
            fontSize: '13px',
            fontWeight: 500,
            width: '120px',
            textAlign: 'center',
            backgroundColor: getCategoryColor(project.category, 'bg'),
            color: getCategoryColor(project.category, 'text')
          }}>
            {capitalize(project.category)}
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '180px'
          }}>
            <div style={{
              flex: 1,
              height: '6px',
              backgroundColor: '#edf2f7',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                borderRadius: '3px',
                transition: 'width 0.5s ease',
                width: `${progress}%`,
                backgroundColor: getCategoryColor(project.category, 'header')
              }}>
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {progress}%
            </span>
          </div>
          <span style={{ fontSize: '13px', color: '#718096', width: '100px' }}>
            {formattedDate}
          </span>
          <div style={{ display: 'flex', width: '100px' }}>
            {generateListAvatars(project.team, project.category)}
          </div>
          <span style={{
            display: 'inline-flex',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: 600,
            width: '80px',
            justifyContent: 'center',
            backgroundColor: priorityStyles.bg,
            color: priorityStyles.text
          }}>
            {capitalize(project.priority)}
          </span>

          <div style={{
            display: 'flex',
            gap: '8px',
            zIndex: 20
          }}>
            {canEditBooking(booking.booking_id) && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Edit button clicked for booking:", booking);
                  handleEditBooking(booking);
                }}
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#EDF2F7',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {canDeleteBooking(booking.booking_id) && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Delete button clicked for booking:", booking.booking_id);
                  initiateDelete(booking.booking_id);
                }}
                style={{
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FEE2E2',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    stroke="#E53E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header on white background */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '20px 20px 0',
        borderBottom: '1px solid #eaeaea'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>Booking</h1>
            <p style={{ color: '#718096', marginTop: '5px', fontSize: '16px' }}>
              Get an overview of your projects and track progress.
            </p>
          </div>
          {canCreateBooking() && (
            <button
              onClick={openModal}
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '15px',
                boxShadow: '0 4px 6px rgba(79, 70, 229, 0.1)'
              }}
            >
              + Add Booking
            </button>
          )}
        </div>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto'
        }}>

          {/* Search and Filters */}
          <div style={{
            display: 'flex',
            marginBottom: '25px',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{
              display: 'flex',
              flex: 1,
              maxWidth: '500px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              <button
                onClick={filterProjects}
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  padding: '0 20px',
                  borderRadius: '0 8px 8px 0',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background-color 0.2s'
                }}
              >
                Search
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                display: 'flex',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    backgroundColor: viewMode === 'grid' ? '#f0f0ff' : 'white',
                    border: 'none',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontWeight: viewMode === 'grid' ? 600 : 500,
                    color: viewMode === 'grid' ? '#4f46e5' : '#718096',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (viewMode !== 'grid') { e.currentTarget.style.backgroundColor = '#f9fafb'; }
                  }}
                  onMouseOut={(e) => {
                    if (viewMode !== 'grid') { e.currentTarget.style.backgroundColor = 'white'; }
                  }}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    backgroundColor: viewMode === 'list' ? '#f0f0ff' : 'white',
                    border: 'none',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontWeight: viewMode === 'list' ? 600 : 500,
                    color: viewMode === 'list' ? '#4f46e5' : '#718096',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (viewMode !== 'list') { e.currentTarget.style.backgroundColor = '#f9fafb'; }
                  }}
                  onMouseOut={(e) => {
                    if (viewMode !== 'list') { e.currentTarget.style.backgroundColor = 'white'; }
                  }}
                >
                  List
                </button>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  outline: 'none',
                  color: '#4a5568',
                  fontWeight: 500,
                  minWidth: '160px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
              >
                <option value="all">All Categories</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operations</option>
              </select>
            </div>
          </div>

          {/* Projects View (Grid or List) */}
          {viewMode === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {renderGridView()}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {renderListView()}
            </div>
          )}

          {/* Stats Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '24px',
            marginTop: '40px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '1px solid #f1f1f1'
            }}>
              <div style={{
                marginBottom: '12px',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#4f46e5'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div style={{ fontSize: '15px', color: '#718096', marginBottom: '8px', fontWeight: 500 }}>Total Projects</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>{stats.totalProjects}</div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '1px solid #f1f1f1'
            }}>
              <div style={{
                marginBottom: '12px',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0ea5e9'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div style={{ fontSize: '15px', color: '#718096', marginBottom: '8px', fontWeight: 500 }}>Completed Tasks</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>{stats.completedTasks}</div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '1px solid #f1f1f1'
            }}>
              <div style={{
                marginBottom: '12px',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#8b5cf6'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div style={{ fontSize: '15px', color: '#718096', marginBottom: '8px', fontWeight: 500 }}>High Priority</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>{stats.highPriorityCount}</div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              border: '1px solid #f1f1f1'
            }}>
              <div style={{
                marginBottom: '12px',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ec4899'
              }}>
                <svg style={{ width: '20px', height: '20px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div style={{ fontSize: '15px', color: '#718096', marginBottom: '8px', fontWeight: 500 }}>Due This Week</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>{stats.dueThisWeek}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Add/Edit Project Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          zIndex: 100,
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          marginTop: '-20px',
          // Add padding to ensure modal doesn't touch screen edges
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            width: '90%',
            maxWidth: '500px',
            animation: 'fadeIn 0.3s',
            maxHeight: '90vh', // Limit height to 90% of viewport
            display: 'flex',
            flexDirection: 'column', // Ensure proper layout
            overflow: 'hidden' // Hide overflow
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a202c', margin: 0 }}>
                {isEditMode ? 'Edit Booking' : 'Add New Booking'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#718096',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px'
                }}
              >
                &times;
              </button>
            </div>
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 140px)'
            }}>
              <form>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }}>
                    Upload Image
                  </label>
                  <div
                    style={{
                      border: '2px dashed #cbd5e0',
                      borderRadius: '10px',
                      padding: '20px',
                      textAlign: 'center',
                      backgroundColor: '#f9fafb',
                      position: 'relative'
                    }}
                  >
                    {((isEditMode && editingBooking.booking_image_preview) || (!isEditMode && newBooking.booking_image_preview)) ? (
                      <img
                        src={isEditMode ? editingBooking.booking_image_preview : newBooking.booking_image_preview}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          borderRadius: '6px',
                          marginBottom: '12px'
                        }}
                      />
                    ) : (
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          style={{ width: '50px', height: '50px', color: '#a78bfa', margin: '0 auto 8px' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4m-4 8v4m0 0H8m4 0h4" />
                        </svg>
                        <p style={{ color: '#718096', marginBottom: '12px' }}>No file chosen, yet!</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg, image/png"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
                          if (!isValidType) {
                            alert('Only JPEG and PNG files are allowed.');
                            return;
                          }
                          const imageURL = URL.createObjectURL(file);
                          if (isEditMode) {
                            setEditingBooking(prev => ({
                              ...prev,
                              booking_image: file,
                              booking_image_preview: imageURL
                            }));
                          } else {
                            setNewBooking(prev => ({
                              ...prev,
                              booking_image: file,
                              booking_image_preview: imageURL
                            }));
                          }
                        }
                      }}
                      style={{ display: 'none' }}
                      id="bookingImage"
                    />
                    <label
                      htmlFor="bookingImage"
                      style={{
                        display: 'inline-block',
                        padding: '10px 20px',
                        backgroundImage: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                        color: 'white',
                        fontWeight: 500,
                        borderRadius: '999px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background 0.2s'
                      }}
                    >
                      Choose a File
                    </label>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }} htmlFor="bookingTitle">
                    Title
                  </label>
                  <input
                    type="text"
                    id="bookingTitle"
                    value={(isEditMode ? editingBooking : newBooking).booking_title || ''}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '15px',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }} htmlFor="bookingDescription">
                    Description
                  </label>
                  <textarea
                    id="bookingDescription"
                    value={(isEditMode ? editingBooking : newBooking).booking_description || ''}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '15px',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }} htmlFor="bookingType">
                    Type
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {typeOptions.map(({ label, value }) => (
                      <button
                        id="bookingType"
                        key={value}
                        type="button"
                        value={(isEditMode ? editingBooking : newBooking).booking_type || ''}
                        onClick={() => handleTypeSelect(value)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          backgroundColor: selectedType === value ? getTypeColor(value).bg : getTypeColor(value).light,
                          color: selectedType === value ? 'white' : getTypeColor(value).text,
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'all 0.2s',
                        }}
                      >
                        {label}
                      </button>
                    ))}

                    {/* ปุ่ม Other */}
                    <button
                      type="button"
                      onClick={() => handleTypeSelect('Other')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        backgroundColor: selectedType === 'Other' ? '#6b7280' : '#f3f4f6',
                        color: selectedType === 'Other' ? 'white' : '#4b5563',
                        border: selectedType === 'Other' ? 'none' : '1px solid #d1d5db',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                      }}
                    >
                      Other
                    </button>
                  </div>

                  {/* ช่องพิมพ์ถ้าเลือก Other */}
                  {selectedType === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom type"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        backgroundColor: '#fff'
                      }}
                    />
                  )}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }}>
                    Due Date
                  </label>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <label
                        htmlFor="bookingStartDate"
                        style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}
                      >
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="bookingStartDate"
                        value={isEditMode ? editingBooking.booking_startdate : newBooking.booking_startdate}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (isEditMode) {
                            setEditingBooking(prev => ({ ...prev, booking_startdate: value }));
                          } else {
                            setNewBooking(prev => ({ ...prev, booking_startdate: value }));
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          outline: 'none',
                          backgroundColor: '#fff',
                          color: '#1a202c',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        required
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label
                        htmlFor="bookingEndDate"
                        style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}
                      >
                        End Date
                      </label>
                      <input
                        type="date"
                        id="bookingEndDate"
                        value={isEditMode ? editingBooking.booking_enddate : newBooking.booking_enddate}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (isEditMode) {
                            setEditingBooking(prev => ({ ...prev, booking_enddate: value }));
                          } else {
                            setNewBooking(prev => ({ ...prev, booking_enddate: value }));
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          outline: 'none',
                          backgroundColor: '#fff',
                          color: '#1a202c',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#4a5568' }}>
                    Time
                  </label>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <label
                        htmlFor="bookingStartTime"
                        style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}
                      >
                        Start Time
                      </label>
                      <input
                        type="time"
                        id="bookingStartTime"
                        value={isEditMode ? editingBooking.booking_starttime : newBooking.booking_starttime}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (isEditMode) {
                            setEditingBooking(prev => ({ ...prev, booking_starttime: value }));
                          } else {
                            setNewBooking(prev => ({ ...prev, booking_starttime: value }));
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          outline: 'none',
                          backgroundColor: '#fff',
                          color: '#1a202c',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        required
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label
                        htmlFor="bookingEndTime"
                        style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}
                      >
                        End Time
                      </label>
                      <input
                        type="time"
                        id="bookingEndTime"
                        value={isEditMode ? editingBooking.booking_endtime : newBooking.booking_endtime}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (isEditMode) {
                            setEditingBooking(prev => ({ ...prev, booking_endtime: value }));
                          } else {
                            setNewBooking(prev => ({ ...prev, booking_endtime: value }));
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '15px',
                          outline: 'none',
                          backgroundColor: '#fff',
                          color: '#1a202c',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            <div style={{
              padding: '15px 20px',
              borderTop: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              backgroundColor: 'white'
            }}>
              <button
                onClick={closeModal}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={isEditMode ? updateBooking : saveBooking}
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {isEditMode ? 'Update Booking' : 'Save Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeletePopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            width: '400px',
            maxWidth: '90%',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ marginTop: 0 }}>Confirm Deletion</h3>
            <p>Are you sure you want to delete this booking?</p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  backgroundColor: 'white'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#ff4d4f',
                  color: 'white'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      {showArchiveModal && (
        <ArchiveModal open={showArchiveModal} onClose={() => setShowArchiveModal(false)} onProjectRestored={handleProjectRestored} />
      )}
    </div>
  );
};

export default BookingPage;
