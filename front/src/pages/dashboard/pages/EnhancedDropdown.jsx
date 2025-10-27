import React, { useState, useRef, useEffect } from "react";

const EnhancedDropdown = ({
  options,
  value,
  onSelect,
  placeholder,
  disabled,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter((option) =>
        option.displayText.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (id) => {
    onSelect(id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedOption = options.find(
    (option) => option.id.toString() === value
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border border-slate-200 rounded-xl px-4 py-3 text-left focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 ${
          disabled
            ? "bg-slate-100 cursor-not-allowed text-slate-400"
            : "bg-white"
        } ${isOpen ? "ring-3 ring-blue-100 border-blue-400" : ""}`}
        disabled={disabled}
      >
        {selectedOption ? selectedOption.displayText : placeholder}
        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className={`h-5 w-5 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              placeholder="Search items..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                    value === option.id.toString()
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }`}
                  onClick={() => handleSelect(option.id)}
                >
                  {option.displayText}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-slate-500">No items found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDropdown;
