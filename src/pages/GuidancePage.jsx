import React from "react";
import { guidanceRows } from "../lyroData.js";

export default function GuidancePage() {
  return (
    <div className="flex min-h-0 flex-1 bg-[#f6f8fb] p-4">
      <div className="min-h-0 flex-1 rounded-[20px] border border-[#dfe5ee] bg-white p-5">
        <div className="rounded-[16px] bg-[#f4f7fb] p-4">
          <div className="text-[18px] font-semibold text-[#111827]">Provide Lyro with specific guidance</div>
          <div className="mt-2 max-w-[720px] text-[14px] leading-[1.5] text-[#334155]">Train your AI Agent to provide precise responses and handle escalations when needed.</div>
          <div className="mt-3 text-[14px] text-[#2563eb]">◫ How to use Guidance</div>
        </div>
        <div className="mt-6 text-[20px] font-semibold text-[#111827]">Guidance</div>
        <div className="mt-1 text-[14px] text-[#64748b]">Train Lyro to follow your team's approach.</div>
        <div className="mt-6 border-b border-[#e5eaf1] pb-6">
          <div className="text-[16px] font-semibold text-[#111827]">Basic answer personalization</div>
          <div className="mt-4 space-y-4 max-w-[300px]">
            <div className="flex items-center justify-between"><span className="text-[14px] text-[#111827]">Use emojis 🙂</span><span className="h-6 w-11 rounded-full bg-[#2563eb] px-1"><span className="mt-[2px] block h-5 w-5 translate-x-5 rounded-full bg-white" /></span></div>
            <div className="flex items-center justify-between"><span className="text-[14px] text-[#111827]">&quot;Read more&quot; links</span><span className="h-6 w-11 rounded-full bg-[#2563eb] px-1"><span className="mt-[2px] block h-5 w-5 translate-x-5 rounded-full bg-white" /></span></div>
          </div>
        </div>
        <div className="py-6 border-b border-[#e5eaf1]">
          <div className="text-[16px] font-semibold text-[#111827]">Communication style</div>
          <div className="mt-4 overflow-hidden rounded-[14px] border border-[#dfe5ee]">
            <div className="grid grid-cols-[1fr_180px] bg-[#fbfcfe] px-4 py-3 text-[13px] text-[#64748b]"><span>Name</span><span>Audience</span></div>
            {guidanceRows.map((row) => (
              <div key={row.name} className="grid grid-cols-[1fr_180px] items-start border-t border-[#eef2f7] px-4 py-3 text-[14px]">
                <div><div className="font-medium text-[#111827]">{row.name}</div><div className="text-[#64748b]">{row.note}</div></div>
                <div className="flex items-center justify-between"><span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[12px] text-[#64748b]">{row.audience}</span><span className="text-[#94a3b8]">⋮</span></div>
              </div>
            ))}
          </div>
          <button className="mt-4 rounded-[10px] bg-[#dfe9ff] px-4 py-2 text-[14px] font-medium text-[#2563eb]">+ Add</button>
        </div>
        <div className="py-6 border-b border-[#e5eaf1]">
          <div className="text-[16px] font-semibold text-[#111827]">Handoff and escalation</div>
          <button className="mt-4 rounded-[10px] bg-[#dfe9ff] px-4 py-2 text-[14px] font-medium text-[#2563eb]">+ Add</button>
        </div>
        <div className="py-6">
          <div className="text-[16px] font-semibold text-[#111827]">Other</div>
          <button className="mt-4 rounded-[10px] bg-[#dfe9ff] px-4 py-2 text-[14px] font-medium text-[#2563eb]">+ Add</button>
        </div>
      </div>
    </div>
  );
}
