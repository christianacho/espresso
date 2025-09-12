// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react'
import type { Session } from "@supabase/supabase-js"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../supabaseClient"
import { Calendar, Menu, X, Plus, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import ThemePicker from "../components/ThemePicker"
import "../style/Dashboard.css"

export default function Dashboard({
  session,
  userProfile,
}: {
  session: Session;
  userProfile?: { id: string; display_name?: string } | null;
}) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);
  const [brainDumpText, setBrainDumpText] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<{ [key: string]: any[] }>({
    '2025-09-08': [
      { id: 1, title: 'Team Meeting', time: '10:00 AM', description: 'Weekly team standup meeting', priority: 'high' },
      { id: 2, title: 'Code Review', time: '2:00 PM', description: 'Review pull requests', priority: 'medium' }
    ],
    '2025-09-10': [
      { id: 3, title: 'Project Demo', time: '3:00 PM', description: 'Present project to stakeholders', priority: 'high' }
    ]
  });
  const [expandedDayEvents, setExpandedDayEvents] = useState<{
    date: string;
    events: any[];
    closing?: boolean;
  } | null>(null);

  const [themeColors, setThemeColors] = useState({
    background: "#f5e6d3",
    calendar: "#8B4513",
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  // const [expandedDayEvents, setExpandedDayEvents] = useState<any[] | null>(null);
  // const [eventSource, setEventSource] = useState<"calendar" | "expanded">("calendar");

  useEffect(() => {
    const loadUserEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/events?user_id=${session.user.id}&month=${currentDate.getFullYear()
          }-${String(currentDate.getMonth() + 1).padStart(2, "0")}`
        )
        if (response.ok) {
          const userEvents = await response.json()
          const newEventsMap: { [key: string]: any[] } = {}
          userEvents.forEach((event: any) => {
            if (!newEventsMap[event.date]) newEventsMap[event.date] = []
            newEventsMap[event.date].push(event)
          })
          setEvents(newEventsMap)
        }
      } catch (error) {
        console.log("Could not load events:", error)
      }
    }
    loadUserEvents()
  }, [session.user.id, currentDate])

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

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

  const handleBrainDumpSubmit = async () => {
    console.log('Brain dump submit clicked!');

    if (!brainDumpText.trim()) {
      console.log('No brain dump text provided');
      return;
    }

    console.log('Sending brain dump:', brainDumpText);

    try {
      console.log('Making fetch request...');

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

      console.log('Response status:', response.status);

      if (response.ok) {
        const newEvents = await response.json();
        console.log('Received events from AI:', newEvents);

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

        setEvents(prev => {
          const updated = { ...prev };
          Object.keys(newEventsMap).forEach(date => {
            updated[date] = [...(updated[date] || []), ...newEventsMap[date]];
          });
          return updated;
        });

        setBrainDumpText('');
        setShowBrainDump(false);
        console.log('Success! Events added to calendar and modal closed.');
      } else {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);

        alert('Sorry, there was an error processing your brain dump. Please try again.');
      }

    } catch (error) {
      console.error('Network/Fetch error:', error);

      console.log('Creating fallback event...');
      const fallbackEvent = [{
        id: Date.now().toString(),
        title: `Review: ${brainDumpText.substring(0, 30)}...`,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
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
    {/* <div
        className="dash-main"
        style={{ backgroundColor: themeColors.background }}
        > */}
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
            <h2 className="side-name">
              brew.ai
            </h2>
          </div>
          <div className="sidebar-section">
            {/* <button
              onClick={() => setShowBrainDump(true)}
              className="add-events-button"
            >
              <Plus size={20} />
              Add Events
            </button> */}
          </div>
          <div className="sidebar-spacer"></div>
          <div className="sidebar-user">
            <p><p>Welcome, {userProfile?.display_name || session.user.email}</p>
            </p>
          </div>
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
      <div className={`main-content ${sidebarOpen ? 'content-shifted' : ''} `}>
        {/* Calendar Header */}
        <div className="calendar-container">
          <div className="calendar-header">
            <h1>
              <Calendar size={32} />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>

            <div className="calendar-nav">

              <button
                onClick={() => setShowThemePicker(true)}
                className="nav-button"
              >
                🎨 Theme
              </button>

              {showThemePicker && (
                <ThemePicker
                  initialColors={themeColors}
                  onClose={() => setShowThemePicker(false)}
                  onApply={(newColors) => setThemeColors(newColors)}
                />
              )}

               <button
              onClick={() => setShowBrainDump(true)}
              className="add-events-button-cal nav-button"
              >
              <Plus size={20} />
              Add
              {/* Add Events */}
            </button>
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
          <div className="whole-calendar">
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

              const visibleEvents = dayEvents.slice(0, 4); // show up to 4
              const extraCount = dayEvents.length - visibleEvents.length;

              return (
                <div
                  key={index}
                  className={`calendar-day ${today ? 'today' : ''} ${currentMonth ? 'current-month' : 'other-month'}`}
                >
                  <div className="day-number">{date.getDate()}</div>
                  <div className="event-list">
                    {visibleEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`event event-${event.priority}`}
                      >
                        {event.title}
                      </div>
                    ))}

                    {extraCount > 0 && (
                      <div
                        className="more-events"
                        onClick={() => setExpandedDayEvents({ date: dateKey, events: dayEvents })}
                      >
                        +{extraCount} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
      {/* Expanded Day Events Modal (for "+X more") */}
      {expandedDayEvents && (
        <div className="modal-exp-main">
          <div
            className={`modal-exp ${expandedDayEvents.closing ? "closing" : ""}`}
          >
            <div className="modal-content-exp">
              <h3 className="exp-title">{expandedDayEvents.date}</h3>
              <div className="expanded-events-list">
                {expandedDayEvents.events.map((event) => (
                  <div
                    key={event.id}
                    className={`event-exp event-${event.priority}`}
                    onClick={() => {
                      setSelectedEvent(event);
                      setExpandedDayEvents(null);
                    }}
                  >
                    <p className="event-title">{event.title}</p>
                    <p className="event-time">{event.time}</p>
                  </div>
                ))}
              </div>

              <div className="modal-buttons">
                <button
                  onClick={() => {
                    setExpandedDayEvents({ ...expandedDayEvents, closing: true });
                    setTimeout(() => setExpandedDayEvents(null), 250);
                  }}
                  className="close-button-exp"
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