import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Auth
export async function loginUser(email: string, password: string) {
  const { data } = await API.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  return data;
}

export async function registerUser(email: string, password: string, confirmPassword: string, name?: string) {
  const { data } = await API.post('/auth/register', { email, password, confirmPassword, name });
  return data;
}

export function logoutUser() {
  localStorage.removeItem('token');
  delete API.defaults.headers.common['Authorization'];
}

// Profile
export async function getProfile() {
  const { data } = await API.get('/profile');
  return data;
}

export async function updateProfile(profile: { name: string }) {
  const { data } = await API.put('/profile', profile);
  return data;
}

// Financial Profile
export async function getFinancialProfile() {
  const { data } = await API.get('/financialprofile');
  return data;
}

export async function updateFinancialProfile(profile: { 
  propertyAssets: number; 
  savings: number; 
  mortgageBalance: number;
  mortgageRate: number;
  superannuationBalance: number;
  superannuationRate: number;
  salary: number; 
  partnerSalary: number;
  expenses: number; 
  currentAge: number; 
  retireAge: number;
  deathAge: number;
  savingsGrowthRate: number;
  propertyGrowthRate: number;
  inflationRate: number;
  pensionAmount: number;
  pensionStartAge: number;
  partnerPensionAmount: number;
  partnerPensionStartAge: number;
  partnerAge: number;
  partnerRetireAge: number;
}) {
  const { data } = await API.post('/financialprofile', profile);
  return data;
}

// Financial Plan
export async function getFinancialPlan() {
  try {
    console.log('Making API call to /api/financialplan');
    const { data } = await API.get('/financialplan');
    console.log('API response:', data);
    return data.projection || [];
  } catch (error: any) {
    console.error('API Error in getFinancialPlan:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Set token from localStorage on load
const token = localStorage.getItem('token');
if (token) {
  API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
