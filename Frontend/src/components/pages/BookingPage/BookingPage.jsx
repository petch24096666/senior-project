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
  const user_id = ctx?.customUser?.id;
  if (!ctx || !ctx.customUser) {
    return <div>Please log in to view your projects.</div>;
  }
  const currentUserId = ctx.customUser.user_id;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
  // Project data
  const [booking, setBooking] = useState([]);
  // State variables
  const [viewMode, setViewMode] = useState('grid');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooking, setFilteredBooking] = useState([]);
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
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingToBook, setBookingToBook] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]); // เก็บเวลาที่ถูกจองไว้
  const [activeTab, setActiveTab] = useState('available'); // 'available' หรือ 'myBookings'
  const [myReservations, setMyReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [bookingCreators, setBookingCreators] = useState({});
  const standardTypes = ['Meeting Rooms', 'Workstations'];
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [bookedList, setBookedList] = useState([]);
  const [showBookedModal, setShowBookedModal] = useState(false);
  const [showBookingViewModal, setShowBookingViewModal] = useState(false);
  const [viewedBookingList, setViewedBookingList] = useState([]);
  const [bookingReservation, setBookingReservation] = useState({
    booked_id: '', // ไม่จำเป็นต้องกำหนดเองก็ได้
    booked_date: '',
    booked_time: '',
    booking_id: '', // จะ set ตอนกดปุ่ม Book Now
    user_id: currentUserId
  });


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

  useEffect(() => {
    if (bookingToBook && bookingReservation.booked_date) {
      fetchBookedTimes(bookingToBook.booking_id, bookingReservation.booked_date);
    }
  }, [bookingToBook, bookingReservation.booked_date]);

  const isTimeBooked = (time) => {
    return bookedTimes.includes(time); // ['08:00', '09:00']
  };

  const fetchBookedTimes = async (bookingId, date) => {
    const res = await fetch(`${API_BASE_URL}/api/booked/times?booking_id=${bookingId}&date=${date}`);
    const data = await res.json();

    if (data.success) {
      setBookedTimes(data.data.map(t => t.booked_time)); // เช่น '08:00'
    }
  };

  const fetchMyReservations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/booked/user/${currentUserId}`);
      const result = await res.json();
      if (result.success) {
        setMyReservations(result.data);
      } else {
        showNotification("Failed to load your reservations", 'error');
      }
    } catch (err) {
      console.error("Error fetching my reservations:", err);
      showNotification("Error fetching your reservations", 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'myBookings') {
      fetchMyReservations();
    }
  }, [activeTab]);

  const handleCancelReservation = async (bookedId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/booked/${bookedId}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showNotification("Reservation cancelled", 'success');
        setMyReservations(prev => prev.filter(b => b.booked_id !== bookedId));
      } else {
        showNotification("Failed to cancel reservation", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification("Error cancelling reservation", 'error');
    }
  };

  const fetchBookingCreator = async (bookingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/booking/${bookingId}`);
      if (response.data.success) {
        const creatorId = response.data.data.creator_id;
        setBookingCreators(prev => ({ ...prev, [bookingId]: creatorId }));
        return creatorId;
      }
    } catch (err) {
      console.error('Error fetching booking creator:', err);
    }
    return null;
  };

  const isBookingCreator = (bookingId) => {
    return bookingCreators[bookingId] === currentUserId;
  };

  useEffect(() => {
    if (booking.length > 0) {
      booking.forEach(b => {
        if (!bookingCreators[b.booking_id]) {
          fetchBookingCreator(b.booking_id); // จะเก็บ creator_id ไว้ใน state
        }
      });
    }
  }, [booking]);

  const getTypeColor = (type) => {
    const colors = {
      'Meeting Rooms': { bg: '#3b82f6', text: '#1e40af', light: '#dbeafe' },
      Workstations: { bg: '#22c55e', text: '#065f46', light: '#dcfce7' },
    };
    return colors[type] || { bg: '#9ca3af', text: '#374151', light: '#f3f4f6' };
  };

  const typeOptions = [
    { label: 'Meeting Rooms', value: 'Meeting Rooms' },
    { label: 'Workstations', value: 'Workstations' },
  ];

  // BookingPage.jsx
  const handleViewBooked = async (bookingId) => {
    try {
      const response = await axios.get(`http://localhost:8081/api/booked/${bookingId}`);
      setBookedList(response.data);
      setShowBookedModal(true);
    } catch (err) {
      console.error("Error fetching booked list", err);
    }
  };

  // Fetch projects
  const fetchProjectsAndCounts = useCallback(async () => {
    try {
      setLoading(true);
      const projRes = await axios.get(`http://localhost:8081/api/booking?userId=${currentUserId}`);
      const bookingData = projRes.data.data.map(p => ({
        ...p,
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
  const filterBooking = useCallback(() => {
    let filtered = [...booking];

    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.booking_title || '').toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedTypeFilter !== 'all') {
      filtered = filtered.filter(project => {
        const type = project.booking_type;
        if (selectedTypeFilter === 'Other') {
          return !['Meeting Rooms', 'Workstations'].includes(type);
        }
        return type === selectedTypeFilter;
      });
    }

    setFilteredBooking(filtered);
  }, [booking, selectedTypeFilter, searchTerm]);

  // Run filter and update stats when projects change
  useEffect(() => {
    filterBooking();
    updateStats();
  }, [filterBooking, booking]);

  const filterReservations = useCallback(() => {
    let filtered = [...myReservations];

    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.booking_title || '').toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedTypeFilter !== 'all') {
      filtered = filtered.filter(item => {
        const type = item.booking_type;
        if (selectedTypeFilter === 'Other') {
          return !['Meeting Rooms', 'Workstations'].includes(type);
        }
        return type === selectedTypeFilter;
      });
    }

    filtered.sort((a, b) => {
      const dateTimeA = dayjs(`${a.booked_date}T${a.booked_time}`);
      const dateTimeB = dayjs(`${b.booked_date}T${b.booked_time}`);
      return dateTimeA - dateTimeB;
    });

    setFilteredReservations(filtered);
  }, [myReservations, selectedTypeFilter, searchTerm]);

  useEffect(() => {
    filterReservations();
  }, [filterReservations, myReservations]);

  useEffect(() => {
    if (viewedBookingList.length > 0) {
      setShowBookingViewModal(true); // แบบนี้จะเปิด popup เมื่อ list มีข้อมูล
    }
  }, [viewedBookingList]);

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
      filterBooking();
      filterReservations();
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
    } = booking;

    if (
      !booking_title ||
      !booking_type
    ) {
      alert('Please fill out all required fields');
      return false;
    }

    if (!booking_title || !selectedType || (selectedType === 'Other' && !customType.trim())) {
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
    bookingData.append(
      'booking_type',
      selectedType === 'Other' ? customType : selectedType
    );
    bookingData.append('booking_status', newBooking.booking_status);
    bookingData.append('creator_id', currentUserId);
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
        booking_status: data.booking_status,
        team: teamArray,
        booking_image: null, // ไว้รองรับรูปใหม่ที่เลือก
        booking_image_preview: `${API_BASE_URL}/uploads/${data.booking_image}` // ✅ หรือ path ที่ backend ให้มา
      });
      setSelectedType(
        ['Meeting Rooms', 'Workstations'].includes(data.booking_type)
          ? data.booking_type
          : 'Other'
      );
      setCustomType(
        ['Meeting Rooms', 'Workstations'].includes(data.booking_type)
          ? ''
          : data.booking_type
      );
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
          console.log("Delete response:", result);
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
    bookingData.append(
      'booking_type',
      selectedType === 'Other' ? customType : selectedType
    );
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
        booking_status: '',
        team: [],
        booking_image: null,
        booking_image_preview: null
      });
    }
  };


  // Render grid view
  const renderGridView = () => {
    if (!filteredBooking || filteredBooking.length === 0) {
      return (
        <div style={{
          gridColumn: '1 / -1',
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          minHeight: '150px'
        }}>
          <h3 style={{
            color: '#1f2937',
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '12px'
          }}>No bookings found</h3>
          <p style={{
            color: '#6b7280',
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
              fontWeight: 500,
            }}
          >
            Reset Filters
          </button>
        </div>
      );
    }
    return [...filteredBooking]
      .sort((a, b) => {
        const aIsCustom = !standardTypes.includes(a.booking_type);
        const bIsCustom = !standardTypes.includes(b.booking_type);
        if (aIsCustom && !bIsCustom) return 1;
        if (!aIsCustom && bIsCustom) return -1;
        return 0;
      })
      .map(item => {
        const typeStyle = getTypeColor(item.booking_type || '');
        const imageUrl = item.booking_image ? `${API_BASE_URL}/uploads/${item.booking_image}` : null;
        return (
          <div
            key={item.booking_id}
            onMouseEnter={() => setHoveredCard(item.booking_id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: hoveredCard === item.booking_id
                ? '0 8px 20px rgba(0,0,0,0.12)'
                : '0 4px 12px rgba(0,0,0,0.05)',
              transform: hoveredCard === item.booking_id ? 'translateY(-4px)' : 'none',
              padding: '20px',
              borderTop: `6px solid ${typeStyle.bg}`,
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.5s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                minHeight: '30px',
                minWidth: '68px', // 👈 กันเลื่อน
                justifyContent: 'flex-end'
              }}>
                {isBookingCreator(item.booking_id) && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleViewBooked(item.booking_id);
                      console.log("View button clicked for booking:", item);
                    }}
                    style={{
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#E6FFFA',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginLeft: '4px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#319795" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="#319795" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}

                {isBookingCreator(item.booking_id) && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditBooking(item);
                      console.log("Edit button clicked for booking:", booking);
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
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                {isBookingCreator(item.booking_id) && (
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
                )}
              </div>
            </div>

            {imageUrl && (
              <div style={{ position: 'relative', width: '100%', height: '160px', marginTop: '12px', marginBottom: '16px' }}>
                <img
                  src={imageUrl}
                  alt="Booking"
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginTop: '12px',
                    marginBottom: '16px',
                    animation: 'fadeIn 0.5s ease-out'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  top: '-35px',
                  left: '-1px', // 👈 เปลี่ยนจาก right: '-1px'
                  backgroundColor: item.booking_status === 'Booked' ? '#ef4444' : '#10b981',
                  color: 'white',
                  padding: '4px 10px',
                  fontSize: '15px',
                  borderRadius: '999px',
                  fontWeight: 600,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  animation: 'fadeIn 0.5s ease-out'
                }}>
                  {item.booking_status}
                </span>
              </div>
            )}
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', margin: 0, marginTop: '16px' }}>
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
              marginBottom: '16px',
              animation: 'fadeIn 0.5s ease-out'
            }}>
              {item.booking_type}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setBookingToBook(item);
                  setBookingReservation({
                    booked_date: '',
                    booked_time: '',
                  });
                  setShowBookModal(true);
                  fetch(`${API_BASE_URL}/api/booked?booking_id=${item.booking_id}`)
                    .then(res => res.json())
                    .then(data => {
                      setBookedSlots(data?.data || []);
                    });
                  setBookedTimes([]); // ✅ Reset เวลาที่เคยจองไว้
                }}
                style={{
                  width: '100%',
                  maxWidth: '200px',
                  padding: '10px 16px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  animation: 'fadeIn 0.5s ease-out',
                  whiteSpace: 'nowrap'
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
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
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
        backgroundColor: '#f8f9fa',       // พื้นหลังเทาอ่อน
        padding: '20px 0 0 0',            // ตัด padding ซ้าย-ขวาออก
        borderBottom: '1px solid #e5e7eb', // เส้นสีเทาอ่อน (บาง)
        margin: '0 50px',
        marginBottom: '10px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a202c' }}>Facility</h1>
            <p style={{ color: '#718096', marginTop: '5px', fontSize: '16px', marginBottom: '35px' }}>
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
              + Add Facility
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
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setActiveTab('available');
                  setSelectedTypeFilter('all');
                  setSearchTerm('');
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: activeTab === 'available' ? '#4f46e5' : '#e5e7eb',
                  color: activeTab === 'available' ? 'white' : '#374151',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                All Facility
              </button>
              <button
                onClick={() => {
                  setActiveTab('myBookings');
                  setSelectedTypeFilter('all');
                  setSearchTerm('');
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: activeTab === 'myBookings' ? '#4f46e5' : '#e5e7eb',
                  color: activeTab === 'myBookings' ? 'white' : '#374151',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                My Booked
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',  // ยังคงอยู่เพื่อ responsive
              marginBottom: '25px'
            }}>
              {/* Search Box */}
              <div style={{
                display: 'flex',
                minWidth: '500px', // 👈 เปลี่ยนจาก width: '100%'
                maxWidth: '500px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                borderRadius: '8px',
                overflow: 'hidden',
                flexGrow: 1
              }}>
                <input
                  type="text"
                  placeholder="Search facility..."
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
                  onClick={() => {
                    filterBooking();
                    filterReservations(); // ✅ ต้องเพิ่มด้วย
                  }}
                  style={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    padding: '0 20px',
                    borderRadius: '0 8px 8px 0',
                    fontWeight: 600,
                    transition: 'background-color 0.2s'
                  }}
                >
                  Search
                </button>
              </div>

              {/* All Type Dropdown */}
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                style={{
                  height: '44px',
                  padding: '0 40px 0 16px', // ✅ padding ขวากว้างขึ้นเพื่อเว้นไอคอน
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  outline: 'none',
                  color: '#4a5568',
                  fontWeight: 500,
                  minWidth: '160px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  appearance: 'none', // ✅ ซ่อนลูกศรดั้งเดิม
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg fill=\'%23343a40\' height=\'18\' viewBox=\'0 0 24 24\' width=\'18\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center', // ✅ เว้นจากขอบขวา
                  backgroundSize: '16px 16px',
                }}
              >
                <option value="all">All Facility</option>
                <option value="Meeting Rooms">Meeting Rooms</option>
                <option value="Workstations">Workstations</option>
                <option value="Other">Other</option>
              </select>

            </div>
          </div>

          {/* Projects View */}
          {activeTab === 'available' && (viewMode === 'grid' ? (
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
          ))}

          {activeTab === 'myBookings' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {filteredReservations.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '60px 20px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
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
                      fontWeight: 500,
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredReservations.map(item => {
                  const typeStyle = getTypeColor(item.booking_type || '');
                  const imageUrl = item.booking_image ? `${API_BASE_URL}/uploads/${item.booking_image}` : null;

                  return (
                    <div key={item.booked_id}
                      onMouseEnter={() => setHoveredCard(item.booked_id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: hoveredCard === item.booked_id
                          ? '0 8px 20px rgba(0,0,0,0.12)'
                          : '0 4px 12px rgba(0,0,0,0.05)',
                        transform: hoveredCard === item.booked_id ? 'translateY(-4px)' : 'none',
                        transition: 'all 0.3s ease',
                        padding: '20px',
                        borderTop: `6px solid ${typeStyle.bg}`,
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'fadeIn 0.5s ease-out',
                        justifyContent: 'space-between',
                      }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setReservationToCancel(item.booked_id);
                            setShowCancelPopup(true);
                          }}
                          style={{
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#fee2e2',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginBottom: '20px'
                          }}
                        >
                          ❌
                        </button>
                      </div>

                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt="Room"
                          style={{
                            width: '100%',
                            height: '160px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '16px'
                          }}
                        />
                      )}

                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', margin: 0 }}>
                        {item.booking_title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#4b5563', margin: '12px 0' }}>
                        {item.booking_description}
                      </p>

                      <div style={{
                        backgroundColor: typeStyle.light,
                        color: typeStyle.text,
                        borderRadius: '50px',
                        padding: '5px 12px',
                        fontSize: '13px',
                        fontWeight: 500,
                        width: 'fit-content',
                        marginBottom: '16px'
                      }}>
                        {item.booking_type}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedReservation(item);
                            setShowReservationModal(true);
                          }}
                          style={{
                            padding: '10px 40px',
                            backgroundColor: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Detail Booked
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
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
                      backgroundColor: '#f9fafb',
                      minHeight: '240px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                  >
                    {((isEditMode && editingBooking.booking_image_preview) || (!isEditMode && newBooking.booking_image_preview)) ? (
                      <img
                        src={isEditMode ? editingBooking.booking_image_preview : newBooking.booking_image_preview}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '160px',
                          objectFit: 'contain',
                          borderRadius: '6px'
                        }}
                      />
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          style={{ width: '50px', height: '50px', color: '#a78bfa', marginBottom: '8px' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4m-4 8v4m0 0H8m4 0h4" />
                        </svg>
                        <p style={{ color: '#718096', margin: 0 }}>No file chosen, yet!</p>
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
                      fontSize: '17px',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit'
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
                      fontSize: '17px',
                      fontFamily: 'inherit',
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
                {isEditMode ? 'Update Facility' : 'Save Facility'}
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
      {showBookModal && bookingToBook && (
        <div style={{
          position: 'fixed',
          zIndex: 100,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Reserve Booking Slot</h2>
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '20px',
              alignItems: 'flex-start',
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '10px'
            }}>
              {/* รูปภาพห้อง */}
              {bookingToBook.booking_image && (
                <img
                  src={`${API_BASE_URL}/uploads/${bookingToBook.booking_image}`}
                  alt="Room"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                />
              )}
              {/* ข้อมูลห้อง */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#1a202c' }}>
                  {bookingToBook.booking_title}
                </h3>
                <p style={{ fontSize: '14px', margin: 0, color: '#4a5568' }}>
                  {bookingToBook.booking_description}
                </p>
              </div>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const reservationData = {
                booked_id: uuidv4(), // เพิ่ม id ใหม่ทุกครั้ง
                booked_date: bookingReservation.booked_date || null,
                booked_time: bookingReservation.booked_time || null,
                booking_id: bookingToBook.booking_id || null,
                user_id: currentUserId || null
              };

              fetch(`${API_BASE_URL}/api/booked`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationData)
              })
                .then(async res => {
                  if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`API Error ${res.status}: ${text}`);
                  }
                  return res.json();
                })
                .then(result => {
                  if (result.success) {
                    showNotification("Reservation confirmed!", "success");
                    setShowBookModal(false);
                    fetchProjectsAndCounts();
                  } else {
                    showNotification("Error: " + result.error, "error");
                  }
                })
                .catch(err => {
                  console.error("Booking Error:", err);
                  showNotification("Something went wrong: " + err.message, "error");
                });
            }}>

              <label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#374151'
                }}
              >
                Date
              </label>

              <input
                type="date"
                required
                value={bookingReservation.booked_date}
                min={dayjs().format('YYYY-MM-DD')}
                onChange={e =>
                  setBookingReservation(prev => ({
                    ...prev,
                    booked_date: e.target.value
                  }))
                }
                style={{
                  width: '92%',
                  padding: '10px 14px',
                  fontSize: '15px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  marginBottom: '12px'
                }}
              />

              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Time</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                  <button
                    key={time}
                    type="button"
                    disabled={isTimeBooked(time)}
                    onClick={() => setBookingReservation(prev => ({ ...prev, booked_time: time }))}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      border: '1px solid #d1d5db',
                      backgroundColor: isTimeBooked(time)
                        ? '#e5e7eb'
                        : bookingReservation.booked_time === time ? '#e0e7ff' : 'transparent',
                      color: isTimeBooked(time) ? '#9ca3af' : '#1f2937',
                      fontWeight: 500,
                      cursor: isTimeBooked(time) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#1f2937',
                    border: 'none',                 // 🔥 ลบขอบดำ
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',                 // 🔥 ลบขอบดำ
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Confirm Booked
                </button>
              </div>
            </form>
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
      {showReservationModal && selectedReservation && (
        <div style={{
          position: 'fixed',
          zIndex: 200,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
          onClick={() => setShowReservationModal(false)} // ปิดเมื่อคลิกพื้นหลัง
        >
          <div
            onClick={(e) => e.stopPropagation()} // ป้องกันคลิกในกล่องแล้วปิด
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflow: 'hidden',
              padding: '20px',
              position: 'relative'
            }}
          >
            {/* Top Border Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '10px',
              width: '100%',
              backgroundColor: getTypeColor(selectedReservation.booking_type || '').bg,
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }} />

            {/* Image */}
            {selectedReservation.booking_image && (
              <img
                src={`${API_BASE_URL}/uploads/${selectedReservation.booking_image}`}
                alt="Room"
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  marginTop: '10px' // รองรับ bar ด้านบน
                }}
              />
            )}

            {/* Content */}
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: '#1f2937' }}>
              {selectedReservation.booking_title}
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              {selectedReservation.booking_description}
            </p>
            <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '20px' }}>
              <div><strong>Date:</strong> {dayjs(selectedReservation.booked_date).format('D MMMM YYYY')}</div>
              <div><strong>Time:</strong> {
                (() => {
                  const start = dayjs(`1970-01-01T${selectedReservation.booked_time}`);
                  const end = start.add(1, 'hour');
                  return `${start.format('H:mm')} - ${end.format('H:mm')}`;
                })()
              }</div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowReservationModal(false)}
              style={{
                backgroundColor: '#e5e7eb',
                color: '#374151',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showCancelPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
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
            <h3 style={{ marginTop: 0 }}>Confirm Cancellation</h3>
            <p>Are you sure you want to cancel this reservation?</p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowCancelPopup(false)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  backgroundColor: 'white'
                }}
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (reservationToCancel) {
                    handleCancelReservation(reservationToCancel);
                    setShowCancelPopup(false);
                    setReservationToCancel(null);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: 'white'
                }}
              >
                Cancel Booked
              </button>
            </div>
          </div>
        </div>
      )}
      {showBookedModal && (
        <div style={{
          position: 'fixed',
          zIndex: 999,
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            fontFamily: 'sans-serif'
          }}>
            <h3 style={{
              marginBottom: '20px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#333',
              textAlign: 'center'
            }}>Booked List</h3>

            {/* Header Row */}
            <div style={{
              display: 'flex',
              fontWeight: '600',
              borderBottom: '2px solid #ccc',
              padding: '10px 16px',
              backgroundColor: '#f2f2f2',
              textAlign: 'center'
            }}>
              <div style={{ flex: 2, textAlign: 'center' }}>Email</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Date</div>
              <div style={{ flex: 1, textAlign: 'center' }}>Time</div>
            </div>

            {/* Data Rows */}
            {bookedList?.length > 0 ? (
              [...bookedList]
                .sort((a, b) => {
                  const dateA = dayjs(`${a.booked_date} ${a.booked_time}`);
                  const dateB = dayjs(`${b.booked_date} ${b.booked_time}`);
                  return dateA.isBefore(dateB) ? -1 : 1;
                })
                .map((b, i) => {
                  const [h, m] = b.booked_time.split(':');
                  const startHour = parseInt(h, 10);
                  const startMin = parseInt(m, 10);
                  const endHour = (startHour + 1) % 24;
                  const formattedTime = `${startHour}:${startMin.toString().padStart(2, '0')} - ${endHour}:${startMin.toString().padStart(2, '0')}`;

                  return (
                    <div key={i} style={{
                      display: 'flex',
                      padding: '12px 16px',
                      borderBottom: '1px solid #eee',
                      backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa',
                      textAlign: 'center'
                    }}>
                      <div style={{ flex: 2, textAlign: 'center' }}>{b.user_email}</div>
                      <div style={{ flex: 1, textAlign: 'center' }}>{dayjs(b.booked_date).format('D MMMM YYYY')}</div>
                      <div style={{ flex: 1, textAlign: 'center' }}>{formattedTime}</div>
                    </div>
                  );
                })
            ) : (
              <p style={{ padding: '16px', textAlign: 'center' }}>No bookings found.</p>
            )}

            {/* Close Button */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#e0e0e0',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onClick={() => setShowBookedModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
