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
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carica automaticamente i dati salvati al mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Carica i dati salvati dal localStorage
  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        setHasSavedData(true);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei dati salvati:', error);
    }
  };

  // Salva i dati nel localStorage
  const saveToStorage = (data: FormData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setHasSavedData(true);
    } catch (error) {
      console.error('Errore nel salvataggio dei dati:', error);
    }
  };

  // Gestisce il cambiamento di un campo del form con auto-save
  const handleInputChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Cancella il timeout precedente se esiste
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Imposta un nuovo timeout per l'auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToStorage(newFormData);
    }, AUTO_SAVE_DELAY);
  };

  // Cancella i dati salvati
  const clearSavedData = () => {
    const confirmMessage = 'Sei sicuro di voler cancellare i dati salvati e inserire nuovi dati?';
    
    if (confirm(confirmMessage)) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        setHasSavedData(false);
        setFormData(initialFormData);
        
        // Cancella anche eventuali timeout pending
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
          autoSaveTimeoutRef.current = null;
        }
        
        alert('✅ Dati cancellati! Puoi inserire nuovi dati.');
      } catch (error) {
        console.error('Errore nella cancellazione dei dati:', error);
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