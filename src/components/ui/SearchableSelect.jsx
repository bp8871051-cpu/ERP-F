import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  searchable = true,
  disabled = false,
  className = '',
  menuClassName = '',
  position = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openUpward, setOpenUpward] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      if (position === 'top') {
        setOpenUpward(true);
      } else if (position === 'bottom') {
        setOpenUpward(false);
      } else {
        const rect = wrapperRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpward(spaceBelow < 240 && rect.top > 240);
      }
    }
  }, [isOpen, position]);

  const filteredOptions = (options || []).filter((option) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    if (option.value === '') return false;
    return (option?.label || '').toLowerCase().includes(term);
  });

  const selectedOption = (options || []).find(opt => String(opt.value) === String(value));

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div
        className={`w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white flex justify-between items-center cursor-pointer transition-colors hover:border-slate-300 ${
          disabled ? 'opacity-50 cursor-not-allowed pointer-events-none bg-slate-50' : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`truncate mr-1 ${selectedOption && selectedOption.value !== '' ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {isOpen && !disabled && (
        <div
          className={`absolute z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${menuClassName}`}
          style={{ minWidth: 'max(100%, 220px)' }}
        >
          {searchable && (
            <div className="p-2 border-b border-slate-100 relative bg-slate-50/70">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                className="w-full text-xs pl-7 pr-3 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-teal-600 focus:ring-1 focus:ring-teal-500"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    String(option.value) === String(value)
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <span className="truncate">{option.label}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No matching results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
