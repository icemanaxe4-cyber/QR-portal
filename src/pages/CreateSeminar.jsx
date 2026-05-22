// src/pages/CreateSeminar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createSeminar } from '../services/seminarService';
import SeminarForm from '../components/SeminarForm';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateSeminar() {
  const { currentUser } = useAuth();
  const navigate        = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData) {
    setSubmitting(true);
    try {
      const seminar = await createSeminar(formData, currentUser.uid);
      toast.success('Programme created! 🎉');
      navigate(`/qr/${seminar.id}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to create programme. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all duration-150 shrink-0">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header mb-0">Create Programme</h1>
          <p className="text-slate-400 text-sm mt-0.5">Fill in the details to generate your programme page and QR code.</p>
        </div>
      </div>
      <SeminarForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
