'use client';

import { LoginButton } from '@/components/custom/LoginButton';
import { UserButton } from '@clerk/nextjs';
import { useConvexAuth } from 'convex/react';
import React from 'react';

export const AuthNavButton = ({ ...props }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <>
      {isLoading && <p {...props}>Loading...</p>}
      {!isAuthenticated && !isLoading && <LoginButton {...props} />}
      {isAuthenticated && !isLoading && <UserButton {...props} />}
    </>
  );
};
