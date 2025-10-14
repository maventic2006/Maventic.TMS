import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchText, onSearchChange }) => {
  return (
    <div className="relative mb-6 group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search transporters..."
          className="w-full pl-12 pr-6 py-4 border-0 rounded-xl bg-white/80 backdrop-blur-lg shadow-lg hover:shadow-xl focus:shadow-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 group-hover:scale-[1.02]"
        />
      </div>
    </div>
  );
};

export default SearchBar;