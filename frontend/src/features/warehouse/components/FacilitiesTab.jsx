import React from "react";
import { Label } from "../../../components/ui/input";
import ThemedSwitch from "../../../components/ui/themed/ThemedSwitch";

const FacilitiesTab = ({ formData, setFormData, errors }) => {
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [field]: value,
      },
    }));
  };

  const facilities = [
    {
      id: "weighBridge",
      label: "Weigh Bridge Available",
      description: "Equipment for weighing vehicles",
    },
    {
      id: "gatepassSystem",
      label: "Gatepass System Available",
      description: "Digital gatepass management",
    },
    {
      id: "fuelAvailability",
      label: "Fuel Availability",
      description: "Fuel station on premises",
    },
    {
      id: "stagingArea",
      label: "Staging Area",
      description: "Vehicle staging and parking area",
    },
    {
      id: "driverWaitingArea",
      label: "Driver Waiting Area",
      description: "Rest area for drivers",
    },
    {
      id: "gateInChecklistAuth",
      label: "Gate-In Checklist Authorization",
      description: "Entry verification system",
    },
    {
      id: "gateOutChecklistAuth",
      label: "Gate-Out Checklist Authorization",
      description: "Exit verification system",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label className="text-sm font-semibold text-[#0D1A33]">
                  {facility.label}
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  {facility.description}
                </p>
              </div>
              <ThemedSwitch
                checked={formData.facilities[facility.id]}
                onCheckedChange={(checked) =>
                  handleChange(facility.id, checked)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacilitiesTab;
