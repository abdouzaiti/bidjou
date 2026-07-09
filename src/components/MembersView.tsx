/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Search, SlidersHorizontal, Grid, List, Download, Upload, 
  Trash2, Edit, CheckCircle, AlertTriangle, Eye, X, Phone, Mail, 
  ShieldAlert, Activity, DollarSign, Calendar, MapPin, Printer, Users, CheckSquare,
  Camera, Image, UploadCloud, Link, Cloud, Database
} from 'lucide-react';
import { Member, Payment, Attendance } from '../types';
import { printMemberQRCard } from '../utils/pdfGenerator';

interface MembersViewProps {
  members: Member[];
  payments: Payment[];
  attendance: Attendance[];
  currency: string;
  t: (key: string) => string;
  onAddMember: (newMember: Omit<Member, 'id' | 'membershipNumber'>) => void;
  onUpdateMember: (id: string, updatedFields: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  quickOpenForm: boolean;
  setQuickOpenForm: (open: boolean) => void;
}

export default function MembersView({
  members,
  payments,
  attendance,
  currency,
  t,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  quickOpenForm,
  setQuickOpenForm
}: MembersViewProps) {
  // UI states
  const [isFormOpen, setIsFormOpen] = useState(quickOpenForm);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended' | 'Inactive'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'membershipNo'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form Field States
  const [formData, setFormData] = useState({
    name: '',
    photoUrl: '',
    birthDate: '',
    phone: '',
    address: '',
    status: 'Active' as 'Active' | 'Suspended' | 'Inactive',
    monthlyFee: 3000,
    medicalNotes: '',
    emergencyInfo: '',
    jetonId: ''
  });

  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const handlePhotoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, JPEG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormData(prev => ({ ...prev, photoUrl: e.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Sync quickOpenForm prop from parent
  React.useEffect(() => {
    if (quickOpenForm) {
      setIsFormOpen(true);
      setIsEditing(false);
      resetForm();
      setQuickOpenForm(false);
    }
  }, [quickOpenForm]);

  const resetForm = () => {
    setFormData({
      name: '',
      photoUrl: '',
      birthDate: '',
      phone: '',
      address: '',
      status: 'Active',
      monthlyFee: 3000,
      medicalNotes: '',
      emergencyInfo: '',
      jetonId: ''
    });
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEditing && editingMemberId) {
      onUpdateMember(editingMemberId, formData as any);
      setIsEditing(false);
      setEditingMemberId(null);
    } else {
      // Photo Url Fallback to beautiful Unsplash random fit
      const resolvedPhoto = formData.photoUrl.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.name || 'Athlète')}`;
      onAddMember({
        ...formData,
        photoUrl: resolvedPhoto
      } as any);
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleEditClick = (member: Member) => {
    setIsEditing(true);
    setEditingMemberId(member.id);
    setFormData({
      name: member.name,
      photoUrl: member.photoUrl,
      birthDate: member.birthDate,
      phone: member.phone,
      address: member.address,
      status: member.status,
      monthlyFee: member.monthlyFee,
      medicalNotes: member.medicalNotes,
      emergencyInfo: member.emergencyInfo,
      jetonId: member.jetonId || ''
    });
    setIsFormOpen(true);
  };

  // Filter & Search Logic
  const filteredMembers = members
    .filter(member => {
      const matchSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.membershipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm);
      const matchStatus = statusFilter === 'All' || member.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.membershipNumber.localeCompare(b.membershipNumber);
      }
    });

  // Excel simulation download
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,N_Adherent,Nom,Date_Naissance,Telephone,Adresse,Statut,Cotisation_Mensuelle\n";
    members.forEach(m => {
      csvContent += `"${m.id}","${m.membershipNumber}","${m.name}","${m.birthDate}","${m.phone}","${m.address}","${m.status}",${m.monthlyFee}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bijoux_Oran_Membres_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import simulation
  const handleImportCSV = () => {
    // Generate a new random member to simulate import
    const randomNames = ["Rachid Neghiz", "Karima Bensoltane", "Halim Zouaghi", "Tarek Saidi"];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const simulatedMember = {
      name: randomName,
      photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(randomName)}`,
      birthDate: '1996-08-14',
      phone: '0555 12 34 56',
      address: 'Centre Ville, Oran',
      status: 'Active' as const,
      monthlyFee: 3000,
      medicalNotes: 'Apte.',
      emergencyInfo: 'R.A.S.'
    };
    onAddMember(simulatedMember as any);
  };

  // Calculations for selected member in drawer
  const getSelectedMemberPayments = () => {
    if (!selectedMember) return [];
    return payments.filter(p => p.memberId === selectedMember.id);
  };

  const getSelectedMemberAttendance = () => {
    if (!selectedMember) return [];
    return attendance.filter(a => a.memberId === selectedMember.id);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-bento-blue">Répertoire des Adhérents</h2>
          <p className="text-xs text-slate-500">Gérez, filtrez et exportez les dossiers sportifs de vos adhérents.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            id="btn-import"
            onClick={handleImportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            {t('import_csv')}
          </button>
          <button 
            id="btn-export"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {t('export_excel')}
          </button>
          <button 
            id="btn-open-add-form"
            onClick={() => {
              setIsEditing(false);
              resetForm();
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-neutral-950 bg-bento-gold hover:bg-bento-gold/90 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            {t('add_member')}
          </button>
        </div>
      </div>

      {/* Search & Filtering Block */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              id="search-members-input"
              type="text" 
              placeholder="Rechercher par nom, n° d'adhérent, téléphone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-50/80 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-bento-blue/25 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100 rounded-xl transition-colors"
              title="Changer de vue"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Filter bar options */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 border-t border-slate-50 pt-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtres :</span>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Statut :</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="All">Tout</option>
              <option value="Active">Actifs</option>
              <option value="Suspended">Suspendus</option>
              <option value="Inactive">Inactifs</option>
            </select>
          </div>

          {/* Sorting filter */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-slate-400">Trier par :</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="name">Nom alphabétique</option>
              <option value="membershipNo">N° d'adhérent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid view of members */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white p-12 text-center border border-slate-100 rounded-3xl shadow-xs">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Aucun adhérent trouvé</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Ajustez vos filtres de recherche ou enregistrez un nouveau membre pour peupler la liste.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              id={`member-card-${member.id}`}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header status + Avatar */}
                <div className="flex justify-between items-start">
                  <div className="relative">
                    <img 
                      src={member.photoUrl} 
                      alt={member.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-50/50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                      }}
                    />
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      member.status === 'Active' ? 'bg-emerald-500' :
                      member.status === 'Suspended' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    member.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    member.status === 'Suspended' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-slate-50 text-slate-600 border border-slate-100'
                  }`}>
                    {member.status === 'Active' ? 'Actif' : member.status === 'Suspended' ? 'Suspendu' : 'Inactif'}
                  </span>
                </div>

                {/* Profile brief */}
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-sm">{member.name}</h4>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    <span className="text-[10px] font-mono text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded-md">
                      {member.membershipNumber}
                    </span>
                    {/* Cloud Sync Status */}
                    {member.id.length > 15 ? (
                      <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                        <Cloud className="w-2.5 h-2.5" /> CLOUD
                      </span>
                    ) : (
                      <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100 flex items-center gap-1">
                        <Database className="w-2.5 h-2.5" /> LOCAL
                      </span>
                    )}
                    {member.jetonId && (
                      <span className="text-[9px] font-mono text-bento-gold font-bold bg-bento-gold/10 border border-bento-gold/20 px-1.5 py-0.5 rounded-md">
                        🎫 {member.jetonId}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid actions */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-4">
                <span className="text-xs font-bold text-slate-700">
                  {member.monthlyFee} {currency} <span className="text-[10px] text-slate-400">/mois</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      setSelectedMember(member);
                      setIsDetailOpen(true);
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
                    title="Voir fiche complète"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleEditClick(member)}
                    className="p-1.5 bg-blue-50/50 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Êtes-vous sûr de vouloir supprimer ${member.name} ?`)) {
                        onDeleteMember(member.id);
                      }
                    }}
                    className="p-1.5 bg-rose-50/50 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List / Table View representation using clean modern glass cards */
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Adhérent</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Téléphone</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Tarif Mensuel</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.photoUrl} 
                          alt={member.name} 
                          className="w-9 h-9 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 block">{member.name}</span>
                            {member.id.length > 25 ? (
                              <span className="text-[7px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100 uppercase">Cloud</span>
                            ) : (
                              <span className="text-[7px] font-black text-rose-500 bg-rose-50 px-1 py-0.2 rounded border border-rose-100 uppercase">Local</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {member.jetonId && (
                              <span className="text-[9px] font-mono text-bento-gold font-bold bg-bento-gold/5 border border-bento-gold/20 px-1 py-0.2 rounded-xs">
                                🎫 {member.jetonId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-600 font-semibold">{member.phone}</td>
                    <td className="p-4 text-xs text-slate-800 font-bold">{member.monthlyFee} {currency}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        member.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        member.status === 'Suspended' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            setSelectedMember(member);
                            setIsDetailOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(member)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Supprimer ${member.name} ?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-over Profile Drawer / Details overlay */}
      {isDetailOpen && selectedMember && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Background backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs transition-opacity" 
              onClick={() => setIsDetailOpen(false)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 md:pl-16">
              <div className="pointer-events-auto w-screen max-w-2xl transform bg-white shadow-2xl transition-all duration-300 ease-in-out">
                
                {/* Drawer header */}
                <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl">
                      <Users className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-display font-bold text-slate-800" id="slide-over-title">
                        Dossier Adhérent complet
                      </h3>
                      <p className="text-xs text-slate-500">N° d'identification : {selectedMember.membershipNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      id="btn-print-qr-member"
                      onClick={() => printMemberQRCard(selectedMember)}
                      className="p-2 bg-white text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimer QR Card
                    </button>
                    <button 
                      onClick={() => setIsDetailOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Drawer content scrolling */}
                <div className="h-[calc(100vh-140px)] overflow-y-auto p-6 space-y-6">
                  {/* Photo Profile Hero */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 bg-linear-to-r from-blue-50/50 to-indigo-50/30 p-5 rounded-3xl border border-blue-100/20">
                    <img 
                      src={selectedMember.photoUrl} 
                      alt={selectedMember.name} 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedMember.name)}`;
                      }}
                    />
                    <div className="text-center sm:text-left space-y-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h4 className="text-lg font-display font-bold text-slate-800">{selectedMember.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedMember.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                          selectedMember.status === 'Suspended' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'
                        }`}>
                          {selectedMember.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{selectedMember.birthDate}</p>
                      
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {selectedMember.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {selectedMember.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Club information - simplified section */}
                  <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100">
                    <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-blue-500" />
                      Détails de l'adhérent
                    </h4>
                    <div className="space-y-2.5 text-xs text-slate-600">
                      <div>
                        <strong className="block text-slate-400">Badge RFID (Jeton ID) :</strong>
                        {selectedMember.jetonId ? (
                          <span className="font-mono text-bento-gold bg-bento-gold/10 border border-bento-gold/25 px-2 py-0.5 rounded font-bold text-xs inline-block mt-0.5">{selectedMember.jetonId}</span>
                        ) : (
                          <span className="text-slate-400 italic">Aucun jeton lié</span>
                        )}
                      </div>
                      <div>
                        <strong className="block text-slate-400">Tarif de cotisation :</strong>
                        <span className="font-bold text-slate-800">{selectedMember.monthlyFee} {currency} / mois</span>
                      </div>
                      <div>
                        <strong className="block text-slate-400">Notes médicales :</strong>
                        <span className="text-slate-700">{selectedMember.medicalNotes || 'Aucune contre-indication renseignée.'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment History timeline */}
                  <div className="space-y-3">
                    <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      Historique des cotisations réglées
                    </h4>
                    
                    <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                      {getSelectedMemberPayments().length === 0 ? (
                        <div className="p-4 text-center text-slate-400 italic">Aucun règlement enregistré.</div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {getSelectedMemberPayments().map(p => (
                            <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-50/40">
                              <div>
                                <span className="font-bold text-slate-700">Cotisation {p.month} {p.year}</span>
                                <span className="block text-[10px] text-slate-400">{p.date} • Reçu : {p.receiptNumber}</span>
                              </div>
                              <span className="font-mono font-bold text-emerald-600">+{p.amount} {currency}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendance Log history */}
                  <div className="space-y-3">
                    <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                      Présences enregistrées (Pointages)
                    </h4>
                    
                    <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                      {getSelectedMemberAttendance().length === 0 ? (
                        <div className="p-4 text-center text-slate-400 italic">Aucun passage enregistré.</div>
                      ) : (
                        <div className="divide-y divide-slate-50 max-h-[180px] overflow-y-auto">
                          {getSelectedMemberAttendance().map(a => (
                            <div key={a.id} className="p-3 flex items-center justify-between hover:bg-slate-50/40">
                              <div>
                                <span className="font-bold text-slate-700 capitalize">{a.status === 'Present' ? 'Présent' : a.status === 'Late' ? 'En retard' : 'Absent'}</span>
                                <span className="block text-[10px] text-slate-400">{a.date} à {a.time}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                                a.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                                a.status === 'Late' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                              }`}>{a.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creation & Editing Modal dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
              onClick={() => setIsFormOpen(false)}
            />

            <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-slate-100">
              
              {/* Modal header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-base font-display font-bold text-bento-blue" id="modal-title">
                  {isEditing ? t('edit_member_title') : t('new_member_title')}
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
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  
                  {/* Two column layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Nom Complet *</label>
                      <input 
                        id="form-name-input"
                        type="text" 
                        required
                        placeholder="Ex: Yacine Brahimi"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Birth Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Date de Naissance *</label>
                      <input 
                        id="form-birthdate-input"
                        type="date" 
                        required
                        value={formData.birthDate}
                        onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Téléphone *</label>
                      <input 
                        id="form-phone-input"
                        type="text" 
                        required
                        placeholder="Ex: 0552 41 82 93"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Adresse de résidence</label>
                      <input 
                        id="form-address-input"
                        type="text" 
                        placeholder="Ex: 12 Rue Larbi Ben M'hidi, Oran"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Statut initial</label>
                      <select 
                        id="form-status-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Active">Actif</option>
                        <option value="Suspended">Suspendu</option>
                        <option value="Inactive">Inactif</option>
                      </select>
                    </div>

                    {/* Monthly Fee */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Cotisation mensuelle (DZD)</label>
                      <input 
                        id="form-fee-input"
                        type="number" 
                        required
                        value={formData.monthlyFee}
                        onChange={(e) => setFormData({...formData, monthlyFee: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Jeton ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">ID Jeton RFID / NFC (Optionnel)</label>
                      <input 
                        id="form-jeton-input"
                        type="text" 
                        placeholder="Ex: JETON-YACINE-01"
                        value={formData.jetonId}
                        onChange={(e) => setFormData({...formData, jetonId: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono"
                      />
                    </div>

                    {/* Photo de Profil */}
                    <div className="md:col-span-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-bento-gold" />
                        Photo de profil de l'athlète
                      </label>
                      
                      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                        {/* Left Column: Big Circular Preview */}
                        <div className="relative group shrink-0">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-bento-gold bg-slate-100 shadow-md flex items-center justify-center relative">
                            {formData.photoUrl ? (
                              <img 
                                src={formData.photoUrl} 
                                alt="Aperçu" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.name || 'Athlète')}`;
                                }}
                              />
                            ) : (
                              <div className="text-slate-400 flex flex-col items-center">
                                <Users className="w-8 h-8 opacity-60 text-bento-blue" />
                                <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Vide</span>
                              </div>
                            )}
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          
                          {formData.photoUrl && (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                              className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-colors"
                              title="Supprimer la photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Right Column: Upload options & preset grid */}
                        <div className="flex-1 space-y-3 w-full">
                          
                          {/* Tab selection */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Drag and Drop Zone */}
                            <div 
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDraggingPhoto(true);
                              }}
                              onDragLeave={() => setIsDraggingPhoto(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingPhoto(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handlePhotoUpload(e.dataTransfer.files[0]);
                                }
                              }}
                              onClick={() => document.getElementById('file-photo-uploader')?.click()}
                              className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[90px] ${
                                isDraggingPhoto 
                                  ? 'border-bento-gold bg-bento-gold/5' 
                                  : 'border-slate-200 hover:border-bento-blue/40 hover:bg-slate-50'
                              }`}
                            >
                              <input 
                                id="file-photo-uploader"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handlePhotoUpload(e.target.files[0]);
                                  }
                                }}
                              />
                              <UploadCloud className="w-5 h-5 text-bento-blue/70 mb-1" />
                              <span className="text-[10px] font-bold text-slate-700 block">Glisser ou Cliquer pour charger</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">Fichier image (Max 5Mo)</span>
                            </div>

                            {/* Preset Selection & custom URL */}
                            <div className="space-y-1.5 flex flex-col justify-between">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 block">⚡ Modèles d'avatars rapides</span>
                                <div className="grid grid-cols-4 gap-1">
                                  {[
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
                                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
                                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
                                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
                                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop',
                                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
                                    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop',
                                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop'
                                  ].map((url, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, photoUrl: url }))}
                                      className={`w-7 h-7 rounded-full overflow-hidden border transition-all hover:scale-105 active:scale-95 shrink-0 ${
                                        formData.photoUrl === url ? 'border-bento-gold ring-2 ring-bento-gold/30' : 'border-slate-200'
                                      }`}
                                    >
                                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Custom URL Option */}
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 py-0.5">
                              <Link className="w-3 h-3 text-slate-400" />
                            </span>
                            <input 
                              type="text"
                              placeholder="Ou collez l'adresse URL d'une photo externe..."
                              value={formData.photoUrl.startsWith('data:') ? '' : formData.photoUrl}
                              onChange={(e) => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                              className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-bento-blue/20"
                            />
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Medical Notes */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Notes Médicales / Contre-indications</label>
                      <textarea 
                        id="form-medical-input"
                        placeholder="Ex: Asthme d'effort léger, allergie aspirine..."
                        value={formData.medicalNotes}
                        onChange={(e) => setFormData({...formData, medicalNotes: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 h-16"
                      />
                    </div>

                    {/* Info Urgence Additionnelle */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Autres Infos d'Urgence</label>
                      <input 
                        id="form-emergency-info-input"
                        type="text" 
                        placeholder="Ex: Allergies, etc."
                        value={formData.emergencyInfo}
                        onChange={(e) => setFormData({...formData, emergencyInfo: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100 rounded-b-3xl">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    id="btn-submit-member-form"
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-bento-blue hover:bg-bento-gold hover:text-bento-blue rounded-xl shadow-xs transition-all"
                  >
                    {t('save')}
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
