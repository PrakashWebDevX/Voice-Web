'use client';

import { useState, useCallback } from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, Download, BookOpen, ChevronDown, ChevronUp,
  Code2, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const CODE_TYPE_LANGUAGE: Record<string, Language> = {
  'html-website': 'markup',
  'react-component': 'tsx',
  'nextjs-page': 'tsx',
  'node-express-api': 'typescript',
  'python-script': 'python',
  'arduino-code': 'cpp',
  'full-stack': 'markdown',
};

const CODE_TYPE_LABEL: Record<string, string> = {
  'html-website': 'HTML/CSS/JS',
  'react-component': 'React TSX',
  'nextjs-page': 'Next.js',
  'node-express-api': 'TypeScript',
  'python-script': 'Python',
  'arduino-code': 'Arduino C++',
  'full-stack': 'Full Stack',
};

interface CodeEditorProps {
  code: string;
  codeType: string;
  title: string;
  explanation?: string;
  onExplain?: () => void;
  onDownload?: () => void;
  isExplaining?: boolean;
  streaming?: boolean;
}

export default function CodeEditor({
  code,
  codeType,
  title,
  explanation,
  onExplain,
  onDownload,
  isExplaining,
  streaming = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const language = CODE_TYPE_LANGUAGE[codeType] || 'typescript';
  const lineCount = code.split('\n').length;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border overflow-hidden bg-surface shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-2 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="h-4 w-px bg-border" />
          <Code2 size={14} className="text-acid" />
          <span className="font-mono text-sm text-white/80 truncate max-w-[240px]">
            {title}
          </span>
          <span className="text-xs font-mono text-muted px-2 py-0.5 bg-surface-3 rounded border border-border">
            {CODE_TYPE_LABEL[codeType] || codeType}
          </span>
          {streaming && (
            <span className="text-xs font-mono text-acid animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-acid rounded-full animate-pulse" />
              generating
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-subtle mr-2">
            {lineCount} lines
          </span>

          {onExplain && (
            <button
              onClick={() => {
                onExplain();
                setShowExplanation(true);
              }}
              disabled={isExplaining}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-muted hover:text-white bg-surface hover:bg-surface-3 border border-border hover:border-border-bright rounded transition-all disabled:opacity-50"
            >
              <BookOpen size={12} />
              {isExplaining ? 'Explaining…' : 'Explain'}
            </button>
          )}

          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-muted hover:text-acid bg-surface hover:bg-acid/10 border border-border hover:border-acid/40 rounded transition-all"
            >
              <Download size={12} />
              ZIP
            </button>
          )}

          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded border transition-all',
              copied
                ? 'text-acid border-acid/40 bg-acid/10'
                : 'text-muted hover:text-white border-border hover:border-border-bright bg-surface hover:bg-surface-3'
            )}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-muted hover:text-white rounded border border-border hover:border-border-bright bg-surface hover:bg-surface-3 transition-all"
          >
            {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>
      </div>

      {/* Code */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-[60vh] overflow-auto">
              <Highlight
                theme={customTheme}
                code={code.trim()}
                language={language}
              >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre
                    className={cn(className, 'p-4 text-[13px] leading-relaxed')}
                    style={{ ...style, background: 'transparent', margin: 0 }}
                  >
                    {tokens.map((line, i) => (
                      <div
                        key={i}
                        {...getLineProps({ line })}
                        className="flex"
                      >
                        <span className="select-none text-subtle w-8 shrink-0 text-right pr-4 font-mono text-xs leading-relaxed">
                          {i + 1}
                        </span>
                        <span>
                          {line.map((token, j) => (
                            <span key={j} {...getTokenProps({ token })} />
                          ))}
                        </span>
                      </div>
                    ))}
                    {streaming && (
                      <div className="flex">
                        <span className="select-none text-subtle w-8 shrink-0 text-right pr-4 font-mono text-xs" />
                        <span className="text-acid animate-pulse">█</span>
                      </div>
                    )}
                  </pre>
                )}
              </Highlight>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation panel */}
      <AnimatePresence>
        {showExplanation && explanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 bg-surface-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-acid" />
                  <span className="text-sm font-mono text-acid">Code Explanation</span>
                </div>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="text-xs text-muted hover:text-white font-mono"
                >
                  hide
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none font-mono text-sm text-white/80 leading-relaxed">
                <ExplanationRenderer text={explanation} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Simple markdown-to-JSX renderer for explanation
function ExplanationRenderer({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-acid font-bold mt-3 mb-1">{line.slice(3)}</h3>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 text-white/70 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith('`') && line.endsWith('`')) {
          return <code key={i} className="text-acid bg-acid/10 px-1 rounded">{line.slice(1, -1)}</code>;
        }
        return <p key={i} className="text-white/70">{line}</p>;
      })}
    </div>
  );
}

// Custom dark terminal theme for Prism
const customTheme = {
  ...themes.vsDark,
  plain: {
    color: '#e8e8e8',
    backgroundColor: '#111111',
  },
  styles: [
    ...themes.vsDark.styles,
    {
      types: ['keyword', 'operator'],
      style: { color: '#39FF14' },
    },
    {
      types: ['string', 'attr-value'],
      style: { color: '#ffd700' },
    },
    {
      types: ['function', 'method'],
      style: { color: '#7dd3fc' },
    },
    {
      types: ['comment'],
      style: { color: '#555555', fontStyle: 'italic' as const },
    },
    {
      types: ['class-name', 'maybe-class-name'],
      style: { color: '#f97316' },
    },
    {
      types: ['number', 'boolean'],
      style: { color: '#c084fc' },
    },
    {
      types: ['tag'],
      style: { color: '#39FF14' },
    },
    {
      types: ['attr-name'],
      style: { color: '#7dd3fc' },
    },
  ],
};
