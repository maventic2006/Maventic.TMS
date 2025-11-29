import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Settings, ChevronRight, Database, FileText } from 'lucide-react';

import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchConfigurations } from '../redux/slices/configurationSlice';
import TMSHeader from '@/components/layout/TMSHeader';
const ConfigurationListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { configurations, loading, error } = useSelector(state => state.configuration);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    dispatch(fetchConfigurations());
  }, [dispatch]);

  const handleConfigurationClick = (configName) => {
    navigate(`/configuration/${configName}`);
  };

  const getIcon = (configName) => {
    if (configName.includes('document')) return <FileText className="text-blue-500" size={24} />;
    if (configName.includes('user') || configName.includes('role')) return <Settings className="text-green-500" size={24} />;
    return <Database className="text-purple-500" size={24} />;
  };

  const groupConfigurations = (configs) => {
    const groups = {
      'Document Management': [],
      'Vehicle & Transportation': [],
      'User & Security': [],
      'Business Configuration': [],
      'System Configuration': []
    };

    configs.forEach(config => {
      const name = config.configName.toLowerCase();
      if (name.includes('document')) {
        groups['Document Management'].push(config);
      } else if (name.includes('vehicle') || name.includes('engine') || name.includes('fuel') || name.includes('trans')) {
        groups['Vehicle & Transportation'].push(config);
      } else if (name.includes('user') || name.includes('role') || name.includes('approval')) {
        groups['User & Security'].push(config);
      } else if (name.includes('warehouse') || name.includes('material') || name.includes('rate') || name.includes('packaging')) {
        groups['Business Configuration'].push(config);
      } else {
        groups['System Configuration'].push(config);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Card className="p-8">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">Error Loading Configurations</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <Button onClick={() => dispatch(fetchConfigurations())}>Retry</Button>
          </div>
        </Card>
      </Layout>
    );
  }

  const groupedConfigurations = groupConfigurations(configurations);

  return (
    <Layout>
        {/* <TMSHeader /> */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Configuration Management</h1>
          <p className="text-gray-600">
            Manage all master data configurations for the TMS system
          </p>
        </motion.div>

        {/* Configuration Groups */}
        {Object.entries(groupedConfigurations).map(([groupName, configs]) => (
          configs.length > 0 && (
            <motion.div key={groupName} variants={itemVariants}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{groupName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {configs.map((config) => (
                  <motion.div
                    key={config.configName}
                    variants={cardVariants}
                    whileHover="hover"
                    className="cursor-pointer"
                    onClick={() => handleConfigurationClick(config.configName)}
                  >
                    <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getIcon(config.configName)}
                          <div>
                            <h3 className="font-semibold text-gray-900">{config.name}</h3>
                            <p className="text-sm text-gray-600">{config.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400" size={20} />
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Table: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                            {config.table}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        ))}

        {/* Stats */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{configurations.length}</div>
                <div className="text-sm text-gray-600">Total Configurations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(groupedConfigurations).filter(configs => configs.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Configuration Groups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">43</div>
                <div className="text-sm text-gray-600">Master Tables</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default ConfigurationListPage;