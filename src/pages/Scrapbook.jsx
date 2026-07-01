import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Image as ImageIcon, Share2, Trash2, Heart, Star, Sparkles, Smile, MessageSquare, Camera } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import './Scrapbook.css';

const STAMPS = ['❤️', '⭐', '🎉', '🌟', '🍿', '🍕', '🌸', '✈️', '🎮', '💡', '🎨', '🎯', '🐾', '🔥', '📚', '☀️', '🌧️', '😴'];

const Scrapbook = () => {
  const { user, scrapbookEntries, friendScrapbookEntries, saveScrapbook, removeScrapbook, friends } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Modal form states
  const [stamp, setStamp] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [shared, setShared] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Tab states for view switcher (My Scrapbook / Friends' Memory Wall)
  const [activeTab, setActiveTab] = useState('mine');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar Helpers
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday is 0

  const calendarDays = [];
  // Add empty spots for days before the 1st of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Add actual days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Format date key: YYYY-MM-DD (local date representation)
  const getDateKey = (day) => {
    if (!day) return '';
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Find scrapbook entry for a given day
  const getEntryForDay = (day) => {
    const key = getDateKey(day);
    return scrapbookEntries.find(e => e.date === key);
  };

  // Open editor for a clicked day
  const handleDayClick = (day) => {
    if (!day) return;
    const key = getDateKey(day);
    const existing = getEntryForDay(day);
    
    setSelectedDate(key);
    setStamp(existing?.stamp || null);
    setPhotoUrl(existing?.photoUrl || null);
    setCaption(existing?.caption || '');
    setShared(existing?.shared || false);
    setShowModal(true);
  };

  // Photo uploads
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result); // Base64 Data URL
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const entryData = {
      date: selectedDate,
      stamp,
      photoUrl,
      caption,
      shared
    };
    
    await saveScrapbook(entryData);
    setIsSaving(false);
    setShowModal(false);
  };

  const handleDelete = async () => {
    const existing = scrapbookEntries.find(e => e.date === selectedDate);
    if (!existing) return;

    if (window.confirm("Delete this scrapbook page?")) {
      setIsSaving(true);
      await removeScrapbook(existing.id);
      setIsSaving(false);
      setShowModal(false);
    }
  };

  const getFriendName = (friendId) => {
    const fr = friends.find(f => f.id === friendId);
    return fr?.displayName || fr?.email || 'A Friend';
  };

  return (
    <div className="scrapbook-page">
      <div className="scrapbook-header">
        <h1 className="scrapbook-title"><Sparkles className="inline-icon" /> Scrap Book</h1>
        <p className="scrapbook-subtitle">Tape your memories, stamp your calendar, and share index cards with friends.</p>
      </div>

      {/* Tab Selector */}
      <div className="scrapbook-tabs">
        <button 
          onClick={() => setActiveTab('mine')}
          className={`tab-btn ${activeTab === 'mine' ? 'active' : ''}`}
        >
          My Calendar
        </button>
        <button 
          onClick={() => setActiveTab('friends')}
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
        >
          Friends' Memory Wall
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'mine' ? (
          <motion.div
            key="calendar-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="calendar-wrapper glass-panel"
          >
            {/* Calendar Month Header */}
            <div className="calendar-nav-bar">
              <button onClick={handlePrevMonth} className="nav-arrow-btn">
                <ChevronLeft size={24} />
              </button>
              <h2 className="current-month-label">{monthNames[month]} {year}</h2>
              <button onClick={handleNextMonth} className="nav-arrow-btn">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Day names */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="grid-day-header">{d}</div>
              ))}

              {/* Day cells */}
              {calendarDays.map((day, idx) => {
                const entry = getEntryForDay(day);
                const isToday = day && 
                  new Date().getDate() === day && 
                  new Date().getMonth() === month && 
                  new Date().getFullYear() === year;

                return (
                  <div
                    key={idx}
                    onClick={() => day && handleDayClick(day)}
                    className={`calendar-cell ${day ? 'active-cell' : 'empty-cell'} ${isToday ? 'today-cell' : ''} ${entry ? 'has-entry' : ''}`}
                  >
                    {day && (
                      <>
                        <span className="cell-day-num">{day}</span>
                        <div className="cell-content">
                          {entry?.stamp && <span className="cell-stamp">{entry.stamp}</span>}
                          {entry?.photoUrl && (
                            <div className="cell-photo-thumb" style={{ backgroundImage: `url(${entry.photoUrl})` }} />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="friends-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="friends-wall"
          >
            {friendScrapbookEntries.length === 0 ? (
              <div className="empty-wall-state glass-panel">
                <Camera size={48} className="placeholder-icon" />
                <h3>No shared memories yet</h3>
                <p>When your friends tag their scrapbook entries as shared, they'll appear here like Polaroid notes!</p>
              </div>
            ) : (
              <div className="polaroid-grid">
                {friendScrapbookEntries.map((entry) => (
                  <motion.div 
                    key={entry.id} 
                    className="polaroid-card"
                    whileHover={{ scale: 1.04, rotate: 0 }}
                    style={{ '--polaroid-rotate': `${(Math.random() * 6 - 3).toFixed(1)}deg` }}
                  >
                    <div className="polaroid-tape" />
                    <div className="polaroid-image-frame">
                      {entry.photoUrl ? (
                        <img src={entry.photoUrl} alt="Polaroid Memory" className="polaroid-image" />
                      ) : (
                        <div className="polaroid-no-image">
                          <span className="polaroid-big-stamp">{entry.stamp || '📝'}</span>
                        </div>
                      )}
                    </div>
                    <div className="polaroid-caption">
                      <div className="polaroid-meta">
                        <span className="polaroid-author">@{getFriendName(entry.userId)}</span>
                        <span className="polaroid-date">{entry.date}</span>
                      </div>
                      <p className="polaroid-text">{entry.caption || 'No caption...'}</p>
                      {entry.stamp && entry.photoUrl && (
                        <div className="polaroid-corner-stamp">{entry.stamp}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="scrapbook-modal-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="scrapbook-modal-card glass-panel"
            >
              <div className="modal-header">
                <h3>Date: {selectedDate}</h3>
                <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
              </div>

              <div className="modal-body">
                {/* Stamp Picker */}
                <div className="form-section">
                  <label className="section-label">Select Stamp / Mood</label>
                  <div className="stamp-picker-grid">
                    {STAMPS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setStamp(stamp === emoji ? null : emoji)}
                        className={`stamp-btn ${stamp === emoji ? 'selected' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="form-section">
                  <label className="section-label">Tape a Photo</label>
                  <div className="photo-upload-container">
                    {photoUrl ? (
                      <div className="photo-preview-wrapper">
                        <img src={photoUrl} alt="Preview" className="photo-upload-preview" />
                        <button onClick={() => setPhotoUrl(null)} className="remove-photo-btn" title="Remove Photo">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="photo-dropzone">
                        <Camera size={28} />
                        <span>Upload Photo (Max 2MB)</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload} 
                          className="hidden-file-input" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Caption / Journal */}
                <div className="form-section">
                  <label className="section-label">Write your thoughts</label>
                  <textarea
                    placeholder="Write a cute message or journal entry..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="caption-textarea"
                    rows={4}
                  />
                </div>

                {/* Shared Switch */}
                <div className="form-section share-toggle-section">
                  <label className="share-toggle-label">
                    <Share2 size={18} />
                    <span>Share Page with Friends</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={shared}
                    onChange={(e) => setShared(e.target.checked)}
                    className="share-checkbox"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                {scrapbookEntries.some(e => e.date === selectedDate) && (
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="btn-delete"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Page'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Scrapbook;
