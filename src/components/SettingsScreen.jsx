import { useState } from 'react';
import { MY_PROFILE } from '../data/profile';
import { getWeekNumber, getCurrentDose } from '../engine/dayGenerator';
import { showToast } from './Toast';

export default function SettingsScreen({ settings, onUpdateSettings, onResetToday, onResetAll, installPrompt, onInstalled }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const weekNum = getWeekNumber(dateStr);
  const dose = getCurrentDose(weekNum);

  return (
    <div className="px-5 pt-5 pb-24">
      <h1 className="text-xl font-semibold text-charcoal mb-5">Settings</h1>

      {/* Profile summary */}
      <div className="card mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Profile</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Name</span>
            <span className="text-charcoal font-medium">{MY_PROFILE.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Week</span>
            <span className="text-charcoal font-medium">{weekNum}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Current Dose</span>
            <span className="text-medical font-medium">{dose}mg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Protein Target</span>
            <span className="text-charcoal font-medium">{MY_PROFILE.proteinTarget}g</span>
          </div>
        </div>
      </div>

      {/* Wake time default */}
      <div className="card mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Default Wake Time</h3>
        <input
          type="time"
          value={settings.defaultWakeTime || '07:00'}
          onChange={(e) => {
            onUpdateSettings({ defaultWakeTime: e.target.value });
            showToast(`Wake time set to ${e.target.value}`, 'info');
          }}
          style={{ fontSize: '20px', padding: '12px' }}
        />
      </div>

      {/* Work schedule */}
      <div className="card mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Work Schedule</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">From</label>
            <input
              type="time"
              value={settings.workStart || '09:00'}
              onChange={(e) => onUpdateSettings({ workStart: e.target.value })}
              style={{ fontSize: '16px', padding: '10px' }}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">To</label>
            <input
              type="time"
              value={settings.workEnd || '18:00'}
              onChange={(e) => onUpdateSettings({ workEnd: e.target.value })}
              style={{ fontSize: '16px', padding: '10px' }}
            />
          </div>
        </div>
      </div>

      {/* Target Sleep Time */}
      <div className="card mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Target Bedtime</h3>
        <p className="text-xs text-muted mb-2">Evening meals and supplements will be scheduled backwards from this time.</p>
        <input
          type="time"
          value={settings.targetSleepTime || '22:00'}
          onChange={(e) => {
            onUpdateSettings({ targetSleepTime: e.target.value });
            showToast(`Bedtime set to ${e.target.value}`, 'info');
          }}
          style={{ fontSize: '20px', padding: '12px' }}
        />
      </div>

      {/* Current weight */}
      <div className="card mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Current Weight</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={settings.currentWeight || MY_PROFILE.weight}
            onChange={(e) => onUpdateSettings({ currentWeight: Number(e.target.value) })}
            className="w-24 text-lg px-3 py-2 rounded-lg bg-offwhite border border-border text-charcoal"
          />
          <span className="text-sm text-muted">kg</span>
        </div>
      </div>

      {/* Install App */}
      {installPrompt && (
        <div className="card mb-4">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Install App</h3>
          <p className="text-sm text-muted mb-3">Add Protocol OS to your home screen for full offline access.</p>
          <button
            onClick={async () => {
              installPrompt.prompt();
              const result = await installPrompt.userChoice;
              if (result.outcome === 'accepted') onInstalled();
            }}
            className="btn-primary w-full"
          >
            Install to Home Screen
          </button>
        </div>
      )}

      {/* Data Export */}
      <div className="card mb-4">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Export Data</h3>
        <p className="text-sm text-muted mb-3">Download all your protocol data as a JSON file.</p>
        <button
          onClick={() => {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              try { data[key] = JSON.parse(localStorage.getItem(key)); }
              catch { data[key] = localStorage.getItem(key); }
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `protocol-os-backup-${dateStr}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="btn-secondary w-full"
        >
          Download Backup
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-3 mt-8">
        <button onClick={() => { onResetToday(); showToast("Today's progress reset", 'info'); }} className="btn-secondary w-full min-h-[48px]">
          Reset Today's Progress
        </button>

        {!showResetConfirm ? (
          <button onClick={() => setShowResetConfirm(true)} className="w-full text-center py-3 text-sm text-medical">
            Reset All Data
          </button>
        ) : (
          <div className="card border-2 border-medical fade-in">
            <p className="text-sm text-charcoal mb-3">This will delete ALL saved data. Are you sure?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowResetConfirm(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={() => { onResetAll(); setShowResetConfirm(false); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#C47070' }}
              >
                Delete Everything
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-8 text-xs text-muted">
        Protocol OS v2.0 — Personal Build
      </div>
    </div>
  );
}
