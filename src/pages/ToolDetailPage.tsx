import { Link, useParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Wrench } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Breadcrumb, Card, CopyButton, PageHeader } from '../components/ui';
import { ToolVisual } from '../components/tools/ToolVisual';
import { useMergedTools } from './ToolkitPage';
import { StatusPill } from './ToolkitPage';

export default function ToolDetailPage() {
  const { toolId } = useParams();
  const { lessonMap, base } = useAcademy();
  const all = useMergedTools();
  const tool = all.find((t) => t.id === toolId);
  if (!tool) return <Navigate to={`${base}/toolkit`} replace />;
  const related = tool.relatedLessons.map((id) => lessonMap.get(id)).filter(Boolean);

  return (
    <div className="animate-fade-up">
      <Breadcrumb items={[{ label: 'Toolkit', to: `${base}/toolkit` }, { label: tool.name }]} />
      <PageHeader
        kicker={tool.category}
        title={tool.name}
        sub={tool.purpose}
        actions={
          <div className="flex items-center gap-2">
            <StatusPill status={tool.status} />
            <a href={tool.docsUrl} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
              <ExternalLink size={13} /> Official docs
            </a>
          </div>
        }
      />

      {tool.image ? (
        <figure className="my-4">
          <div className="overflow-hidden rounded-xl border border-line bg-[#050b14]">
            <img
              src={import.meta.env.BASE_URL + 'tool-images/' + tool.image}
              alt={tool.name + ' — interface screenshot'}
              loading="lazy"
              className="block w-full"
            />
          </div>
          <figcaption className="mt-1.5 text-center font-mono text-[10px] text-dim">
            {tool.imageCredit}
          </figcaption>
        </figure>
      ) : (
        tool.visual && <ToolVisual kind={tool.visual} tool={tool} />
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="section-title mb-2 flex items-center gap-1.5">
            <Wrench size={13} /> Installation
          </div>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-line bg-[#050a12] p-3 font-mono text-[12px] text-[#c9d6e4]">
              <code>{tool.install}</code>
            </pre>
            <div className="absolute right-2 top-2">
              <CopyButton text={tool.install} small />
            </div>
          </div>
          <div className="section-title mb-2 mt-5">When to use it</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted marker:text-acid/70">
            {tool.whenToUse.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <div className="section-title mb-2">Usage</div>
          <p className="text-sm leading-relaxed text-muted">{tool.usage}</p>
          <div className="section-title mb-3 mt-5">Common commands</div>
          <div className="overflow-hidden rounded-lg border border-line">
            {tool.commands.map((c, i) => (
              <div key={i} className="flex items-start gap-3 border-b border-line/60 px-4 py-2.5 last:border-0 odd:bg-panel2/30">
                <code className="min-w-0 flex-1 break-all font-mono text-[12.5px] text-acid">{c.cmd}</code>
                <span className="max-w-[45%] text-right text-xs text-muted">{c.desc}</span>
                <CopyButton text={c.cmd} small />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {related.length > 0 && (
        <Card className="mt-4">
          <div className="section-title mb-2">Related lessons</div>
          <div className="flex flex-wrap gap-2">
            {related.map((e) => (
              <Link key={e!.lesson.id} to={`${base}/lesson/${e!.lesson.id}`} className="chip hover:!border-cyan/50 hover:!text-cyan">
                {e!.lesson.title}
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-6">
        <Link to={`${base}/toolkit`} className="btn-ghost btn-sm">
          <ArrowLeft size={14} /> Back to toolkit
        </Link>
      </div>
    </div>
  );
}
