// Accessibility Provider - Universal access for life-changing platform
// Ensures everyone can participate in TuiTrade's mission regardless of ability

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Type, 
  MousePointer,
  Keyboard,
  Heart,
  Zap,
  Sun,
  Moon,
  Contrast,
  Focus,
  Accessibility,
  Settings,
  X,
  TrendingUp
} from 'lucide-react';

// Accessibility Context
const AccessibilityContext = createContext();

// Accessibility modes and settings
const ACCESSIBILITY_MODES = {
  VISUAL: {
    HIGH_CONTRAST: 'high-contrast',
    DARK_MODE: 'dark-mode',
    LARGE_TEXT: 'large-text',
    REDUCED_MOTION: 'reduced-motion',
    FOCUS_INDICATORS: 'focus-indicators',
    COLOR_BLIND_FRIENDLY: 'color-blind-friendly'
  },
  MOTOR: {
    LARGE_CLICK_TARGETS: 'large-click-targets',
    STICKY_HOVER: 'sticky-hover',
    VOICE_NAVIGATION: 'voice-navigation',
    KEYBOARD_ONLY: 'keyboard-only'
  },
  COGNITIVE: {
    SIMPLIFIED_UI: 'simplified-ui',
    CLEAR_LANGUAGE: 'clear-language',
    PROGRESS_INDICATORS: 'progress-indicators',
    AUTO_SAVE: 'auto-save'
  },
  AUDIO: {
    SCREEN_READER: 'screen-reader',
    AUDIO_DESCRIPTIONS: 'audio-descriptions',
    CAPTIONS: 'captions',
    SOUND_ALERTS: 'sound-alerts'
  }
};

// Te Reo Māori accessibility terms
const ACCESSIBILITY_TRANSLATIONS = {
  accessibility: 'uru whānui',
  'screen reader': 'pānui mata',
  'high contrast': 'rereke tiketike',
  'large text': 'kupu nunui',
  'voice control': 'whakahaere reo',
  'keyboard navigation': 'kōwhiri papapātuhi',
  'focus indicator': 'tohu arotahi',
  'alternative text': 'kupu kē'
};

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    // Visual accessibility
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    focusIndicators: true,
    colorBlindMode: false,
    
    // Motor accessibility
    largeClickTargets: false,
    stickyHover: false,
    voiceNavigation: false,
    keyboardOnly: false,
    
    // Cognitive accessibility
    simplifiedUI: false,
    clearLanguage: false,
    progressIndicators: true,
    autoSave: true,
    
    // Audio accessibility
    screenReader: false,
    audioDescriptions: false,
    captions: false,
    soundAlerts: true,
    
    // Custom settings
    textSize: 100,
    animationSpeed: 100,
    contrastLevel: 100,
    voiceSpeed: 100
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('visual');
  const [announcements, setAnnouncements] = useState([]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('tuitrade-accessibility');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }

    // Check for system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
    
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('tuitrade-accessibility', JSON.stringify(settings));
    applyAccessibilityStyles();
  }, [settings]);

  // Apply CSS custom properties for accessibility
  const applyAccessibilityStyles = useCallback(() => {
    const root = document.documentElement;
    
    // Text size
    root.style.setProperty('--accessibility-text-scale', `${settings.textSize / 100}`);
    
    // Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Large click targets
    if (settings.largeClickTargets) {
      root.classList.add('large-click-targets');
    } else {
      root.classList.remove('large-click-targets');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    
    // Color blind friendly
    if (settings.colorBlindMode) {
      root.classList.add('color-blind-friendly');
    } else {
      root.classList.remove('color-blind-friendly');
    }
    
    // Simplified UI
    if (settings.simplifiedUI) {
      root.classList.add('simplified-ui');
    } else {
      root.classList.remove('simplified-ui');
    }
  }, [settings]);

  // Toggle individual setting
  const toggleSetting = useCallback((setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // Announce change to screen readers
    announce(`${setting} ${settings[setting] ? 'disabled' : 'enabled'}`);
  }, [settings]);

  // Update range setting
  const updateRangeSetting = useCallback((setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  }, []);

  // Screen reader announcements
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 5000);
  }, []);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + A to open accessibility menu
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsMenuOpen(prev => !prev);
        announce('Accessibility menu toggled');
      }
      
      // Escape to close menu
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        announce('Accessibility menu closed');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, announce]);

  // Voice navigation (simplified implementation)
  useEffect(() => {
    if (settings.voiceNavigation && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-NZ';
      
      recognition.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        handleVoiceCommand(command);
      };
      
      recognition.start();
      
      return () => recognition.stop();
    }
  }, [settings.voiceNavigation]);

  const handleVoiceCommand = (command) => {
    if (command.includes('profile')) {
      window.location.href = '/profiles';
      announce('Navigating to profiles');
    } else if (command.includes('jobs')) {
      window.location.href = '/jobs';
      announce('Navigating to jobs');
    } else if (command.includes('marketplace')) {
      window.location.href = '/marketplace';
      announce('Navigating to marketplace');
    } else if (command.includes('help')) {
      window.location.href = '/help';
      announce('Navigating to help');
    }
  };

  const contextValue = {
    settings,
    toggleSetting,
    updateRangeSetting,
    announce,
    isMenuOpen,
    setIsMenuOpen
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Screen Reader Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="accessibility-announcements"
      >
        {announcements.map(announcement => (
          <div key={announcement.id}>
            {announcement.message}
          </div>
        ))}
      </div>
      
      {/* Accessibility Menu */}
      <AccessibilityMenu />
    </AccessibilityContext.Provider>
  );
};

// Accessibility Menu Component
const AccessibilityMenu = () => {
  const { settings, toggleSetting, updateRangeSetting, isMenuOpen, setIsMenuOpen } = useAccessibility();
  const [activeTab, setActiveTab] = useState('visual');

  const tabs = [
    { id: 'visual', label: 'Visual', maori: 'Mata', icon: Eye },
    { id: 'motor', label: 'Motor', maori: 'Kori', icon: MousePointer },
    { id: 'cognitive', label: 'Cognitive', maori: 'Hinengaro', icon: Focus },
    { id: 'audio', label: 'Audio', maori: 'Rongo', icon: Volume2 }
  ];

  const visualSettings = [
    { key: 'highContrast', label: 'High Contrast', maori: 'Rereke Tiketike', icon: Contrast },
    { key: 'largeText', label: 'Large Text', maori: 'Kupu Nunui', icon: Type },
    { key: 'reducedMotion', label: 'Reduced Motion', maori: 'Kori Iti', icon: Zap },
    { key: 'focusIndicators', label: 'Focus Indicators', maori: 'Tohu Arotahi', icon: Focus },
    { key: 'colorBlindMode', label: 'Color Blind Friendly', maori: 'Hoa Mata Ā', icon: Eye }
  ];

  const motorSettings = [
    { key: 'largeClickTargets', label: 'Large Click Targets', maori: 'Whāinga Pāti Nunui', icon: MousePointer },
    { key: 'stickyHover', label: 'Sticky Hover', maori: 'Kōpare Piri', icon: MousePointer },
    { key: 'voiceNavigation', label: 'Voice Navigation', maori: 'Kōwhiri Reo', icon: Volume2 },
    { key: 'keyboardOnly', label: 'Keyboard Only', maori: 'Papapātuhi Anake', icon: Keyboard }
  ];

  const cognitiveSettings = [
    { key: 'simplifiedUI', label: 'Simplified Interface', maori: 'Mata Māmā', icon: Settings },
    { key: 'clearLanguage', label: 'Clear Language', maori: 'Reo Mārama', icon: Type },
    { key: 'progressIndicators', label: 'Progress Indicators', maori: 'Tohu Ahunga', icon: TrendingUp },
    { key: 'autoSave', label: 'Auto Save', maori: 'Tiaki Aunoa', icon: Heart }
  ];

  const audioSettings = [
    { key: 'screenReader', label: 'Screen Reader', maori: 'Pānui Mata', icon: Volume2 },
    { key: 'audioDescriptions', label: 'Audio Descriptions', maori: 'Whakaahua Rongo', icon: Volume2 },
    { key: 'captions', label: 'Captions', maori: 'Tapanga Kupu', icon: Type },
    { key: 'soundAlerts', label: 'Sound Alerts', maori: 'Whakamataara Oro', icon: Volume2 }
  ];

  const getSettingsForTab = (tab) => {
    switch (tab) {
      case 'visual': return visualSettings;
      case 'motor': return motorSettings;
      case 'cognitive': return cognitiveSettings;
      case 'audio': return audioSettings;
      default: return [];
    }
  };

  if (!isMenuOpen) {
    return (
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
        aria-label="Open accessibility menu (Alt + A)"
        title="Accessibility Settings"
      >
        <Accessibility size={24} />
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={() => setIsMenuOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Accessibility className="mr-3" />
                  Accessibility Settings
                </h2>
                <p className="text-green-100 mt-1">Uru Whānui - Universal Access</p>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:text-green-200 transition-colors"
                aria-label="Close accessibility menu"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-4 text-center border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600 bg-green-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">{tab.label}</div>
                  <div className="text-xs text-gray-500">{tab.maori}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {getSettingsForTab(activeTab).map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <setting.icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-500">{setting.maori}</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[setting.key]}
                      onChange={() => toggleSetting(setting.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}

              {/* Range Controls */}
              {activeTab === 'visual' && (
                <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900">Fine-tune Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Size: {settings.textSize}%
                    </label>
                    <input
                      type="range"
                      min="80"
                      max="200"
                      value={settings.textSize}
                      onChange={(e) => updateRangeSetting('textSize', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animation Speed: {settings.animationSpeed}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={settings.animationSpeed}
                      onChange={(e) => updateRangeSetting('animationSpeed', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Settings are saved automatically
              </div>
              <div className="text-sm text-gray-500">
                Shortcut: Alt + A
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Custom hook for accessing accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export default AccessibilityProvider;