'use client';

import React, { useState } from 'react';
import { ChevronDown, Info, ArrowRight } from 'lucide-react';

// --- Components ---

// Simple Card Wrapper
const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

// Formatted Currency Component
const Money = ({ value, compact = false, highlight = false }) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 0
  }).format(value);
  
  return (
    <span className={`${highlight ? 'text-amber-400 font-bold' : 'text-slate-200'} font-mono`}>
      {formatted}
    </span>
  );
};

// Tick-Style Meter for Efficiency
const TickMeter = ({ value }) => {
  // Generate 24 ticks for a denser look
  const ticks = Array.from({ length: 24 });
  // Calculate which tick should be active based on value (assuming max visual range of ~30%)
  const activeIndex = Math.min(Math.floor((value / 0.30) * 24), 23);

  return (
    <div className="flex flex-col items-center w-full max-w-[120px] mx-auto">
      <span className="text-[10px] font-bold text-amber-500 font-mono mb-0.5">
        {(value * 100).toFixed(0)}%
      </span>
      <div className="flex items-end justify-between w-full h-3 gap-[1px]">
        {ticks.map((_, i) => {
          // Highlight logic
          const isHighlight = i === activeIndex;
          const isMajor = i % 6 === 0; // Every 6th tick is taller
          
          return (
            <div 
              key={i}
              className={`w-[1.5px] rounded-full transition-all duration-300
                ${isHighlight ? 'bg-amber-400 h-full shadow-[0_0_8px_rgba(251,191,36,1)] w-[2px]' : 'bg-slate-700'}
                ${!isHighlight && isMajor ? 'h-2 bg-slate-600' : ''}
                ${!isHighlight && !isMajor ? 'h-1 bg-slate-800' : ''}
              `}
            />
          );
        })}
      </div>
    </div>
  );
};

// Custom Range Slider
const CustomSlider = ({ value, min, max, onChange, label, subLabel, formatValue }) => (
  <div className="flex flex-col w-full">
    <div className="flex justify-between items-end mb-2">
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className="text-white font-bold text-lg">{formatValue ? formatValue(value) : value}</span>
    </div>
    <div className="relative h-2 bg-slate-700 rounded-full">
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" 
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      />
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transform transition-transform"
        style={{ left: `${((value - min) / (max - min)) * 100}%`, transform: `translate(-50%, -50%)` }}
      />
    </div>
    <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
      <span>{formatValue ? formatValue(min) : min}</span>
      <span>{subLabel}</span>
      <span>{formatValue ? formatValue(max) : max}</span>
    </div>
  </div>
);

// --- Main Application ---

export default function Home() {
  // Global State
  const [revenue, setRevenue] = useState(5200000000); // 5.2B
  const [opExPercent, setOpExPercent] = useState(20); // 20%
  const [activeRow, setActiveRow] = useState(0);

  // Data Definition
  const expenseCategories = [
    { id: 0, name: "Inventory Carrying / Holding Cost", baseAllocation: 0.12, efficiencyGain: 0.15, range: [0.08, 0.15] },
    { id: 1, name: "Warehousing & Logistics (Outbound + Internal)", baseAllocation: 0.18, efficiencyGain: 0.10, range: [0.12, 0.22] },
    { id: 2, name: "Sales, Marketing, & Customer Service", baseAllocation: 0.25, efficiencyGain: 0.08, range: [0.15, 0.30] },
    { id: 3, name: "Order Processing / Back-Office Overhead", baseAllocation: 0.08, efficiencyGain: 0.20, range: [0.05, 0.12] },
    { id: 4, name: "Returns, Obsolescene & Shrinkage", baseAllocation: 0.05, efficiencyGain: 0.12, range: [0.02, 0.08] },
    { id: 5, name: "IT", baseAllocation: 0.10, efficiencyGain: 0.05, range: [0.05, 0.15] },
    { id: 6, name: "Risk & Compliance / Other", baseAllocation: 0.05, efficiencyGain: 0.05, range: [0.02, 0.08] },
  ];

  // Specific Problem Lists for the bottom section
  const problemsMap = {
    0: [ // Inventory
      "Demand Forecasting", "Inventory Planning & Replenishment", "Supplier Lead Time & Reliability", 
      "SKU Rationalization", "Warehouse Layout & Slotting", "Cycle Counting & Inventory Accuracy",
      "Order Pattern Optimization", "Inventory Visibility & Data Systems", "Obsolescence & Aging Control"
    ],
    1: [ // Logistics
      "Route Optimization", "Carrier Selection Logic", "Freight Audit & Payment",
      "Load Consolidation", "Cross-Docking Efficiency", "Last Mile Delivery Cost",
      "Reverse Logistics Flow", "Packaging Optimization", "Labor Management"
    ],
    // Defaults for others to save space
    default: [
      "Process Automation", "Data Silo Integration", "Real-time Analytics",
      "Resource Allocation", "Predictive Modeling", "Workflow Standardization"
    ]
  };

  // Helper to format large numbers
  const formatBillions = (val) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(0)}M`;
    return `$${val}`;
  };

  // Calculation Logic
  const totalOpEx = revenue * (opExPercent / 100);
  
  // Calculate totals including ranges
  const totals = expenseCategories.reduce((acc, cat) => {
    const spend = totalOpEx * cat.baseAllocation;
    const spendLow = totalOpEx * cat.range[0];
    const spendHigh = totalOpEx * cat.range[1];
    
    const savings = spend * cat.efficiencyGain;
    const savingsLow = spendLow * cat.efficiencyGain;
    const savingsHigh = spendHigh * cat.efficiencyGain;

    return {
      savings: acc.savings + savings,
      savingsLow: acc.savingsLow + savingsLow,
      savingsHigh: acc.savingsHigh + savingsHigh
    };
  }, { savings: 0, savingsLow: 0, savingsHigh: 0 });

  // VISUAL SCALE SETTINGS
  const MAX_SCALE = 0.45; 

  return (
    <div 
      className="min-h-screen text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a2a3a 0%, #0a0f14 70%)' }}
    >
      
      {/* Navbar / Header */}
      <header className="px-6 py-3 flex justify-between items-center border-b border-slate-800 bg-[#0B1120]/90 backdrop-blur sticky top-0 z-50">
        <div>
          <h2 className="text-amber-500 text-sm font-bold tracking-widest uppercase mb-1">Proof of Value (PoV)</h2>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            No Risk. No Commitment. <span className="text-blue-500">Prove It First</span>
          </h1>
        </div>
        <div className="hidden md:block">
            <img src="/aaxis-logo.png" alt="AAXIS" className="h-16 w-auto object-contain" />
        </div>
      </header>

      {/* Main Container - WIDENED to 95% width to prevent text wrapping */}
      <main className="p-2 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 w-[98%] max-w-[2000px] mx-auto">
        
        {/* LEFT COLUMN: Controls & Data Dashboard */}
        <div className="lg:col-span-10 space-y-3">
          
          {/* Main Data Table Card */}
          <Card className="p-4 md:p-5 overflow-hidden relative">
            
            {/* Top Controls Bar - Moved Inside Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-4 pb-4 border-b border-slate-700/50">
              <div className="md:col-span-3">
                <label className="block text-slate-400 text-xs font-bold uppercase mb-2">Choose Your Industry</label>
                <div className="relative">
                  <select className="w-full bg-slate-800 border border-slate-700 text-white py-2 px-4 rounded-lg appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm">
                    <option>Distribution</option>
                    <option>Manufacturing</option>
                    <option>Retail</option>
                    <option>Logistics</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-5">
                <CustomSlider 
                  label="Annual Revenue" 
                  value={revenue} 
                  min={500000000} 
                  max={20000000000} 
                  formatValue={formatBillions}
                  subLabel=""
                  onChange={setRevenue} 
                />
              </div>

              <div className="md:col-span-4">
                <CustomSlider 
                  label="Operating Expenses" 
                  subLabel="(% of Revenue)"
                  value={opExPercent} 
                  min={5} 
                  max={50} 
                  formatValue={(v) => `${v}%`}
                  onChange={setOpExPercent} 
                />
              </div>
            </div>

            {/* Table Headers */}
            <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-700/50 pb-2">
              <div className="col-span-3">Expense Areas</div>
              <div className="col-span-3 text-center">Current Allocation</div>
              <div className="col-span-2 text-center">
                Annual Spends
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-2">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              <div className="col-span-2 text-center">
                % Efficiency Gained
                <div className="text-[10px] text-slate-500 mt-1">(1st use case only)</div>
              </div>
              <div className="col-span-2 text-center">
                Annual Savings
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-2">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            <div className="space-y-2"> 
              {expenseCategories.map((category, index) => {
                const annualSpend = totalOpEx * category.baseAllocation;
                const annualSpendLow = totalOpEx * category.range[0];
                const annualSpendHigh = totalOpEx * category.range[1];
                
                const savings = annualSpend * category.efficiencyGain;
                const savingsLow = annualSpendLow * category.efficiencyGain;
                const savingsHigh = annualSpendHigh * category.efficiencyGain;
                
                const isActive = activeRow === index;

                return (
                  <div 
                    key={category.id}
                    onClick={() => setActiveRow(index)}
                    className={`grid grid-cols-12 gap-4 items-center py-1 px-2 rounded-lg cursor-pointer transition-all duration-200 group
                      ${isActive ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-slate-800/50 border border-transparent'}
                    `}
                  >
                    {/* Name - Now enforced single line */}
                    <div className="col-span-3 flex items-center gap-2 overflow-hidden">
                      <span className={`text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {category.name}
                      </span>
                      <Info className="w-3 h-3 text-slate-600 hover:text-blue-400 transition-colors shrink-0" />
                    </div>

                    {/* Allocation Visual - FLOATING BAND STYLE */}
                    <div className="col-span-3 px-4 flex items-center h-full">
                        <div className="relative w-full h-8 flex items-center">
                            {/* Thin Background Line (Axis) */}
                            <div className="absolute w-full h-[1px] bg-slate-700/50 top-1/2 -translate-y-1/2"></div>
                            
                            {/* The Range Band (Floating Bar) */}
                            <div 
                                className={`absolute h-2 rounded-full top-1/2 -translate-y-1/2 transition-colors duration-300
                                  ${isActive ? 'bg-blue-400' : 'bg-slate-600'}
                                `}
                                style={{ 
                                    left: `${(category.range[0] / MAX_SCALE) * 100}%`, 
                                    width: `${((category.range[1] - category.range[0]) / MAX_SCALE) * 100}%` 
                                }}
                            >
                                {/* Min Label */}
                                <span className={`absolute -top-4 left-0 -translate-x-1/4 text-[9px] font-mono ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>
                                    {(category.range[0] * 100).toFixed(1)}%
                                </span>
                                {/* Max Label */}
                                <span className={`absolute -top-4 right-0 translate-x-1/4 text-[9px] font-mono ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>
                                    {(category.range[1] * 100).toFixed(1)}%
                                </span>
                            </div>

                            {/* Current Value Marker (Dot) */}
                            <div 
                                className="absolute w-2 h-2 bg-white rounded-full shadow border border-slate-900 top-1/2 -translate-y-1/2 z-10"
                                style={{ left: `${(category.baseAllocation / MAX_SCALE) * 100}%`, transform: 'translate(-50%, -50%)' }}
                            />
                        </div>
                    </div>

                    {/* Annual Spend (Low / High) */}
                    <div className="col-span-2 flex justify-between text-sm font-mono text-slate-300 px-2">
                      <Money value={annualSpendLow} compact />
                      <Money value={annualSpendHigh} compact />
                    </div>

                    {/* Efficiency Gain - NEW TICK METER */}
                    <div className="col-span-2 flex items-center justify-center">
                        <TickMeter value={category.efficiencyGain} />
                    </div>

                    {/* Annual Savings (Low / High) */}
                    <div className="col-span-2 flex justify-between text-sm font-mono px-2">
                       <span className="text-slate-300"><Money value={savingsLow} compact /></span>
                       <span className={`${isActive ? 'text-amber-400 font-bold' : 'text-slate-300'}`}><Money value={savingsHigh} compact /></span>
                    </div>
                  </div>
                );
              })}

              {/* Total Row */}
              <div className="grid grid-cols-12 gap-4 items-center py-4 mt-2 border-t border-slate-700">
                 <div className="col-span-10 text-right font-bold text-slate-400 uppercase tracking-widest text-xs">Total Estimated Impact</div>
                 <div className="col-span-2 flex justify-between items-baseline px-2">
                     <div className="text-sm font-mono text-slate-400">
                         <Money value={totals.savingsLow} compact />
                     </div>
                     <div className="text-xl font-black text-amber-400 font-mono drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]">
                         <Money value={totals.savingsHigh} compact />
                     </div>
                 </div>
              </div>
            </div>
          </Card>

          {/* Separator Line */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-2 opacity-50"></div>

          {/* Drill-Down Info Section */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            
            <h3 className="text-base text-slate-200 mb-2 flex items-center justify-center gap-2">
              Problems solved to achieve <span className="text-amber-400 font-bold text-lg">15%</span> improvement in 
              <span className="text-white font-bold truncate">{expenseCategories[activeRow].name}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-8">
              {(problemsMap[activeRow] || problemsMap['default']).map((problem, idx) => (
                <div key={idx} className="flex items-start gap-2 group cursor-default">
                  <span className="text-slate-600 font-mono text-[10px] mt-1 group-hover:text-blue-500 transition-colors">
                    0{idx + 1}.
                  </span>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs group-hover:text-slate-200 transition-colors border-b border-transparent group-hover:border-slate-600 pb-0.5 leading-tight">
                      {problem}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-1 pt-1 border-t border-slate-800 flex justify-end">
                <button className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 uppercase tracking-wider font-bold">
                    Learn How <ArrowRight className="w-3 h-3" />
                </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar Steps */}
        <div className="lg:col-span-2 space-y-8 pl-4 border-l border-slate-800/50">
          
          {/* Step 1 */}
          <div className="relative group">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-blue-900 stroke-text opacity-90 font-outline-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">01</span>
              <h3 className="text-xl font-bold text-white tracking-wide">DISCOVERY</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed pl-2 border-l-2 border-blue-500/30 ml-4 group-hover:border-blue-500 transition-colors">
              Identify most impactful business problem to solve. We analyze your specific data landscape.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-500 to-blue-900 opacity-90 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">02</span>
              <h3 className="text-xl font-bold text-white tracking-wide">DELIVERY</h3>
            </div>
            <ul className="space-y-3 pl-6">
              <li className="text-slate-400 text-sm flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>Provide relevant data modeling.</span>
              </li>
              <li className="text-slate-400 text-sm flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>AAXIS provides the data, AI engineering expertise, and full technology stack.</span>
              </li>
            </ul>
          </div>

           {/* Step 3 */}
           <div className="relative group">
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-500 to-blue-900 opacity-90 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">03</span>
              <h3 className="text-xl font-bold text-white tracking-wide">REVIEW & CONFIRM</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed pl-2 border-l-2 border-blue-500/30 ml-4 group-hover:border-blue-500 transition-colors">
              Validate results against the success criteria defined in discovery.
            </p>
          </div>
          
          <div className="pt-8">
              <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg shadow-lg shadow-blue-900/50 transition-all transform active:scale-95">
                  Start Your PoV
              </button>
          </div>

        </div>

      </main>
    </div>
  );
}
