import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import './Notes.css';

const COLORS = ['#fbbf24', '#f87171', '#60a5fa', '#34d399', '#a78bfa', '#fb923c'];

const Notes = () => {
  const { notes, addNote, deleteNote, themes } = useTasks();
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#fbbf24');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Filter notes by selected date
    if (notes.length > 0) {
      const filtered = notes.filter(note => note.date === selectedDate);
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes([]);
    }
  }, [notes, selectedDate]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    await addNote(newNoteContent, selectedColor);
    setNewNoteContent('');
    setSelectedColor('#fbbf24');
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Delete this note?')) {
      await deleteNote(noteId);
    }
  };

  const getDateDisplay = (date) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="notes-container"
    >
      <div className="notes-header" style={{ borderBottomColor: themes.myTasks }}>
        <div>
          <h1 className="text-4xl font-bold" style={{ color: themes.myTasks }}>
            Sticky Notes
          </h1>
          <p className="text-secondary mt-2">Add daily notes and keep track of your thoughts</p>
        </div>
      </div>

      {/* Date Picker */}
      <div className="date-picker-section">
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
        <span className="date-display">{getDateDisplay(selectedDate)}</span>
      </div>

      {/* Add New Note Form */}
      <form onSubmit={handleAddNote} className="add-note-form glass-panel">
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Write your note here..."
          className="note-input"
          rows="4"
        />
        
        <div className="form-controls">
          <div className="color-picker">
            <label>Color:</label>
            <div className="color-options">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  title={`Color: ${color}`}
                />
              ))}
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary add-note-btn">
            <Plus size={20} />
            Add Note
          </button>
        </div>
      </form>

      {/* Notes Grid */}
      <div className="notes-grid">
        <AnimatePresence>
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="sticky-note"
                style={{ backgroundColor: note.color }}
              >
                <div className="note-content">
                  <p>{note.content}</p>
                </div>
                <div className="note-footer">
                  <span className="note-time">
                    {new Date(note.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="delete-btn"
                    title="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state"
            >
              <p>No notes for this date yet. Create one to get started!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Notes;
