import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Link2, 
  Check, 
  MessageCircle,
  Users,
  Bell,
  Repeat,
  AlertCircle
} from 'lucide-react';

const MeetingSchedulerPreview = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('zoom');
  
  const platforms = [
    { id: 'zoom', name: 'Zoom', icon: '🖥️', description: 'Best for large meetings' },
    { id: 'teams', name: 'Microsoft Teams', icon: '👥', description: 'Integrated with Office 365' },
    { id: 'meet', name: 'Google Meet', icon: '🎥', description: 'Simple Google integration' }
  ];

  return (
    <div className="flex justify-center items-center w-full bg-gray-100 p-6 rounded-xl">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Schedule Your Meeting</h1>
          <p className="text-gray-500">Create and manage your meetings seamlessly</p>
          <div className="mt-2 mx-auto w-16 h-1 bg-indigo-500 rounded"></div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MessageCircle size={16} />
            Meeting Title
          </label>
          <input 
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
            placeholder="Team Weekly Sync"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} />
              Date
            </label>
            <input 
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              value="2025-04-12"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} />
              Time
            </label>
            <input 
              type="time"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              value="10:00"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock size={16} />
              Duration
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 appearance-none bg-no-repeat bg-right pr-10">
              <option>30 minutes</option>
              <option selected>1 hour</option>
              <option>1.5 hours</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Video size={16} />
            Choose Meeting Platform
          </label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {platforms.map(platform => (
              <div
                key={platform.id}
                className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedPlatform === platform.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPlatform(platform.id)}
              >
                <div className="text-2xl mb-2">{platform.icon}</div>
                <div className="text-center">
                  <div className="font-semibold text-sm text-gray-800">{platform.name}</div>
                  <div className="text-xs text-gray-500">{platform.description}</div>
                </div>
                {selectedPlatform === platform.id && (
                  <div className="absolute top-0 right-0 bg-blue-500 w-6 h-6 flex items-center justify-center rounded-full text-white -mt-2 -mr-2">
                    <Check size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="h-px bg-gray-200 my-6"></div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Repeat size={16} />
              Frequency
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
              <option>One-time Meeting</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Bell size={16} />
              Reminder
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
              <option>15 minutes before</option>
              <option>30 minutes before</option>
              <option>1 hour before</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users size={16} />
              Participants
            </label>
            <input 
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="Email addresses"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Link2 size={16} />
            Description (Optional)
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-24"
            placeholder="Add agenda, notes, or any additional information"
          ></textarea>
        </div>
        
        <button 
          className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-700 transition shadow-md"
        >
          Create Meeting
          <Check size={18} />
        </button>
      </div>
    </div>
  );
};

export default MeetingSchedulerPreview;