import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { AlertTriangle, ArrowLeft, Shield } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, role } = useSelector((state) => state.auth);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="border border-red-200 shadow-lg">
          <CardContent className="p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>

            {/* Error Description */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  You don't have permission to access this page
                </p>
              </div>
              
              <div className="text-gray-600 space-y-2">
                <p className="text-sm">
                  This page requires <span className="font-semibold text-blue-600">product_owner</span> role access.
                </p>
                {user && (
                  <p className="text-xs text-gray-500">
                    Current user: <span className="font-mono">{user.email || user.username}</span><br />
                    Current role: <span className="font-mono text-red-600">{role || 'No role assigned'}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleGoToDashboard}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
              
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="w-full gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                If you believe this is an error, please contact your system administrator 
                to verify your access permissions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnauthorizedPage;