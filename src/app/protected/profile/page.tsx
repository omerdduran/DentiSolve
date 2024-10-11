"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    membership: "",
    lastVisit: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user-profile');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Your Profile
          </h1>
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Image
                  src={user.avatar || "/default-avatar.jpg"}
                  alt="Profile Picture"
                  width={100}
                  height={100}
                  className="rounded-full mr-6"
              />
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.membership} Member
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Information
                </h3>
                <ul className="space-y-2">
                  <li className="text-gray-600 dark:text-gray-400">
                    {user.email}
                  </li>
                  <li className="text-gray-600 dark:text-gray-400">
                    {user.phone}
                  </li>
                  <li className="text-gray-600 dark:text-gray-400">
                    {user.address}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProfilePage;