import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import { fetchDriverById } from "../../../redux/slices/driverSlice";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { getPageTheme, getComponentTheme } from "../../../theme.config";

const DriverDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = getPageTheme("general");
  const actionButtonTheme = getComponentTheme("actionButton");

  const { selectedDriver, isFetchingDetails, error } = useSelector(
    (state) => state.driver
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchDriverById(id));
    }
  }, [id, dispatch]);

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
                      Driver Details
                    </h1>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {id ? `Driver ID: ${id}` : "Loading..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Content */}
        <Card
          className="overflow-hidden border shadow-md"
          style={{
            backgroundColor: theme.colors.card.background,
            borderColor: theme.colors.card.border,
          }}
        >
          {/* Loading State */}
          {isFetchingDetails && (
            <div className="p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading driver details...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isFetchingDetails && (
            <div className="p-8 text-center">
              <User className="h-24 w-24 text-red-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-red-600">
                Error Loading Driver
              </h2>
              <p className="text-gray-600 mb-4">
                {error.message || "Something went wrong"}
              </p>
              <Button
                onClick={handleBack}
                style={{
                  backgroundColor: actionButtonTheme.primary.background,
                  color: actionButtonTheme.primary.text,
                }}
              >
                Back to Driver List
              </Button>
            </div>
          )}

          {/* Coming Soon State */}
          {!isFetchingDetails && !error && (
            <div className="p-8 text-center">
              <User className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: theme.colors.text.primary }}
              >
                Driver Details View Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                This page will display driver information with Basic Info,
                Address, and Documents tabs, along with view/edit modes.
              </p>
              {selectedDriver && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                  <p className="font-semibold text-blue-900 mb-2">
                    Driver data loaded successfully:
                  </p>
                  <pre className="text-xs text-blue-800 overflow-auto">
                    {JSON.stringify(selectedDriver, null, 2)}
                  </pre>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-6">
                Navigation is working! The API successfully fetched driver data.
                You can go back to the driver list using the back button above.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DriverDetailsPage;
