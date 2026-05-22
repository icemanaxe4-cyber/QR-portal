// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Requires logged in
export function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// Requires logged in + approved
export function ApprovedRoute({ children }) {
  const { currentUser, isApproved } = useAuth();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isApproved) return <PendingApproval />;
  return children;
}

function PendingApproval() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⏳</span>
        </div>
        <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">Awaiting Approval</h2>
        <p className="text-slate-500">
          Your account is pending approval. You'll be able to access the portal once it's reviewed.
        </p>
      </div>
    </div>
  );
}
