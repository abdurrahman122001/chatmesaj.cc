import React from "react";
import { actionTemplates } from "../lyroData.js";

export default function ActionsPage() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fb] p-4">
      <div className="rounded-[20px] border border-[#dfe5ee] bg-white p-5">
        <div className="rounded-[16px] bg-[#f4f7fb] p-4">
          <div className="text-[18px] font-semibold text-[#111827]">Meet Actions - AI that works like your team would</div>
          <div className="mt-2 max-w-[760px] text-[14px] leading-[1.5] text-[#334155]">Lyro can now do more than just respond: it connects to your systems via API to execute real tasks.</div>
          <div className="mt-3 text-[14px] text-[#2563eb]">◫ Learn about Actions</div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div>
            <div className="text-[20px] font-semibold text-[#111827]">Actions</div>
            <div className="mt-1 text-[14px] text-[#64748b]">Lyro can perform actions across your apps and services via API calls.</div>
          </div>
          <div className="flex gap-3">
            <button className="rounded-[10px] border border-[#d6dee9] bg-white px-4 py-2 text-[13px] font-medium text-[#111827]">◉ Test Lyro</button>
            <button className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">+ Create Action</button>
          </div>
        </div>
        <div className="mt-5 flex gap-6 border-b border-[#e5eaf1] text-[15px]">
          <div className="border-b-[3px] border-[#2563eb] pb-3 font-medium text-[#2563eb]">My Actions</div>
          <div className="pb-3 text-[#111827]">Templates</div>
        </div>
        <div className="mt-4 rounded-[18px] border border-[#dfe5ee] px-5 py-10 text-center">
          <div className="text-[18px] font-semibold text-[#111827]">You have no Actions yet</div>
          <div className="mt-2 text-[14px] text-[#64748b]">Start creating your first Action or use one of our templates</div>
          <div className="mt-5 flex justify-center gap-3">
            <button className="rounded-[10px] border border-[#d6dee9] px-4 py-2 text-[13px]">Create from scratch</button>
            <button className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">Explore templates</button>
          </div>
        </div>
        <div className="mt-6 rounded-[18px] border border-[#dfe5ee] p-5">
          <div className="text-[18px] font-semibold text-[#111827]">Explore how Lyro can do more with templates</div>
          <div className="mt-5 grid grid-cols-3 gap-4">
            {actionTemplates.map((item) => (
              <div key={item.title} className="rounded-[16px] border border-[#dfe5ee] p-5">
                <div className="text-[18px] font-semibold leading-[1.25] text-[#111827]">{item.title}</div>
                <div className="mt-3 text-[14px] leading-[1.5] text-[#64748b]">{item.body}</div>
                {item.title === "Explore all templates" ? <button className="mt-5 rounded-[10px] bg-[#dfe9ff] px-4 py-2 text-[13px] font-medium text-[#2563eb]">Explore all →</button> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
