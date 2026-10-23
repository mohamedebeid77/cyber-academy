import { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, User, Gauge, Database, AlertTriangle, Info } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Card, ConfirmButton, PageHeader } from '../components/ui';
import { downloadJson, storageUsageBytes } from '../services/storage';
import { formatDuration } from '../utils/format';
import type { AppData } from '../types';

export default function SettingsPage() {
  const { data, updateSettings, importData, resetProgress, resetAll, stats, academy } = useAcademy();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const usageKb = (storageUsageBytes(academy.storageKey) / 1024).toFixed(1);

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData;
        if (!parsed || parsed.version !== 1 || !parsed.progress) {
          setImportMsg({ ok: false, text: 'Not a valid academy backup (missing version/progress).' });
          return;
        }
        importData(parsed);
        setImportMsg({ ok: true, text: 'Backup imported successfully.' });
      } catch {
        setImportMsg({ ok: false, text: 'Could not parse the file as JSON.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-up">
      <PageHeader kicker="system" title="Settings" sub="Profile, data backup and application state. Everything lives in your browser's local storage — export regularly." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="section-title mb-3 flex items-center gap-2">
            <User size={14} /> Profile
          </div>
          <label className="label">Display name</label>
          <input className="input" value={data.settings.userName} onChange={(e) => updateSettings({ userName: e.target.value })} />
          <div className="mt-3 flex items-center gap-2 text-xs text-muted">
            <Gauge size={13} />
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={data.settings.reduceMotion}
                onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
                className="accent-acc"
              />
              Reduce motion & animations
            </label>
          </div>
        </Card>

        <Card>
          <div className="section-title mb-3 flex items-center gap-2">
            <Database size={14} /> Backup & restore
          </div>
          <div className="space-y-2.5">
            <button
              className="btn-primary w-full justify-start"
              onClick={() => downloadJson(`${academy.strings.backupPrefix}-backup-${new Date().toISOString().slice(0, 10)}.json`, data)}
            >
              <Download size={15} /> Export full backup (progress + notes + content)
            </button>
            <button
              className="btn-ghost w-full justify-start"
              onClick={() =>
                downloadJson(`${academy.strings.backupPrefix}-progress-${new Date().toISOString().slice(0, 10)}.json`, {
                  version: 1,
                  progress: data.progress
                })
              }
            >
              <Download size={15} /> Export progress only
            </button>
            <button className="btn-ghost w-full justify-start" onClick={() => fileRef.current?.click()}>
              <Upload size={15} /> Import backup…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImport(f);
                e.target.value = '';
              }}
            />
            {importMsg && (
              <div className={`text-xs ${importMsg.ok ? 'text-acid' : 'text-danger'}`}>{importMsg.text}</div>
            )}
          </div>
          <div className="mt-4 border-t border-line pt-3 font-mono text-[11px] text-dim">
            storage used: {usageKb} KB · {stats.completedLessons} lessons · {data.notes.length} notes ·{' '}
            {formatDuration(stats.studyTotal)} studied
          </div>
        </Card>

        <Card className="lg:col-span-2 !border-danger/30">
          <div className="section-title mb-3 flex items-center gap-2 text-danger">
            <AlertTriangle size={14} /> Danger zone
          </div>
          <div className="flex flex-wrap gap-3">
            <ConfirmButton onConfirm={resetProgress} confirmLabel="Click again — erases ALL progress">
              <RotateCcw size={14} /> Reset progress
            </ConfirmButton>
            <ConfirmButton onConfirm={resetAll} confirmLabel="Click again — erases EVERYTHING">
              <RotateCcw size={14} /> Reset everything (progress + notes + custom content)
            </ConfirmButton>
          </div>
          <p className="mt-3 text-xs text-muted">
            Resetting cannot be undone. Export a backup first — the buttons above never ask twice.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <div className="section-title mb-2 flex items-center gap-2">
            <Info size={14} /> About
          </div>
          <p className="text-sm leading-relaxed text-muted">
            {academy.strings.aboutText}
          </p>
        </Card>
      </div>
    </div>
  );
}
