import React from "react";
import {
  Star,
  Truck,
  Plane,
  Train,
  Ship,
  Calendar,
  CheckCircle,
  XCircle,
  User,
  Hash,
} from "lucide-react";

const GeneralDetailsViewTab = ({ formData, transporterData }) => {
  const data = formData || transporterData;

  // Helper function to format date from ISO to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const transportModes = [
    {
      key: "road",
      label: "Road",
      icon: Truck,
      color: "bg-green-100 text-green-800",
    },
    {
      key: "rail",
      label: "Rail",
      icon: Train,
      color: "bg-purple-100 text-purple-800",
    },
    {
      key: "air",
      label: "Air",
      icon: Plane,
      color: "bg-blue-100 text-blue-800",
    },
    {
      key: "sea",
      label: "Sea",
      icon: Ship,
      color: "bg-cyan-100 text-cyan-800",
    },
  ];

  const activeTransportModes = transportModes.filter(
    (mode) => data?.generalDetails?.transMode?.[mode.key]
  );

  const renderStarRating = (rating) => {
    // Convert rating to number and ensure it's valid
    const numericRating =
      typeof rating === "number" ? rating : parseFloat(rating) || 0;
    // Clamp rating between 0 and 5
    const clampedRating = Math.max(0, Math.min(5, numericRating));

    const fullStars = Math.floor(clampedRating);
    const hasHalfStar = clampedRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-5 h-5 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {clampedRating.toFixed(1)} / 5.0
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Business Information Section */}
      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Hash className="w-5 h-5 text-blue-600" />
          Business Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Business Name
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <p className="text-gray-800 font-medium">
                {data?.generalDetails?.businessName || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Transporter ID
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <p className="text-gray-800 font-medium">
                {data?.transporterId || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Valid From
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-gray-800">
                {formatDate(data?.generalDetails?.fromDate)}
              </p>
            </div>
          </div>

          {/* ✅ Conditionally show Valid To only when to_date is not null */}
          {data?.generalDetails?.toDate && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Valid To
              </label>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-gray-800">
                  {formatDate(data?.generalDetails?.toDate)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Section */}
      <div className="bg-gradient-to-r from-yellow-50/50 to-orange-50/50 rounded-2xl p-6 border border-yellow-100/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-600" />
          Rating Information
        </h3>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">
            Average Rating
          </label>
          <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
            {renderStarRating(data?.generalDetails?.avgRating || 0)}
          </div>
        </div>
      </div>

      {/* Transport Modes Section */}
      <div className="bg-gradient-to-r from-green-50/50 to-teal-50/50 rounded-2xl p-6 border border-green-100/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Truck className="w-5 h-5 text-green-600" />
          Transport Modes
        </h3>

        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-600">
            Supported Transport Modes
          </label>
          <div className="flex flex-wrap gap-3">
            {activeTransportModes.length > 0 ? (
              activeTransportModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <div
                    key={mode.key}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${mode.color} font-medium text-sm`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{mode.label}</span>
                  </div>
                );
              })
            ) : (
              <div className="bg-gray-100 rounded-lg px-4 py-3 text-gray-500">
                No transport modes selected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-purple-100/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-purple-600" />
          Status Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Active Status
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <div className="flex items-center gap-2">
                {data?.generalDetails?.activeFlag ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Current Status
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  data?.generalDetails?.status?.toLowerCase() === "active"
                    ? "bg-green-100 text-green-800"
                    : data?.generalDetails?.status?.toLowerCase() === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {data?.generalDetails?.status == "SAVE_AS_DRAFT"
                  ? "Draft"
                  : data?.generalDetails?.status == "ACTIVE"
                  ? "Active"
                  : data?.generalDetails?.status == "PENDING"
                  ? "Pending"
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Information Section */}
      <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 rounded-2xl p-6 border border-gray-100/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-600" />
          Audit Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Created By
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <p className="text-gray-800">
                {data?.generalDetails?.createdBy || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Created On
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-gray-800">
                {data?.generalDetails?.createdOn || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Approved By
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <p className="text-gray-800">
                {data?.generalDetails?.approvedBy || "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Approved On
            </label>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-gray-800">
                {data?.generalDetails?.approvedOn || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralDetailsViewTab;
