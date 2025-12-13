// import React, { useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import {
//   X,
//   CheckCircle,
//   AlertCircle,
//   AlertTriangle,
//   Info,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";
// import { removeToast } from "../../redux/slices/uiSlice";
// import { clsx } from "clsx";

// const Toast = ({
//   id,
//   type = "info",
//   message,
//   details = null,
//   duration = 5000,
// }) => {
//   const dispatch = useDispatch();
//   const [isExpanded, setIsExpanded] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       dispatch(removeToast(id));
//     }, duration);

//     return () => clearTimeout(timer);
//   }, [id, duration, dispatch]);

//   const handleClose = () => {
//     dispatch(removeToast(id));
//   };

//   const getToastStyles = () => {
//     switch (type) {
//       case "success":
//         return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800";
//       case "error":
//         return "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800";
//       case "warning":
//         return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800";
//       default:
//         return "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800";
//     }
//   };

//   const getIcon = () => {
//     switch (type) {
//       case "success":
//         return <CheckCircle className="h-5 w-5 text-green-600" />;
//       case "error":
//         return <AlertCircle className="h-5 w-5 text-red-600" />;
//       case "warning":
//         return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
//       default:
//         return <Info className="h-5 w-5 text-blue-600" />;
//     }
//   };

//   const hasDetails = details && Array.isArray(details) && details.length > 0;

//   return (
//     <div
//       className={clsx(
//         "max-w-md w-full shadow-xl rounded-xl border-2 transition-all duration-300 backdrop-blur-sm",
//         "animate-in slide-in-from-right-5 fade-in",
//         getToastStyles()
//       )}
//     >
//       <div className="p-4">
//         <div className="flex items-start">
//           <div className="flex-shrink-0">{getIcon()}</div>
//           <div className="ml-3 flex-1">
//             <p className="text-sm font-semibold leading-relaxed">{message}</p>

//             {hasDetails && (
//               <div className="mt-2">
//                 <button
//                   onClick={() => setIsExpanded(!isExpanded)}
//                   className="flex items-center gap-1 text-xs font-medium hover:underline focus:outline-none"
//                 >
//                   {isExpanded ? (
//                     <>
//                       <ChevronUp className="w-3 h-3" />
//                       Hide details
//                     </>
//                   ) : (
//                     <>
//                       <ChevronDown className="w-3 h-3" />
//                       Show {details.length} error{details.length > 1 ? "s" : ""}
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}
//           </div>
//           <div className="ml-4 flex-shrink-0 flex">
//             <button
//               className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-lg p-1 transition-colors"
//               onClick={handleClose}
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         {hasDetails && isExpanded && (
//           <div className="mt-3 pt-3 border-t border-current/10">
//             <ul className="space-y-1.5 text-xs">
//               {details.map((detail, index) => (
//                 <li key={index} className="flex items-start gap-2">
//                   <span className="text-current/60 mt-0.5">•</span>
//                   <span className="flex-1 leading-relaxed">{detail}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export { Toast };
// export default Toast;

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { removeToast } from "../../redux/slices/uiSlice";
import { clsx } from "clsx";

const Toast = ({
  id,
  type = "info",
  message,
  details = null,
  duration = null, // Default null = persistent (no auto-dismiss), user must close manually
}) => {
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // ✅ If duration is null or 0, toast is persistent (user must close manually)
    if (!duration || duration === 0) {
      console.log(`🔒 Toast ${id} is persistent - no auto-dismiss`);
      return; // No timer, toast stays until user closes
    }

    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, dispatch]);

  const handleClose = () => {
    dispatch(removeToast(id));
  };

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800";
      case "error":
        return "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800";
      case "warning":
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const hasDetails = details && Array.isArray(details) && details.length > 0;

  // NEW: Correct label logic
  const getDetailsLabel = () => {
    if (type === "error") {
      return `Show ${details.length} error${details.length > 1 ? "s" : ""}`;
    }
    return "Show details";
  };

  return (
    <div
      className={clsx(
        "max-w-md w-full shadow-xl rounded-xl border-2 transition-all duration-300 backdrop-blur-sm",
        "animate-in slide-in-from-right-5 fade-in",
        getToastStyles()
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold leading-relaxed">{message}</p>

            {hasDetails && (
              <div className="mt-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-xs font-medium hover:underline focus:outline-none"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      {getDetailsLabel()}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-lg p-1 transition-colors"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {hasDetails && isExpanded && (
          <div className="mt-3 pt-3 border-t border-current/10">
            <ul className="space-y-1.5 text-xs">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-current/60 mt-0.5">•</span>
                  <span className="flex-1 leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export { Toast };
export default Toast;
