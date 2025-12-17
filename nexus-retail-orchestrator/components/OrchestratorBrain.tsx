import React from 'react';
import { AgentName, OrchestratorResponse } from '../types';
import { Brain, ShoppingBag, CreditCard, Truck, Users, Search, Package } from 'lucide-react';

interface Props {
  lastResponse: OrchestratorResponse | null;
  activeAgents: AgentName[];
  isProcessing: boolean;
}

const AgentIcon: React.FC<{ name: AgentName; isActive: boolean }> = ({ name, isActive }) => {
  let Icon = Search;
  let label = "Agent";
  let color = "text-slate-400";
  let activeColor = "text-emerald-400";
  let activeBg = "bg-emerald-500/10 border-emerald-500/50";
  let inactiveBg = "bg-slate-800/50 border-slate-700/50";

  switch (name) {
    case 'inventory_agent':
      Icon = Package;
      label = "Inventory";
      activeColor = "text-blue-400";
      activeBg = "bg-blue-500/10 border-blue-500/50";
      break;
    case 'recommendation_agent':
      Icon = Search;
      label = "Recs";
      activeColor = "text-purple-400";
      activeBg = "bg-purple-500/10 border-purple-500/50";
      break;
    case 'payment_agent':
      Icon = CreditCard;
      label = "Payment";
      activeColor = "text-emerald-400";
      activeBg = "bg-emerald-500/10 border-emerald-500/50";
      break;
    case 'fulfillment_agent':
      Icon = Truck;
      label = "Logistics";
      activeColor = "text-orange-400";
      activeBg = "bg-orange-500/10 border-orange-500/50";
      break;
    case 'loyalty_agent':
      Icon = Users;
      label = "Loyalty";
      activeColor = "text-amber-400";
      activeBg = "bg-amber-500/10 border-amber-500/50";
      break;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
        isActive ? `${activeBg} scale-105 shadow-lg shadow-emerald-900/20` : inactiveBg
      }`}
    >
      <Icon className={`w-6 h-6 mb-2 ${isActive ? activeColor : color}`} />
      <span className={`text-xs font-medium ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
        {label}
      </span>
      {isActive && (
        <span className="flex h-2 w-2 mt-2 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeColor.replace('text', 'bg')}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${activeColor.replace('text', 'bg')}`}></span>
        </span>
      )}
    </div>
  );
};

export const OrchestratorBrain: React.FC<Props> = ({ lastResponse, activeAgents, isProcessing }) => {
  return (
    <div className="h-full flex flex-col gap-6 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="flex items-center gap-3 mb-2 z-10">
        <div className={`p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 ${isProcessing ? 'animate-pulse' : ''}`}>
          <Brain className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Master Orchestrator</h2>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            Status: 
            <span className={isProcessing ? "text-amber-400" : "text-emerald-400"}>
              {isProcessing ? "Reasoning & Delegating..." : "Idle"}
            </span>
          </p>
        </div>
      </div>

      {/* Thought Process Panel */}
      <div className="flex-1 min-h-[120px] bg-slate-950/50 rounded-xl p-4 border border-slate-800 overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Internal Thought Stream</h3>
        {lastResponse ? (
          <p className="text-sm text-slate-300 font-mono leading-relaxed animate-in fade-in slide-in-from-bottom-2">
            <span className="text-indigo-400">&gt;</span> {lastResponse.thought_process}
          </p>
        ) : (
          <p className="text-sm text-slate-600 italic">Waiting for input...</p>
        )}
      </div>

      {/* Agent Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Active Worker Agents</h3>
        <div className="grid grid-cols-3 gap-3">
          <AgentIcon name="inventory_agent" isActive={activeAgents.includes('inventory_agent')} />
          <AgentIcon name="recommendation_agent" isActive={activeAgents.includes('recommendation_agent')} />
          <AgentIcon name="loyalty_agent" isActive={activeAgents.includes('loyalty_agent')} />
          <AgentIcon name="payment_agent" isActive={activeAgents.includes('payment_agent')} />
          <AgentIcon name="fulfillment_agent" isActive={activeAgents.includes('fulfillment_agent')} />
        </div>
      </div>
      
      {/* JSON Plan View (Mini) */}
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-xs overflow-hidden">
        <div className="flex justify-between text-slate-500 mb-1">
          <span>LATEST_OUTPUT.JSON</span>
        </div>
        <pre className="text-emerald-400/80 whitespace-pre-wrap break-all">
          {lastResponse ? JSON.stringify(lastResponse, null, 2) : '// No active plan'}
        </pre>
      </div>
    </div>
  );
};