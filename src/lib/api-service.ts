import { Patient, Xray, Appointment } from '@/lib/types';

// API endpoint constants
const API_ENDPOINTS = {
  PATIENTS: '/api/patients',
  XRAYS: '/api/xrays',
  EVENTS: '/api/events',
};

// Fetch options with cache control
const FETCH_OPTIONS = {
  cache: 'force-cache' as RequestCache,
  next: { revalidate: 300 } // 5 minutes
};

/**
 * Fetches all patients
 */
export const fetchPatients = async (): Promise<Patient[]> => {
  const response = await fetch(API_ENDPOINTS.PATIENTS, FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }
  return response.json();
};

/**
 * Fetches a specific patient by ID
 */
export const fetchPatientById = async (id: number): Promise<Patient> => {
  const response = await fetch(`${API_ENDPOINTS.PATIENTS}/${id}`, FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error(`Failed to fetch patient with ID ${id}`);
  }
  return response.json();
};

/**
 * Fetches all X-rays
 */
export const fetchXrays = async (): Promise<Xray[]> => {
  const response = await fetch(API_ENDPOINTS.XRAYS, FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error('Failed to fetch X-rays');
  }
  return response.json();
};

/**
 * Fetches X-rays for a specific patient
 */
export const fetchPatientXrays = async (patientId: number): Promise<Xray[]> => {
  const response = await fetch(`${API_ENDPOINTS.XRAYS}?patientId=${patientId}`, FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error(`Failed to fetch X-rays for patient with ID ${patientId}`);
  }
  return response.json();
};

/**
 * Fetches all appointments/events
 */
export const fetchEvents = async (): Promise<Appointment[]> => {
  // Önbelleği kırmak için timestamp ekle, ama URL'de görünmesin
  const response = await fetch(API_ENDPOINTS.EVENTS, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

/**
 * Fetches appointments for a specific patient
 */
export const fetchPatientAppointments = async (patientId: number): Promise<Appointment[]> => {
  const response = await fetch(`${API_ENDPOINTS.EVENTS}?patientId=${patientId}`, FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error(`Failed to fetch appointments for patient with ID ${patientId}`);
  }
  return response.json();
};

/**
 * Updates a patient
 */
export const updatePatient = async (id: number, data: Partial<Patient>): Promise<Patient> => {
  const response = await fetch(`${API_ENDPOINTS.PATIENTS}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update patient with ID ${id}`);
  }
  
  return response.json();
};

/**
 * Creates a new patient
 */
export const createPatient = async (data: Omit<Patient, 'id'>): Promise<Patient> => {
  const response = await fetch(API_ENDPOINTS.PATIENTS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create patient');
  }
  
  return response.json();
};

/**
 * Deletes a patient
 */
export const deletePatient = async (id: number): Promise<void> => {
  const response = await fetch(`${API_ENDPOINTS.PATIENTS}/${id}/delete`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete patient with ID ${id}`);
  }
};

/**
 * Creates a new appointment
 */
export const createAppointment = async (data: { title: string; date: string; patientId: number }): Promise<Appointment> => {
  const response = await fetch(`${API_ENDPOINTS.EVENTS}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create appointment');
  }
  
  return response.json();
};

/**
 * Updates or creates an X-ray
 */
export const updateOrCreateXray = async (id: number | null, data: Partial<Xray>): Promise<Xray> => {
  const url = id ? `${API_ENDPOINTS.XRAYS}/${id}` : API_ENDPOINTS.XRAYS;
  const method = id ? 'PUT' : 'POST';
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to ${id ? 'update' : 'create'} X-ray`);
  }
  
  return response.json();
};

/**
 * Deletes an X-ray
 */
export const deleteXray = async (id: number): Promise<void> => {
  const response = await fetch(`${API_ENDPOINTS.XRAYS}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete X-ray with ID ${id}`);
  }
}; 