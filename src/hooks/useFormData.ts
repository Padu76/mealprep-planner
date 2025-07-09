import { useState, useEffect, useRef } from 'react';
import { FormData } from '../types';

const STORAGE_KEY = 'mealPrepFormData';
const AUTO_SAVE_DELAY = 1000; // 1 secondo

const initialFormData: FormData = {
  nome: '',
  eta: '',
  sesso: '',
  peso: '',
  altezza: '',
  attivita: '',
  obiettivo: '',
  allergie: '',
  preferenze: '',
  pasti: '',
  durata: '',
  varieta: ''
};

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carica automaticamente i dati salvati al mount - SOLO lato client
  useEffect(() => {
    setIsClient(true);
    loadSavedData();
  }, []);

  // Carica i dati salvati dal localStorage
  const loadSavedData = () => {
    if (typeof window === 'undefined') return; // Prevenzione SSR
    
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      console.log('📂 Loading saved data:', savedData); // DEBUG
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('✅ Parsed data:', parsedData); // DEBUG
        setFormData(parsedData);
        setHasSavedData(true);
      } else {
        console.log('📭 No saved data found'); // DEBUG
      }
    } catch (error) {
      console.error('❌ Errore nel caricamento dei dati salvati:', error);
    }
  };

  // Salva i dati nel localStorage
  const saveToStorage = (data: FormData) => {
    if (typeof window === 'undefined') return; // Prevenzione SSR
    
    try {
      const dataToSave = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, dataToSave);
      console.log('💾 Data saved:', dataToSave); // DEBUG
      setHasSavedData(true);
    } catch (error) {
      console.error('❌ Errore nel salvataggio dei dati:', error);
    }
  };

  // Gestisce il cambiamento di un campo del form con auto-save
  const handleInputChange = (field: keyof FormData, value: string) => {
    console.log('📝 Input change:', field, '=', value); // DEBUG
    
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Cancella il timeout precedente se esiste
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Imposta un nuovo timeout per l'auto-save - SOLO se client-side
    if (isClient) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Auto-saving triggered for:', field); // DEBUG
        saveToStorage(newFormData);
      }, AUTO_SAVE_DELAY);
    }
  };

  // Cancella i dati salvati
  const clearSavedData = () => {
    const confirmMessage = 'Sei sicuro di voler cancellare i dati salvati e inserire nuovi dati?';
    
    if (confirm(confirmMessage)) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
          console.log('🗑️ Saved data cleared'); // DEBUG
        }
        setHasSavedData(false);
        setFormData(initialFormData);
        
        // Cancella anche eventuali timeout pending
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
          autoSaveTimeoutRef.current = null;
        }
        
        alert('✅ Dati cancellati! Puoi inserire nuovi dati.');
      } catch (error) {
        console.error('❌ Errore nella cancellazione dei dati:', error);
        alert('❌ Errore nella cancellazione dei dati.');
      }
    }
  };

  // Reset form data (utile per "nuovo piano")
  const resetFormData = () => {
    setFormData(initialFormData);
    setHasSavedData(false);
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
  };

  // Cleanup del timeout quando il componente viene unmountato
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    formData,
    hasSavedData,
    handleInputChange,
    clearSavedData,
    resetFormData,
    loadSavedData
  };
};