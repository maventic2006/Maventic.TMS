import React from "react";
import { Building, User, Key, CreditCard, Calendar, FileText, AlertTriangle } from "lucide-react";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium text-[#0D1A33]">{value || "N/A"}</p>
  </div>
);

const OwnershipDetailsViewTab = ({ vehicle, isEditMode }) => {
  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">Edit mode for Ownership Details coming soon...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="pb-4 border-b border-[#E5E7EB]">
        <h3 className="text-lg font-bold text-[#0D1A33]">Ownership & Lease Details</h3>
        <p className="text-sm text-[#4A5568] mt-1">Complete ownership, leasing, and financial information</p>
      </div> */}

      {/* Ownership Information */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Key className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Ownership Details</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Ownership Type" value={vehicle.ownership} />
          <InfoField label="Owner Name" value={vehicle.ownerName} />
          <InfoField label="Owner Contact" value={vehicle.ownerContact} />
          <InfoField label="Owner Email" value={vehicle.ownerEmail} />
          <InfoField label="Owner Address" value={vehicle.ownerAddress} />
          <InfoField label="Ownership Since" value={vehicle.ownershipSince} />
        </div>
      </div>

      {/* Transporter Association */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Building className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Transporter Association</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Transporter ID" value={vehicle.transporterId} />
          <InfoField label="Transporter Name" value={vehicle.transporterName} />
          <InfoField label="Association Date" value={vehicle.transporterAssociationDate} />
          <InfoField label="Contract Number" value={vehicle.transporterContractNumber} />
          <InfoField label="Contract Validity" value={vehicle.transporterContractValidity} />
        </div>
      </div>

      {/* Leasing Information */}
      {vehicle.ownership === "LEASED" && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
            <FileText className="h-5 w-5 text-[#6366F1]" />
            <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Leasing Details</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <InfoField label="Leasing Company" value={vehicle.leasingCompany} />
            <InfoField label="Lease Agreement Number" value={vehicle.leaseAgreementNumber} />
            <InfoField label="Lease Start Date" value={vehicle.leaseStartDate} />
            <InfoField label="Lease End Date" value={vehicle.leaseEndDate} />
            <InfoField label="Monthly Lease Amount" value={vehicle.monthlyLeaseAmount} />
            <InfoField label="Lease Security Deposit" value={vehicle.leaseSecurityDeposit} />
            <InfoField label="Lease Contact Person" value={vehicle.leaseContactPerson} />
            <InfoField label="Lease Contact Number" value={vehicle.leaseContactNumber} />
            <InfoField label="Lease Terms & Conditions" value={vehicle.leaseTerms} />
          </div>
        </div>
      )}

      {/* Financial Information */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <CreditCard className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Financial Details</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Purchase Price" value={vehicle.purchasePrice} />
          <InfoField label="Purchase Date" value={vehicle.purchaseDate} />
          <InfoField label="Current Market Value" value={vehicle.currentMarketValue} />
          <InfoField label="Loan Amount" value={vehicle.loanAmount} />
          <InfoField label="Outstanding Loan" value={vehicle.outstandingLoan} />
          <InfoField label="Loan Bank/Institution" value={vehicle.loanBank} />
          <InfoField label="Loan Account Number" value={vehicle.loanAccountNumber} />
          <InfoField label="EMI Amount" value={vehicle.emiAmount} />
          <InfoField label="Loan End Date" value={vehicle.loanEndDate} />
        </div>
      </div>

      {/* Insurance Details */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <FileText className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Insurance Information</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Insurance Company" value={vehicle.insuranceCompany} />
          <InfoField label="Insurance Policy Number" value={vehicle.insurancePolicyNumber} />
          <InfoField label="Insurance Type" value={vehicle.insuranceType} />
          <InfoField label="Sum Insured" value={vehicle.sumInsured} />
          <InfoField label="Premium Amount" value={vehicle.premiumAmount} />
          <InfoField label="Policy Start Date" value={vehicle.policyStartDate} />
          <InfoField label="Policy Expiry Date" value={vehicle.insuranceExpiryDate} />
          <InfoField label="IDV (Insured Declared Value)" value={vehicle.idv} />
          <InfoField label="Agent/Broker Name" value={vehicle.insuranceAgent} />
        </div>
      </div>

      {/* Depreciation & Tax */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E5E7EB]">
          <Calendar className="h-5 w-5 text-[#6366F1]" />
          <h4 className="text-sm font-bold text-[#0D1A33] uppercase tracking-wide">Depreciation & Tax</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <InfoField label="Depreciation Rate (%)" value={vehicle.depreciationRate} />
          <InfoField label="Accumulated Depreciation" value={vehicle.accumulatedDepreciation} />
          <InfoField label="Book Value" value={vehicle.bookValue} />
          <InfoField label="Road Tax Paid Until" value={vehicle.roadTaxPaidUntil} />
          <InfoField label="Annual Tax Amount" value={vehicle.annualTaxAmount} />
        </div>
      </div>

      {/* Blacklist Information (if applicable) */}
      {vehicle.blacklistedReason && (
        <div className="bg-[#FEE2E2] border-2 border-[#EF4444] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#EF4444]">
            <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
            <h4 className="text-sm font-bold text-[#EF4444] uppercase tracking-wide">Blacklist Information</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            <InfoField label="Blacklist Reason" value={vehicle.blacklistedReason} />
            <InfoField label="Blacklisted Date" value={vehicle.blacklistedDate} />
            <InfoField label="Blacklisted By" value={vehicle.blacklistedBy} />
            <InfoField label="Remarks" value={vehicle.blacklistRemarks} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnershipDetailsViewTab;
