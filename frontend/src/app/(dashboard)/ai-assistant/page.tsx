'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  Zap,
  Terminal,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Clock,
  Sparkles,
  RotateCcw,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ChatMessage, ToolExecutionRecord } from '@/types';
import { formatNumber } from '@/lib/utils';

const initialMessages: ChatMessage[] = [
  {
    id: 'msg-01',
    role: 'assistant',
    content: `Hello Officer Sharma. I am **ResQFlow AI**, your operational emergency copilot for the North Bihar Monsoon Flood response.\n\nAll my responses are strictly grounded in live PostgreSQL records, Open-Meteo precipitation telemetry, and OSRM route calculations. I never hallucinate inventory counts or bypass supervisor approval gates.\n\nHow can I assist your operations center today?`,
    timestamp: '12:00 PM',
  },
  {
    id: 'msg-02',
    role: 'user',
    content: `Which affected locations have critical shortages and require immediate assistance?`,
    timestamp: '12:02 PM',
  },
  {
    id: 'msg-03',
    role: 'assistant',
    content: `I queried our active incident database and calculated village urgency rankings based on population vulnerability and road submergence.\n\n**Immediate Critical Locations:**\n1. **Darbhanga Lowland Settlement (Biraul):** 18,600 affected. Urgent need for **15,000L water** and **5,500 food packets**. State Highway 88 is completely submerged.\n2. **Supaul Village Ward 4:** 14,200 affected. Kosi embankment breached. Need for **12,000L water** and **4,200 rations**.\n\nI recommend prioritizing Muzaffarpur North Staging Depot WH-MUZ-02 for amphibious boat dispatch to Darbhanga immediately.`,
    timestamp: '12:02 PM',
    toolCalls: [
      {
        id: 'tc-01',
        toolName: 'getActiveIncidents',
        inputParameters: { state: 'Bihar', status: 'ACTIVE' },
        outputResult: { count: 2, criticalIncident: 'North Bihar Monsoon Deluge 2026' },
        durationMs: 42,
        timestamp: '12:02:01',
        status: 'SUCCESS'
      },
      {
        id: 'tc-02',
        toolName: 'getAffectedLocations',
        inputParameters: { incidentId: 'inc-bihar-2026-01', urgency: 'CRITICAL' },
        outputResult: {
          resultsCount: 2,
          criticalDistricts: ['Darbhanga', 'Supaul'],
          combinedPopulation: 32800
        },
        durationMs: 64,
        timestamp: '12:02:02',
        status: 'SUCCESS'
      }
    ],
    suggestedAction: {
      type: 'VIEW_PLAN',
      label: 'Open Deterministic Allocation Optimizer',
      payload: { locationIds: ['loc-dar-02', 'loc-sup-01'] }
    }
  }
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const samplePrompts = [
    'Which warehouse has the most available water?',
    'Prepare an emergency distribution plan for Darbhanga',
    'Explain why Muzaffarpur was prioritized over Patna',
    'Show pending relief orders awaiting my approval'
  ];

  const handleSend = (text?: string) => {
    const query = text || inputPrompt;
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsProcessing(true);

    setTimeout(() => {
      let replyContent = '';
      let tools: ToolExecutionRecord[] = [];

      if (query.toLowerCase().includes('warehouse') || query.toLowerCase().includes('water')) {
        tools = [
          {
            id: `tc-${Date.now()}-1`,
            toolName: 'getWarehouseInventory',
            inputParameters: { category: 'WATER' },
            outputResult: {
              topWarehouse: 'Patna Central Relief Superhub (WH-PAT-01)',
              availableLiters: 42000,
              reservedLiters: 8000,
              muzaffarpurAvailable: 21500
            },
            durationMs: 58,
            timestamp: new Date().toLocaleTimeString(),
            status: 'SUCCESS'
          }
        ];
        replyContent = `According to live stock records in PostgreSQL:\n\n**Patna Central Relief Superhub (WH-PAT-01)** holds the largest reserve of potable water with **42,000 Liters available** (8,000L currently reserved for active orders).\n\n**Muzaffarpur North Depot (WH-MUZ-02)** holds **21,500 Liters** and is situated significantly closer to the northern flood belt (58 km vs 184 km to Darbhanga).`;
      } else {
        tools = [
          {
            id: `tc-${Date.now()}-2`,
            toolName: 'optimizeReliefAllocation',
            inputParameters: { incidentId: 'inc-bihar-2026-01', algorithm: 'GREEDY_CONSTRAINED' },
            outputResult: {
              planId: 'plan-opt-2026-07-31-01',
              servedLocations: 3,
              fulfillmentRate: '79.6%'
            },
            durationMs: 112,
            timestamp: new Date().toLocaleTimeString(),
            status: 'SUCCESS'
          }
        ];
        replyContent = `I executed the deterministic allocation algorithm across our active staging depots:\n\n- **Darbhanga Settlement:** Allocated 4,000 rations and 10,000L water from Muzaffarpur via Rescue Boat.\n- **Supaul Ward 4:** Allocated 3,500 rations and 8,000L water from Patna Superhub reserves.\n\nA draft order **ORD-2026-002** has been synthesized in PostgreSQL and is currently held in \`PENDING_APPROVAL\` status awaiting your authorization.`;
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: tools,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>ResQFlow AI Operations Assistant</span>
              <span className="text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
                Gemini 2.5 Pro Agent
              </span>
            </h2>
            <p className="text-xs text-slate-400">Strictly tool-assisted reasoning with database validation</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Zero Hallucination Guardrail Active</span>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div
                  className={`p-4 rounded-xl border ${
                    isUser
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20 rounded-tr-none'
                      : 'glass-panel text-slate-200 border-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Tool Call Traces */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-cyan-400" />
                        <span>Executed Backend Tools ({msg.toolCalls.length})</span>
                      </div>

                      {msg.toolCalls.map((tc) => {
                        const isExpanded = expandedToolId === tc.id;
                        return (
                          <div
                            key={tc.id}
                            className="rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedToolId(isExpanded ? null : tc.id)}
                              className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span className="text-cyan-300 font-semibold">{tc.toolName}</span>
                                <span className="text-slate-400 text-[10px]">({tc.durationMs}ms)</span>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="px-3 py-2 border-t border-slate-900 bg-black/40 text-slate-300 space-y-1">
                                <div className="text-slate-400 text-[10px]">Inputs:</div>
                                <pre className="text-[10px] text-amber-300 overflow-x-auto">
                                  {JSON.stringify(tc.inputParameters, null, 2)}
                                </pre>
                                <div className="text-slate-400 text-[10px] mt-1">Output Result:</div>
                                <pre className="text-[10px] text-emerald-300 overflow-x-auto">
                                  {JSON.stringify(tc.outputResult, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Suggested Action Button */}
                  {msg.suggestedAction && (
                    <div className="mt-3 pt-2">
                      <Link
                        href="/relief-plans"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{msg.suggestedAction.label}</span>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 px-1">{msg.timestamp}</div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-panel p-3 rounded-xl border border-slate-800 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 font-mono text-[11px]">Querying database tools and evaluating routes...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompts Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Suggestions:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="glass-panel p-2 rounded-xl flex items-center gap-2 border border-slate-800">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask ResQFlow AI (e.g., 'Generate relief distribution plan for affected villages')..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isProcessing}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
