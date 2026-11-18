import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Lock,
  UserCheck,
  MapPin,
  FileText,
  Upload,
  CheckCircle2,
  CheckCircle,
  Trash2,
  Link as LinkIcon,
  CreditCard,
  ShieldCheck,
  Camera,
  Search,
  AlertTriangle,
  AlertCircle,
  Send,
  Plus,
  Image as ImageIcon,
  FilePlus,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import crmService from '../../../services/crmService';
import SearchableSelect from '../../../components/ui/SearchableSelect';

const LinkedinIcon = ({ className = "w-3.5 h-3.5 text-blue-600" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
  </svg>
);

// Fast offline Indian pincode dictionary for instantaneous city lookup
const PINCODE_MAP = {
  '380': { city: 'Ahmedabad', state: 'Gujarat' },
  '382': { city: 'Gandhinagar', state: 'Gujarat' },
  '395': { city: 'Surat', state: 'Gujarat' },
  '390': { city: 'Vadodara', state: 'Gujarat' },
  '360': { city: 'Rajkot', state: 'Gujarat' },
  '361': { city: 'Jamnagar', state: 'Gujarat' },
  '364': { city: 'Bhavnagar', state: 'Gujarat' },
  '388': { city: 'Anand', state: 'Gujarat' },
  '396': { city: 'Vapi / Valsad', state: 'Gujarat' },
  '400': { city: 'Mumbai', state: 'Maharashtra' },
  '411': { city: 'Pune', state: 'Maharashtra' },
  '440': { city: 'Nagpur', state: 'Maharashtra' },
  '110': { city: 'New Delhi', state: 'Delhi' },
  '560': { city: 'Bengaluru', state: 'Karnataka' },
  '500': { city: 'Hyderabad', state: 'Telangana' },
  '600': { city: 'Chennai', state: 'Tamil Nadu' },
  '700': { city: 'Kolkata', state: 'West Bengal' },
  '302': { city: 'Jaipur', state: 'Rajasthan' },
  '226': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '201': { city: 'Noida / Ghaziabad', state: 'Uttar Pradesh' },
  '122': { city: 'Gurugram', state: 'Haryana' },
  '160': { city: 'Chandigarh', state: 'Punjab' },
  '452': { city: 'Indore', state: 'Madhya Pradesh' },
  '462': { city: 'Bhopal', state: 'Madhya Pradesh' },
};

// Lead source options requested by user
const LEAD_SOURCE_OPTIONS = [
  'Website',
  'Meta Ads',
  'Referral',
  'Cold Call',
  'IndiaMART',
  'Justdial',
  'Other',
];

export const LeadModal = ({ isOpen, onClose, onSuccess, lead = null }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin' || user?.is_super_admin === true;
  const isManager = user?.is_manager || user?.role?.toLowerCase().includes('manager') || isSuperAdmin;
  const canAssignLead = isManager;
  const hasContactAccess = !lead || lead.has_contact_access !== false;

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
    job_title: '',
    website: '',
    linkedin: '',
    other_link: '',
    lead_source_id: '',
    lead_source_name: 'Website',
    other_source_details: '',
    campaign_id: '',
    industry: 'Technology',
    company_size: '50-200',
    budget: '',
    expected_value: '',
    expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    status: 'new',
    assigned_to: '',
    notes: '',
    documents: {
      pan_card: null,
      aadhar_card: null,
      bank_passbook: null,
      passport_photo: null,
      electricity_bill: null,
      pre_installation_photo: null,
      post_installation_photo: null,
      other_documents: [],
    },
  });

  const [leadSources, setLeadSources] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeDetected, setPincodeDetected] = useState('');

  // Duplicate Lead Detection & Request Approval States
  const [duplicateMatch, setDuplicateMatch] = useState(null);
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false);
  const [duplicateReason, setDuplicateReason] = useState('');
  const [requestingDuplicate, setRequestingDuplicate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      setDuplicateMatch(null);
      setDuplicateReason('');
      if (lead) {
        setFormData({
          name: lead.name || '',
          company_name: lead.company_name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          address: lead.address || '',
          pincode: lead.pincode || '',
          city: lead.city || '',
          state: lead.state || '',
          country: lead.country || 'India',
          job_title: lead.job_title || '',
          website: lead.website || '',
          linkedin: lead.linkedin || '',
          other_link: lead.other_link || '',
          lead_source_id: lead.lead_source_id || '',
          lead_source_name: lead.lead_source_name || lead.lead_source?.name || 'Website',
          other_source_details: lead.other_source_details || '',
          campaign_id: lead.campaign_id || '',
          industry: lead.industry || 'Technology',
          company_size: lead.company_size || '50-200',
          budget: lead.budget || '',
          expected_value: lead.expected_value || '',
          expected_close_date: lead.expected_close_date || '',
          status: lead.status || 'new',
          assigned_to: lead.assigned_to || '',
          notes: lead.notes || '',
          documents: {
            pan_card: lead.documents?.pan_card || null,
            aadhar_card: lead.documents?.aadhar_card || null,
            bank_passbook: lead.documents?.bank_passbook || null,
            passport_photo: lead.documents?.passport_photo || null,
            electricity_bill: lead.documents?.electricity_bill || null,
            pre_installation_photo: lead.documents?.pre_installation_photo || null,
            post_installation_photo: lead.documents?.post_installation_photo || null,
            other_documents: Array.isArray(lead.documents?.other_documents) ? lead.documents.other_documents : [],
          },
        });
      } else {
        setFormData({
          name: '',
          company_name: '',
          email: '',
          phone: '',
          address: '',
          pincode: '',
          city: '',
          state: '',
          country: 'India',
          job_title: '',
          website: '',
          linkedin: '',
          other_link: '',
          lead_source_id: '',
          lead_source_name: 'Website',
          other_source_details: '',
          campaign_id: '',
          industry: 'Technology',
          company_size: '50-200',
          budget: '',
          expected_value: '',
          expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
          status: 'new',
          assigned_to: '',
          notes: '',
          documents: {
            pan_card: null,
            aadhar_card: null,
            bank_passbook: null,
            passport_photo: null,
            electricity_bill: null,
            pre_installation_photo: null,
            post_installation_photo: null,
            other_documents: [],
          },
        });
        setPincodeDetected('');
      }
    }
  }, [isOpen, lead]);

  // Real-time Duplicate Lead Detection (name, phone, email)
  useEffect(() => {
    if (lead) {
      setDuplicateMatch(null);
      return;
    }

    const name = formData.name?.trim();
    const phone = formData.phone?.trim();
    const email = formData.email?.trim();

    if (!phone && !email && (!name || name.length < 3)) {
      setDuplicateMatch(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setDuplicateCheckLoading(true);
        const res = await crmService.checkDuplicate({
          name,
          phone,
          email,
        });
        if (res && res.is_duplicate) {
          setDuplicateMatch(res);
        } else {
          setDuplicateMatch(null);
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      } finally {
        setDuplicateCheckLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.name, formData.phone, formData.email, lead]);

  // Request Admin Approval for Duplicate Lead
  const handleRequestDuplicateApproval = async () => {
    if (!duplicateMatch) return;

    const missingDocs = validateRequiredDocuments();
    if (missingDocs.length > 0) {
      alert(
        'તમામ ૭ દસ્તાવેજો અપલોડ કરવા ફરજિયાત છે (All 7 documents are required before submitting to Admin):\n\n' +
        'કૃપા કરીને નીચેના બાકી દસ્તાવેજો અપલોડ કરો:\n• ' +
        missingDocs.join('\n• ')
      );
      return;
    }

    if (!duplicateReason.trim()) {
      alert('Please provide a reason or explanation for adding this duplicate lead.');
      return;
    }

    try {
      setRequestingDuplicate(true);
      await crmService.requestDuplicate({
        existing_lead_id: duplicateMatch.existing_lead.id,
        lead_data: formData,
        matched_field: duplicateMatch.matched_field,
        matched_value: duplicateMatch.matched_value,
        reason: duplicateReason.trim(),
      });

      alert('Duplicate lead request has been sent to Admin! Admin will review and approve it.');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit duplicate lead request.');
    } finally {
      setRequestingDuplicate(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const calls = [
        crmService.getLeadSources(),
        crmService.getCampaigns({ per_page: 50 }),
      ];
      if (canAssignLead) {
        calls.push(crmService.getAssignees());
      }
      const [srcRes, campRes, assigneesRes] = await Promise.all(calls);
      setLeadSources(srcRes.data || []);
      const campPayload = campRes.data?.data || campRes.data;
      setCampaigns(campPayload.data || campPayload || []);
      if (assigneesRes) {
        setAssignees(assigneesRes.data || []);
      }
    } catch (err) {
      console.error('Error loading lead dependencies:', err);
    }
  };

  // Pincode auto-fill handler
  const handlePincodeChange = async (pinValue) => {
    const cleanPin = pinValue.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: cleanPin }));

    if (cleanPin.length === 6) {
      // 1. Instant offline cache lookup
      const prefix = cleanPin.substring(0, 3);
      if (PINCODE_MAP[prefix]) {
        const { city, state } = PINCODE_MAP[prefix];
        setFormData((prev) => ({ ...prev, city, state: state || prev.state }));
        setPincodeDetected(`${city}, ${state}`);
      }

      // 2. Online India Post API lookup fallback/enrichment
      try {
        setPincodeLoading(true);
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        const data = await res.json();
        if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const detectedCity = po.District || po.Division || po.Block || po.Name;
          const detectedState = po.State;
          setFormData((prev) => ({
            ...prev,
            city: detectedCity,
            state: detectedState,
          }));
          setPincodeDetected(`${detectedCity}, ${detectedState}`);
        }
      } catch (err) {
        // Quietly keep cached city or user manual entry
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeDetected('');
    }
  };

  // Document upload handler (reads file to Base64)
  const handleFileUpload = (docKey, file) => {
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8 MB limit. Please select a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docKey]: {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
            data: e.target.result,
          },
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (docKey) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: null,
      },
    }));
  };

  const handleAddOtherDoc = () => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        other_documents: [
          ...(prev.documents?.other_documents || []),
          { id: Date.now(), title: '', file: null },
        ],
      },
    }));
  };

  const handleRemoveOtherDoc = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        other_documents: (prev.documents?.other_documents || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleOtherDocTitleChange = (index, title) => {
    setFormData((prev) => {
      const list = [...(prev.documents?.other_documents || [])];
      list[index] = { ...list[index], title };
      return {
        ...prev,
        documents: {
          ...prev.documents,
          other_documents: list,
        },
      };
    });
  };

  const handleOtherDocFileUpload = (index, file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8 MB limit. Please select a smaller file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => {
        const list = [...(prev.documents?.other_documents || [])];
        list[index] = {
          ...list[index],
          file: {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
            data: e.target.result,
          },
        };
        return {
          ...prev,
          documents: {
            ...prev.documents,
            other_documents: list,
          },
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const validateRequiredDocuments = () => {
    const missing = [];
    if (!formData.documents?.pan_card) missing.push('PAN Card (પાન કાર્ડ)');
    if (!formData.documents?.aadhar_card) missing.push('Aadhaar Card (આધાર કાર્ડ)');
    if (!formData.documents?.bank_passbook) missing.push('Passbook / Cancel Cheque (પાસબુક અથવા કેન્સલ ચેક)');
    if (!formData.documents?.passport_photo) missing.push('Passport Size Photo (પાસપોર્ટ સાઇઝ ફોટો)');
    if (!formData.documents?.electricity_bill) missing.push('Electricity Bill (લાઇટ બિલ / વીજળી બિલ)');
    if (!formData.documents?.pre_installation_photo) missing.push('Pre-installation Photo (ઇન્સ્ટોલેશન પહેલાંનો ફોટો)');
    if (!formData.documents?.post_installation_photo) missing.push('Post-installation Photo (ઇન્સ્ટોલેશન પછીનો ફોટો)');
    return missing;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (duplicateMatch && !lead && !isSuperAdmin) {
      alert('This lead already exists in CRM! Please send a request to Admin to approve adding this duplicate lead.');
      return;
    }

    if (formData.lead_source_name === 'Other' && !formData.other_source_details?.trim()) {
      alert('Please enter the source link or description for "Other" lead source.');
      return;
    }

    // Strict validation: all 6 documents are required as requested by user
    const missingDocs = validateRequiredDocuments();
    if (missingDocs.length > 0) {
      alert(
        'તમામ ૬ દસ્તાવેજો અપલોડ કરવા ફરજિયાત છે (All 6 documents are required):\n\n' +
        'કૃપા કરીને નીચેના બાકી દસ્તાવેજો અપલોડ કરો:\n• ' +
        missingDocs.join('\n• ')
      );
      return;
    }

    try {
      setSubmitting(true);
      if (lead?.id) {
        await crmService.updateLead(lead.id, formData);
      } else {
        await crmService.createLead(formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving lead.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 my-6 !overflow-visible">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-teal-50/20 to-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {lead ? 'Edit CRM Lead Profile' : 'Register New CRM Lead'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Complete contact, address, KYC documents and sales pipeline details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs !overflow-visible">
          {/* SECTION 1: PRIMARY CONTACT INFORMATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-100 pb-1.5">
              <span>1. Contact & Organization Info</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Lead / Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Vikram Mehta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Infosys Digital Labs"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Address
                  </span>
                  {!hasContactAccess && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                      <Lock className="w-2.5 h-2.5" /> Protected
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  disabled={!hasContactAccess}
                  placeholder={hasContactAccess ? 'vikram@infosys.com' : 'Email masked by privacy policy'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    !hasContactAccess
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
                  } focus:outline-hidden`}
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Phone Number
                  </span>
                  {!hasContactAccess && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                      <Lock className="w-2.5 h-2.5" /> Protected
                    </span>
                  )}
                </label>
                <input
                  type="tel"
                  disabled={!hasContactAccess}
                  placeholder={hasContactAccess ? '+91 98210 54321' : 'Phone masked by privacy policy'}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-xs ${
                    !hasContactAccess
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
                  } focus:outline-hidden`}
                />
              </div>
            </div>

            {/* DUPLICATE LEAD ALERT BANNER */}
            {duplicateMatch && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2.5 animate-fadeIn">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-rose-800 text-xs flex items-center gap-1.5">
                        <span>⚠️ Already Lead Exists! (આ લીડ પહેલેથી CRM માં હાજર છે)</span>
                      </h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-200 text-rose-800 uppercase tracking-wider">
                        Duplicate Match
                      </span>
                    </div>

                    <p className="text-[11px] text-rose-700 mt-1">
                      A lead with this <strong className="font-semibold uppercase">{duplicateMatch.matched_field}</strong>: <code className="bg-rose-100 px-1 py-0.5 rounded font-mono font-bold text-rose-900">{duplicateMatch.matched_value}</code> is already registered.
                    </p>

                    <div className="mt-2 p-2 bg-white/90 rounded-lg border border-rose-200 text-[11px] text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                      <div><span className="text-slate-500">Existing Lead:</span> <strong className="font-semibold text-slate-900">{duplicateMatch.existing_lead.name}</strong></div>
                      <div><span className="text-slate-500">Company:</span> <strong className="font-semibold text-slate-900">{duplicateMatch.existing_lead.company_name || 'N/A'}</strong></div>
                      <div><span className="text-slate-500">Assigned Staff:</span> <strong className="font-semibold text-emerald-700">{duplicateMatch.existing_lead.assigned_user?.name || 'Unassigned'}</strong></div>
                      <div><span className="text-slate-500">Status:</span> <strong className="capitalize font-semibold text-teal-700">{duplicateMatch.existing_lead.status}</strong></div>
                    </div>

                    <p className="text-[11px] text-rose-700 mt-2 font-medium">
                      ⚠️ સીધી લીડ એડ નહીં થાય. જો આ ડુપ્લીકેટ લીડ એડ કરવી હોય તો નીચે કારણ લખીને <strong>Admin ને Request Send</strong> કરો. Admin approve કરશે પછી જ આ લીડ એડ થશે.
                    </p>

                    <div className="mt-2.5">
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Reason for adding duplicate lead (Admin Approval Request) <span className="text-rose-600">*</span>:
                      </label>
                      <textarea
                        rows={2}
                        value={duplicateReason}
                        onChange={(e) => setDuplicateReason(e.target.value)}
                        placeholder="e.g. Client reopened inquiry with new branch / separate project requirement..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Manager & Super Admin Lead Assignment Control */}
            {canAssignLead ? (
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/80">
                <label className="font-semibold text-slate-800 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    Assign Lead To
                  </span>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wide">
                    {isSuperAdmin ? 'Admin Control' : 'Manager Control'}
                  </span>
                </label>
                <SearchableSelect
                  options={[
                    { value: '', label: '-- Unassigned (Available in Pool) --' },
                    ...assignees.map((a) => ({
                      value: String(a.id),
                      label: `${a.name} (${typeof a.department === 'string' ? a.department : (a.department?.name || a.role)})`,
                    })),
                  ]}
                  value={String(formData.assigned_to || '')}
                  onChange={(val) => setFormData({ ...formData, assigned_to: val ? Number(val) : '' })}
                  placeholder="-- Assign Lead To --"
                />
              </div>
            ) : lead ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 block">Lead Assignment:</span>
                <span className="text-xs font-bold text-slate-800">
                  {lead.assigned_to ? lead.assigned_user?.name || lead.owner?.name || 'Assigned' : 'Unassigned'}
                </span>
              </div>
            ) : null}
          </div>

          {/* SECTION 2: ADDRESS, PINCODE & LOCATION (WITH AUTO CITY FILL) */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-100 pb-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>2. Address & Location Details</span>
            </h4>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Street Address</label>
              <input
                type="text"
                placeholder="Flat / Office / Street / Area, Landmark"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Pincode</span>
                  {pincodeLoading && <span className="text-[10px] text-teal-600 animate-pulse">Finding...</span>}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 380001"
                    value={formData.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {pincodeDetected && (
                  <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block truncate">
                    ✓ {pincodeDetected}
                  </span>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  City <span className="text-slate-400 font-normal">(Auto-fill)</span>
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">State</label>
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Country</label>
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: LEAD SOURCE SELECTION (Website, Meta Ads, Referral, Cold Call, IndiaMART, Justdial, Other) */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-100 pb-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>3. Lead Source (ક્યાંથી લીડ આવે છે)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Select Lead Source <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={LEAD_SOURCE_OPTIONS.map((src) => ({
                    value: src,
                    label: src,
                  }))}
                  value={formData.lead_source_name || 'Website'}
                  onChange={(val) => {
                    const matched = leadSources.find((s) => s.name?.toLowerCase() === val?.toLowerCase());
                    setFormData((prev) => ({
                      ...prev,
                      lead_source_name: val,
                      lead_source_id: matched ? matched.id : prev.lead_source_id,
                    }));
                  }}
                  placeholder="Select where lead came from..."
                  searchable={false}
                />
              </div>

              {formData.lead_source_name === 'Other' ? (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Other Source Link / Description <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Enter link or description (e.g. Trade Expo, WhatsApp Group, Flyer)..."
                    value={formData.other_source_details || ''}
                    onChange={(e) => setFormData({ ...formData, other_source_details: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-teal-500 bg-teal-50/20 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs font-medium"
                  />
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Website / Campaign URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com or source link"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: KYC & REQUIRED DOCUMENT UPLOADS */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>4. KYC Documents & Site Photos (તમામ ૭ દસ્તાવેજો ફરજિયાત છે)</span>
              </h4>
              {(() => {
                const uploadedCount = [
                  formData.documents?.pan_card,
                  formData.documents?.aadhar_card,
                  formData.documents?.bank_passbook,
                  formData.documents?.passport_photo,
                  formData.documents?.electricity_bill,
                  formData.documents?.pre_installation_photo,
                  formData.documents?.post_installation_photo,
                ].filter(Boolean).length;
                return (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      uploadedCount === 7
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {uploadedCount === 7 ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {uploadedCount} / 7 Required Uploaded
                  </span>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Slot 1: PAN Card */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    PAN Card <span className="text-rose-500 font-bold">*</span>
                  </span>
                  {formData.documents?.pan_card ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      * Required
                    </span>
                  )}
                </div>

                {formData.documents?.pan_card ? (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                    <div className="flex items-center gap-2 truncate">
                      {formData.documents.pan_card.data?.startsWith('data:image') ? (
                        <img
                          src={formData.documents.pan_card.data}
                          alt="PAN preview"
                          className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-700 truncate">
                        {formData.documents.pan_card.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formData.documents.pan_card.size})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('pan_card')}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 transition-all text-[11px] text-slate-600">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload PAN Card (PDF / Image)</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileUpload('pan_card', e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* Slot 2: Aadhaar Card */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Aadhaar Card <span className="text-rose-500 font-bold">*</span>
                  </span>
                  {formData.documents?.aadhar_card ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      * Required
                    </span>
                  )}
                </div>

                {formData.documents?.aadhar_card ? (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                    <div className="flex items-center gap-2 truncate">
                      {formData.documents.aadhar_card.data?.startsWith('data:image') ? (
                        <img
                          src={formData.documents.aadhar_card.data}
                          alt="Aadhaar preview"
                          className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-700 truncate">
                        {formData.documents.aadhar_card.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formData.documents.aadhar_card.size})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('aadhar_card')}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 transition-all text-[11px] text-slate-600">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload Aadhaar Card (PDF / Image)</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileUpload('aadhar_card', e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* Slot 3: Passbook / Cancelled Cheque */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <FileText className="w-4 h-4 text-teal-600" />
                    Passbook / Cancel Cheque <span className="text-rose-500 font-bold">*</span>
                  </span>
                  {formData.documents?.bank_passbook ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      * Required
                    </span>
                  )}
                </div>

                {formData.documents?.bank_passbook ? (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                    <div className="flex items-center gap-2 truncate">
                      {formData.documents.bank_passbook.data?.startsWith('data:image') ? (
                        <img
                          src={formData.documents.bank_passbook.data}
                          alt="Passbook preview"
                          className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-700 truncate">
                        {formData.documents.bank_passbook.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formData.documents.bank_passbook.size})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('bank_passbook')}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 transition-all text-[11px] text-slate-600">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload Passbook / Cancel Cheque</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileUpload('bank_passbook', e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* Slot 4: Passport Size Photo */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-teal-600" />
                    Passport Size Photo <span className="text-rose-500 font-bold">*</span>
                  </span>
                  {formData.documents?.passport_photo ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      * Required
                    </span>
                  )}
                </div>

                {formData.documents?.passport_photo ? (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                    <div className="flex items-center gap-2 truncate">
                      {formData.documents.passport_photo.data?.startsWith('data:image') ? (
                        <img
                          src={formData.documents.passport_photo.data}
                          alt="Passport preview"
                          className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <Camera className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-700 truncate">
                        {formData.documents.passport_photo.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formData.documents.passport_photo.size})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('passport_photo')}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 transition-all text-[11px] text-slate-600">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload Passport Photo (JPG / PNG)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileUpload('passport_photo', e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* Slot 5: Electricity Bill */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Electricity Bill (લાઇટ બિલ) <span className="text-rose-500 font-bold">*</span>
                  </span>
                  {formData.documents?.electricity_bill ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      * Required
                    </span>
                  )}
                </div>

                {formData.documents?.electricity_bill ? (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                    <div className="flex items-center gap-2 truncate">
                      {formData.documents.electricity_bill.data?.startsWith('data:image') ? (
                        <img
                          src={formData.documents.electricity_bill.data}
                          alt="Electricity bill preview"
                          className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-700 truncate">
                        {formData.documents.electricity_bill.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formData.documents.electricity_bill.size})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('electricity_bill')}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 transition-all text-[11px] text-slate-600">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload Electricity Bill (PDF / Image)</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileUpload('electricity_bill', e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* Slot 6: Pre-installation Photos */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-teal-600" />
                    Pre-installation Photo <span className="text-rose-500 font-bold">*</span>
                  </span>
                  {formData.documents?.pre_installation_photo ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      * Required
                    </span>
                  )}
                </div>

                {formData.documents?.pre_installation_photo ? (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                    <div className="flex items-center gap-2 truncate">
                      {formData.documents.pre_installation_photo.data?.startsWith('data:image') ? (
                        <img
                          src={formData.documents.pre_installation_photo.data}
                          alt="Pre-installation preview"
                          className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-700 truncate">
                        {formData.documents.pre_installation_photo.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formData.documents.pre_installation_photo.size})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('pre_installation_photo')}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 transition-all text-[11px] text-slate-600">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload Pre-installation (JPG / PNG)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload('pre_installation_photo', e.target.files[0])}
                    />
                  </label>
                )}
              </div>

              {/* Slot 7: Post-installation Photos */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-4 h-4 text-teal-600" />
                    Post-installation Photo <span className="text-rose-500 font-bold">*</span>
                  </span>
                  {formData.documents?.post_installation_photo ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      * Required
                    </span>
                  )}
                </div>

                {formData.documents?.post_installation_photo ? (
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                    <div className="flex items-center gap-2 truncate">
                      {formData.documents.post_installation_photo.data?.startsWith('data:image') ? (
                        <img
                          src={formData.documents.post_installation_photo.data}
                          alt="Post-installation preview"
                          className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-teal-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-700 truncate">
                        {formData.documents.post_installation_photo.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formData.documents.post_installation_photo.size})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('post_installation_photo')}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50/20 transition-all text-[11px] text-slate-600">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload Post-installation (JPG / PNG)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload('post_installation_photo', e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Other Documents (અન્ય દસ્તાવેજો) Dynamic Section */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FilePlus className="w-4 h-4 text-teal-600" />
                    <span>Other Documents / Attachments (અન્ય દસ્તાવેજો)</span>
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    Add any additional documents like GST Certificate, Electricity Bill, Quotation, Site Survey, etc.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOtherDoc}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Other Document</span>
                </button>
              </div>

              {(!formData.documents?.other_documents || formData.documents.other_documents.length === 0) ? (
                <div className="text-center py-2 text-[11px] text-slate-400 italic bg-white/60 border border-dashed border-slate-200 rounded-lg">
                  No other documents added. Click &quot;Add Other Document&quot; above to attach extra files.
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.documents.other_documents.map((otherDoc, index) => (
                    <div
                      key={otherDoc.id || index}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <input
                        type="text"
                        placeholder="Document Title (e.g. GST Certificate, Light Bill)"
                        value={otherDoc.title || ''}
                        onChange={(e) => handleOtherDocTitleChange(index, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-xs"
                      />

                      {otherDoc.file ? (
                        <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded border border-slate-200 text-[11px] max-w-xs truncate">
                          {otherDoc.file.data?.startsWith('data:image') ? (
                            <img
                              src={otherDoc.file.data}
                              alt="preview"
                              className="w-5 h-5 rounded object-cover shrink-0"
                            />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          )}
                          <span className="truncate font-medium text-slate-700">{otherDoc.file.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">({otherDoc.file.size})</span>
                        </div>
                      ) : (
                        <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer transition-colors text-[11px] shrink-0">
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          <span>Choose File</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx"
                            className="hidden"
                            onChange={(e) => handleOtherDocFileUpload(index, e.target.files[0])}
                          />
                        </label>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveOtherDoc(index)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer shrink-0 self-end sm:self-center"
                        title="Delete this document entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: BUSINESS & PIPELINE DETAILS */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-100 pb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-teal-600" />
              <span>5. Business & Pipeline Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Job Title / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Chief Technology Officer"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Industry</label>
                <input
                  type="text"
                  placeholder="Technology, Manufacturing, Retail..."
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Marketing Campaign</label>
                <SearchableSelect
                  options={[
                    { value: '', label: '-- No Direct Campaign --' },
                    ...campaigns.map((c) => ({ value: String(c.id), label: c.name })),
                  ]}
                  value={String(formData.campaign_id)}
                  onChange={(val) => setFormData({ ...formData, campaign_id: val })}
                  placeholder="-- No Direct Campaign --"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Size</label>
                <input
                  type="text"
                  placeholder="e.g. 50-200 employees"
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Budget (₹)</label>
                <input
                  type="number"
                  placeholder="250000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Expected Deal Value (₹)</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={formData.expected_value}
                  onChange={(e) => setFormData({ ...formData, expected_value: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Expected Close</label>
                <input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Initial Status</label>
              <SearchableSelect
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'unqualified', label: 'Unqualified' },
                  { value: 'lost', label: 'Lost' },
                ]}
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
                placeholder="Initial Status"
                searchable={false}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Notes & Requirements</label>
              <textarea
                rows={3}
                placeholder="Client pain point, current software stack, requested modules..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {duplicateMatch && !lead ? (
                <>
                  <button
                    type="button"
                    onClick={handleRequestDuplicateApproval}
                    disabled={requestingDuplicate || !duplicateReason.trim()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    title={!duplicateReason.trim() ? 'Please provide a reason to submit to Admin' : 'Submit request to Admin'}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {requestingDuplicate ? 'Sending Request...' : 'Send Request to Admin to Add Duplicate Lead'}
                  </button>

                  {isSuperAdmin && (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors"
                    >
                      {submitting ? 'Saving...' : 'Force Register (Admin Override)'}
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <span>Saving Lead...</span>
                  ) : (
                    <span>{lead ? 'Update Lead' : 'Register Lead'}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
