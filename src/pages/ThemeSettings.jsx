import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import './ThemeSettings.css';

const PRESET_THEMES = [
  {
    name: 'Default',
    myTasks: '#ec4899',
    friendTasks: '#2196f3',
    groupTasks: '#10b981',
    inkColor: '#2b5b84',
    marginColor: '#d94646',
    paperColor: '#ffffff',
    textColor: '#1a1a1a'
  },
  {
    name: 'Ocean',
    myTasks: '#0ea5e9',
    friendTasks: '#06b6d4',
    groupTasks: '#0d9488',
    inkColor: '#0369a1',
    marginColor: '#0ea5e9',
    paperColor: '#f0f9ff',
    textColor: '#0f172a'
  },
  {
    name: 'Sunset',
    myTasks: '#f97316',
    friendTasks: '#ec4899',
    groupTasks: '#f59e0b',
    inkColor: '#c2410c',
    marginColor: '#ea580c',
    paperColor: '#fff7ed',
    textColor: '#431407'
  },
  {
    name: 'Forest',
    myTasks: '#10b981',
    friendTasks: '#059669',
    groupTasks: '#047857',
    inkColor: '#15803d',
    marginColor: '#16a34a',
    paperColor: '#f0fdf4',
    textColor: '#14532d'
  },
  {
    name: 'Purple Dream',
    myTasks: '#a855f7',
    friendTasks: '#d946ef',
    groupTasks: '#7c3aed',
    inkColor: '#6d28d9',
    marginColor: '#8b5cf6',
    paperColor: '#faf5ff',
    textColor: '#3b0764'
  },
  {
    name: 'Dark Mode',
    myTasks: '#e5e7eb',
    friendTasks: '#9ca3af',
    groupTasks: '#374151',
    inkColor: '#f3f4f6',
    marginColor: '#4b5563',
    paperColor: '#111827',
    textColor: '#f9fafb'
  }
];

const ThemeSettings = () => {
  const { themes, updateThemes } = useTasks();
  const [customThemes, setCustomThemes] = useState(themes);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleColorChange = (section, color) => {
    const newThemes = { ...customThemes, [section]: color };
    setCustomThemes(newThemes);
  };

  const handleApplyPreset = (preset) => {
    setCustomThemes({
      myTasks: preset.myTasks,
      friendTasks: preset.friendTasks,
      groupTasks: preset.groupTasks,
      inkColor: preset.inkColor || '#2b5b84',
      marginColor: preset.marginColor || '#d94646',
      paperColor: preset.paperColor || '#ffffff',
      textColor: preset.textColor || '#1a1a1a'
    });
  };

  const handleSaveThemes = async () => {
    setLoading(true);
    try {
      const success = await updateThemes(customThemes);
      if (success) {
        setMessage('✅ Themes updated successfully!');
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('❌ Failed to update themes');
      }
    } catch (_err) {
      setMessage('❌ Error updating themes');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCustomThemes(themes);
    setMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="theme-settings"
    >
      <div className="theme-settings-card">
        <div className="theme-header">
          <Palette size={24} />
          <h2>Color Themes</h2>
          <p>Customize colors for different task sections</p>
        </div>

        {/* Current Themes Preview */}
        <div className="theme-preview-section">
          <h3>Your Current Themes</h3>
          <div className="theme-preview">
            <div className="preview-item">
              <label>My Tasks</label>
              <div
                className="color-preview"
                style={{ backgroundColor: customThemes.myTasks }}
              ></div>
              <input
                type="color"
                value={customThemes.myTasks}
                onChange={(e) => handleColorChange('myTasks', e.target.value)}
                className="color-picker"
              />
              <code className="color-code">{customThemes.myTasks}</code>
            </div>

            <div className="preview-item">
              <label>Friend Tasks</label>
              <div
                className="color-preview"
                style={{ backgroundColor: customThemes.friendTasks }}
              ></div>
              <input
                type="color"
                value={customThemes.friendTasks}
                onChange={(e) => handleColorChange('friendTasks', e.target.value)}
                className="color-picker"
              />
              <code className="color-code">{customThemes.friendTasks}</code>
            </div>

            <div className="preview-item">
              <label>Group Tasks</label>
              <div
                className="color-preview"
                style={{ backgroundColor: customThemes.groupTasks }}
              ></div>
              <input
                type="color"
                value={customThemes.groupTasks}
                onChange={(e) => handleColorChange('groupTasks', e.target.value)}
                className="color-picker"
              />
              <code className="color-code">{customThemes.groupTasks}</code>
            </div>
          </div>
        </div>

        {/* General App Colors */}
        <div className="theme-preview-section">
          <h3>General App Colors</h3>
          <div className="theme-preview">
            <div className="preview-item">
              <label>Ink Color</label>
              <div
                className="color-preview"
                style={{ backgroundColor: customThemes.inkColor || '#2b5b84' }}
              ></div>
              <input
                type="color"
                value={customThemes.inkColor || '#2b5b84'}
                onChange={(e) => handleColorChange('inkColor', e.target.value)}
                className="color-picker"
              />
              <code className="color-code">{customThemes.inkColor || '#2b5b84'}</code>
            </div>

            <div className="preview-item">
              <label>Margin Line</label>
              <div
                className="color-preview"
                style={{ backgroundColor: customThemes.marginColor || '#d94646' }}
              ></div>
              <input
                type="color"
                value={customThemes.marginColor || '#d94646'}
                onChange={(e) => handleColorChange('marginColor', e.target.value)}
                className="color-picker"
              />
              <code className="color-code">{customThemes.marginColor || '#d94646'}</code>
            </div>

            <div className="preview-item">
              <label>Paper Background</label>
              <div
                className="color-preview"
                style={{ backgroundColor: customThemes.paperColor || '#ffffff' }}
              ></div>
              <input
                type="color"
                value={customThemes.paperColor || '#ffffff'}
                onChange={(e) => handleColorChange('paperColor', e.target.value)}
                className="color-picker"
              />
              <code className="color-code">{customThemes.paperColor || '#ffffff'}</code>
            </div>

            <div className="preview-item">
              <label>Text Color</label>
              <div
                className="color-preview"
                style={{ backgroundColor: customThemes.textColor || '#1a1a1a' }}
              ></div>
              <input
                type="color"
                value={customThemes.textColor || '#1a1a1a'}
                onChange={(e) => handleColorChange('textColor', e.target.value)}
                className="color-picker"
              />
              <code className="color-code">{customThemes.textColor || '#1a1a1a'}</code>
            </div>
          </div>
        </div>

        {/* Preset Themes */}
        <div className="preset-themes-section">
          <h3>Preset Themes</h3>
          <div className="preset-grid">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                className="preset-btn"
              >
                <div className="preset-colors">
                  <div
                    className="preset-color"
                    style={{ backgroundColor: preset.myTasks }}
                  ></div>
                  <div
                    className="preset-color"
                    style={{ backgroundColor: preset.friendTasks }}
                  ></div>
                  <div
                    className="preset-color"
                    style={{ backgroundColor: preset.groupTasks }}
                  ></div>
                </div>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}
          >
            {message}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="theme-actions">
          <button
            onClick={handleReset}
            disabled={loading}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveThemes}
            disabled={loading || JSON.stringify(customThemes) === JSON.stringify(themes)}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : 'Save Themes'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ThemeSettings;
