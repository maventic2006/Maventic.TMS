import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { getPageTheme, getComponentTheme } from "../../../theme.config";

const DriverCreatePage = () => {
  const navigate = useNavigate();
  const theme = getPageTheme("general");
  const actionButtonTheme = getComponentTheme("actionButton");

  const handleBack = () => {
    navigate("/drivers");
  };

  return (
    <div
      className="min-h-screen p-4 lg:p-6"
      style={{
        background: `linear-gradient(to bottom right, ${theme.colors.primary.background}, #f0f4f8, #e6f0ff)`,
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card
          className="overflow-hidden border shadow-md"
          style={{
            backgroundColor: theme.colors.card.background,
            borderColor: theme.colors.card.border,
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleBack}
                  style={{
                    backgroundColor: actionButtonTheme.secondary.background,
                    color: actionButtonTheme.secondary.text,
                    borderColor: actionButtonTheme.secondary.border,
                  }}
                  className="flex items-center space-x-2 border hover:opacity-90 transition-opacity"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div className="flex items-center space-x-3">
                  <User
                    className="h-8 w-8"
                    style={{ color: actionButtonTheme.primary.background }}
                  />
                  <div>
                    <h1
                      className="text-2xl font-bold"
                      style={{ color: theme.colors.text.primary }}
                    >
                      Create Driver
                    </h1>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Add a new driver to the system
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Content - Coming Soon */}
        <Card
          className="overflow-hidden border shadow-md"
          style={{
            backgroundColor: theme.colors.card.background,
            borderColor: theme.colors.card.border,
          }}
        >
          <div className="p-8 text-center">
            <User className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: theme.colors.text.primary }}
            >
              Driver Create Form Coming Soon
            </h2>
            <p className="text-gray-600 mb-6">
              This page will contain a multi-tab form for creating new drivers
              with Basic Info, Address, and Documents sections.
            </p>
            <p className="text-sm text-gray-500">
              Navigation is working! You can go back to the driver list using
              the back button above.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DriverCreatePage;
