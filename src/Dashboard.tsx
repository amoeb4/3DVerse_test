import { useEffect } from "react";

export function DisplayDashboard()
{
return(
        <div className="fixed top-[3%] left-[3%] z-50 p-6 rounded-xl backdrop-blur bg-white/10 border border-white/20 shadow-xl text-white space-y-6 w-[90vw] max-w-[600px]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Control Panel</h1>
        <button
          className="text-sm bg-white/10 border border-white/30 rounded-md px-2 py-1 hover:bg-white/20 transition">
          Minimize
        </button>
      </div>
    </div>
);
}

