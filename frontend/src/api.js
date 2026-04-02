import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const register        = (data)           => API.post('/register', data);
export const login           = (data)           => API.post('/login', data);
export const submitComplaint = (formData) => API.post('/complaint', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getAllComplaints = ()              => API.get('/complaints');
export const getMyComplaints = (email)         => API.get(`/complaints/email/${email}`);
export const updateStatus    = (id, data)      => API.put(`/status/${id}`, data);
export const deleteComplaint = (id)            => API.delete(`/complaints/${id}`);

// ── AI Endpoints ───────────────────────────────────────────────
export const getAiSuggestion = (id)            => API.get(`/complaints/${id}/ai-suggest`);
export const getAiDraft       = (id)           => API.get(`/complaints/${id}/ai-draft`);
export const sendChatMessage  = (message, history) => API.post('/ai/chat', { message, history });
export const getAiStatus      = ()             => API.get('/ai/status');
export const getAiInsights    = ()             => API.get('/analytics/insights');
export const getFeedbackAnalysis = ()          => API.get('/analytics/feedback');
export const getZonalHealth   = ()             => API.get('/analytics/zonal-health');
export const getPredictiveForecast = ()        => API.get('/analytics/forecast');
export const getNextWeekStrategy   = ()        => API.get('/analytics/next-week-strategy');
export const getDailyRoute         = ()        => API.get('/analytics/daily-route');
export const getAnomalyAlerts      = ()        => API.get('/analytics/alerts');
export const getValueSaved         = ()        => API.get('/governance/value-saved');
export const getSustainability    = ()        => API.get('/governance/sustainability');
export const getProposals         = ()        => API.get('/governance/proposals');
export const voteProposal         = (id, email) => API.post(`/governance/proposals/${id}/vote`, null, { params: { email } });
export const pledgeProposal       = (id, data)   => API.post(`/governance/proposals/${id}/pledge`, data);
export const getBenchmarks        = ()        => API.get('/governance/benchmarks');
export const getLedger            = ()        => API.get('/governance/ledger');
export const getUserImpact        = (email)     => API.get('/user/impact', { params: { email } });
export const getUserImpactReport  = (email)     => API.get('/user/impact-report', { params: { email } });
export const checkSimilarity       = (data)       => API.post('/complaints/check-similarity', data);
export const triggerVendorHandoff  = (id)         => API.post(`/complaints/${id}/handoff`);
export const triggerOracle         = ()         => API.post('/admin/trigger-oracle');
export const redeemPerk          = (data)       => API.post('/governance/marketplace/redeem', data);
export const mediateDispute       = (data)       => API.post('/ai/mediate', data);
export const supportComplaint = (id)           => API.post(`/complaints/${id}/support`);
export const searchSemantic   = (query, email) => API.post('/complaints/search', { query, email });

export default API;
