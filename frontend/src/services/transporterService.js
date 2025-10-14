import api from '../utils/api';

// API endpoints for transporter operations
export const transporterAPI = {
  // Get all transporters with pagination and filters
  getTransporters: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 25,
        transporterId = '',
        tan = '',
        tinPan = '',
        vatGst = '',
        status = '',
        transportMode = []
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add filter parameters if they exist
      if (transporterId) queryParams.append('transporterId', transporterId);
      if (tan) queryParams.append('tan', tan);
      if (tinPan) queryParams.append('tinPan', tinPan);
      if (vatGst) queryParams.append('vatGst', vatGst);
      if (status) queryParams.append('status', status);
      if (transportMode.length > 0) {
        transportMode.forEach(mode => queryParams.append('transportMode', mode));
      }

      const response = await api.get(`/transporters?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transporters:', error);
      throw error;
    }
  },

  // Get single transporter by ID
  getTransporterById: async (transporterId) => {
    try {
      const response = await api.get(`/transporters/${transporterId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transporter:', error);
      throw error;
    }
  },

  // Create new transporter
  createTransporter: async (transporterData) => {
    try {
      const response = await api.post('/transporters', transporterData);
      return response.data;
    } catch (error) {
      console.error('Error creating transporter:', error);
      throw error;
    }
  },

  // Update transporter
  updateTransporter: async (transporterId, transporterData) => {
    try {
      const response = await api.put(`/transporters/${transporterId}`, transporterData);
      return response.data;
    } catch (error) {
      console.error('Error updating transporter:', error);
      throw error;
    }
  },

  // Delete transporter
  deleteTransporter: async (transporterId) => {
    try {
      const response = await api.delete(`/transporters/${transporterId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transporter:', error);
      throw error;
    }
  },

  // Bulk upload transporters
  bulkUploadTransporters: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/transporters/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk uploading transporters:', error);
      throw error;
    }
  }
};

// Mock data generator for testing
export const generateMockTransporters = (count = 174) => {
  const statuses = ['Active', 'Pending', 'Inactive', 'Approved', 'Rejected'];
  const transportModes = [
    ['R'], ['A'], ['RL'], ['S'],
    ['R', 'A'], ['R', 'RL'], ['A', 'S'], ['R', 'A', 'RL'],
    ['R', 'S'], ['A', 'RL'], ['RL', 'S'], ['R', 'A', 'S'],
    ['R', 'RL', 'S'], ['A', 'RL', 'S'], ['R', 'A', 'RL', 'S']
  ];
  
  const locations = [
    { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai', country: 'India' },
    { city: 'Delhi', state: 'Delhi', district: 'New Delhi', country: 'India' },
    { city: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban', country: 'India' },
    { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', country: 'India' },
    { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', country: 'India' },
    { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', country: 'India' },
    { city: 'Pune', state: 'Maharashtra', district: 'Pune', country: 'India' },
    { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', country: 'India' },
    { city: 'Surat', state: 'Gujarat', district: 'Surat', country: 'India' },
    { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', country: 'India' },
    { city: 'Indore', state: 'Madhya Pradesh', district: 'Indore', country: 'India' },
    { city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', country: 'India' },
    { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', country: 'India' },
    { city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', country: 'India' },
    { city: 'Patna', state: 'Bihar', district: 'Patna', country: 'India' }
  ];

  const businessNames = [
    'Agrawal Packers & Movers', 'Blue Dart', 'Delhivery', 'DTDC Express', 'Ecom Express',
    'FedEx India', 'Gati Limited', 'Hindustan Logistics', 'Indian Express', 'JK Logistics',
    'Kedia Transport', 'Logistics Plus', 'Mahindra Logistics', 'National Express', 'Om Logistics',
    'Professional Couriers', 'Quick Transport', 'Reliable Logistics', 'SafeExpress', 'Transport Corporation',
    'United Cargo', 'VRL Logistics Limited', 'Warelq', 'XpressBees', 'Yellow Express', 'Zomato Logistics'
  ];

  const creators = ['Admin User', 'System Admin', 'Transport Manager', 'Operations Head'];
  const approvers = ['Regional Manager', 'Transport Head', 'Senior Manager', 'Director Operations'];

  return Array.from({ length: count }, (_, index) => {
    const location = locations[index % locations.length];
    const businessName = businessNames[index % businessNames.length];
    const createdDate = new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000);
    const approvedDate = new Date(createdDate.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    
    return {
      id: `T${String(index + 1).padStart(3, '0')}`,
      businessName: `${businessName} ${index > businessNames.length ? Math.floor(index / businessNames.length) : ''}`.trim(),
      transportMode: transportModes[index % transportModes.length],
      mobileNumber: Math.random() > 0.3 ? `${String(Math.floor(Math.random() * 9000000000) + 1000000000)}` : 'N/A',
      emailId: Math.random() > 0.2 ? `${businessName.toLowerCase().replace(/[^a-z]/g, '')}${index + 1}@gmail.com` : 'N/A',
      tinPan: Math.random() > 0.1 ? `${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + ((index + 1) % 26))}BC${String(index + 1).padStart(4, '0')}${String.fromCharCode(67 + (index % 24))}` : 'N/A',
      vatGst: Math.random() > 0.15 ? `${String(Math.floor(Math.random() * 35) + 1).padStart(2, '0')}${String.fromCharCode(65 + (index % 26))}BC${String(index + 1).padStart(4, '0')}${String.fromCharCode(67 + (index % 24))}1${String.fromCharCode(82 + (index % 8))}${String.fromCharCode(83 + (index % 6))}` : 'N/A',
      country: location.country,
      state: location.state,
      city: location.city,
      district: location.district,
      address: `${location.city}, ${location.state}, ${location.country}`,
      createdBy: creators[index % creators.length],
      createdOn: createdDate.toISOString().split('T')[0],
      status: statuses[index % statuses.length],
      approver: Math.random() > 0.3 ? approvers[index % approvers.length] : 'N/A',
      approvedOn: Math.random() > 0.3 ? approvedDate.toISOString().split('T')[0] : 'N/A',
      // Legacy fields for backward compatibility
      tan: Math.random() > 0.2 ? `TAN${String(index + 1).padStart(5, '0')}${String.fromCharCode(65 + (index % 26))}` : 'N/A',
      createdAt: createdDate.toISOString().split('T')[0],
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  });
};

export default transporterAPI;