import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Plus, Edit3, Trash2, MapPin, Flag } from "lucide-react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/Table";

const ServiceAreaTab = ({ transporter, transporterId, onUpdate }) => {
  // Transform API data from object to array format
  const transformServiceAreas = (serviceAreasObj) => {
    if (!serviceAreasObj || typeof serviceAreasObj !== "object") {
      return [];
    }

    return Object.entries(serviceAreasObj).map(([country, states], index) => ({
      id: index + 1,
      serviceCountry: country,
      serviceStates: Array.isArray(states) ? states : [],
    }));
  };

  const serviceAreas = transformServiceAreas(transporter?.serviceAreas);

  const ServiceAreaCard = ({ serviceArea, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="p-4 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 hover:shadow-xl hover:shadow-green-100 hover:border-green-300 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg">
            <Flag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-text-primary mb-1">
              {serviceArea.serviceCountry}
            </h4>
            <div className="flex items-center space-x-2">
              <MapPin className="h-3 w-3 text-[#10B981]" />
              <p className="text-xs text-text-secondary font-medium">
                {serviceArea.serviceStates.length} states covered
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-1 bg-green-100 rounded-lg">
            <MapPin className="h-3 w-3 text-green-600" />
          </div>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Coverage States
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {serviceArea.serviceStates.map((state, stateIndex) => (
            <motion.span
              key={stateIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * stateIndex }}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              🏛️ {state}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6"
    >
      <Card className="shadow-xl bg-gradient-to-br from-white via-white to-green-50/30 border-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="p-2 bg-gradient-to-r from-green-100 to-green-50 rounded-xl">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-text-primary to-green-600 bg-clip-text text-transparent">
                  Service Coverage Areas
                </h3>
                <p className="text-text-secondary text-xs mt-1">
                  Geographic regions where services are available
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-white/80 hover:bg-white border-gray-200 hover:border-green-400 hover:text-green-600 hover:shadow-glow transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </motion.div>
          </div>

          {serviceAreas.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {serviceAreas.map((serviceArea, index) => (
                <ServiceAreaCard
                  key={serviceArea.id}
                  serviceArea={serviceArea}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Globe className="h-14 w-14 text-text-secondary opacity-40 mx-auto mb-3" />
              <h4 className="text-base font-medium text-text-primary mb-2">
                No Service Areas Defined
              </h4>
              <p className="text-text-secondary text-sm mb-4">
                Add service areas to define where this transporter operates.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Service Area</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-primary-accent" />
            <span>Service Area Summary</span>
          </h3>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
                  <TableHead className="text-white text-xs">
                    Service Country
                  </TableHead>
                  <TableHead className="text-white text-xs">
                    Service States
                  </TableHead>
                  <TableHead className="text-white text-xs">
                    Total States
                  </TableHead>
                  <TableHead className="text-white text-xs text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceAreas.map((serviceArea, index) => (
                  <TableRow
                    key={serviceArea.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <TableCell className="font-medium text-xs">
                      <div className="flex items-center space-x-2">
                        <Flag className="h-3 w-3 text-primary-accent" />
                        <span>{serviceArea.serviceCountry}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="max-w-md">
                        <div className="flex flex-wrap gap-1">
                          {serviceArea.serviceStates
                            .slice(0, 3)
                            .map((state, stateIndex) => (
                              <span
                                key={stateIndex}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {state}
                              </span>
                            ))}
                          {serviceArea.serviceStates.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-accent text-white">
                              +{serviceArea.serviceStates.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {serviceArea.serviceStates.length} states
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Service Area Statistics */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-900">
                  Total Countries
                </span>
              </div>
              <p className="text-xl font-bold text-blue-900 mt-1">
                {serviceAreas.length}
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-900">
                  Total States
                </span>
              </div>
              <p className="text-xl font-bold text-green-900 mt-1">
                {serviceAreas.reduce(
                  (total, area) => total + area.serviceStates.length,
                  0
                )}
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <Flag className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-900">
                  Coverage
                </span>
              </div>
              <p className="text-xl font-bold text-green-900 mt-1">
                {serviceAreas.length > 0 ? "Multi-Region" : "None"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceAreaTab;
