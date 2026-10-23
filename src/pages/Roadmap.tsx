import { Link } from 'react-router-dom';
import { useAcademy } from '../context/AcademyContext';
import { PageHeader, ProgressBar } from '../components/ui';
import { classNames } from '../utils/format';

export default function Roadmap() {
  const { modules, moduleCompletion, roadmapStages: STAGES, base, academy } = useAcademy();

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="the complete journey"
        title="Roadmap"
        sub={`Every stage of the ${academy.name} journey, in order. Click a stage to open its module.`}
      />
      <div className="relative mx-auto max-w-3xl">
        <div className="absolute bottom-6 left-[22px] top-6 w-px bg-gradient-to-b from-acid via-cyan to-violet opacity-40" />
        <div className="space-y-4">
          {STAGES.map((stage, i) => {
            const stageModules = stage.moduleIds.map((id) => modules.find((m) => m.id === id)).filter(Boolean) as typeof modules;
            const avg = stageModules.length
              ? Math.round(stageModules.reduce((a, m) => a + moduleCompletion(m.id), 0) / stageModules.length)
              : 0;
            const done = avg === 100;
            return (
              <div key={stage.name} className="relative flex gap-6">
                <div
                  className={classNames(
                    'z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 font-mono text-xs font-bold',
                    done ? 'border-acid bg-acid/15 text-acid shadow-glow' : avg > 0 ? 'border-cyan bg-cyan/10 text-cyan' : 'border-line bg-panel text-dim'
                  )}
                >
                  {done ? '✓' : String(i + 1).padStart(2, '0')}
                </div>
                <div className="card card-hover min-w-0 flex-1 !p-4">
                  {stageModules.map((m) => (
                    <Link key={m.id} to={`${base}/path/module/${m.id}`} className="group block rounded-lg p-1.5 -mx-1.5 hover:bg-panel2/60">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-semibold group-hover:text-acid">{m.title}</div>
                          <div className="mt-0.5 text-xs text-muted">{m.description}</div>
                        </div>
                        <span className="shrink-0 font-mono text-xs text-dim">{moduleCompletion(m.id)}%</span>
                      </div>
                      <ProgressBar value={moduleCompletion(m.id)} className="mt-2" color={done ? 'acid' : 'cyan'} />
                    </Link>
                  ))}
                  {stageModules.length === 0 && <div className="p-1.5 text-sm text-dim">{stage.name}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
