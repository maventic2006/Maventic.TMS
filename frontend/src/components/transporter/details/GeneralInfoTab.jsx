import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Save, X, User, Building, Calendar, Star, Truck, Plane, Train, Ship } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';

const GeneralInfoTab = ({ transporter, transporterId, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Helper function to format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const [editData, setEditData] = useState({
    businessName: transporter?.businessName || '',
    userType: transporter?.userType || 'TRANSPORTER',
    transMode: {
      road: transporter?.transportMode?.road || false,
      rail: transporter?.transportMode?.rail || false,
      air: transporter?.transportMode?.air || false,
      sea: transporter?.transportMode?.sea || false,
    },
    activeFlag: transporter?.status === 'Active' || false,
    fromDate: formatDateForInput(transporter?.fromDate),
    toDate: formatDateForInput(transporter?.toDate),
    avgRating: transporter?.avgRating || 0,
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the data
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      businessName: transporter?.businessName || '',
      userType: transporter?.userType || 'TRANSPORTER',
      transMode: {
        road: transporter?.transportMode?.road || false,
        rail: transporter?.transportMode?.rail || false,
        air: transporter?.transportMode?.air || false,
        sea: transporter?.transportMode?.sea || false,
      },
      activeFlag: transporter?.status === 'Active' || false,
      fromDate: formatDateForInput(transporter?.fromDate),
      toDate: formatDateForInput(transporter?.toDate),
      avgRating: transporter?.avgRating || 0,
    });
    setIsEditing(false);
  };

  // Transport mode icons
  const transportModeIcons = {
    road: { icon: Truck, label: 'Road', color: 'text-green-500' },
    rail: { icon: Train, label: 'Rail', color: 'text-purple-500' },
    air: { icon: Plane, label: 'Air', color: 'text-blue-500' },
    sea: { icon: Ship, label: 'Sea', color: 'text-cyan-500' }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-5 w-5 text-yellow-400 fill-current opacity-50" />
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      );
    }
    
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      <Card className="shadow-xl bg-gradient-to-br from-white via-white to-blue-50/30 border-white/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="p-3 bg-gradient-to-r from-primary-accent/10 to-blue-100 rounded-xl">
                <Building className="h-6 w-6 text-primary-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-text-primary to-primary-accent bg-clip-text text-transparent">
                  General Information
                </h3>
                <p className="text-text-secondary text-sm mt-1">Basic transporter details and configuration</p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex space-x-3"
            >
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-white/80 hover:bg-white border-gray-200 hover:border-primary-accent hover:text-primary-accent hover:shadow-glow transition-all duration-300"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              ) : (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 bg-white/80 hover:bg-white border-gray-200 hover:border-red-300 hover:text-red-600 transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Transporter ID */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Transporter ID
              </label>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                <span className="text-text-primary font-bold text-lg">{transporterId}</span>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  <div className="text-xs text-blue-600 font-medium">System Generated</div>
                </div>
              </div>
            </motion.div>

            {/* User Type */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                User Type
              </label>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 shadow-sm">
                <span className="text-text-primary font-bold flex items-center text-lg">
                  <User className="h-5 w-5 mr-2 text-primary-accent" />
                  {editData.userType}
                </span>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  <div className="text-xs text-purple-600 font-medium">System Derived</div>
                </div>
              </div>
            </motion.div>

            {/* Business Name */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Business Name <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <Input
                  value={editData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter business name"
                  className="bg-white border-gray-200 focus:border-primary-accent focus:ring-2 focus:ring-primary-accent/20 rounded-xl h-12"
                />
              ) : (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-sm">
                  <span className="text-text-primary font-bold text-lg">{editData.businessName || 'N/A'}</span>
                </div>
              )}
            </motion.div>

            {/* Active Flag */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Status
              </label>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100 shadow-sm">
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                  editData.activeFlag 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                    : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    editData.activeFlag ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  {editData.activeFlag ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  <div className="text-xs text-gray-600 font-medium">System Managed</div>
                </div>
              </div>
            </motion.div>

            {/* From Date */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Start Date <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData.fromDate}
                  onChange={(e) => handleInputChange('fromDate', e.target.value)}
                  className="bg-white border-gray-200 focus:border-primary-accent focus:ring-2 focus:ring-primary-accent/20 rounded-xl h-12"
                />
              ) : (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100 shadow-sm">
                  <span className="text-text-primary font-bold flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                    {formatDateForDisplay(transporter?.fromDate)}
                  </span>
                </div>
              )}
            </motion.div>

            {/* To Date */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                End Date <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editData.toDate}
                  onChange={(e) => handleInputChange('toDate', e.target.value)}
                  className="bg-white border-gray-200 focus:border-primary-accent focus:ring-2 focus:ring-primary-accent/20 rounded-xl h-12"
                />
              ) : (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 shadow-sm">
                  <span className="text-text-primary font-bold flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-red-500" />
                    {formatDateForDisplay(transporter?.toDate)}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Average Rating */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Performance Rating
              </label>
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex space-x-1">
                    {renderStars(editData.avgRating)}
                  </div>
                  <span className="text-text-primary font-bold text-xl">
                    {editData.avgRating.toFixed(1)}
                  </span>
                  <span className="text-text-secondary text-sm">/5.0</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <div className="text-xs text-yellow-600 font-medium">Auto-calculated from reviews</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Transport Modes Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                <Truck className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-text-primary">
                  Transport Modes <span className="text-red-500">*</span>
                </h4>
                <p className="text-text-secondary text-sm">Select available transportation methods</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(transportModeIcons).map(([mode, config], index) => {
                const IconComponent = config.icon;
                const isSelected = editData.transMode[mode];
                
                return (
                  <motion.div 
                    key={mode} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="space-y-2"
                  >
                    {isEditing ? (
                      <label className={`flex items-center space-x-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-primary-accent shadow-md' 
                          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleInputChange(`transMode.${mode}`, e.target.checked)}
                          className="h-5 w-5 text-primary-accent focus:ring-2 focus:ring-primary-accent/30 border-gray-300 rounded-md"
                        />
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                            <IconComponent className={`h-6 w-6 ${isSelected ? config.color : 'text-gray-500'}`} />
                          </div>
                          <span className={`font-semibold ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {config.label}
                          </span>
                        </div>
                      </label>
                    ) : (
                      <div className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-primary-accent shadow-lg' 
                          : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                      }`}>
                        <div className={`h-6 w-6 rounded-xl border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-primary-accent border-primary-accent shadow-sm' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && (
                            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                            <IconComponent className={`h-6 w-6 ${isSelected ? config.color : 'text-gray-400'}`} />
                          </div>
                          <span className={`font-semibold ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GeneralInfoTab;