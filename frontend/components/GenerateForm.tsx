'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ChevronDown, LayoutTemplate } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { cn } from '@/lib/utils';

export type CodeType =
  | 'html-website'
  | 'react-component'
  | 'nextjs-page'
  | 'node-express-api'
  | 'python-script'
  | 'arduino-code'
  | 'full-stack';

const CODE_TYPES: { value: CodeType; label: string; icon: string; description: string }[] = [
  { value: 'html-website', label: 'HTML Website', icon: '🌐', description: 'Full static site' },
  { value: 'react-component', label: 'React Component', icon: '⚛️', description: 'Reusable component' },
  { value: 'nextjs-page', label: 'Next.js Page', icon: '▲', description: 'App Router page' },
  { value: 'node-express-api', label: 'Express API', icon: '🟢', description: 'REST API endpoints' },
  { value: 'python-script', label: 'Python Script', icon: '🐍', description: 'Python program' },
  { value: 'arduino-code', label: 'Arduino', icon: '🔌', description: 'Embedded sketch' },
  { value: 'full-stack', label: 'Full Stack', icon: '🏗️', description: 'Complete app' },
];

const TEMPLATES: { label: string; prompt: string; codeType: CodeType }[] = [
  { label: 'Landing Page', prompt: 'Create a modern SaaS landing page with hero section, features grid, pricing table, and CTA. Make it dark themed with gradient accents.', codeType: 'html-website' },
  { label: 'REST API', prompt: 'Build a RESTful Express API for a todo application with CRUD operations, validation, and proper error handling.', codeType: 'node-express-api' },
  { label: 'Dashboard', prompt: 'Create an analytics dashboard React component with charts, KPI cards, and a data table with sorting and filtering.', codeType: 'react-component' },
  { label: 'Auth Page', prompt: 'Build a login/signup page with tabs, form validation, Google OAuth button, and smooth animations using Tailwind.', codeType: 'nextjs-page' },
  { label: 'Data Analyzer', prompt: 'Write a Python script that reads a CSV file, analyzes it for statistics (mean, median, std), and generates a report.', codeType: 'python-script' },
  { label: 'LED Controller', prompt: 'Arduino sketch to control an RGB LED strip via serial commands with fade animations and pattern modes.', codeType: 'arduino-code' },
];

interface GenerateFormProps {
  onGenerate: (prompt: string, codeType: CodeType) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export default function GenerateForm({ onGenerate, isGenerating, disabled }: GenerateFormProps) {
  const [prompt, setPrompt] = useState('');
  const [codeType, setCodeType] = useState<CodeType>('html-website');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedType = CODE_TYPES.find((t) => t.value === codeType)!;

  const handleVoiceTranscript = (text: string) => {
    setPrompt((prev) => (prev ? `${prev} ${text}` : text));
    textareaRef.current?.focus();
  };

  const handleTemplate = (template: (typeof TEMPLATES)[0]) => {
    setPrompt(template.prompt);
    setCodeType(template.codeType);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating || disabled) return;
    onGenerate(prompt.trim(), codeType);
  };

  const charCount = prompt.length;
  const charLimit = 2000;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type selector */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border hover:border-acid/40 rounded-lg text-sm font-mono transition-all"
          >
            <span>{selectedType.icon}</span>
            <span className="text-white/80">{selectedType.label}</span>
            <ChevronDown size={12} className="text-muted" />
          </button>

          <AnimatePresence>
            {showTypeDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full left-0 mt-2 w-56 bg-surface-2 border border-border rounded-xl shadow-2xl z-20 overflow-hidden"
              >
                {CODE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setCodeType(type.value);
                      setShowTypeDropdown(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-surface-3 transition-colors',
                      codeType === type.value && 'bg-acid/10 text-acid'
                    )}
                  >
                    <span className="text-base">{type.icon}</span>
                    <div>
                      <div className="font-mono font-medium">{type.label}</div>
                      <div className="text-xs text-muted">{type.description}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Templates button */}
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-mono border rounded-lg transition-all',
            showTemplates
              ? 'border-acid/40 text-acid bg-acid/10'
              : 'border-border text-muted hover:text-white hover:border-border-bright bg-surface-2'
          )}
        >
          <LayoutTemplate size={14} />
          Templates
        </button>
      </div>

      {/* Templates grid */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => handleTemplate(template)}
                  className="text-left px-3 py-2.5 bg-surface-2 border border-border hover:border-acid/30 hover:bg-acid/5 rounded-lg transition-all group"
                >
                  <div className="text-sm font-mono font-medium text-white/80 group-hover:text-acid transition-colors">
                    {template.label}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {CODE_TYPES.find((t) => t.value === template.codeType)?.label}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, charLimit))}
          placeholder="Describe what you want to build… e.g. 'Create a responsive landing page for a fitness app with dark theme, animated hero, and pricing section'"
          rows={5}
          disabled={isGenerating || disabled}
          className={cn(
            'w-full bg-surface-2 border rounded-xl px-4 py-3 font-mono text-sm text-white/90 placeholder:text-subtle resize-none transition-all outline-none leading-relaxed',
            'border-border focus:border-acid/50 focus:ring-1 focus:ring-acid/20',
            (isGenerating || disabled) && 'opacity-50 cursor-not-allowed'
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
        />
        <div className="absolute bottom-3 right-3 text-xs font-mono text-subtle">
          {charCount}/{charLimit}
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between gap-3">
        <VoiceInput onTranscript={handleVoiceTranscript} disabled={isGenerating || disabled} />

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-subtle hidden sm:block">
            ⌘↵ to generate
          </span>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={!prompt.trim() || isGenerating || disabled}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-lg font-mono text-sm font-bold transition-all',
              !prompt.trim() || isGenerating || disabled
                ? 'bg-surface-2 text-muted border border-border cursor-not-allowed'
                : 'bg-acid text-terminal hover:bg-acid-dim glow-acid'
            )}
          >
            <Wand2 size={15} />
            {isGenerating ? 'Generating…' : 'Generate'}
          </motion.button>
        </div>
      </div>
    </form>
  );
}
