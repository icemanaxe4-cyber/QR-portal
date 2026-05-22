// src/pages/EditSeminar.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSeminar, updateSeminar } from '../services/seminarService';
import SeminarForm from '../components/SeminarForm';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditSeminar() {
  const { id }          = useParams();
  const { currentUser } = useAuth();
  const navigate        = useNavigate();
  const [seminar, setSeminar]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSeminar(id);
        if (!data) { toast.error('Programme not found'); navigate('/dashboard'); return; }
        // Ownership check
        if (data.professorUid !== currentUser?.uid) {
          toast.error('You can only edit your own programmes.');
          navigate('/dashboard');
          return;
        }
        setSeminar(data);
      } catch {
        toast.error('Failed to load programme');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(formData) {
    setSubmitting(true);
    try {
      await updateSeminar(id, formData);
      toast.success('Programme updated!');
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update programme.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="spinner !border-slate-300 !border-t-brand-500" style={{width:32,height:32,borderWidth:3}} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 fade-in">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all duration-150 shrink-0">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-header mb-0">Edit Programme</h1>
          <p className="text-slate-400 text-sm mt-0.5">Updating: <span className="font-semibold text-slate-600">{seminar?.title}</span></p>
        </div>
      </div>
      {seminar && <SeminarForm initialData={seminar} onSubmit={handleSubmit} submitting={submitting} />}
    </div>
  );
}
