/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, Check, X, Megaphone, Calendar, Cake, ShieldAlert, Plus, Trash2 
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsViewProps {
  notifications: AppNotification[];
  t: (key: string) => string;
  onMarkAsRead: (id: string) => void;
  onAddNotification: (newNotif: Omit<AppNotification, 'id' | 'read' | 'date'>) => void;
  onClearAllNotifications: () => void;
}

export default function NotificationsView({
  notifications,
  t,
  onMarkAsRead,
  onAddNotification,
  onClearAllNotifications
}: NotificationsViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'Announcement' | 'Alert' | 'Reminder'>('Announcement');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    onAddNotification({
      title,
      message,
      type
    });

    setIsFormOpen(false);
    setTitle('');
    setMessage('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Alert':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'Reminder':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'Birthday':
        return <Cake className="w-4 h-4 text-purple-500" />;
      default:
        return <Megaphone className="w-4 h-4 text-bento-blue" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'Alert':
        return 'bg-rose-50';
      case 'Reminder':
        return 'bg-amber-50';
      case 'Birthday':
        return 'bg-purple-50';
      default:
        return 'bg-bento-blue/5';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-bento-blue">Alertes & Annonces Club</h2>
          <p className="text-xs text-slate-500">
            Broadcastez des annonces importantes aux athlètes et gérez les alertes administratives de retard ou d'expiration.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button 
            onClick={onClearAllNotifications}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
          >
            Tout effacer
          </button>
          <button 
            id="btn-open-announcement-form"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-bento-blue hover:bg-bento-gold hover:text-bento-blue rounded-xl shadow-xs transition-all"
          >
            <Megaphone className="w-4 h-4" />
            Créer un communiqué
          </button>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts feed list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Centre de notifications ({notifications.length})</div>
          
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                id={`notification-card-${notif.id}`}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  notif.read 
                    ? 'bg-white border-slate-100 opacity-70' 
                    : 'bg-white border-blue-100 shadow-xs ring-1 ring-blue-50/50'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`p-2.5 rounded-xl shrink-0 ${getBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </span>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display font-bold text-slate-800 text-xs">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                    <span className="text-[9px] font-mono text-slate-400 block mt-1">{notif.date}</span>
                  </div>
                </div>

                {!notif.read && (
                  <button 
                    id={`btn-read-${notif.id}`}
                    onClick={() => onMarkAsRead(notif.id)}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 rounded-lg transition-colors shrink-0"
                    title="Marquer comme lu"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-100">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                <p className="text-xs text-slate-400 italic">Aucune alerte en attente dans la boîte de réception.</p>
              </div>
            )}
          </div>
        </div>

        {/* Informational sidebar context */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between h-full min-h-[300px]">
          <div className="space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-sm">Gestion des communiqués</h3>
            <p className="text-[11px] text-slate-400">
              Chaque communiqué diffusé est instantanément enregistré dans l'historique général et visible pour les adhérents.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50 text-xs text-slate-600 space-y-2">
              <span className="font-bold text-slate-700 block">Bonnes Pratiques :</span>
              <p>• Précisez les dates et heures limites de compétition.</p>
              <p>• Gardez les alertes courtes et directes pour un meilleur taux de mémorisation.</p>
              <p>• Pour les anniversaires, une notification est automatiquement générée le jour J !</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center text-xs text-slate-400 font-semibold">
            Canal de communication : <strong>Dojo Central</strong>
          </div>
        </div>

      </div>

      {/* Broadcaster announcement form dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="notif-modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
              onClick={() => setIsFormOpen(false)}
            />

            <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100">
              
              {/* Modal header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-base font-display font-bold text-slate-800" id="notif-modal-title">
                  Créer un communiqué officiel
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
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Sujet de l'annonce *</label>
                    <input 
                      id="form-notif-title-input"
                      type="text" 
                      required
                      placeholder="Ex: Stage de Perfectionnement Judo"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Type de message</label>
                    <select 
                      id="form-notif-type-select"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                    >
                      <option value="Announcement">Megaphone - Communiqué Général</option>
                      <option value="Alert">Danger - Alerte Administrative</option>
                      <option value="Reminder">Calendrier - Rappel d'entraînement</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Corps du message *</label>
                    <textarea 
                      id="form-notif-msg-input"
                      required
                      placeholder="Tapez le texte complet du message ici..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden h-28"
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
                    id="btn-submit-notif-form"
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-bento-blue hover:bg-bento-gold hover:text-bento-blue rounded-xl shadow-xs transition-all"
                  >
                    Diffuser l'annonce
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
