'use client';

import { UserButton } from '@clerk/nextjs';
import { useConvexAuth } from 'convex/react';
import { LoginButton } from '@/components/custom/LoginButton';

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
