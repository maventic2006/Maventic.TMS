import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Settings, Database } from "lucide-react";
import { fetchConsignorConfigurations } from "../redux/slices/consignorConfigurationSlice";

const ConsignorConfigurationListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { configurations, loading, error } = useSelector(state => state.consignorConfiguration);

  useEffect(() => {
    dispatch(fetchConsignorConfigurations());
  }, [dispatch]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleConfigurationClick = (configName) => {
    navigate(`/consignor-configuration/${configName}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading consignor configurations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <CardContent className="px-0 py-0">
            <div className="flex items-center justify-between px-0 py-0 gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-20 w-20 rounded-lg hover:bg-gray-100 hover:text-[#0D1A33] transition-all duration-200 flex-shrink-0"
                >
                  <ArrowLeft className="h-5 w-5 text-[#0D1A33]" />
                </Button>
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-[#0D1A33] font-poppins truncate">
                    Consignor Configuration Management
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Manage consignor-specific configuration settings and parameters
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configurations.map((config) => (
            <Card 
              key={config.configName}
              className="hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => handleConfigurationClick(config.configName)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    {config.configName.includes('e_bidding') || config.configName.includes('ebidding') ? (
                      <Database className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Settings className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {config.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {config.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Database className="h-3 w-3" />
                      <span className="font-mono">{config.table}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfigurationClick(config.configName);
                    }}
                  >
                    Manage Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {configurations.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <CardContent>
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Configurations Available
              </h3>
              <p className="text-gray-600">
                No consignor configurations are currently available.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsignorConfigurationListPage;