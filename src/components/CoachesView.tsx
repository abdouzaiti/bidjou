/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, Mail, Phone, Plus, X, Edit, Trash2, Shield, Calendar, CheckCircle
} from 'lucide-react';
import { Coach, Session } from '../types';

interface CoachesViewProps {
  coaches: Coach[];
  sessions: Session[];
  t: (key: string) => string;
  onAddCoach: (newCoach: Omit<Coach, 'id'>) => void;
  onDeleteCoach: (id: string) => void;
}

export default function CoachesView({
  coaches,
  sessions,
  t,
  onAddCoach,
  onDeleteCoach
}: CoachesViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('Ceinture Noire Judo');
  const [experience, setExperience] = useState('10 ans');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const resolvedPhoto = photoUrl.trim() || `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1534528741775-53994a69daeb' : '1506794778202-cad84cf45f1d'}?q=80&w=250&auto=format&fit=crop`;

    onAddCoach({
      name,
      phone,
      email,
      specialty,
      experience,
      photoUrl: resolvedPhoto,
      status: 'Active'
    });

    setIsFormOpen(false);
    // Reset
    setName('');
    setPhone('');
    setEmail('');
    setPhotoUrl('');
  };

  // Helper: Count assigned sessions
  const getAssignedSessionsCount = (coachId: string) => {
    return sessions.filter(s => s.coachId === coachId).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Upper bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-bento-blue">Équipe d'Entraîneurs</h2>
          <p className="text-xs text-slate-500">
            Supervisez les entraîneurs officiels du dojo, leurs qualifications et les séances de sport attitrées.
          </p>
        </div>

        <button 
          id="btn-open-coach-form"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-bento-blue bg-bento-gold hover:bg-bento-gold-dark rounded-xl shadow-md transition-all self-start border border-bento-gold/20"
        >
          <Plus className="w-4 h-4" />
          Ajouter un entraîneur
        </button>
      </div>

      {/* Grid view of coaches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => {
          const sessionsCount = getAssignedSessionsCount(coach.id);
          return (
            <div 
              key={coach.id} 
              id={`coach-card-${coach.id}`}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[240px]"
            >
              <div className="space-y-4">
                {/* Header profile photo + status */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img 
                      src={coach.photoUrl} 
                      alt={coach.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(coach.name)}`;
                      }}
                    />
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm">{coach.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono font-bold block">{coach.experience} d'expérience</span>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Actif
                  </span>
                </div>

                {/* Specialties list */}
                <div className="space-y-2 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/30">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Spécialité Principale</span>
                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    {coach.specialty}
                  </p>
                </div>

                {/* Contact data info */}
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{coach.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{coach.email}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-4 text-xs">
                <span className="font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {sessionsCount} séances attitrées
                </span>

                <button 
                  onClick={() => {
                    if (confirm(`Voulez-vous supprimer l'entraîneur ${coach.name} de l'équipe ?`)) {
                      onDeleteCoach(coach.id);
                    }
                  }}
                  className="p-1.5 bg-rose-50/50 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                  title="Supprimer l'entraîneur"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Creation Form Modal dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="coaches-modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
              onClick={() => setIsFormOpen(false)}
            />

            <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100">
              
              {/* Modal header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-base font-display font-bold text-slate-800" id="coaches-modal-title">
                  Inscrire un nouvel entraîneur
                </h3>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Nom complet de l'expert *</label>
                    <input 
                      id="form-coach-name-input"
                      type="text" 
                      required
                      placeholder="Ex: Maître Mourad Benyahia"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Specialty */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Spécialité & Diplôme *</label>
                    <input 
                      id="form-coach-specialty-input"
                      type="text" 
                      required
                      placeholder="Ex: Karaté Do Shotokan (5ème Dan)"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Expérience professionnelle *</label>
                    <input 
                      id="form-coach-exp-input"
                      type="text" 
                      required
                      placeholder="Ex: 12 ans d'enseignement"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Téléphone *</label>
                      <input 
                        id="form-coach-phone-input"
                        type="text" 
                        required
                        placeholder="0550..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">E-mail *</label>
                      <input 
                        id="form-coach-email-input"
                        type="email" 
                        required
                        placeholder="mourad@..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Photo Url */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Lien URL de la photo portrait (Optionnel)</label>
                    <input 
                      id="form-coach-photo-input"
                      type="url" 
                      placeholder="Laissez vide pour utiliser un avatar aléatoire"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100 rounded-b-3xl">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    id="btn-submit-coach-form"
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-bento-blue bg-bento-gold hover:bg-bento-gold-dark rounded-xl shadow-md transition-all border border-bento-gold/20"
                  >
                    Inscrire l'entraîneur
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
