import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Warehouse, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  Search, 
  Filter,
  RefreshCw,
  Building2,
  X,
  Edit,
  Trash2
} from "lucide-react";
import { getPageTheme } from "../../../theme.config";

const WarehouseListTab = ({ consignor, formData, handleInputChange }) => {
  const { id: customerId } = useParams();
  const theme = getPageTheme("tab");

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMappingForm, setShowMappingForm] = useState(false);
  const [availableWarehouses, setAvailableWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [mappingStatus, setMappingStatus] = useState("ACTIVE");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    warehouse_type: "",
    page: 1,
    limit: 10
  });
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch warehouses
  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${apiUrl}/api/consignors/${customerId}/warehouses?${queryParams}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch warehouses');
      }

      const result = await response.json();
      setWarehouses(result.data || []);
      setMeta(result.meta || {});
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available warehouses for mapping
  const fetchAvailableWarehouses = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/warehouse?limit=1000&status=ACTIVE`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available warehouses');
      }

      const result = await response.json();
      // Filter out already mapped warehouses
      const mappedIds = warehouses.map(w => w.warehouse_id);
      const available = (result.data || []).filter(w => !mappedIds.includes(w.warehouse_id));
      setAvailableWarehouses(available);
    } catch (error) {
      console.error('Error fetching available warehouses:', error);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchWarehouses();
    }
  }, [customerId, filters.page, filters.status, filters.warehouse_type]);

  useEffect(() => {
    if (showMappingForm) {
      fetchAvailableWarehouses();
    }
  }, [showMappingForm, warehouses]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchWarehouses();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "",
      warehouse_type: "",
      page: 1,
      limit: 10
    });
  };

  const handleAddMapping = async () => {
    if (!selectedWarehouse) {
      alert('Please select a warehouse');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/consignors/${customerId}/warehouses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            warehouse_id: selectedWarehouse,
            status: mappingStatus
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create warehouse mapping');
      }

      // Success - reset form and refresh list
      setShowMappingForm(false);
      setSelectedWarehouse("");
      setMappingStatus("ACTIVE");
      fetchWarehouses();
      alert('Warehouse mapped successfully!');
    } catch (error) {
      console.error('Error creating warehouse mapping:', error);
      alert('Failed to map warehouse. Please try again.');
    }
  };

  const handleDeleteMapping = async (mappingId) => {
    if (!confirm('Are you sure you want to remove this warehouse mapping?')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${apiUrl}/api/consignors/${customerId}/warehouses/${mappingId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete warehouse mapping');
      }

      fetchWarehouses();
      alert('Warehouse mapping removed successfully!');
    } catch (error) {
      console.error('Error deleting warehouse mapping:', error);
      alert('Failed to remove warehouse mapping. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700';
      case 'INACTIVE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header with Actions */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: theme.colors.text.primary, marginBottom: "4px" }}>
            Manage Warehouses
          </h2>
          <p style={{ fontSize: "14px", color: theme.colors.text.secondary }}>
            Total: {meta.total} warehouse{meta.total !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: showFilters ? theme.colors.primary.background : "white",
              color: showFilters ? "white" : theme.colors.text.primary,
              border: `1px solid ${theme.colors.card.border}`,
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Filter size={16} />
            Filters
          </button>

          <button
            onClick={fetchWarehouses}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: "white",
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.card.border}`,
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              opacity: loading ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => setShowMappingForm(!showMappingForm)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              backgroundColor: theme.colors.button.primary.background,
              color: theme.colors.button.primary.text,
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Plus size={16} />
            {showMappingForm ? 'Cancel' : 'Map Warehouse'}
          </button>
        </div>
      </div>

      {/* Mapping Form */}
      {showMappingForm && (
        <div style={{
          backgroundColor: theme.colors.card.background,
          border: `2px solid ${theme.colors.primary.background}`,
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px"
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: theme.colors.text.primary, marginBottom: "20px" }}>
            Map New Warehouse
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            {/* Warehouse Selection */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: theme.colors.text.secondary, marginBottom: "8px" }}>
                Select Warehouse <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${theme.colors.card.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none"
                }}
              >
                <option value="">-- Select Warehouse --</option>
                {availableWarehouses.map(warehouse => (
                  <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                    {warehouse.warehouse_name} ({warehouse.warehouse_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: theme.colors.text.secondary, marginBottom: "8px" }}>
                Mapping Status <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={mappingStatus}
                onChange={(e) => setMappingStatus(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${theme.colors.card.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none"
                }}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                setShowMappingForm(false);
                setSelectedWarehouse("");
                setMappingStatus("ACTIVE");
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.card.border}`,
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddMapping}
              disabled={!selectedWarehouse}
              style={{
                padding: "10px 20px",
                backgroundColor: selectedWarehouse ? theme.colors.button.primary.background : theme.colors.card.background,
                color: selectedWarehouse ? theme.colors.button.primary.text : theme.colors.text.disabled,
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: selectedWarehouse ? "pointer" : "not-allowed",
                opacity: selectedWarehouse ? 1 : 0.5
              }}
            >
              Add Mapping
            </button>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div style={{
          backgroundColor: theme.colors.card.background,
          border: `1px solid ${theme.colors.card.border}`,
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: theme.colors.text.primary }}>
              Filter Warehouses
            </h3>
            <button
              onClick={handleClearFilters}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 12px",
                backgroundColor: "transparent",
                color: theme.colors.text.secondary,
                border: "none",
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              <X size={14} />
              Clear All
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {/* Search */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: theme.colors.text.secondary, marginBottom: "8px" }}>
                Search
              </label>
              <form onSubmit={handleSearch}>
                <div style={{ position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: theme.colors.text.disabled }} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Name, ID, City..."
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 36px",
                      border: `1px solid ${theme.colors.card.border}`,
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                </div>
              </form>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: theme.colors.text.secondary, marginBottom: "8px" }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${theme.colors.card.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none"
                }}
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Warehouse Type Filter */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: theme.colors.text.secondary, marginBottom: "8px" }}>
                Warehouse Type
              </label>
              <select
                value={filters.warehouse_type}
                onChange={(e) => handleFilterChange('warehouse_type', e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${theme.colors.card.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none"
                }}
              >
                <option value="">All Types</option>
                <option value="Distribution Center">Distribution Center</option>
                <option value="Fulfillment Center">Fulfillment Center</option>
                <option value="Cold Storage">Cold Storage</option>
                <option value="Cross-Dock">Cross-Dock</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: `4px solid ${theme.colors.card.border}`,
            borderTop: `4px solid ${theme.colors.primary.background}`,
            borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ color: theme.colors.text.secondary }}>Loading warehouses...</p>
        </div>
      ) : warehouses.length === 0 ? (
        <div style={{
          backgroundColor: theme.colors.card.background,
          border: `2px dashed ${theme.colors.card.border}`,
          borderRadius: "12px",
          padding: "60px 20px",
          textAlign: "center"
        }}>
          <Warehouse size={48} style={{ color: theme.colors.text.disabled, margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: theme.colors.text.primary, marginBottom: "8px" }}>
            No Warehouses Mapped
          </h3>
          <p style={{ fontSize: "14px", color: theme.colors.text.secondary, marginBottom: "20px" }}>
            Map warehouses to this consignor to get started
          </p>
          <button
            onClick={() => setShowMappingForm(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              backgroundColor: theme.colors.button.primary.background,
              color: theme.colors.button.primary.text,
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            <Plus size={18} />
            Map First Warehouse
          </button>
        </div>
      ) : (
        <>
          {/* Warehouse Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            {warehouses.map((warehouse) => (
              <div
                key={warehouse.mapping_id}
                style={{
                  backgroundColor: theme.colors.card.background,
                  border: `1px solid ${theme.colors.card.border}`,
                  borderRadius: "12px",
                  padding: "20px",
                  transition: "all 0.2s",
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = theme.colors.card.shadow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "start", gap: "12px", flex: 1 }}>
                    <div style={{
                      backgroundColor: theme.colors.primary.background + "15",
                      padding: "10px",
                      borderRadius: "8px"
                    }}>
                      <Building2 size={20} style={{ color: theme.colors.primary.background }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", color: theme.colors.text.primary, marginBottom: "4px" }}>
                        {warehouse.warehouse_name || 'N/A'}
                      </h3>
                      <p style={{ fontSize: "12px", color: theme.colors.text.secondary }}>
                        {warehouse.warehouse_id}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "8px", alignItems: "start" }}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(warehouse.mapping_status)}`}>
                      {warehouse.mapping_status}
                    </span>
                    <button
                      onClick={() => handleDeleteMapping(warehouse.mapping_id)}
                      style={{
                        padding: "6px",
                        backgroundColor: "transparent",
                        color: theme.colors.status.error,
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.status.error + "15";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={14} style={{ color: theme.colors.text.secondary }} />
                    <span style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                      {[warehouse.city, warehouse.state, warehouse.country].filter(Boolean).join(', ') || 'Location not specified'}
                    </span>
                  </div>
                  
                  {warehouse.contact_person && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={14} style={{ color: theme.colors.text.secondary }} />
                      <span style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                        {warehouse.contact_person}{warehouse.contact_number && ` - ${warehouse.contact_number}`}
                      </span>
                    </div>
                  )}

                  {warehouse.email_id && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail size={14} style={{ color: theme.colors.text.secondary }} />
                      <span style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                        {warehouse.email_id}
                      </span>
                    </div>
                  )}

                  {warehouse.warehouse_type && (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 10px",
                      backgroundColor: theme.colors.primary.background + "10",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: theme.colors.primary.background,
                      fontWeight: "500",
                      marginTop: "4px",
                      width: "fit-content"
                    }}>
                      {warehouse.warehouse_type}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{
                  marginTop: "16px",
                  paddingTop: "16px",
                  borderTop: `1px solid ${theme.colors.card.border}`,
                  fontSize: "12px",
                  color: theme.colors.text.disabled
                }}>
                  Mapped on: {warehouse.mapped_at ? new Date(warehouse.mapped_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!meta.hasPrevPage}
                style={{
                  padding: "8px 16px",
                  backgroundColor: meta.hasPrevPage ? "white" : theme.colors.card.background,
                  color: meta.hasPrevPage ? theme.colors.text.primary : theme.colors.text.disabled,
                  border: `1px solid ${theme.colors.card.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: meta.hasPrevPage ? "pointer" : "not-allowed",
                  opacity: meta.hasPrevPage ? 1 : 0.5
                }}
              >
                Previous
              </button>
              
              <span style={{ fontSize: "14px", color: theme.colors.text.secondary }}>
                Page {meta.page} of {meta.totalPages}
              </span>

              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!meta.hasNextPage}
                style={{
                  padding: "8px 16px",
                  backgroundColor: meta.hasNextPage ? "white" : theme.colors.card.background,
                  color: meta.hasNextPage ? theme.colors.text.primary : theme.colors.text.disabled,
                  border: `1px solid ${theme.colors.card.border}`,
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: meta.hasNextPage ? "pointer" : "not-allowed",
                  opacity: meta.hasNextPage ? 1 : 0.5
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WarehouseListTab;