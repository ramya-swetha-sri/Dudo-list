import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import './StickyNoteWidget.css';

const COLORS = ['#fbbf24', '#f87171', '#60a5fa', '#34d399', '#a78bfa', '#fb923c'];

const StickyNoteWidget = () => {
  const { notes, addNote, deleteNote, loadNotes } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#fbbf24');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const panelRef = useRef(null);

  // Filter notes for selected date
  const filteredNotes = (notes || []).filter(note => note.date === selectedDate);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.sticky-widget-trigger')) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    await addNote(newNoteContent, selectedColor);
    setNewNoteContent('');
    setIsAdding(false);
  };

  const handleDeleteNote = async (noteId) => {
    await deleteNote(noteId);
  };

  const changeDate = (direction) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + direction);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getDateDisplay = (date) => {
    const d = new Date(date + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    if (date === today) return 'Today';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        className={`sticky-widget-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Sticky Notes"
      >
        <StickyNote size={20} />
        {notes.length > 0 && (
          <span className="note-count">{notes.length}</span>
        )}
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            className="sticky-widget-panel"
            initial={{ opacity: 0, scale: 0.85, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Panel Header */}
            <div className="sw-header">
              <h3>📝 Sticky Notes</h3>
              <button className="sw-close" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Date Navigation */}
            <div className="sw-date-nav">
              <button onClick={() => changeDate(-1)} className="sw-date-btn">
                <ChevronLeft size={16} />
              </button>
              <span className="sw-date-label">{getDateDisplay(selectedDate)}</span>
              <button onClick={() => changeDate(1)} className="sw-date-btn">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Notes List */}
            <div className="sw-notes-list">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    className="sw-note-card"
                    style={{ backgroundColor: note.color }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                  >
                    <p className="sw-note-text">{note.content}</p>
                    <div className="sw-note-footer">
                      <span className="sw-note-time">
                        {new Date(note.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="sw-note-delete"
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="sw-empty">No notes for {getDateDisplay(selectedDate)}</p>
              )}
            </div>

            {/* Add Note Section */}
            {isAdding ? (
              <form onSubmit={handleAddNote} className="sw-add-form">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write a note..."
                  className="sw-note-input"
                  rows="3"
                  autoFocus
                />
                <div className="sw-form-row">
                  <div className="sw-colors">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`sw-color-btn ${selectedColor === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="sw-form-actions">
                    <button type="button" className="sw-cancel-btn" onClick={() => { setIsAdding(false); setNewNoteContent(''); }}>
                      Cancel
                    </button>
                    <button type="submit" className="sw-save-btn">
                      Save
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <button className="sw-add-btn" onClick={() => setIsAdding(true)}>
                <Plus size={18} />
                Add Note
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StickyNoteWidget;
