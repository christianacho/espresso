// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import type { Session } from "@supabase/supabase-js"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../supabaseClient"
import { Calendar, Menu, X, Plus, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import "../style/Dashboard.css"

export default function Dashboard({ session }: { session: Session }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);
  const [brainDumpText, setBrainDumpText] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<{ [key: string]: any[] }>({
    // Sample events - in real app, this comes from your backend
    '2025-09-08': [
      { id: 1, title: 'Team Meeting', time: '10:00 AM', description: 'Weekly team standup meeting', priority: 'high' },
      { id: 2, title: 'Code Review', time: '2:00 PM', description: 'Review pull requests', priority: 'medium' }
    ],
    '2025-09-10': [
      { id: 3, title: 'Project Demo', time: '3:00 PM', description: 'Present project to stakeholders', priority: 'high' }
    ]
  });

  // Load events when component mounts (optional)
  useEffect(() => {
    const loadUserEvents = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/events?user_id=${session.user.id}&month=${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`);
        if (response.ok) {
          const userEvents = await response.json();
          // Process and set user events here if you have this endpoint
        }
      } catch (error) {
        console.log('Could not load events:', error);
      }
    };

    // Uncomment when you have the events endpoint ready
    // loadUserEvents();
  }, [session.user.id, currentDate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Get calendar data for current month
  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDateObj = new Date(startDate);

    while (currentDateObj <= lastDay || days.length < 42) {
      days.push(new Date(currentDateObj));
      currentDateObj.setDate(currentDateObj.getDate() + 1);
      if (days.length >= 42) break;
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // const handleBrainDumpSubmit = async () => {
  //   if (!brainDumpText.trim()) return;

  //   try {
  //     const response = await fetch('http://localhost:5000/api/process-brain-dump', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         brain_dump: brainDumpText,
  //         user_id: session.user.id
  //       })
  //     });

  //     if (response.ok) {
  //       const newEvents = await response.json();

  //       // Process the events and add them to your calendar
  //       const newEventsMap: { [key: string]: any[] } = {};
  //       newEvents.forEach((event: any) => {
  //         if (!newEventsMap[event.date]) {
  //           newEventsMap[event.date] = [];
  //         }
  //         newEventsMap[event.date].push({
  //           ...event,
  //           time: event.time,
  //           description: `Generated from brain dump`,
  //           priority: 'medium'
  //         });
  //       });

  //       // Merge with existing events
  //       setEvents(prev => {
  //         const updated = { ...prev };
  //         Object.keys(newEventsMap).forEach(date => {
  //           updated[date] = [...(updated[date] || []), ...newEventsMap[date]];
  //         });
  //         return updated;
  //       });

  //       setBrainDumpText('');
  //       setShowBrainDump(false);
  //     } else {
  //       console.error('Failed to process brain dump');
  //     }
  //   } catch (error) {
  //     console.error('Failed to process brain dump:', error);
  //   }
  // };

  const handleBrainDumpSubmit = async () => {
    console.log('🟡 Brain dump submit clicked!');

    if (!brainDumpText.trim()) {
      console.log('🔴 No brain dump text provided');
      return;
    }

    console.log('🟢 Sending brain dump:', brainDumpText);

    try {
      console.log('🟡 Making fetch request...');

      // Remove no-cors mode to properly handle the response
      const response = await fetch('http://localhost:5001/api/process-brain-dump', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          brain_dump: brainDumpText,
          user_id: session.user.id
        })
      });

      console.log('🟡 Response status:', response.status);

      if (response.ok) {
        const newEvents = await response.json();
        console.log('🟢 Received events from AI:', newEvents);

        // Process the events and add them to your calendar
        const newEventsMap: { [key: string]: any[] } = {};
        newEvents.forEach((event: any) => {
          if (!newEventsMap[event.date]) {
            newEventsMap[event.date] = [];
          }
          newEventsMap[event.date].push({
            ...event,
            description: `Generated from AI brain dump processing`,
            priority: 'medium'
          });
        });

        // Merge with existing events
        setEvents(prev => {
          const updated = { ...prev };
          Object.keys(newEventsMap).forEach(date => {
            updated[date] = [...(updated[date] || []), ...newEventsMap[date]];
          });
          return updated;
        });

        setBrainDumpText('');
        setShowBrainDump(false);
        console.log('🟢 Success! Events added to calendar and modal closed.');
      } else {
        const errorText = await response.text();
        console.error('🔴 Server error:', response.status, errorText);

        // Show user-friendly error message
        alert('Sorry, there was an error processing your brain dump. Please try again.');
      }

    } catch (error) {
      console.error('🔴 Network/Fetch error:', error);

      // Fallback: create a simple event if the request fails
      console.log('🟡 Creating fallback event...');
      const fallbackEvent = [{
        id: Date.now().toString(),
        title: `Review: ${brainDumpText.substring(0, 30)}...`,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        time: '10:00',
        description: 'Fallback event - server unavailable',
        priority: 'medium'
      }];

      const fallbackEventsMap: { [key: string]: any[] } = {};
      fallbackEvent.forEach((event: any) => {
        if (!fallbackEventsMap[event.date]) {
          fallbackEventsMap[event.date] = [];
        }
        fallbackEventsMap[event.date].push(event);
      });

      setEvents(prev => {
        const updated = { ...prev };
        Object.keys(fallbackEventsMap).forEach(date => {
          updated[date] = [...(updated[date] || []), ...fallbackEventsMap[date]];
        });
        return updated;
      });

      setBrainDumpText('');
      setShowBrainDump(false);

      alert('Unable to connect to AI service. Created a basic reminder event instead.');
    }
  };


  const calendarDays = getCalendarData();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="dash-main">
      {/* Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="menu-button"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-content">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <h2>
              <Calendar size={28} />
              Schedule AI
            </h2>
            <p>Smart calendar management</p>
          </div>

          {/* Add Events Button */}
          <div className="sidebar-section">
            <button
              onClick={() => setShowBrainDump(true)}
              className="add-events-button"
            >
              <Plus size={20} />
              Add Events
            </button>
          </div>

          {/* Spacer */}
          <div className="sidebar-spacer"></div>

          {/* User Info */}
          <div className="sidebar-user">
            <p>Welcome, {session.user.email}</p>
          </div>

          {/* Logout Button */}
          <div className="sidebar-footer">
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'content-shifted' : ''}`}>
        {/* Calendar Header */}
        <div className="calendar-container">
          <div className="calendar-header">
            <h1>
              <Calendar size={32} />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            <div className="calendar-nav">
              <button
                onClick={() => navigateMonth(-1)}
                className="nav-button"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="today-button"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="nav-button"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((date, index) => {
              const dateKey = formatDateKey(date);
              const dayEvents = events[dateKey] || [];
              const today = isToday(date);
              const currentMonth = isCurrentMonth(date);

              return (
                <div
                  key={index}
                  className={`calendar-day ${today ? 'today' : ''} ${currentMonth ? 'current-month' : 'other-month'}`}
                >
                  <div className="day-number">
                    {date.getDate()}
                  </div>
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`event event-${event.priority}`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Brain Dump Modal */}
      {showBrainDump && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <h3>Brain Dump Your Tasks</h3>
              <p>Tell me what you need to do and when. I'll create an optimal schedule for you!</p>

              <textarea
                value={brainDumpText}
                onChange={(e) => setBrainDumpText(e.target.value)}
                placeholder="Example: I need to finish the project report by Friday, call mom sometime this week, gym session Tuesday evening, grocery shopping before weekend..."
                className="brain-dump-textarea"
              />

              <div className="modal-buttons">
                <button
                  onClick={() => setShowBrainDump(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBrainDumpSubmit}
                  className="submit-button"
                >
                  Create Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <h3>{selectedEvent.title}</h3>
              <p className="event-time">{selectedEvent.time}</p>
              <p className="event-description">{selectedEvent.description}</p>

              <div className="event-footer">
                <span className={`priority-badge priority-${selectedEvent.priority}`}>
                  {selectedEvent.priority} priority
                </span>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="close-button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}