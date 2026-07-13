/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, CheckCircle, Search, Calendar, Clock, AlertTriangle, 
  Sparkles, RefreshCw, Smartphone, User, Play, StopCircle, CheckSquare,
  Tag, Edit2, Plus, Check, X, Wifi, Cpu, Radio
} from 'lucide-react';
import { Member, Attendance, Session, Coach } from '../types';

interface AttendanceViewProps {
  members: Member[];
  attendance: Attendance[];
  sessions: Session[];
  coaches: Coach[];
  t: (key: string) => string;
  onRecordAttendance: (memberId: string, status: 'Present' | 'Late' | 'Absent', sessionId: string) => void;
  onClearTodayAttendance: () => void;
  quickOpenScanner: boolean;
  setQuickOpenScanner: (open: boolean) => void;
  onUpdateMember?: (id: string, updatedFields: Partial<Member>) => void;
}

export default function AttendanceView({
  members,
  attendance,
  sessions,
  coaches,
  t,
  onRecordAttendance,
  onClearTodayAttendance,
  quickOpenScanner,
  setQuickOpenScanner,
  onUpdateMember
}: AttendanceViewProps) {
  const todayStr = '2026-07-07';
  
  // Tabs: Terminal Scanner or Manual pointage or Calendar History
  const [activeTab, setActiveTab] = useState<'scanner' | 'manual' | 'calendar'>('scanner');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  // Determine current active date based on selected session
  const activeDate = sessions.find(s => s.id === selectedSessionId)?.date || todayStr;

  // Set initial selected session when sessions list loads or changes
  useEffect(() => {
    if (sessions.length > 0) {
      if (!selectedSessionId || !sessions.some(s => s.id === selectedSessionId)) {
        setSelectedSessionId(sessions[0].id);
      }
    }
  }, [sessions, selectedSessionId]);

  // Scanner Simulator States
  const [scannedMemberId, setScannedMemberId] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error' | 'already'>('idle');
  const [scannedMember, setScannedMember] = useState<Member | null>(null);

  // Jeton RFID / NFC simulator states
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [jetonInputValue, setJetonInputValue] = useState('');
  const [rfidManualInput, setRfidManualInput] = useState('');
  const [scanErrorMessage, setScanErrorMessage] = useState('');

  // Real Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Handle quick scan trigger from dashboard
  useEffect(() => {
    if (quickOpenScanner) {
      setActiveTab('scanner');
      setQuickOpenScanner(false);
    }
  }, [quickOpenScanner]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera access denied or blocked inside iframe:", err);
      alert("L'accès à la caméra réelle a été bloqué par les restrictions de sécurité de l'iFrame. Utilisez notre émulateur de terminal QR haut de gamme ci-dessous pour tester l'enregistrement en temps réel !");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Perform Simulation of QR Scan
  const handleSimulateScan = (memberId: string) => {
    if (!memberId || !selectedSessionId) return;

    const memberObj = members.find(m => m.id === memberId);
    if (!memberObj) return;

    setScanStatus('scanning');
    setScannedMember(memberObj);

    // Check if already checked in today
    const isAlreadyPresent = attendance.some(
      a => a.memberId === memberId && a.date === activeDate && a.sessionId === selectedSessionId
    );

    setTimeout(() => {
      if (isAlreadyPresent) {
        setScanStatus('already');
        // Visual beep flash
      } else {
        onRecordAttendance(memberId, 'Present', selectedSessionId);
        setScanStatus('success');
      }

      // Reset to idle after 4 seconds
      setTimeout(() => {
        setScanStatus('idle');
        setScannedMember(null);
      }, 3500);
    }, 900);
  };

  // Simulate direct Jeton scanning/entry via the device
  const handleJetonDirectScan = (jetonId: string) => {
    const cleanId = jetonId.trim();
    if (!cleanId) return;

    setScanStatus('scanning');
    setScanErrorMessage('');

    setTimeout(() => {
      const foundMember = members.find(m => m.jetonId && m.jetonId.trim().toLowerCase() === cleanId.toLowerCase());
      
      if (!foundMember) {
        setScanStatus('error');
        setScanErrorMessage(`Le jeton "${cleanId}" n'est associé à aucun athlète.`);
        setTimeout(() => {
          setScanStatus('idle');
          setScanErrorMessage('');
        }, 4000);
        return;
      }

      setScannedMember(foundMember);

      const isAlreadyPresent = attendance.some(
        a => a.memberId === foundMember.id && a.date === activeDate && a.sessionId === selectedSessionId
      );

      if (isAlreadyPresent) {
        setScanStatus('already');
      } else {
        onRecordAttendance(foundMember.id, 'Present', selectedSessionId);
        setScanStatus('success');
      }

      // Reset to idle after 4 seconds
      setTimeout(() => {
        setScanStatus('idle');
        setScannedMember(null);
      }, 3500);
    }, 800);
  };

  // Manual Checkin / Pointage Toggles
  const handleManualStatusChange = (memberId: string, status: 'Present' | 'Late' | 'Absent') => {
    onRecordAttendance(memberId, status, selectedSessionId);
  };

  // Calculations for list of active members with status today
  const todayAttendances = attendance.filter(a => a.date === activeDate && a.sessionId === selectedSessionId);
  
  // Create a dictionary of today's attendance for quick lookup
  const todayAttendanceMap = new Map<string, Attendance>();
  todayAttendances.forEach(a => todayAttendanceMap.set(a.memberId, a));

  const activeMembers = members.filter(m => m.status === 'Active');
  
  const filteredActiveMembers = activeMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats for the active session
  const presentCount = todayAttendances.filter(a => a.status === 'Present').length;
  const lateCount = todayAttendances.filter(a => a.status === 'Late').length;
  const totalScannedToday = presentCount + lateCount;

  // Calendar Simulation Data (Last 7 Days)
  const last7Days = [
    { date: '01 Juil', present: 5, late: 1 },
    { date: '02 Juil', present: 4, late: 2 },
    { date: '03 Juil', present: 6, late: 0 },
    { date: '04 Juil', present: 5, late: 1 },
    { date: '05 Juil', present: 5, late: 2 },
    { date: '06 Juil', present: 3, late: 1 },
    { date: '07 Juil', present: presentCount, late: lateCount } // Today
  ];

  return (
    <div className="space-y-6">
      {/* Upper bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-bold text-bento-blue">Pointage des Athlètes</h2>
          <p className="text-xs text-slate-500">
            Enregistrez les présences par scanner de cartes QR ou via la console de recherche manuelle.
          </p>
        </div>

        {/* Dynamic Séance selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-2xl">
            <Calendar className="w-4 h-4 text-bento-gold shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Séance active</span>
              <select
                id="select-session-attendance"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="text-xs font-bold text-bento-blue bg-transparent focus:outline-hidden cursor-pointer"
              >
                {sessions.length === 0 ? (
                  <option value="">Aucune séance disponible</option>
                ) : (
                  sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}{s.time ? ` (${s.time})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Show details of selected session if available */}
          {sessions.find(s => s.id === selectedSessionId) && (
            <div className="hidden md:flex flex-col text-xs text-slate-500 bg-slate-50/50 border border-slate-100/50 px-3 py-1.5 rounded-xl text-left">
              <span className="font-semibold text-slate-700">📍 {sessions.find(s => s.id === selectedSessionId)?.location}</span>
              {sessions.find(s => s.id === selectedSessionId)?.time && (
                <span className="text-[10px] text-slate-400">Heure: {sessions.find(s => s.id === selectedSessionId)?.time}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mode navigation */}
      <div className="flex items-center border-b border-slate-100 gap-1">
        <button 
          onClick={() => setActiveTab('scanner')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'scanner' ? 'border-bento-blue text-bento-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('scan_qr_title')}
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'manual' ? 'border-bento-blue text-bento-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t('manual_checkin')}
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'calendar' ? 'border-bento-blue text-bento-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Historique & Calendrier
        </button>
      </div>

      {/* Active Mode Contents */}
      {/* Active Mode Contents */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Scanner view & Terminal emulator */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Visual Hardware Terminal Mockup */}
            <div className="bg-[#0B0F19] text-slate-100 p-6 rounded-3xl shadow-2xl border-2 border-bento-gold/40 relative overflow-hidden flex flex-col justify-between min-h-[440px]">
              
              {/* Background electromagnetic waves animation */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />
              
              <div className="flex justify-between items-center relative z-10 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-bento-gold" />
                  <span className="text-xs font-mono tracking-wider font-bold text-bento-gold">LES BIJOUX D'ORAN RFID/NFC TERMINAL v2.0</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] bg-slate-900 px-2.5 py-1 rounded-md font-mono text-bento-gold border border-bento-gold/20">
                  <span className="w-1.5 h-1.5 bg-bento-gold rounded-full animate-ping" />
                  LECTEUR PRÊT
                </div>
              </div>

              {/* Viewfinder block */}
              <div className="my-6 flex flex-col items-center justify-center text-center relative z-10 py-4">
                
                {scanStatus === 'idle' && (
                  <div className="space-y-4">
                    <div className="relative w-36 h-36 rounded-full bg-bento-gold/5 border-2 border-dashed border-bento-gold/30 flex items-center justify-center mx-auto mb-4 animate-[pulse_3s_infinite]">
                      <div className="absolute inset-2 rounded-full bg-bento-gold/10 border border-bento-gold/20 flex items-center justify-center">
                        <Radio className="w-12 h-12 text-bento-gold animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-300 font-display">Présenter un Jeton RFID / NFC</p>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">Approchez un jeton d'athlète ou tapez directement le code ci-dessous pour simuler le passage physique.</p>
                    </div>
                  </div>
                )}

                {scanStatus === 'scanning' && (
                  <div className="space-y-3">
                    <RefreshCw className="w-12 h-12 text-bento-gold animate-spin mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-bento-gold font-mono">LECTURE EN COURS...</p>
                      <p className="text-xs text-slate-400">Authentification de la signature magnétique...</p>
                    </div>
                  </div>
                )}

                {scanStatus === 'success' && scannedMember && (
                  <div className="space-y-4 animate-scale-in">
                    <div className="w-16 h-16 bg-emerald-500/15 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      <CheckSquare className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-display">{scannedMember.name}</h4>
                      <p className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest">ACCÈS AUTORISÉ • POINTÉ PRÉSENT</p>
                      <p className="text-[10px] text-slate-500 mt-1">Jeton: {scannedMember.jetonId} • {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • Dojo Central</p>
                    </div>
                  </div>
                )}

                {scanStatus === 'already' && scannedMember && (
                  <div className="space-y-4 animate-scale-in">
                    <div className="w-16 h-16 bg-amber-500/15 border-2 border-amber-500 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-display">{scannedMember.name}</h4>
                      <p className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">DÉJÀ ENREGISTRÉ AUJOURD'HUI</p>
                      <p className="text-[10px] text-slate-500 mt-1">Ce jeton a déjà été validé pour cette séance.</p>
                    </div>
                  </div>
                )}

                {scanStatus === 'error' && (
                  <div className="space-y-4 animate-scale-in">
                    <div className="w-16 h-16 bg-rose-500/15 border-2 border-rose-500 text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      <X className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white font-display">ERREUR DE LECTURE</h4>
                      <p className="text-xs font-mono text-rose-400 font-bold uppercase tracking-widest">{scanErrorMessage || "Jeton non reconnu."}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Veuillez d'abord associer ce jeton à un athlète ci-contre.</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Direct scan typing simulator box */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 relative z-10 max-w-md mx-auto w-full mb-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-bento-gold mb-2 font-mono text-center">💻 Saisir le signal de l'appareil (Simulateur Lecteur USB/NFC)</p>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (rfidManualInput.trim()) {
                      handleJetonDirectScan(rfidManualInput);
                    }
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-bento-gold/60" />
                    <input 
                      type="text" 
                      placeholder="Ex: JETON-YACINE-01" 
                      value={rfidManualInput}
                      onChange={(e) => setRfidManualInput(e.target.value)}
                      className="w-full bg-slate-900 border border-bento-gold/25 rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-hidden focus:border-bento-gold"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-bento-gold hover:bg-bento-gold/90 text-bento-blue font-bold px-3 py-1.5 rounded-xl text-xs transition-all active:scale-95"
                  >
                    Simuler Scan
                  </button>
                </form>
              </div>

              {/* Info section below terminal screen */}
              <div className="border-t border-slate-800 pt-4 text-xs text-slate-500 font-mono flex justify-between items-center">
                <span>Passages séance : <strong>{totalScannedToday}</strong></span>
                <span>Athlètes attendus : <strong>{activeMembers.length}</strong></span>
              </div>
            </div>

          </div>

          {/* Member fast checkout selector */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display font-bold text-bento-blue text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-bento-gold" />
                    Athlètes & Jetons RFID
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Associez des jetons à vos athlètes et simulez leur passage rapide d'un seul clic.
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    id="search-attendance-sim-input"
                    type="text" 
                    placeholder="Chercher athlète..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 hover:bg-slate-50/80 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {filteredActiveMembers.map((member) => {
                    const isChecked = todayAttendanceMap.has(member.id);
                    return (
                      <div 
                        key={member.id} 
                        className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img 
                              src={member.photoUrl} 
                              alt={member.name} 
                              className="w-7 h-7 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                              }}
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-700 block leading-tight">{member.name}</span>
                              <span className="text-[9px] text-slate-400 block font-mono">{member.membershipNumber}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {isChecked ? (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Pointé</span>
                            ) : member.jetonId ? (
                              <button 
                                id={`btn-simulate-member-scan-${member.id}`}
                                onClick={() => handleJetonDirectScan(member.jetonId!)}
                                disabled={scanStatus === 'scanning'}
                                className="text-[9px] font-bold text-bento-blue bg-bento-blue/5 hover:bg-bento-blue hover:text-white px-2 py-1 rounded-md transition-all active:scale-95 disabled:opacity-50"
                              >
                                Badger
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {/* Inline Jeton display or editor */}
                        <div className="mt-2 pt-2 border-t border-slate-100/60 flex items-center justify-between text-[10px]">
                          {editingMemberId === member.id ? (
                            <div className="flex items-center gap-1 w-full">
                              <Tag className="w-3 h-3 text-bento-gold shrink-0" />
                              <input 
                                type="text"
                                placeholder="ID Jeton (ex: JETON-101)"
                                value={jetonInputValue}
                                onChange={(e) => setJetonInputValue(e.target.value)}
                                className="bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-[10px] font-mono flex-1 focus:outline-none"
                              />
                              <button 
                                onClick={() => {
                                  if (onUpdateMember) {
                                    onUpdateMember(member.id, { jetonId: jetonInputValue.trim() || undefined });
                                    setEditingMemberId(null);
                                    setJetonInputValue('');
                                  }
                                }}
                                className="p-0.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingMemberId(null);
                                  setJetonInputValue('');
                                }}
                                className="p-0.5 bg-rose-500 text-white rounded-md hover:bg-rose-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full text-slate-500">
                              <div className="flex items-center gap-1">
                                <Tag className="w-3 h-3 text-bento-gold/80" />
                                {member.jetonId ? (
                                  <span className="font-mono text-bento-gold bg-bento-gold/5 border border-bento-gold/20 px-1.5 py-0.5 rounded-sm font-semibold">{member.jetonId}</span>
                                ) : (
                                  <span className="text-slate-400 italic font-medium">Aucun jeton lié</span>
                                )}
                              </div>
                              <button 
                                onClick={() => {
                                  setEditingMemberId(member.id);
                                  setJetonInputValue(member.jetonId || '');
                                }}
                                className="text-bento-blue hover:text-bento-gold font-bold flex items-center gap-0.5 hover:underline"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                {member.jetonId ? "Changer" : "Lier"}
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <button 
                  onClick={onClearTodayAttendance}
                  className="w-full text-center text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline transition-colors"
                >
                  Réinitialiser le pointage du jour (test)
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Manual lookup mode */}
      {activeTab === 'manual' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-bento-blue text-sm">Registre d'appel manuel</h3>
              <p className="text-[11px] text-slate-500">Sélectionnez le statut de chaque adhérent pour la séance courante.</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                id="search-attendance-manual-input"
                type="text" 
                placeholder="Chercher un nom d'adhérent..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-100">
                    <th className="p-4">Athlète</th>
                    <th className="p-4">N° de carte</th>
                    <th className="p-4">Statut de pointage</th>
                    <th className="p-4 text-right">Action rapide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredActiveMembers.map((member) => {
                    const currentRecord = todayAttendanceMap.get(member.id);
                    return (
                      <tr key={member.id} className="hover:bg-slate-50/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={member.photoUrl} 
                              alt={member.name} 
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                              }}
                            />
                            <div>
                              <span className="font-bold text-slate-700 block">{member.name}</span>
                              <span className="text-[9px] text-slate-400">Actif</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-semibold text-blue-600">{member.membershipNumber}</td>
                        <td className="p-4">
                          {currentRecord ? (
                            <span className={`px-2 py-0.5 font-bold rounded-sm text-[10px] ${
                              currentRecord.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                              currentRecord.status === 'Late' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {currentRecord.status === 'Present' ? 'Présent' : currentRecord.status === 'Late' ? 'En retard' : 'Absent'}{currentRecord.time ? ` (${currentRecord.time})` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Non pointé</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex rounded-xl border border-slate-100 p-1 bg-slate-50 gap-1">
                            <button 
                              id={`btn-manual-present-${member.id}`}
                              onClick={() => handleManualStatusChange(member.id, 'Present')}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                currentRecord?.status === 'Present' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              Présent
                            </button>
                            <button 
                              id={`btn-manual-late-${member.id}`}
                              onClick={() => handleManualStatusChange(member.id, 'Late')}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                currentRecord?.status === 'Late' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              Retard
                            </button>
                            <button 
                              id={`btn-manual-absent-${member.id}`}
                              onClick={() => handleManualStatusChange(member.id, 'Absent')}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                currentRecord?.status === 'Absent' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Calendar & Stats History view */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Visual weekly stats summary */}
          <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
            <h3 className="font-display font-bold text-slate-800 text-base mb-4">Assiduité de la semaine</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end h-40 pt-4 border-b border-slate-100 pb-2">
                {last7Days.map((day, i) => {
                  const total = day.present + day.late;
                  const ratio = (total / Math.max(1, activeMembers.length)) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="w-full max-w-[24px] bg-slate-100 rounded-t-md h-full flex flex-col justify-end relative">
                        {/* Present bar (emerald) */}
                        <div 
                          style={{ height: `${(day.present / activeMembers.length) * 100}%` }}
                          className="bg-emerald-500 w-full rounded-t-md relative group-hover:opacity-90"
                        />
                        {/* Late bar (amber) */}
                        <div 
                          style={{ height: `${(day.late / activeMembers.length) * 100}%` }}
                          className="bg-amber-400 w-full relative group-hover:opacity-90"
                        />
                        
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-mono p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Pres: {day.present}, Ret: {day.late}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{day.date}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 text-xs font-semibold text-slate-500 justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  <span>Présents</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                  <span>En retard</span>
                </div>
              </div>
            </div>
          </div>

          {/* List of today's present list */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-base mb-4">Présences de ce jour</h3>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {todayAttendances.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 italic">
                    Aucun pointage aujourd'hui pour cette séance.
                  </div>
                ) : (
                  todayAttendances.map(record => {
                    const member = members.find(m => m.id === record.memberId);
                    if (!member) return null;
                    return (
                      <div key={record.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-xl border border-slate-100/50">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={member.photoUrl} 
                            alt={member.name} 
                            className="w-7 h-7 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                            }}
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">{member.name}</span>
                            {record.time && <span className="text-[10px] text-slate-400 block">{record.time}</span>}
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm ${
                          record.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>{record.status === 'Present' ? 'Présent' : 'Retard'}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-400 text-center font-semibold">
              Rapport d'assiduité global estimé à <strong>84%</strong>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
