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
  phone?: string;
  website?: string;
  category: string;
}

export default function ResourcesPage() {
    const [searchTerm, setSearchTerm] = useState('');

  // Sample UGA campus resources - can be replaced with API call
  const resources: CampusResource[] = [
    {
      id: '1',
      name: 'Tate Student Center',
      description: 'Multipurpose student center with dining, meeting spaces, and recreational facilities.',
      emoji: '🏛️',
      color: 'bg-red-700',
      location: 'Downtown Campus',
      phone: '(706) 542-9000',
      website: 'https://tate.uga.edu',
      category: 'Facilities',
    },
    {
      id: '2',
      name: 'Ramsey Student Center',
      description: 'Fitness center with pool, courts, weight rooms, and group fitness classes.',
      emoji: '🏋️',
      color: 'bg-orange-600',
      location: 'Smith Street',
      phone: '(706) 542-5060',
      website: 'https://recsports.uga.edu',
      category: 'Facilities',
    },
    {
      id: '3',
      name: 'University Health Center',
      description: 'Comprehensive healthcare services including medical, pharmacy, and lab.',
      emoji: '🏥',
      color: 'bg-blue-600',
      location: 'River Road',
      phone: '(706) 542-1441',
      website: 'https://www.uhs.uga.edu',
      category: 'Health',
    },
    {
      id: '4',
      name: 'Zell B. Miller Learning Center',
      description: '24-hour study facility with group rooms, auditoriums, and Jittery Joe\'s coffee.',
      emoji: '📚',
      color: 'bg-amber-600',
      location: 'South Campus',
      phone: '(706) 542-8105',
      website: 'https://mlc.uga.edu',
      category: 'Academic',
    },
    {
      id: '5',
      name: 'Counseling & Psych Services (CAPS)',
      description: 'Free counseling, crisis support, and mental health resources for students.',
      emoji: '🧠',
      color: 'bg-purple-600',
      location: 'Health Center, 3rd Floor',
      phone: '(706) 542-2273',
      website: 'https://www.caps.uga.edu',
      category: 'Health',
    },
    {
      id: '6',
      name: 'UGA Police Department',
      description: 'Campus police, UGASafe app, LiveSafe escorts, and 24/7 emergency response.',
      emoji: '🚔',
      color: 'bg-slate-700',
      location: 'Riverbend Road',
      phone: '(706) 542-2200',
      website: 'https://police.uga.edu',
      category: 'Safety',
    },
    {
      id: '7',
      name: 'Career Center',
      description: 'Career coaching, internship search, resume reviews, mock interviews, and job fairs.',
      emoji: '💼',
      color: 'bg-emerald-600',
      location: 'Clark Howell Hall',
      phone: '(706) 542-3375',
      website: 'https://career.uga.edu',
      category: 'Career',
    },
    {
      id: '8',
      name: 'International Student Life',
      description: 'Visa advising, cultural events, and support for international Bulldogs.',
      emoji: '🌍',
      color: 'bg-teal-600',
      location: 'Memorial Hall',
      phone: '(706) 542-6820',
      website: 'https://isl.uga.edu',
      category: 'Student Services',
    },
    {
      id: '9',
      name: 'Writing Center',
      description: 'Free peer tutoring for essays, research papers, and any writing project.',
      emoji: '✍️',
      color: 'bg-indigo-600',
      location: 'Park Hall',
      phone: '(706) 542-0386',
      website: 'https://writingcenter.uga.edu',
      category: 'Academic',
    },
    {
      id: '10',
      name: 'Division of Academic Enhancement',
      description: 'Tutoring for math, science, and study skills plus Supplemental Instruction.',
      emoji: '🎓',
      color: 'bg-cyan-600',
      location: 'Milledge Hall',
      phone: '(706) 542-7575',
      website: 'https://dae.uga.edu',
      category: 'Academic',
    },
    {
      id: '11',
      name: 'Main Library',
      description: 'Research databases, study rooms, interlibrary loans, and Special Collections.',
      emoji: '📖',
      color: 'bg-yellow-600',
      location: 'North Campus',
      phone: '(706) 542-3251',
      website: 'https://www.libs.uga.edu',
      category: 'Academic',
    },
    {
      id: '12',
      name: 'Disability Resource Center',
      description: 'Accommodations, assistive technology, and academic support for students with disabilities.',
      emoji: '♿',
      color: 'bg-sky-600',
      location: 'Clark Howell Hall',
      phone: '(706) 542-8719',
      website: 'https://drc.uga.edu',
      category: 'Student Services',
    },
    {
      id: '13',
      name: 'Office of Student Conduct',
      description: 'Student rights, academic honesty policies, and conflict resolution.',
      emoji: '⚖️',
      color: 'bg-rose-600',
      location: 'Tate Center',
      phone: '(706) 542-1131',
      website: 'https://conduct.uga.edu',
      category: 'Student Services',
    },
    {
      id: '14',
      name: 'UGA Dining Services',
      description: 'Five dining halls, meal plan info, allergen menus, and Bulldog Bucks.',
      emoji: '🍽️',
      color: 'bg-red-600',
      location: 'Multiple Locations',
      phone: '(706) 542-9663',
      website: 'https://dining.uga.edu',
      category: 'Facilities',
    },
  ];

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        resource.name.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.category.toLowerCase().includes(searchLower) ||
        resource.location.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, resources]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navigation />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">UGA Campus Resources</h1>
            <p className="text-lg text-gray-800">
              Explore the services and facilities available to support your college experience
            </p>
          </div>

                  {/* Search Bar */}
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-600" />
                    <input
                      type="text"
                      placeholder="Search resources by name, category, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-700 transition-colors text-gray-900 placeholder:text-gray-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-3 text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Results count */}
                  <p className="text-sm text-gray-800 mt-3">
                    {filteredResources.length} of {resources.length} resources
                  </p>
        </div>

        {/* Resources Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Category Header */}
                <div className={`${resource.color} h-32 flex items-center justify-center`}>
                  <span className="text-5xl">{resource.emoji}</span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{resource.name}</h3>
                    <span className="text-xs font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                      {resource.category}
                    </span>
                  </div>

                  <p className="text-gray-800 text-sm mb-4">{resource.description}</p>

                  {/* Details */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    {resource.location && (
                      <div className="flex items-start space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{resource.location}</span>
                      </div>
                    )}

                    {resource.phone && (
                      <div className="flex items-start space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                        <a href={`tel:${resource.phone}`} className="text-red-700 hover:underline">
                          {resource.phone}
                        </a>
                      </div>
                    )}

                    {resource.website && (
                      <div className="flex items-start space-x-2 text-sm">
                        <Globe className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                        <a
                          href={resource.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-700 hover:underline truncate"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-800 mb-4">No resources found matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-red-700 hover:text-red-800 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
