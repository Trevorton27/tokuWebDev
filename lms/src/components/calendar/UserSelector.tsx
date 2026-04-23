"use client";

import { useState, useEffect } from "react";
import { User } from "@prisma/client";

interface UserSelectorProps {
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  role?: "STUDENT" | "INSTRUCTOR" | "ALL";
  label?: string;
  placeholder?: string;
}

export default function UserSelector({
  selectedUserIds,
  onChange,
  role = "ALL",
  label = "Select Users",
  placeholder = "Search users...",
}: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = new URLSearchParams();
        if (role !== "ALL") {
          params.append("role", role);
        }

        const response = await fetch(`/api/users?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [role]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const selectedUsers = users.filter((user) =>
    selectedUserIds.includes(user.id)
  );

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    onChange(selectedUserIds.filter((id) => id !== userId));
  };

  const handleSelectAll = () => {
    onChange(filteredUsers.map((user) => user.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="text-sm text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Selected users chips */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
            >
              <span>{user.name || user.email}</span>
              <button
                type="button"
                onClick={() => handleRemoveUser(user.id)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {/* Action buttons */}
            <div className="flex justify-between gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
              >
                Select All ({filteredUsers.length})
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(false)}
                className="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Close
              </button>
            </div>

            {/* User list */}
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">
                No users found
              </div>
            ) : (
              <div className="py-1">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleToggleUser(user.id)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/30"
                          : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.name || "No name"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          Role: {user.role}
                        </div>
                      </div>
                      {isSelected && (
                        <svg
                          className="w-5 h-5 text-blue-600 dark:text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {selectedUserIds.length} user{selectedUserIds.length !== 1 ? "s" : ""}{" "}
        selected
      </div>
    </div>
  );
}
