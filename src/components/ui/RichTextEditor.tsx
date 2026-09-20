import React, { useRef } from 'react';
import { Bold, Italic, Heading2, Heading3, List, Quote, Link as LinkIcon } from 'lucide-react';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  description?: string;
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = 'Write content here...',
  rows = 5,
  description,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newValue = `${before}${replacement}${after}`;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
            {label}
          </label>
          {description && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{description}</span>
          )}
        </div>
      )}

      <div className="border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#111111] focus-within:ring-2 focus-within:ring-[#F52F3A]/30 focus-within:border-[#F52F3A] transition-all">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => applyFormat('**', '**')}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('*', '*')}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-zinc-200 dark:bg-white/10 mx-1" />
          <button
            type="button"
            onClick={() => applyFormat('## ')}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('### ')}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-zinc-200 dark:bg-white/10 mx-1" />
          <button
            type="button"
            onClick={() => applyFormat('- ')}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="List Item"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('> ')}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('[', '](https://example.com)')}
            className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-3 bg-transparent text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-y leading-relaxed font-sans"
        />
      </div>
    </div>
  );
}

// Sanitized Rich Content Renderer for Public Views
export function RenderRichText({ content }: { content: string }) {
  if (!content) return null;

  // Simple, secure paragraph and markdown formatter without innerHTML injection
  const paragraphs = content.split('\n\n');

  return (
    <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
      {paragraphs.map((p, pIdx) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={pIdx} className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white pt-2">
              {trimmed.replace('## ', '')}
            </h2>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={pIdx} className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-white pt-1">
              {trimmed.replace('### ', '')}
            </h3>
          );
        }

        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={pIdx}
              className="border-l-2 border-[#F52F3A] pl-4 italic text-zinc-600 dark:text-zinc-400 my-2"
            >
              {trimmed.replace('> ', '')}
            </blockquote>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const lines = trimmed.split('\n');
          return (
            <ul key={pIdx} className="list-disc list-inside space-y-1 my-2">
              {lines.map((l, lIdx) => (
                <li key={lIdx}>{l.replace(/^[-*]\s*/, '')}</li>
              ))}
            </ul>
          );
        }

        return <p key={pIdx}>{trimmed}</p>;
      })}
    </div>
  );
}
