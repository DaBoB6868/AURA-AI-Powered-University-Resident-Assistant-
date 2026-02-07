'use client';
import { Navigation } from '@/components/Navigation';
import { MapPin, Phone, Globe, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';

interface CampusResource {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  location: string;
  nearestDorm: string;
  phone?: string;
  website?: string;
  category: string;
}

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const resources: CampusResource[] = [
    // ── Facilities ──
    { id: '1', name: 'Tate Student Center', description: 'Multipurpose student center with dining, meeting spaces, bookstore, and student org offices.', emoji: '🏛️', color: 'bg-red-700', location: '45 Baxter St', nearestDorm: 'Near Myers & Soule Halls', phone: '(706) 542-9000', website: 'https://tate.uga.edu', category: 'Facilities' },
    { id: '2', name: 'Ramsey Student Center', description: 'Fitness center with pool, courts, weight rooms, rock wall, and group fitness classes.', emoji: '🏋️', color: 'bg-orange-600', location: '330 River Rd', nearestDorm: 'Near Creswell & Russell Halls', phone: '(706) 542-5060', website: 'https://recsports.uga.edu', category: 'Facilities' },
    { id: '3', name: 'UGA Housing Office', description: 'Room assignments, maintenance requests, roommate conflicts, and housing contracts.', emoji: '🏠', color: 'bg-red-600', location: 'Reed Hall', nearestDorm: 'Near Reed & Payne Halls', phone: '(706) 542-1421', website: 'https://housing.uga.edu', category: 'Facilities' },
    { id: '4', name: 'UGA Bookstore', description: 'Textbooks, school supplies, and UGA merchandise inside Tate Student Center.', emoji: '📕', color: 'bg-red-800', location: 'Tate Student Center', nearestDorm: 'Near Myers & Soule Halls', phone: '(706) 542-3151', website: 'https://www.bkstr.com/georgiastore', category: 'Facilities' },
    { id: '5', name: 'UGA Laundry (Free)', description: 'Free washers & dryers in every residence hall. Track availability via the CSC ServiceWorks app.', emoji: '🧺', color: 'bg-sky-600', location: 'All Residence Halls', nearestDorm: 'In your building', phone: '', website: 'https://housing.uga.edu/amenities/laundry', category: 'Facilities' },

    // ── Health ──
    { id: '6', name: 'University Health Center', description: 'Medical care, pharmacy, lab, allergy clinic, and women\'s health services for students.', emoji: '🏥', color: 'bg-blue-600', location: '55 Carlton St', nearestDorm: 'Near East Campus Village', phone: '(706) 542-1441', website: 'https://www.uhs.uga.edu', category: 'Health' },
    { id: '7', name: 'CAPS (Counseling)', description: 'Free individual counseling, crisis support, group therapy, and mental health workshops.', emoji: '🧠', color: 'bg-purple-600', location: 'Health Center, 3rd Floor', nearestDorm: 'Near East Campus Village', phone: '(706) 542-2273', website: 'https://www.caps.uga.edu', category: 'Health' },
    { id: '8', name: 'UGA Pharmacy', description: 'Full-service pharmacy inside the Health Center. Accepts most insurance plans.', emoji: '💊', color: 'bg-blue-500', location: 'Health Center', nearestDorm: 'Near East Campus Village', phone: '(706) 542-1558', website: 'https://www.uhs.uga.edu/pharmacy', category: 'Health' },
    { id: '9', name: 'Fontaine Center (Wellness)', description: 'Wellness coaching, alcohol & drug education, peer health programs, and BeWellUGA.', emoji: '🌿', color: 'bg-green-600', location: 'Near Health Center', nearestDorm: 'Near East Campus Village', phone: '(706) 542-8690', website: 'https://www.uhs.uga.edu/bewelluga', category: 'Health' },

    // ── Safety ──
    { id: '10', name: 'UGA Police Department', description: 'Campus police, UGASafe app, LiveSafe walking escorts, and 24/7 emergency response.', emoji: '🚔', color: 'bg-slate-700', location: '1120 Riverbend Pkwy', nearestDorm: 'East of East Campus Village', phone: '(706) 542-2200', website: 'https://police.uga.edu', category: 'Safety' },

    // ── Academic ──
    { id: '11', name: 'Zell B. Miller Learning Center', description: '24-hour study facility with group rooms, auditoriums, and Jittery Joe\'s coffee.', emoji: '📚', color: 'bg-amber-600', location: '289 S Jackson St', nearestDorm: 'Near Creswell & Russell Halls', phone: '(706) 542-8105', website: 'https://mlc.uga.edu', category: 'Academic' },
    { id: '12', name: 'Main Library', description: 'Research databases, study rooms, interlibrary loans, and Special Collections.', emoji: '📖', color: 'bg-yellow-600', location: 'North Campus', nearestDorm: 'Near Hill Community', phone: '(706) 542-3251', website: 'https://www.libs.uga.edu', category: 'Academic' },
    { id: '13', name: 'Writing Center', description: 'Free peer tutoring for essays, research papers, and any writing project.', emoji: '✍️', color: 'bg-indigo-600', location: 'Park Hall', nearestDorm: 'Near Hill Community', phone: '(706) 542-0386', website: 'https://writingcenter.uga.edu', category: 'Academic' },
    { id: '14', name: 'Division of Academic Enhancement', description: 'Tutoring for math, science, and study skills plus Supplemental Instruction.', emoji: '🎓', color: 'bg-cyan-600', location: 'Milledge Hall', nearestDorm: 'Near Hill Community & Brumby', phone: '(706) 542-7575', website: 'https://dae.uga.edu', category: 'Academic' },
    { id: '15', name: 'EITS Help Desk (Tech Support)', description: 'Wi-Fi, UGA email, eLC/eLCE support, and campus tech troubleshooting. Walk-in & remote.', emoji: '💻', color: 'bg-gray-600', location: 'MLC & Tate Center', nearestDorm: 'Near Creswell & Myers Halls', phone: '(706) 542-3106', website: 'https://eits.uga.edu/help_desk', category: 'Academic' },

    // ── Career ──
    { id: '16', name: 'Career Center', description: 'Career coaching, internship search, resume reviews, mock interviews, and job fairs.', emoji: '💼', color: 'bg-emerald-600', location: 'Clark Howell Hall', nearestDorm: 'Near Hill Community', phone: '(706) 542-3375', website: 'https://career.uga.edu', category: 'Career' },

    // ── Student Services ──
    { id: '17', name: 'International Student Life', description: 'Visa advising, cultural events, and support for international Bulldogs.', emoji: '🌍', color: 'bg-teal-600', location: 'Memorial Hall', nearestDorm: 'Near Hill Community', phone: '(706) 542-6820', website: 'https://isl.uga.edu', category: 'Student Services' },
    { id: '18', name: 'Disability Resource Center', description: 'Accommodations, assistive technology, and academic support for students with disabilities.', emoji: '♿', color: 'bg-sky-700', location: 'Clark Howell Hall', nearestDorm: 'Near Hill Community', phone: '(706) 542-8719', website: 'https://drc.uga.edu', category: 'Student Services' },
    { id: '19', name: 'Office of Student Conduct', description: 'Student rights, academic honesty policies, and conflict resolution.', emoji: '⚖️', color: 'bg-rose-600', location: 'Tate Student Center', nearestDorm: 'Near Myers & Soule Halls', phone: '(706) 542-1131', website: 'https://conduct.uga.edu', category: 'Student Services' },
    { id: '20', name: 'Dean of Students Office', description: 'Assists with personal, academic, and crisis situations. Coordinates support resources.', emoji: '🤝', color: 'bg-violet-600', location: 'Tate Student Center', nearestDorm: 'Near Myers & Soule Halls', phone: '(706) 542-7774', website: 'https://dos.uga.edu', category: 'Student Services' },
    { id: '21', name: 'Student Financial Aid Office', description: 'Scholarships, grants, loans, and work-study information and application support.', emoji: '💰', color: 'bg-green-700', location: 'Holmes/Hunter Academic Bldg', nearestDorm: 'Near Hill Community', phone: '(706) 542-6147', website: 'https://osfa.uga.edu', category: 'Student Services' },
    { id: '22', name: 'Multicultural Services & Programs', description: 'Cultural programming, identity-based support, and diversity education for all students.', emoji: '🎭', color: 'bg-fuchsia-600', location: 'Memorial Hall', nearestDorm: 'Near Hill Community', phone: '(706) 542-5773', website: 'https://msp.uga.edu', category: 'Student Services' },
    { id: '23', name: 'LGBTQ+ Resource Center', description: 'Support, advocacy, safe space training, and community for LGBTQ+ students.', emoji: '🏳️‍🌈', color: 'bg-pink-600', location: 'Memorial Hall', nearestDorm: 'Near Hill Community', phone: '(706) 542-4077', website: 'https://lgbtq.uga.edu', category: 'Student Services' },

    // ── Dining ──
    { id: '24', name: 'Bolton Dining Hall', description: 'All-you-care-to-eat dining with rotating menus, allergen stations, and late-night hours.', emoji: '🍽️', color: 'bg-red-600', location: 'East of Sanford Stadium', nearestDorm: 'Near Creswell, Russell & Brown Halls', phone: '(706) 542-9663', website: 'https://dining.uga.edu', category: 'Dining' },
    { id: '25', name: 'Snelling Dining Hall', description: 'Dining commons with diverse food stations, salad bar, and dessert bar.', emoji: '🥗', color: 'bg-orange-500', location: 'Near Snelling Dr', nearestDorm: 'Near Brumby, Reed & Payne Halls', phone: '(706) 542-9663', website: 'https://dining.uga.edu', category: 'Dining' },
    { id: '26', name: 'Oglethorpe Dining Hall', description: 'Compact dining commons near south-central campus.', emoji: '🍲', color: 'bg-amber-500', location: 'Near Oglethorpe House', nearestDorm: 'Near Oglethorpe House & Reed Hall', phone: '(706) 542-9663', website: 'https://dining.uga.edu', category: 'Dining' },
    { id: '27', name: 'Village Summit Dining', description: 'Dining hall serving the south campus residential area.', emoji: '🥘', color: 'bg-lime-600', location: 'Rogers Rd area', nearestDorm: 'Near University Village & Rogers Rd', phone: '(706) 542-9663', website: 'https://dining.uga.edu', category: 'Dining' },
    { id: '28', name: 'Niche (ECV Dining)', description: 'Modern dining venue in the East Campus Village complex.', emoji: '☕', color: 'bg-stone-600', location: 'East Campus Village', nearestDorm: 'Near Vandiver, Rooker & McWhorter', phone: '(706) 542-9663', website: 'https://dining.uga.edu', category: 'Dining' },

    // ── Transportation ──
    { id: '29', name: 'UGA Transit (Campus Bus)', description: 'Free bus routes connecting all campus areas, dorms, and downtown. Real-time tracking via app.', emoji: '🚌', color: 'bg-teal-700', location: 'Stops at all residence halls', nearestDorm: 'Stops near every dorm', phone: '(706) 369-5401', website: 'https://transportation.uga.edu/transit', category: 'Transportation' },

    // ── Recreation ──
    { id: '30', name: 'Intramural & Club Sports', description: 'Intramural leagues, club sports, outdoor recreation, and adventure trips through Rec Sports.', emoji: '⚽', color: 'bg-emerald-700', location: 'Ramsey Center / IM Fields', nearestDorm: 'Near Brumby & Creswell Halls', phone: '(706) 542-5060', website: 'https://recsports.uga.edu', category: 'Facilities' },
  ];

  const filteredResources = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return resources.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.nearestDorm.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navigation />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">UGA Campus Resources</h1>
            <p className="text-lg text-gray-800">
              Explore services and facilities available to support your college experience at UGA
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-7xl mx-auto relative mt-4">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search by name, category, location, or dorm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-700 transition-colors text-gray-900 placeholder:text-gray-500"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <p className="max-w-7xl mx-auto text-sm text-gray-700 mt-3">
            {filteredResources.length} of {resources.length} resources
          </p>
        </div>

        {/* Resources Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Category Header */}
                  <div className={`${resource.color} h-28 flex items-center justify-center`}>
                    <span className="text-5xl">{resource.emoji}</span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-base font-bold text-gray-900 leading-tight">{resource.name}</h3>
                      <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full whitespace-nowrap ml-2 mt-0.5">
                        {resource.category}
                      </span>
                    </div>

                    <p className="text-gray-800 text-sm mb-3">{resource.description}</p>

                    {/* Details */}
                    <div className="space-y-2 border-t border-gray-200 pt-3">
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-gray-700">{resource.location}</span>
                          <span className="block text-xs text-gray-500">{resource.nearestDorm}</span>
                        </div>
                      </div>

                      {resource.phone && (
                        <div className="flex items-start space-x-2 text-sm">
                          <Phone className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                          <a href={`tel:${resource.phone}`} className="text-red-700 hover:underline">{resource.phone}</a>
                        </div>
                      )}

                      {resource.website && (
                        <div className="flex items-start space-x-2 text-sm">
                          <Globe className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                          <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline truncate">Visit Website</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-800 mb-4">No resources found matching &ldquo;{searchTerm}&rdquo;</p>
              <button onClick={() => setSearchTerm('')} className="text-red-700 hover:text-red-800 font-medium">Clear search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
