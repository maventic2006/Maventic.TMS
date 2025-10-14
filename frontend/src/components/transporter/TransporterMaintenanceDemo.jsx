import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Users, FileText, BarChart3, ArrowRight } from 'lucide-react';

const TransporterMaintenanceDemo = () => {
  const features = [
    {
      icon: Building,
      title: 'Transporter Management',
      description: 'Complete CRUD operations for transporter data',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Users,
      title: 'Advanced Filtering',
      description: 'Filter by ID, TAN, Status, Transport Mode and more',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FileText,
      title: 'Gmail-style Pagination',
      description: '25 records per page with intuitive navigation',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: BarChart3,
      title: 'Real-time Search',
      description: 'Instant fuzzy search across all transporter fields',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const stats = [
    { label: 'Total Transporters', value: '54', color: 'text-blue-600' },
    { label: 'Active Status', value: '18', color: 'text-green-600' },
    { label: 'Pending Review', value: '18', color: 'text-yellow-600' },
    { label: 'Inactive', value: '18', color: 'text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-primary-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-tab-background via-slate-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transporter Maintenance
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Comprehensive transporter management system with advanced filtering, 
              real-time search, and Gmail-style pagination
            </p>
            <Link
              to="/transporters"
              className="inline-flex items-center bg-primary-accent text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>Launch Transporter Management</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-card-background rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Key Features
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Everything you need to manage transporters efficiently with modern UI/UX
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card-background rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-lg w-fit mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screenshot/Preview Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Live Preview
            </h2>
            <p className="text-lg text-text-secondary">
              Experience the full-featured transporter management interface
            </p>
          </div>

          <div className="bg-card-background rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-tab-background to-blue-900 p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="ml-4 text-white text-sm font-medium">
                  TMS - Transporter Maintenance
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                {/* Mock header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">Transporter Maintenance</h3>
                    <p className="text-sm text-text-secondary">Manage and monitor all transporters</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-primary-accent text-white px-4 py-2 rounded-lg text-sm">
                      Create New
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">
                      Logout
                    </button>
                  </div>
                </div>

                {/* Mock search and filters */}
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-3 top-3">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    </div>
                    <div className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="w-48 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  <button className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg text-sm">
                    <span>Show Filters</span>
                  </button>
                </div>

                {/* Mock table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-7 gap-4 bg-gray-50 p-4 text-xs font-medium text-gray-500 uppercase">
                    <div>ID</div>
                    <div>Business Name</div>
                    <div>Address</div>
                    <div>Mobile</div>
                    <div>Email</div>
                    <div>TAN</div>
                    <div>Status</div>
                  </div>
                  
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="grid grid-cols-7 gap-4 p-4 border-t border-gray-200">
                      <div className="text-primary-accent font-medium">TRP00{row}</div>
                      <div className="text-sm text-text-primary">Company {row}</div>
                      <div className="text-sm text-text-secondary">City {row}, State</div>
                      <div className="text-sm text-text-secondary">+91 9876543210</div>
                      <div className="text-sm text-text-secondary">contact{row}@company.com</div>
                      <div className="text-sm text-text-secondary">TAN{row}234A</div>
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pill-success-background text-pill-success-text">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mock pagination */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-text-secondary">
                    Showing 1 to 25 of 54 transporters
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-2 text-sm border border-gray-200 rounded-md">Previous</button>
                    <button className="px-3 py-2 text-sm bg-primary-accent text-white rounded-md">1</button>
                    <button className="px-3 py-2 text-sm border border-gray-200 rounded-md">2</button>
                    <button className="px-3 py-2 text-sm border border-gray-200 rounded-md">3</button>
                    <button className="px-3 py-2 text-sm border border-gray-200 rounded-md">Next</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/transporters"
              className="inline-flex items-center bg-primary-accent text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              <span>Try Interactive Demo</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransporterMaintenanceDemo;