// Enhanced New Zealand Localization with Te Reo Māori Integration
// Comprehensive NZ-specific data including real suburbs, postcodes, and bilingual elements

// Te Reo Māori Translations and Common Phrases
export const TE_REO_TRANSLATIONS = {
  // Common greetings and phrases used throughout NZ
  greetings: {
    'welcome': 'nau mai', // welcome
    'hello': 'kia ora', // hello/hi
    'goodbye': 'ka kite', // see you later
    'thankyou': 'kia ora', // thank you
    'good_morning': 'ata mārie', // good morning
    'good_evening': 'ahiahi pai', // good evening
  },

  // Website terminology
  interface: {
    'home': 'kāinga', // home
    'search': 'rapu', // search
    'jobs': 'mahi', // work/jobs
    'location': 'tauwāhi', // location/place
    'community': 'hapori', // community
    'marketplace': 'maakete', // marketplace
    'profile': 'kiri tangata', // profile
    'help': 'āwhina', // help
    'contact': 'whakapā', // contact
    'about': 'mō mātou', // about us
    'login': 'takiuru', // login
    'register': 'rēhita', // register
    'apply': 'tono', // apply
    'save': 'tiaki', // save
    'browse': 'kōwhiri', // browse/choose
    'filter': 'tātari', // filter
    'company': 'kamupene', // company
    'salary': 'utu', // payment/salary
    'experience': 'wheako', // experience
    'education': 'mātauranga', // education/knowledge
    'skills': 'pūkenga', // skills
    // Additional marketplace terms
    'buy': 'hoko', // buy
    'sell': 'hoko atu', // sell
    'price': 'utu', // price
    'negotiable': 'whiriwhiri', // negotiable
    'condition': 'āhua', // condition
    'description': 'whakaahuatanga', // description
    'shipping': 'kawe', // shipping
    'delivery': 'tuku', // delivery
    'pickup': 'tiki', // pickup
    'payment': 'utu', // payment
    'secure': 'haumaru', // secure
    'verified': 'whakamana', // verified
    'rating': 'whakatauranga', // rating
    'review': 'arotake', // review
    'favorite': 'pai', // favorite
    'share': 'tiri', // share
    'report': 'pūrongo', // report
    'message': 'karere', // message
    'offer': 'tuku', // offer
    'bid': 'tuku', // bid
    'auction': 'hokohoko', // auction
    'reserve': 'taapiri', // reserve
    'sold': 'hokona', // sold
    'available': 'wātea', // available
    'cart': 'kāta', // cart
    'watchlist': 'mātakitaki', // watchlist
    'categories': 'kāwai', // categories
    // Notification system
    'notifications': 'pānui', // notifications
    'markAllRead': 'tohua katoa kua pānuitia', // mark all read
    'loadingNotifications': 'e uta ana ngā pānui...', // loading notifications
    'noNotifications': 'kāore anō he pānui', // no notifications yet
    'notificationHint': 'ka pānui mātou ki a koe ina tupu tētahi mea', // we'll notify you when something happens
    'viewAllNotifications': 'tirohia ngā pānui katoa', // view all notifications
    'selectConversation': 'tīpakohia he kōrerorero hei tīmata i te karere', // select conversation to start messaging
    'noMessages': 'kāore anō he karere', // no messages yet
    'startConversation': 'tīmatahia te kōrerorero!', // start the conversation
    'typeMessage': 'tuhia tō karere...', // type your message
    'typing': 'e tuhi ana...', // typing
  },

  // Job-related terms
  employment: {
    'full_time': 'roa katoa', // full time
    'part_time': 'wā roa', // part time
    'contract': 'kirimana', // contract
    'casual': 'rēhia', // casual
    'permanent': 'mutunga kore', // permanent
    'temporary': 'roa poto', // temporary
    'internship': 'akoranga mahi', // work learning
    'apprenticeship': 'akoranga hangarau', // skill learning
    'volunteer': 'tuku aroha', // giving love (volunteer)
    'manager': 'kaiwhakahaere', // manager
    'supervisor': 'kaitiaki', // supervisor/guardian
    'team_lead': 'kaiārahi rōpū', // team leader
    'director': 'rangatira', // chief/director
    'administrator': 'kaiwhakahaere', // administrator
    'specialist': 'tohunga', // expert/specialist
    'consultant': 'kaitohutohu', // advisor
    'coordinator': 'kaiwhakakotahi', // coordinator
    'assistant': 'kaiāwhina', // helper
    'analyst': 'kaitātari', // analyst
    'developer': 'kaiwhakawhanake', // developer
    'designer': 'kaihoahoa', // designer
    'engineer': 'mataauranga hangarau', // technical knowledge
    'teacher': 'kaiako', // teacher
    'nurse': 'tapuhi', // nurse
    'doctor': 'rata', // doctor
    'lawyer': 'rōia', // lawyer
    'accountant': 'kaititiro', // accountant
  },

  // Common NZ workplace phrases
  phrases: {
    'new_zealand': 'Aotearoa', // Land of the long white cloud
    'find_your_next_role': 'rapua tō mahi hou', // find your new work
    'career_opportunities': 'rautaki mahi', // work strategies
    'work_life_balance': 'ōritenga mahi-oranga', // work-life balance
    'professional_development': 'whakawhanake ngaiotanga', // professional development
    'team_environment': 'taiao rōpū', // team environment
    'competitive_salary': 'utu whakataetae', // competitive payment
    'great_benefits': 'hua pai', // good benefits
    'flexible_hours': 'hāora kōwhiri', // flexible hours
    'work_from_home': 'mahi i te kāinga', // work from home
    'career_growth': 'tipu mahi', // career growth
    'join_our_team': 'uru mai ki tō mātou rōpū', // join our team
    'apply_now': 'tono ināianei', // apply now
    'view_details': 'titiro i ngā taipitopito', // view details
    'save_job': 'tiaki mahi', // save job
    'featured_jobs': 'mahi rongonui', // featured/famous jobs
    'latest_jobs': 'mahi hou', // new jobs
    'browse_categories': 'kōwhiri rōpū', // browse groups
    'search_jobs': 'rapu mahi', // search work
    'all_locations': 'katoa tauwāhi', // all places
    'salary_range': 'awhe utu', // payment range
    'job_type': 'momo mahi', // type of work
    'experience_level': 'rā wheako', // experience level
    'work_rights': 'mana mahi', // work rights
    'visa_required': 'uruwhenua hiahiatia', // visa required
    'nz_resident': 'tangata whenua Aotearoa', // NZ resident
    'post_a_job': 'whakatō mahi', // post work
    'employer_login': 'takiuru kaimahi', // employer login
    'job_alerts': 'matohi mahi', // job alerts
    'my_applications': 'aku tono', // my applications
    'saved_jobs': 'mahi tiaki', // saved jobs
    'profile_settings': 'whirihoranga kiri tangata', // profile settings
  }
};

// Comprehensive NZ Locations with Real Suburbs and Postcodes
export const NZ_DETAILED_LOCATIONS = {
  'auckland': {
    name: 'Auckland | Tāmaki Makaurau',
    region: 'Auckland Region',
    maoriName: 'Tāmaki Makaurau',
    population: '1,717,500',
    majorCities: ['Auckland City', 'North Shore', 'Waitākere', 'Manukau'],
    suburbs: {
      'central': {
        name: 'Auckland Central',
        postcodes: ['1010', '1011', '1020', '1021', '1023'],
        districts: ['CBD', 'Viaduct', 'Britomart', 'Karangahape Road', 'Newmarket']
      },
      'north_shore': {
        name: 'North Shore',
        postcodes: ['0620', '0622', '0624', '0626', '0627', '0629', '0630', '0632'],
        districts: ['Takapuna', 'Milford', 'Devonport', 'Birkenhead', 'Glenfield', 'Albany']
      },
      'west_auckland': {
        name: 'West Auckland | Waitākere',
        postcodes: ['0610', '0612', '0614', '0616', '0618'],
        districts: ['Henderson', 'Glen Eden', 'New Lynn', 'Titirangi', 'Massey', 'Te Atatū']
      },
      'south_auckland': {
        name: 'South Auckland | Manukau',
        postcodes: ['1701', '1702', '1705', '1706', '1707', '1708'],
        districts: ['Manukau', 'Papakura', 'Ōtāhuhu', 'Papatoetoe', 'Māngere', 'Ōtara']
      },
      'east_auckland': {
        name: 'East Auckland',
        postcodes: ['1071', '1072', '1073', '1081', '1082'],
        districts: ['Pakuranga', 'Botany', 'Howick', 'Bucklands Beach', 'Whitford']
      }
    }
  },
  'wellington': {
    name: 'Wellington | Te Whanganui-a-Tara',
    region: 'Wellington Region',
    maoriName: 'Te Whanganui-a-Tara',
    population: '215,900',
    majorCities: ['Wellington City', 'Lower Hutt', 'Upper Hutt', 'Porirua'],
    suburbs: {
      'central': {
        name: 'Wellington Central',
        postcodes: ['6011', '6012', '6021', '6022'],
        districts: ['Te Aro', 'Lambton Quay', 'Thorndon', 'Mount Victoria', 'Oriental Bay']
      },
      'eastern_suburbs': {
        name: 'Eastern Suburbs',
        postcodes: ['6023', '6024', '6025'],
        districts: ['Miramar', 'Kilbirnie', 'Lyall Bay', 'Hataitai', 'Roseneath']
      },
      'northern_suburbs': {
        name: 'Northern Suburbs',
        postcodes: ['6035', '6037', '6012'],
        districts: ['Karori', 'Khandallah', 'Ngaio', 'Crofton Downs', 'Johnsonville']
      },
      'southern_suburbs': {
        name: 'Southern Suburbs',
        postcodes: ['6023', '6242'],
        districts: ['Island Bay', 'Newtown', 'Berhampore', 'Owhiro Bay']
      },
      'hutt_valley': {
        name: 'Hutt Valley | Te Awakairangi',
        postcodes: ['5010', '5011', '5012', '5013', '5018', '5019'],
        districts: ['Lower Hutt', 'Upper Hutt', 'Petone', 'Eastbourne', 'Wainuiomata']
      }
    }
  },
  'christchurch': {
    name: 'Christchurch | Ōtautahi',
    region: 'Canterbury',
    maoriName: 'Ōtautahi',
    population: '381,500',
    majorCities: ['Christchurch City', 'Banks Peninsula'],
    suburbs: {
      'central': {
        name: 'Christchurch Central',
        postcodes: ['8011', '8013', '8014'],
        districts: ['Cathedral Square', 'Addington', 'Sydenham', 'St Albans']
      },
      'east_christchurch': {
        name: 'East Christchurch',
        postcodes: ['8061', '8062', '8083'],
        districts: ['New Brighton', 'Linwood', 'Aranui', 'Wainoni', 'Avondale']
      },
      'west_christchurch': {
        name: 'West Christchurch',
        postcodes: ['8041', '8042', '8051', '8052'],
        districts: ['Riccarton', 'Ilam', 'Fendalton', 'Merivale', 'Papanui']
      },
      'south_christchurch': {
        name: 'South Christchurch',
        postcodes: ['8023', '8024', '8025'],
        districts: ['Cashmere', 'Hillmorton', 'Spreydon', 'Beckenham', 'Woolston']
      },
      'north_christchurch': {
        name: 'North Christchurch',
        postcodes: ['8052', '8053', '8081'],
        districts: ['Papanui', 'Redwood', 'Northcote', 'Casebrook', 'Belfast']
      }
    }
  },
  'hamilton': {
    name: 'Hamilton | Kirikiriroa',
    region: 'Waikato',
    maoriName: 'Kirikiriroa',
    population: '179,800',
    majorCities: ['Hamilton City'],
    suburbs: {
      'central': {
        name: 'Hamilton Central',
        postcodes: ['3204', '3206', '3210'],
        districts: ['Hamilton Central', 'Hamilton East', 'Hamilton West', 'Claudelands']
      },
      'north_hamilton': {
        name: 'North Hamilton',
        postcodes: ['3200', '3201', '3202'],
        districts: ['The Base', 'Chartwell', 'Rototuna', 'Flagstaff', 'Glenview']
      },
      'south_hamilton': {
        name: 'South Hamilton',
        postcodes: ['3214', '3216', '3218'],
        districts: ['Hillcrest', 'Dinsdale', 'Nawton', 'Frankton', 'Te Rapa']
      }
    }
  },
  'tauranga': {
    name: 'Tauranga',
    region: 'Bay of Plenty',
    maoriName: 'Tauranga',
    population: '151,300',
    majorCities: ['Tauranga City', 'Mount Maunganui'],
    suburbs: {
      'tauranga_central': {
        name: 'Tauranga Central',
        postcodes: ['3110', '3112', '3116'],
        districts: ['Tauranga CBD', 'Greerton', 'Gate Pā', 'Judea', 'Brookfield']
      },
      'mount_maunganui': {
        name: 'Mount Maunganui | Mauao',
        postcodes: ['3116', '3118'],
        districts: ['Mount Maunganui', 'Pilot Bay', 'Omanu', 'Arataki']
      },
      'papamoa': {
        name: 'Papamoa',
        postcodes: ['3118', '3119'],
        districts: ['Papamoa Beach', 'Papamoa East', 'Golden Sands']
      }
    }
  },
  'dunedin': {
    name: 'Dunedin | Ōtepoti',
    region: 'Otago',
    maoriName: 'Ōtepoti',
    population: '131,200',
    majorCities: ['Dunedin City'],
    suburbs: {
      'central': {
        name: 'Dunedin Central',
        postcodes: ['9016', '9018'],
        districts: ['Dunedin Central', 'North Dunedin', 'South Dunedin', 'West Harbour']
      },
      'north_dunedin': {
        name: 'North Dunedin',
        postcodes: ['9010', '9012', '9014'],
        districts: ['North East Valley', 'Normanby', 'Pine Hill', 'Ravensbourne']
      },
      'peninsula': {
        name: 'Otago Peninsula',
        postcodes: ['9077', '9081', '9082'],
        districts: ['Portobello', 'Macandrew Bay', 'Company Bay', 'Taiaroa Head']
      }
    }
  },
  'palmerston_north': {
    name: 'Palmerston North | Te Papa-i-Oea',
    region: 'Manawatū-Whanganui',
    maoriName: 'Te Papa-i-Oea',
    population: '91,100',
    majorCities: ['Palmerston North City'],
    suburbs: {
      'central': {
        name: 'Palmerston North Central',
        postcodes: ['4410', '4412', '4414'],
        districts: ['Central City', 'Roslyn', 'Takaro', 'Milson', 'Hokowhitu']
      },
      'massey': {
        name: 'Massey',
        postcodes: ['4442'],
        districts: ['Massey University', 'Turitea', 'Aokautere']
      }
    }
  },
  'napier': {
    name: 'Napier',
    region: 'Hawke\'s Bay',
    maoriName: 'Ahuriri',
    population: '66,900',
    majorCities: ['Napier City'],
    suburbs: {
      'napier_central': {
        name: 'Napier Central',
        postcodes: ['4110', '4112'],
        districts: ['Napier Central', 'Ahuriri', 'Westshore', 'Bluff Hill', 'Marewa']
      },
      'napier_south': {
        name: 'Napier South',
        postcodes: ['4112', '4114'],
        districts: ['Tamatea', 'Onekawa', 'Maraenui', 'Pirimai']
      }
    }
  },
  'nelson': {
    name: 'Nelson | Whakatū',
    region: 'Nelson',
    maoriName: 'Whakatū',
    population: '52,200',
    majorCities: ['Nelson City'],
    suburbs: {
      'nelson_central': {
        name: 'Nelson Central',
        postcodes: ['7010', '7011'],
        districts: ['Nelson Central', 'The Wood', 'Tahunanui', 'Stoke', 'Richmond']
      }
    }
  },
  'rotorua': {
    name: 'Rotorua',
    region: 'Bay of Plenty',
    maoriName: 'Rotorua',
    population: '58,800',
    majorCities: ['Rotorua City'],
    suburbs: {
      'rotorua_central': {
        name: 'Rotorua Central',
        postcodes: ['3010', '3015'],
        districts: ['Rotorua Central', 'Lynmore', 'Hillcrest', 'Ngongotaha', 'Koutu']
      }
    }
  },
  'whangarei': {
    name: 'Whangārei',
    region: 'Northland',
    maoriName: 'Whangārei',
    population: '56,800',
    majorCities: ['Whangārei City'],
    suburbs: {
      'whangarei_central': {
        name: 'Whangārei Central',
        postcodes: ['0110', '0112'],
        districts: ['Whangārei Central', 'Regent', 'Kamo', 'Onerahi', 'Raumanga']
      }
    }
  },
  'new_plymouth': {
    name: 'New Plymouth | Ngāmotu',
    region: 'Taranaki',
    maoriName: 'Ngāmotu',
    population: '59,400',
    majorCities: ['New Plymouth City'],
    suburbs: {
      'new_plymouth_central': {
        name: 'New Plymouth Central',
        postcodes: ['4310', '4312'],
        districts: ['New Plymouth Central', 'Fitzroy', 'Vogeltown', 'Brooklands', 'Bell Block']
      }
    }
  },
  'invercargill': {
    name: 'Invercargill | Waihōpai',
    region: 'Southland',
    maoriName: 'Waihōpai',
    population: '51,200',
    majorCities: ['Invercargill City'],
    suburbs: {
      'invercargill_central': {
        name: 'Invercargill Central',
        postcodes: ['9810', '9812'],
        districts: ['Invercargill Central', 'Windsor', 'Appleby', 'Rosedale', 'Gladstone']
      }
    }
  },
  'queenstown': {
    name: 'Queenstown | Tāhuna',
    region: 'Otago',
    maoriName: 'Tāhuna',
    population: '28,200',
    majorCities: ['Queenstown'],
    suburbs: {
      'queenstown_central': {
        name: 'Queenstown Central',
        postcodes: ['9300', '9302'],
        districts: ['Queenstown Central', 'Fernhill', 'Arthurs Point', 'Frankton', 'Arrowtown']
      }
    }
  }
};

// Industry-specific Te Reo terms
export const INDUSTRY_TE_REO = {
  'technology': 'hangarau',
  'healthcare': 'hauora',
  'education': 'mātauranga',
  'construction': 'hanga whare',
  'finance': 'pūtea',
  'hospitality': 'manaakitanga',
  'retail': 'hokohoko',
  'manufacturing': 'whakatōhanga',
  'government': 'kāwanatanga',
  'agriculture': 'ahuwhenua',
  'tourism': 'tāpoi',
  'transport': 'kawenga',
  'engineering': 'mataauranga hangarau',
  'consulting': 'tohutohu',
  'marketing': 'whakatairanga',
  'sales': 'hokohoko',
  'administration': 'whakahaere',
  'legal': 'ture'
};

// Common NZ workplace benefits in Te Reo
export const BENEFITS_TE_REO = {
  'health_insurance': 'rōia hauora',
  'dental_care': 'tiaki niho',
  'kiwisaver': 'KiwiSaver',
  'annual_leave': 'rā whakatā ā-tau',
  'sick_leave': 'rā whakatā māuiui',
  'maternity_leave': 'rā whakatā whānau',
  'bereavement_leave': 'rā whakatā mate',
  'study_leave': 'rā whakatā ako',
  'flexible_hours': 'hāora kōwhiri',
  'work_from_home': 'mahi i te kāinga',
  'professional_development': 'whakawhanake ngaiotanga',
  'training': 'whakangungu',
  'gym_membership': 'mema whare hauora',
  'car_parking': 'tauwāhi motokā',
  'public_transport': 'kawenga tūmatanui',
  'laptop_phone': 'rorohiko waea rānei',
  'team_events': 'hui rōpū',
  'bonus': 'utu tāpiri'
};

// Te Reo job titles
export const JOB_TITLES_TE_REO = {
  'manager': 'kaiwhakahaere',
  'senior_manager': 'kaiwhakahaere matua',
  'team_leader': 'kaiārahi rōpū',
  'supervisor': 'kaitiaki',
  'coordinator': 'kaiwhakakotahi',
  'administrator': 'kaiwhakahaere',
  'assistant': 'kaiāwhina',
  'specialist': 'tohunga',
  'consultant': 'kaitohutohu',
  'analyst': 'kaitātari',
  'developer': 'kaiwhakawhanake',
  'designer': 'kaihoahoa',
  'engineer': 'iniana',
  'technician': 'kaimahi hangarau',
  'operator': 'kaiwhakamahi',
  'representative': 'kaimana',
  'advisor': 'kaitohutohu',
  'officer': 'ōhipa',
  'executive': 'rangatira',
  'director': 'kaiarataki',
  'teacher': 'kaiako',
  'nurse': 'tapuhi',
  'doctor': 'rata',
  'lawyer': 'rōia',
  'accountant': 'kaititiro',
  'receptionist': 'kaipowhiri',
  'secretary': 'hēkeretari',
  'clerk': 'kairēhita',
  'cashier': 'kaipūtea',
  'driver': 'kaitaraiwa',
  'chef': 'kuki',
  'waiter': 'kaiwhakangahau',
  'cleaner': 'kaihoroi',
  'security': 'kaitiaki haumarutanga',
  'sales_person': 'kaihoko',
  'mechanic': 'kaimīhini',
  'electrician': 'kaiemi',
  'plumber': 'kaiwhakangao',
  'carpenter': 'kamupene',
  'painter': 'kaiwhiri',
  'gardener': 'kaimahi māra'
};

// NZ workplace culture terms
export const WORKPLACE_CULTURE_TE_REO = {
  'team_work': 'mahi rōpū',
  'collaboration': 'mahi ngātahi',
  'leadership': 'rangatiratanga',
  'innovation': 'auaha',
  'excellence': 'hiranga',
  'integrity': 'ngākaunui',
  'respect': 'whakatapu',
  'diversity': 'kanorau',
  'inclusion': 'whakaurunga',
  'sustainability': 'toiora roa',
  'growth': 'tipu',
  'development': 'whakawhanake',
  'opportunity': 'rautaki',
  'challenge': 'wero',
  'achievement': 'whakatutukitanga',
  'success': 'angitu',
  'career': 'taiao mahi',
  'future': 'taima',
  'potential': 'kōmau',
  'skills': 'pūkenga',
  'knowledge': 'mōhio',
  'experience': 'wheako',
  'qualification': 'tohu',
  'certification': 'whakamana'
};

// Helper function to get bilingual text
export const getBilingualText = (englishText, teReoKey) => {
  const teReoText = TE_REO_TRANSLATIONS.phrases[teReoKey] ||
    TE_REO_TRANSLATIONS.interface[teReoKey] ||
    TE_REO_TRANSLATIONS.employment[teReoKey];

  if (teReoText) {
    return `${englishText} | ${teReoText}`;
  }
  return englishText;
};

// Helper function to get suburb data by postcode
export const getSuburbByPostcode = (postcode) => {
  for (const [cityKey, cityData] of Object.entries(NZ_DETAILED_LOCATIONS)) {
    for (const [suburbKey, suburbData] of Object.entries(cityData.suburbs)) {
      if (suburbData.postcodes.includes(postcode)) {
        return {
          city: cityData.name,
          suburb: suburbData.name,
          region: cityData.region,
          districts: suburbData.districts
        };
      }
    }
  }
  return null;
};

// Helper function to format address in NZ style
export const formatNZAddress = (streetNumber, streetName, suburb, city, postcode) => {
  return `${streetNumber} ${streetName}, ${suburb}, ${city} ${postcode}, New Zealand`;
};

// Get all postcodes for a city
export const getPostcodesForCity = (cityKey) => {
  const city = NZ_DETAILED_LOCATIONS[cityKey];
  if (!city) return [];

  const postcodes = [];
  Object.values(city.suburbs).forEach(suburb => {
    postcodes.push(...suburb.postcodes);
  });

  return [...new Set(postcodes)].sort();
};

// Get random NZ address
export const generateRandomNZAddress = () => {
  const cities = Object.keys(NZ_DETAILED_LOCATIONS);
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const cityData = NZ_DETAILED_LOCATIONS[randomCity];

  const suburbs = Object.values(cityData.suburbs);
  const randomSuburb = suburbs[Math.floor(Math.random() * suburbs.length)];

  const streetNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '15', '18', '20', '22', '25', '28', '30', '35', '40', '45', '50'];
  const streetNames = [
    'Queen Street', 'King Street', 'Main Road', 'High Street', 'Church Street',
    'School Road', 'Park Avenue', 'Hill Road', 'Beach Road', 'Forest Drive',
    'Lake View', 'Mountain View', 'Valley Road', 'River Street', 'Garden Place',
    'Victoria Street', 'Albert Street', 'George Street', 'Elizabeth Street', 'William Street',
    'James Street', 'Mary Street', 'John Street', 'David Street', 'Robert Street',
    'Michael Street', 'Sarah Street', 'Emma Street', 'Emily Street', 'Jessica Street'
  ];

  const streetNumber = streetNumbers[Math.floor(Math.random() * streetNumbers.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const postcode = randomSuburb.postcodes[Math.floor(Math.random() * randomSuburb.postcodes.length)];

  return {
    streetNumber,
    streetName,
    suburb: randomSuburb.name,
    city: cityData.name,
    postcode,
    region: cityData.region,
    fullAddress: formatNZAddress(streetNumber, streetName, randomSuburb.name, cityData.name, postcode)
  };
};

// Export the enhanced NZ localization object
const nzLocalizationEnhanced = {
  TE_REO_TRANSLATIONS,
  NZ_DETAILED_LOCATIONS,
  getBilingualText,
  getSuburbByPostcode,
  formatNZAddress,
  getPostcodesForCity,
  generateRandomNZAddress
};

export default nzLocalizationEnhanced;