import React from "react";
import { FileX2 } from "lucide-react";

const EmptyState = ({
  message = "No data available",
  description = "This section will be available once the mapping data is configured.",
  icon: Icon = FileX2,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{message}</h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
