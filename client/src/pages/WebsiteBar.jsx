import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import StatusCircle from "../components/StatusCircle";
import UptimeTicks from "../components/Ticks";

const WebsiteCard = ({ website }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#1a1a1a] dark:bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden">
      <div
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-[#2e2e2e] dark:hover:bg-[#2e2e2e]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <StatusCircle status={website.status} />
          <div>
            <h3 className="font-semibold text-[#e5e5e5]">{website.url}</h3>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-[#e5e5e5]">
            {website.uptimePercentage.toFixed(1)}% uptime
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[#e5e5e5]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#e5e5e5]" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-[#2e2e2e] dark:border-[#2e2e2e]">
          <div className="mt-3">
            <p className="text-sm text-[#e5e5e5] mb-1">Last 30 minutes status:</p>
            <UptimeTicks ticks={website.uptimeTicks} />
          </div>
          <p className="text-xs text-[#a5a5a5] mt-2">
            Last checked: {website.lastChecked}
          </p>
        </div>
      )}
    </div>
  );
};

export default WebsiteCard;
