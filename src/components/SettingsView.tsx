/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, Save, Globe, DollarSign, Database, Moon, Sun, ShieldAlert,
  Download, RefreshCw, Landmark, Heart, Sparkles, Smile, Shield, CheckCircle
} from 'lucide-react';
import { ClubSettings } from '../types';
import { resetStoredData } from '../utils/mockData';

interface SettingsViewProps {
  settings: ClubSettings;
  t: (key: string) => string;
  onUpdateSettings: (newSettings: Partial<ClubSettings>) => void;
  onResetDatabase: () => void;
  onTriggerBackup: () => void;
}

export default function SettingsView({
  settings,
  t,
  onUpdateSettings,
  onResetDatabase,
  onTriggerBackup
}: SettingsViewProps) {
  // Local state copy
  const [clubName, setClubName] = useState(settings.clubName);
  const [clubLogo, setClubLogo] = useState(settings.clubLogo);
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState(settings.defaultMonthlyFee);
  const [currency, setCurrency] = useState(settings.currency);
  const [language, setLanguage] = useState(settings.language);
  const [theme, setTheme] = useState(settings.theme);

  // Coach Account State
  const [coachUsername, setCoachUsername] = useState(settings.coachUsername || 'coach');
  const [coachPassword, setCoachPassword] = useState(settings.coachPassword || 'password');
  const [requireCoachPassword, setRequireCoachPassword] = useState(settings.requireCoachPassword || false);

  // Success message state
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      clubName,
      clubLogo,
      defaultMonthlyFee,
      currency,
      language,
      theme,
      coachUsername,
      coachPassword,
      requireCoachPassword
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-bento-blue">Configuration Système</h2>
          <p className="text-xs text-slate-500">Ajustez les métadonnées de l'association sportive, la langue de travail et les sauvegardes.</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-scale-in">
          <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
          <span>Paramètres sauvegardés avec succès ! Les modifications ont été appliquées.</span>
        </div>
      )}

      {/* Grid of options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* General Club profile card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="font-display font-bold text-bento-blue text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <Landmark className="w-4 h-4 text-bento-gold" />
              Informations Administratives
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Club Name */}
              <div>
                <label className="block font-bold text-slate-600 mb-1.5">{t('settings_club_name')} *</label>
                <input 
                  id="settings-clubname-input"
                  type="text" 
                  required
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:ring-2 focus:ring-bento-blue/20"
                />
              </div>







              {/* Language Selector */}
              <div>
                <label className="block font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {t('settings_language')}
                </label>
                <select 
                  id="settings-lang-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="fr">Français (French)</option>
                  <option value="en">English (English)</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>



            </div>

            {/* Coach Account Configuration */}
            <div className="border-t border-slate-100 pt-5 mt-5">
              <h3 className="font-display font-bold text-bento-blue text-xs flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-bento-gold" />
                Compte Entraîneur (Coach)
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block">Exiger une authentification</span>
                    <span className="text-[10px] text-slate-400">Demander un nom d'utilisateur et un mot de passe pour passer en mode Coach</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      id="toggle-require-password"
                      type="checkbox" 
                      checked={requireCoachPassword} 
                      onChange={(e) => setRequireCoachPassword(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bento-gold"></div>
                  </label>
                </div>

                {requireCoachPassword && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-scale-in">
                    <div>
                      <label className="block font-bold text-slate-600 mb-1.5">Nom d'utilisateur du Coach</label>
                      <input 
                        id="coach-username-input"
                        type="text" 
                        required={requireCoachPassword}
                        value={coachUsername}
                        onChange={(e) => setCoachUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:ring-2 focus:ring-bento-gold/20 bg-white"
                        placeholder="Ex: coach"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-600 mb-1.5">Mot de passe du Coach</label>
                      <input 
                        id="coach-password-input"
                        type="password" 
                        required={requireCoachPassword}
                        value={coachPassword}
                        onChange={(e) => setCoachPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:ring-2 focus:ring-bento-gold/20 bg-white"
                        placeholder="Ex: 123456"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-end">
              <button 
                id="btn-submit-settings-form"
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-bento-gold hover:bg-bento-gold-dark text-xs font-bold text-bento-blue rounded-xl shadow-md transition-all cursor-pointer border border-bento-gold/20"
              >
                <Save className="w-4 h-4" />
                Enregistrer la configuration
              </button>
            </div>
          </form>
        </div>

        {/* Database administration & Backup panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
          <h3 className="font-display font-bold text-rose-600 text-sm flex items-center gap-2 border-b border-slate-50 pb-3">
            <Database className="w-4 h-4 text-rose-500" />
            Administration des Données
          </h3>

          <div className="space-y-4 text-xs">
            <p className="text-slate-500 leading-relaxed">
              Pour des raisons de sécurité, vous pouvez à tout moment exporter une copie cryptée de votre base de données locale ou réinitialiser le système à l'état de livraison d'usine.
            </p>

            {/* Backup Button */}
            <div className="p-3 bg-bento-blue/5 border border-bento-blue/10 rounded-2xl">
              <span className="font-bold text-bento-blue block">Sauvegarde locale</span>
              <p className="text-[10px] text-slate-400 mt-1">Téléchargez un instantané physique JSON de vos adhérents, cotisations, dépenses et pointages.</p>
              <button 
                id="btn-trigger-backup"
                onClick={onTriggerBackup}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-bento-blue/10 hover:bg-bento-blue/20 text-bento-blue font-bold rounded-xl transition-all mt-3 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                {t('backup_data')}
              </button>
            </div>

            {/* Factory Restore Button */}
            <div className="p-3 bg-rose-50/20 border border-rose-100/30 rounded-2xl">
              <span className="font-bold text-rose-700 block">Réinitialisation complète</span>
              <p className="text-[10px] text-slate-400 mt-1">Effacez toutes les modifications de test et restaurez l'annuaire d'origine avec les données de démonstration.</p>
              <button 
                id="btn-factory-reset"
                onClick={() => {
                  if (confirm("ATTENTION : Cette action effacera de manière irréversible toutes vos modifications de test, nouveaux membres et cotisations enregistrées pour réinitialiser les données de démonstration. Voulez-vous continuer ?")) {
                    onResetDatabase();
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-all mt-3 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restaurer les données d'origine
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Decorative Brand footer */}
      <div className="text-center py-6 text-xs text-slate-400 font-medium">
        <span>Conçu de manière artisanale pour <strong>{clubName}</strong> par Google AI Studio • Version 2.0.26</span>
      </div>

    </div>
  );
}

// Simple Helper Icon
function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
