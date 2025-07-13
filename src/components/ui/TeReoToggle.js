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

  return (
    <button
      onClick={toggleTeReoMode}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-100 ${className}`}
      title={isTeReoMode ? 'Switch to English' : 'Switch to Te Reo Māori'}
    >
      <Languages size={18} className={isTeReoMode ? 'text-green-600' : 'text-gray-600'} />
      <span className={`text-sm font-medium ${isTeReoMode ? 'text-green-600' : 'text-gray-600'}`}>
        {isTeReoMode ? 'Te Reo' : 'English'}
      </span>
    </button>
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