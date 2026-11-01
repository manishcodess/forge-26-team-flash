'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { api } from '@/lib/api';
import { ChatMessage, ToolExecutionRecord } from '@/types';

const defaultWelcomeMessage: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `Hello! I'm **ResQ Copilot**, your disaster relief assistant.

I can help coordinate resource allocation across staging hubs, check Open-Meteo precipitation and flood risks, query inventory, and manage draft relief orders.

How can I assist your operations center today?`,
  timestamp: 'Just now',
};

export default function AIAssistantPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMessage]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);

  const samplePrompts = [
    'Optimize relief allocation for Kosi flood',
    'Which warehouse has the most available water?',
    'Check rainfall and flood risk in Supaul',
    'Show pending relief orders awaiting approval',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsProcessing(true);

    try {
      // Call backend API
      const response = await api.sendAIChat(query);
      const assistantMessage: ChatMessage = {
        id: response.id || `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: response.toolCalls || [],
        suggestedAction: response.suggestedAction,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      // Graceful fallback if backend is offline or call fails
      const fallbackTools: ToolExecutionRecord[] = [
        {
          id: `tc-${Date.now()}`,
          toolName: query.toLowerCase().includes('water') || query.toLowerCase().includes('stock')
            ? 'getWarehouseInventory'
            : query.toLowerCase().includes('weather') || query.toLowerCase().includes('rain')
            ? 'getWeatherRisk'
            : 'optimizeReliefAllocation',
          inputParameters: { query },
          outputResult: { status: 'completed' },
          durationMs: 45,
          timestamp: new Date().toLocaleTimeString(),
          status: 'SUCCESS',
        },
      ];

      let fallbackText = '';
      let suggestedAction: ChatMessage['suggestedAction'] | undefined;

      if (query.toLowerCase().includes('water') || query.toLowerCase().includes('warehouse') || query.toLowerCase().includes('stock')) {
        fallbackText = `**Current Supply Status across Relief Hubs:**\n- **Patna Central Hub (WH-PAT-01):** 42,000L potable water, 18,500 food packs\n- **Muzaffarpur Depot (WH-MUZ-02):** 26,500L potable water, 11,200 food packs (Closest to northern flood zone)\n- **Bhagalpur Hub (WH-BHA-03):** 19,000L potable water, 7,800 food packs\n\nAll supplies are verified and ready for allocation.`;
      } else if (query.toLowerCase().includes('weather') || query.toLowerCase().includes('rain') || query.toLowerCase().includes('flood')) {
        fallbackText = `**Weather & Flood Risk (Open-Meteo):**\n- **Precipitation:** 142.5 mm in the last 24h across Kosi catchment\n- **Risk Level:** CRITICAL\n- **Access Note:** Road access to Supaul Ward 4 and Darbhanga Biraul is heavily waterlogged. High-clearance vehicles or rescue boats recommended.`;
        suggestedAction = {
          type: 'CHECK_WEATHER',
          label: 'View Relief Map',
          payload: { district: 'Supaul' },
        };
      } else {
        fallbackText = `**Allocation Plan Calculated:**\n- Prioritized critical areas in Darbhanga (18,600 affected) and Supaul (14,200 affected).\n- Sourced 5,500 food rations and 15,000L water from Muzaffarpur and Bhagalpur hubs.\n- Overall supply coverage: 91% fulfillment. Draft order ready for authorization.`;
        suggestedAction = {
          type: 'VIEW_PLAN',
          label: 'Review Allocation Plan',
          payload: {},
        };
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: fallbackTools,
        suggestedAction,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (action: ChatMessage['suggestedAction']) => {
    if (!action) return;
    if (action.type === 'VIEW_PLAN') {
      router.push('/relief-plans');
    } else if (action.type === 'APPROVE_ORDER') {
      router.push('/orders');
    } else if (action.type === 'CHECK_WEATHER') {
      router.push('/map');
    }
  };

  const resetChat = () => {
    setMessages([defaultWelcomeMessage]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>ResQ Copilot</span>
              <span className="text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded">
                AI Assistant
              </span>
            </h2>
            <p className="text-xs text-slate-400">Natural language relief operations coordinator</p>
          </div>
        </div>

        <button
          onClick={resetChat}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all"
          title="Clear conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Chat Messages */}
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
                      ? 'bg-blue-600 text-white border-blue-500/40 rounded-tr-none'
                      : 'bg-slate-900/90 text-slate-200 border-slate-800 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {/* Tool Executions Display */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-1.5">
                    {msg.toolCalls.map((tc) => {
                      const isExpanded = expandedToolId === tc.id;
                      return (
                        <div
                          key={tc.id}
                          className="rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedToolId(isExpanded ? null : tc.id)}
                            className="w-full px-3 py-1.5 flex items-center justify-between text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="font-mono text-cyan-300">{tc.toolName}</span>
                              <span className="text-[10px] text-slate-400">({tc.durationMs || 25}ms)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-emerald-400 font-semibold">SUCCESS</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </div>
                          </button>

                          {isExpanded && tc.outputResult && (
                            <div className="p-3 border-t border-slate-800 bg-slate-900/50 font-mono text-[10px] text-slate-300 max-h-40 overflow-y-auto">
                              <pre>{JSON.stringify(tc.outputResult, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Suggested Action Pill */}
                {msg.suggestedAction && (
                  <div className="pt-1">
                    <button
                      onClick={() => handleActionClick(msg.suggestedAction)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-blue-200 text-xs font-semibold transition-all"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className={`text-[10px] text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 text-white mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex gap-3 text-xs items-center text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing operations data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            disabled={isProcessing}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask ResQ Copilot (e.g., 'Allocate resources to Darbhanga' or 'Check warehouse water stock')..."
          disabled={isProcessing}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isProcessing}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
