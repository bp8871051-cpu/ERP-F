import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
