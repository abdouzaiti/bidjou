/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Users, Plus, X, Edit, Trash2, 
  ChevronRight, Compass, HelpCircle, User, Sparkles, RefreshCw
} from 'lucide-react';
import { Session, Coach, Member, Attendance } from '../types';

interface SessionsViewProps {
  sessions: Session[];
  coaches: Coach[];
  members: Member[];
  attendance: Attendance[];
  t: (key: string) => string;
  onAddSession: (newSession: Omit<Session, 'id'>) => void;
  onDeleteSession: (id: string) => void;
}

export default function SessionsView({
  sessions,
  coaches,
  members,
  attendance,
  t,
  onAddSession,
  onDeleteSession
}: SessionsViewProps) {
  // UI states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(sessions[0] || null);

  // Auto-select first session when sessions are loaded or updated
  React.useEffect(() => {
    if (sessions.length > 0) {
      if (!selectedSession || !sessions.some(s => s.id === selectedSession.id)) {
        setSelectedSession(sessions[0]);
      }
    } else {
      setSelectedSession(null);
    }
  }, [sessions, selectedSession]);

  // Form states
  const [title, setTitle] = useState('');
  const [coachId, setCoachId] = useState('');
  const [location, setLocation] = useState('Dojo Central - Oran');
  const [date, setDate] = useState('2026-07-07');
  const [time, setTime] = useState('18:00');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default coachId when coaches list changes or form opens
  useEffect(() => {
    if (coaches.length > 0 && !coachId) {
      setCoachId(coaches[0].id);
    }
  }, [coaches, coachId]);

  // Also reset form fields when modal opens
  useEffect(() => {
    if (isFormOpen) {
      setTitle('');
      setDescription('');
      setIsSubmitting(false);
      if (coaches.length > 0) setCoachId(coaches[0].id);
    }
  }, [isFormOpen, coaches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Veuillez saisir un titre pour la séance.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!coachId && coaches.length > 0) {
        // Try to fallback if state hasn't caught up
        const fallbackId = coaches[0].id;
        await onAddSession({
          title,
          coachId: fallbackId,
          location,
          date,
          time,
          description,
          capacity
        });
      } else if (!coachId) {
        alert('Veuillez d\'abord ajouter un entraîneur dans la section Coachs.');
        setIsSubmitting(false);
        return;
      } else {
        await onAddSession({
          title,
          coachId,
          location,
          date,
          time,
          description,
          capacity
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: Count how many members are marked as Present/Late for a given session
  const getSessionAttendanceCount = (sessionId: string) => {
    return attendance.filter(a => a.sessionId === sessionId && (a.status === 'Present' || a.status === 'Late')).length;
  };

  // Helper: List names of scanned members in active selected session
  const getScannedAthletes = (sessionId: string) => {
    const records = attendance.filter(a => a.sessionId === sessionId && (a.status === 'Present' || a.status === 'Late'));
    return records.map(r => {
      const member = members.find(m => m.id === r.memberId);
      return {
        id: r.id,
        name: member ? member.name : 'Athlète inconnu',
        time: r.time,
        status: r.status,
        photoUrl: member?.photoUrl
      };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Upper bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-bento-blue">Planification des Séances</h2>
          <p className="text-xs text-slate-500">
            Créez des entraînements, assignez des coachs experts et examinez le taux de remplissage en temps réel.
          </p>
        </div>

        <button 
          id="btn-open-session-form"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-bento-blue bg-bento-gold hover:bg-bento-gold-dark rounded-xl shadow-md transition-all self-start border border-bento-gold/20"
        >
          <Plus className="w-4 h-4" />
          {t('create_session')}
        </button>
      </div>

      {/* Main interactive split view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sessions list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Séances programmées ({sessions.length})</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sessions.map((session) => {
              const coach = coaches.find(c => c.id === session.coachId);
              const presentCount = getSessionAttendanceCount(session.id);
              const occupancyRate = Math.round((presentCount / session.capacity) * 100);
              const isSelected = selectedSession?.id === session.id;

              return (
                <div 
                  key={session.id} 
                  id={`session-card-${session.id}`}
                  onClick={() => setSelectedSession(session)}
                  className={`cursor-pointer p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between min-h-[200px] text-left ${
                    isSelected 
                      ? 'bg-bento-gold text-bento-blue border-bento-gold shadow-md ring-4 ring-bento-gold/20' 
                      : 'bg-white text-slate-800 border-slate-100 hover:border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-bento-blue/10 text-bento-blue' : 'bg-blue-50 text-blue-700'
                      }`}>
                        🥋 Dojo
                      </span>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Voulez-vous supprimer cette séance de sport ?')) {
                            onDeleteSession(session.id);
                            if (selectedSession?.id === session.id) {
                              setSelectedSession(null);
                            }
                          }
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          isSelected ? 'text-bento-blue/60 hover:bg-bento-blue/10 hover:text-bento-blue' : 'text-slate-400 hover:bg-slate-50 hover:text-rose-600'
                        }`}
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-sm leading-snug line-clamp-2">{session.title}</h3>
                      <p className={`text-[10px] font-semibold ${isSelected ? 'text-bento-blue/70' : 'text-slate-400'}`}>
                        Coach : {coach ? coach.name : 'Non assigné'}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 opacity-90">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{session.date}{session.time ? ` • ${session.time}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-90">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{session.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress filler indicator */}
                  <div className={`pt-4 border-t border-dashed mt-4 ${isSelected ? 'border-bento-blue/20' : 'border-slate-100'}`}>
                    <div className="flex justify-between text-[10px] font-bold mb-1 opacity-90">
                      <span>Remplissage</span>
                      <span>{presentCount} / {session.capacity} ({occupancyRate}%)</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-bento-blue/10' : 'bg-slate-100'}`}>
                      <div 
                        style={{ width: `${Math.min(100, occupancyRate)}%` }} 
                        className={`h-full rounded-full ${isSelected ? 'bg-bento-blue' : 'bg-blue-600'}`}
                      />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Session Details Drawer Panel */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
          {selectedSession ? (
            <div className="space-y-5">
              <div className="border-b border-slate-50 pb-3">
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-sm">COMPTE RENDU SÉANCE</span>
                <h3 className="font-display font-bold text-slate-800 text-base mt-2">{selectedSession.title}</h3>
                <p className="text-xs text-slate-500 italic mt-1">"{selectedSession.description || 'Aucune description rédigée pour cette séance d\'entraînement.'}"</p>
              </div>

              {/* Coach details block */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Entraîneur expert assigné</span>
                {(() => {
                  const coachObj = coaches.find(c => c.id === selectedSession.coachId);
                  return coachObj ? (
                    <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/30">
                      <img 
                        src={coachObj.photoUrl} 
                        alt={coachObj.name} 
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{coachObj.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Aucun entraîneur lié à cette séance.</div>
                  );
                })()}
              </div>

              {/* Athletes present in this session */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <span>Athlètes pointés ({getSessionAttendanceCount(selectedSession.id)})</span>
                  <span className="text-blue-600">Sur place</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {getScannedAthletes(selectedSession.id).length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic bg-slate-50/30 border border-dashed border-slate-100 rounded-xl">
                      Aucun athlète n'a encore badge sa carte QR pour cette session.
                    </div>
                  ) : (
                    getScannedAthletes(selectedSession.id).map((athlete) => (
                      <div key={athlete.id} className="flex items-center justify-between p-2.5 bg-emerald-50/25 border border-emerald-100/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          <img 
                            src={athlete.photoUrl} 
                            alt={athlete.name} 
                            className="w-6 h-6 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(athlete.name)}`;
                            }}
                          />
                          <span className="text-xs font-bold text-slate-700">{athlete.name}</span>
                        </div>
                        {athlete.time && <span className="text-[10px] text-slate-400 font-mono font-semibold">{athlete.time}</span>}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-400 italic">
              Sélectionnez une séance pour examiner ses détails d'assiduité.
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 mt-4 text-center text-xs text-slate-400 font-semibold">
            Capacité d'accueil globale : <strong>100 athlètes</strong>
          </div>
        </div>

      </div>

      {/* Planning Form Modal dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="session-modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
              onClick={() => setIsFormOpen(false)}
            />

            <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100">
              
              {/* Modal header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-base font-display font-bold text-slate-800" id="session-modal-title">
                  Planifier une séance d'entraînement
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
                  
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Intitulé de la séance *</label>
                    <input 
                      id="form-session-title-input"
                      type="text" 
                      required
                      placeholder="Ex: Judo Élite - Randori technique"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Coach selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Entraîneur assigné *</label>
                    <select 
                      id="form-session-coach-select"
                      required
                      value={coachId}
                      onChange={(e) => setCoachId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                    >
                      {coaches.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Lieu de l'activité *</label>
                    <input 
                      id="form-session-loc-input"
                      type="text" 
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Date</label>
                      <input 
                        id="form-session-date-input"
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Heure de début</label>
                      <input 
                        id="form-session-time-input"
                        type="text" 
                        required
                        placeholder="Ex: 18:30"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Capacité maximale (Athlètes) *</label>
                    <input 
                      id="form-session-cap-input"
                      type="number" 
                      required
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Description de l'entraînement</label>
                    <textarea 
                      id="form-session-desc-input"
                      placeholder="Contenu pédagogique ou technique..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden h-16"
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
                    id="btn-submit-session-form"
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all border flex items-center gap-2 ${
                      isSubmitting 
                        ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed' 
                        : 'text-bento-blue bg-bento-gold hover:bg-bento-gold-dark border-bento-gold/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Planification...
                      </>
                    ) : (
                      'Confirmer le planning'
                    )}
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
