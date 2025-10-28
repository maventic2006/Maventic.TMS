import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Plus, Edit3, Trash2, Phone, Mail, Star, Building2 } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../ui/Table';

const AddressContactsTab = ({ transporter, transporterId, onUpdate }) => {
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  
  // Use actual data from API response
  const addresses = transporter?.addresses || [];
  const contacts = transporter?.contacts || [];

  // Address type mapping
  const getAddressTypeLabel = (addressType) => {
    const typeMap = {
      'AT001': 'Head Office',
      'AT002': 'Branch Office',
      'AT003': 'Warehouse',
      'AT004': 'Regional Office'
    };
    return typeMap[addressType] || 'Office';
  };

  // Filter contacts based on selected address
  const filteredContacts = contacts.filter(contact => 
    contact.addressId === addresses[selectedAddressIndex]?.id
  );

  const handleAddressSelect = (index) => {
    setSelectedAddressIndex(index);
  };

  const AddressCard = ({ address, index, isSelected, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'border-primary-accent bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl shadow-blue-100' 
          : 'border-gray-200 bg-gradient-to-br from-white via-white to-gray-50 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary-accent/10' : 'bg-gray-100'}`}>
            <MapPin className={`h-5 w-5 ${isSelected ? 'text-primary-accent' : 'text-text-secondary'}`} />
          </div>
          <div>
            <span className={`font-bold text-lg ${isSelected ? 'text-primary-accent' : 'text-text-primary'}`}>
              {getAddressTypeLabel(address.addressType)}
            </span>
            {address.isPrimary && (
              <div className="mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Primary Location
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="hover:bg-white hover:shadow-md transition-all duration-200">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="p-3 bg-white/50 rounded-xl border border-gray-100">
          <div className="flex items-center space-x-2 mb-1">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">VAT Number</span>
          </div>
          <span className="text-text-primary font-semibold">{address.vatNumber || 'Not Available'}</span>
        </div>
        
        <div className="space-y-2">
          <div className="text-text-primary font-medium">
            📍 {address.street1 || ''}{address.street2 ? `, ${address.street2}` : ''}
          </div>
          <div className="text-text-secondary">
            🏛️ {address.district || ''}{address.city ? `, ${address.city}` : ''}{address.state ? `, ${address.state}` : ''}{address.postalCode ? ` - ${address.postalCode}` : ''}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-semibold border border-blue-200">
              🌍 {address.country || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Addresses Section */}
      <Card className="shadow-xl bg-gradient-to-br from-white via-white to-blue-50/30 border-white/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <MapPin className="h-6 w-6 text-primary-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-text-primary to-primary-accent bg-clip-text text-transparent">
                  Business Addresses
                </h3>
                <p className="text-text-secondary text-sm mt-1">Physical locations and office addresses</p>
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
                className="flex items-center space-x-2 bg-white/80 hover:bg-white border-gray-200 hover:border-primary-accent hover:text-primary-accent hover:shadow-glow transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Address</span>
              </Button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {addresses.map((address, index) => (
              <AddressCard
                key={address.id}
                address={address}
                index={index}
                isSelected={selectedAddressIndex === index}
                onClick={() => handleAddressSelect(index)}
              />
            ))}
          </div>
          
          {addresses.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-10 w-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">No Addresses Found</h4>
              <p className="text-text-secondary mb-4">Add the first business address to get started</p>
              <Button variant="outline" className="bg-white hover:bg-gray-50">
                <Plus className="h-4 w-4 mr-2" />
                Add First Address
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Contacts Section */}
      <Card className="shadow-xl bg-gradient-to-br from-white via-white to-green-50/30 border-white/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-3"
            >
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-text-primary to-green-600 bg-clip-text text-transparent">
                  Contact Persons
                </h3>
                <p className="text-text-secondary text-sm mt-1">
                  {addresses[selectedAddressIndex] ? 
                    `For ${getAddressTypeLabel(addresses[selectedAddressIndex]?.addressType)}` : 
                    'Select an address to view contacts'
                  }
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2 bg-white/80 hover:bg-white border-gray-200 hover:border-green-400 hover:text-green-600 hover:shadow-glow transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span>Add Contact</span>
              </Button>
            </motion.div>
          </div>

          {filteredContacts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Role</TableHead>
                    <TableHead className="text-white">Phone Number</TableHead>
                    <TableHead className="text-white">Alternate Phone</TableHead>
                    <TableHead className="text-white">Email ID</TableHead>
                    <TableHead className="text-white">Alternate Email</TableHead>
                    <TableHead className="text-white text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact, index) => (
                    <TableRow 
                      key={contact.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 bg-primary-accent rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{contact.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {contact.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-text-secondary" />
                          <span>{contact.phoneNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {contact.alternatePhoneNumber || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-text-secondary" />
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            {contact.emailId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {contact.alternateEmailId ? (
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            {contact.alternateEmailId}
                          </span>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-text-secondary opacity-40 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-text-primary mb-2">
                No Contacts Found
              </h4>
              <p className="text-text-secondary mb-4">
                No contacts are associated with the selected address.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Contact</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AddressContactsTab;