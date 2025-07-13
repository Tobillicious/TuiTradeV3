// Te Reo Māori Language Toggle Component
// Provides bilingual text switching throughout the application

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { TE_REO_TRANSLATIONS, getBilingualText } from '../../lib/nzLocalizationEnhanced';

// Context for Te Reo Māori state
const TeReoContext = createContext();

// Provider component
export const TeReoProvider = ({ children }) => {
  const [isTeReoMode, setIsTeReoMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('tuitrade-te-reo-mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('tuitrade-te-reo-mode', JSON.stringify(isTeReoMode));
  }, [isTeReoMode]);

  const toggleTeReoMode = () => {
    setIsTeReoMode(prev => !prev);
  };

  const getText = (englishText, teReoKey) => {
    if (isTeReoMode) {
      const teReoText = TE_REO_TRANSLATIONS.phrases[teReoKey] ||
        TE_REO_TRANSLATIONS.interface[teReoKey] ||
        TE_REO_TRANSLATIONS.employment[teReoKey];
      return teReoText || englishText;
    }
    return englishText;
  };

  const getBilingualDisplay = (englishText, teReoKey) => {
    return getBilingualText(englishText, teReoKey);
  };

  return (
    <TeReoContext.Provider value={{
      isTeReoMode,
      toggleTeReoMode,
      getText,
      getBilingualDisplay,
      translations: TE_REO_TRANSLATIONS
    }}>
      {children}
    </TeReoContext.Provider>
  );
};

// Hook to use Te Reo context
export const useTeReo = () => {
  const context = useContext(TeReoContext);
  if (!context) {
    // Return default functions instead of throwing error
    return {
      isTeReoMode: false,
      toggleTeReoMode: () => { },
      getText: (englishText) => englishText,
      getBilingualDisplay: (englishText) => englishText,
      translations: {}
    };
  }
  return context;
};

// Toggle button component
export const TeReoToggle = ({ className = '' }) => {
  const { isTeReoMode, toggleTeReoMode } = useTeReo();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={toggleTeReoMode}
        className={`relative flex items-center w-32 h-8 rounded-full transition-colors duration-300 focus:outline-none ${
          isTeReoMode ? 'bg-blue-600' : 'bg-gray-300'
        } ${className}`}
        aria-label={isTeReoMode ? 'Switch to English' : 'Switch to Te Reo Māori'}
      >
        <span
          className={`absolute left-1 top-1 bottom-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isTeReoMode ? 'translate-x-24' : ''
          }`}
        />
        <div className="flex justify-around w-full text-xs font-bold">
          <span className={isTeReoMode ? 'text-white' : 'text-gray-500'}>English</span>
          <span className={isTeReoMode ? 'text-white' : 'text-gray-500'}>Te Reo</span>
        </div>
      </button>
      {isHovered && (
        <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-sm rounded-lg py-2 px-3 shadow-lg text-center">
          {isTeReoMode ? 'Huri ki te reo Pākehā' : 'Switch to Te Reo Māori'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

// Text component that automatically switches based on mode
export const TeReoText = ({
  english,
  teReoKey,
  className = '',
  showBilingual = false,
  fallback = null
}) => {
  const { isTeReoMode, getText, getBilingualDisplay } = useTeReo();

  if (showBilingual) {
    return (
      <span className={className}>
        {getBilingualDisplay(english, teReoKey)}
      </span>
    );
  }

  const text = getText(english, teReoKey);

  return (
    <span className={className}>
      {text || fallback || english}
    </span>
  );
};

// Category name component with industry-specific translations
export const TeReoCategoryText = ({ categoryKey, englishName, className = '' }) => {
  const { isTeReoMode } = useTeReo();

  // Check for industry-specific translation
  const industryTranslation = {
    'technology': 'hangarau',
    'healthcare': 'hauora',
    'education': 'mātauranga',
    'construction': 'hanga whare',
    'finance': 'pūtea',
    'hospitality': 'manaakitanga',
    'government': 'kāwanatanga',
    'agriculture': 'ahuwhenua',
    'tourism': 'tāpoi',
    'transport': 'kawenga',
    'engineering': 'mataauranga hangarau',
    'legal': 'ture',
    'manufacturing': 'whakatōhanga',
    'retail': 'hokohoko'
  }[categoryKey];

  const displayText = isTeReoMode && industryTranslation
    ? `${englishName} | ${industryTranslation}`
    : englishName;

  return <span className={className}>{displayText}</span>;
};

// Location component with Māori place names
export const TeReoLocationText = ({ location, className = '' }) => {
  const { isTeReoMode } = useTeReo();

  const locationMappings = {
    'Auckland': 'Tāmaki Makaurau',
    'Wellington': 'Te Whanganui-a-Tara',
    'Christchurch': 'Ōtautahi',
    'Hamilton': 'Kirikiriroa',
    'Dunedin': 'Ōtepoti',
    'Tauranga': 'Tauranga',
    'Napier': 'Ahuriri',
    'Palmerston North': 'Te Papa-i-Oea',
    'Nelson': 'Whakatū',
    'Rotorua': 'Rotorua',
    'Whangarei': 'Whangārei',
    'New Plymouth': 'Ngāmotu',
    'Invercargill': 'Waihōpai',
    'Queenstown': 'Tāhuna',
    'New Zealand': 'Aotearoa'
  };

  const maoriName = locationMappings[location];
  const displayText = isTeReoMode && maoriName
    ? `${location} | ${maoriName}`
    : location;

  return <span className={className}>{displayText}</span>;
};

// Greeting component for time-sensitive greetings
export const TeReoGreeting = ({ className = '' }) => {
  const { isTeReoMode } = useTeReo();

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return isTeReoMode ? 'Ata mārie' : 'Good morning';
    } else if (hour < 17) {
      return isTeReoMode ? 'Kia ora' : 'Good afternoon';
    } else {
      return isTeReoMode ? 'Ahiahi pai' : 'Good evening';
    }
  };

  return <span className={className}>{getTimeBasedGreeting()}</span>;
};

// Job title component with Te Reo translations
export const TeReoJobTitle = ({ title, className = '' }) => {
  const { isTeReoMode } = useTeReo();

  const jobTitleMappings = {
    'Manager': 'kaiwhakahaere',
    'Developer': 'kaiwhakawhanake',
    'Teacher': 'kaiako',
    'Nurse': 'tapuhi',
    'Engineer': 'iniana',
    'Designer': 'kaihoahoa',
    'Consultant': 'kaitohutohu',
    'Analyst': 'kaitātari',
    'Coordinator': 'kaiwhakakotahi',
    'Specialist': 'tohunga',
    'Administrator': 'kaiwhakahaere',
    'Assistant': 'kaiāwhina'
  };

  // Check if title contains any of the mapped words
  let displayTitle = title;

  if (isTeReoMode) {
    Object.entries(jobTitleMappings).forEach(([english, maori]) => {
      if (title.toLowerCase().includes(english.toLowerCase())) {
        displayTitle = `${title} | ${maori}`;
      }
    });
  }

  return <span className={className}>{displayTitle}</span>;
};

// Default export
export default TeReoToggle;