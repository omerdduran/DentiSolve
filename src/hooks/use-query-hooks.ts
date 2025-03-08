import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Patient, Xray, Appointment } from '@/shared/types';
import * as apiService from '@/lib/api-service';

// Query keys
export const QUERY_KEYS = {
  PATIENTS: 'patients',
  PATIENT: 'patient',
  XRAYS: 'xrays',
  PATIENT_XRAYS: 'patientXrays',
  EVENTS: 'events',
  PATIENT_APPOINTMENTS: 'patientAppointments',
};

/**
 * Hook to fetch all patients
 */
export const usePatients = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PATIENTS],
    queryFn: apiService.fetchPatients,
  });
};

/**
 * Hook to fetch a specific patient by ID
 */
export const usePatient = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PATIENT, id],
    queryFn: () => apiService.fetchPatientById(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch all X-rays
 */
export const useXrays = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.XRAYS],
    queryFn: apiService.fetchXrays,
  });
};

/**
 * Hook to fetch X-rays for a specific patient
 */
export const usePatientXrays = (patientId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PATIENT_XRAYS, patientId],
    queryFn: () => apiService.fetchPatientXrays(patientId),
    enabled: options?.enabled !== undefined ? options.enabled : !!patientId,
  });
};

/**
 * Hook to fetch all events/appointments
 */
export const useEvents = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.EVENTS],
    queryFn: apiService.fetchEvents,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

/**
 * Hook to fetch appointments for a specific patient
 */
export const usePatientAppointments = (patientId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PATIENT_APPOINTMENTS, patientId],
    queryFn: () => apiService.fetchPatientAppointments(patientId),
    enabled: options?.enabled !== undefined ? options.enabled : !!patientId,
  });
};

/**
 * Hook to update a patient
 */
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Patient> }) => 
      apiService.updatePatient(id, data),
    onSuccess: (updatedPatient) => {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENT, updatedPatient.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENT_APPOINTMENTS] });
      
      // Update the specific patient in the cache
      queryClient.setQueryData(
        [QUERY_KEYS.PATIENT, updatedPatient.id], 
        updatedPatient
      );
    },
  });
};

/**
 * Hook to create a new patient
 */
export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Patient, 'id'>) => apiService.createPatient(data),
    onSuccess: () => {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] });
    },
  });
};

/**
 * Hook to delete a patient
 */
export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiService.deletePatient(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.XRAYS] });
      
      // Remove the specific patient from the cache
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.PATIENT, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENT_APPOINTMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENT_XRAYS] });
    },
  });
};

/**
 * Hook to create a new appointment
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { title: string; date: string; patientId: number }) => 
      apiService.createAppointment(data),
    onSuccess: async () => {
      // Tüm önbelleği temizle
      queryClient.clear();
    },
  });
};

/**
 * Hook to update or create an X-ray
 */
export const useUpdateOrCreateXray = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number | null; data: Partial<Xray> }) => 
      apiService.updateOrCreateXray(id, data),
    onSuccess: (updatedXray) => {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.XRAYS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENTS] });
      
      // Invalidate and refetch patient X-rays if patient ID is available
      if (updatedXray.patient?.id) {
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.PATIENT_XRAYS, updatedXray.patient.id] 
        });
      }
    },
  });
};

/**
 * Hook to delete an X-ray
 */
export const useDeleteXray = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: number; patientId?: number }) => {
      await apiService.deleteXray(id);
      return { id, patientId };
    },
    onSuccess: (result) => {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.XRAYS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PATIENTS] });
      
      // If we have the patient ID, invalidate that patient's X-rays
      if (result.patientId) {
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.PATIENT_XRAYS, result.patientId] 
        });
      }
    },
  });
}; 