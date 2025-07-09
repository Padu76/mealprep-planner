import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'mealPrepFormData';
const AUTO_SAVE_DELAY = 1000; // 1 secondo

// Aggiornata FormData con array
export interface FormData {
  nome: string;
  eta: string;
  sesso: string;
  peso: string;
  altezza: string;
  attivita: string;
  obiettivo: string;
  allergie: string[]; // Ora è un array
  preferenze: string[]; // Ora è un array
  pasti: string;
  durata: string;
  varieta: string;
}

const initialFormData: FormData = {
  nome: '',
  eta: '',
  sesso: '',
  peso: '',
  altezza: '',
  attivita: '',
  obiettivo: '',
  allergie: [], // Array vuoto
  preferenze: [], // Array vuoto
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
        
        // Assicurati che allergie e preferenze siano array
        if (parsedData.allergie && typeof parsedData.allergie === 'string') {
          parsedData.allergie = parsedData.allergie.split(',').filter(Boolean);
        }
        if (parsedData.preferenze && typeof parsedData.preferenze === 'string') {
          parsedData.preferenze = parsedData.preferenze.split(',').filter(Boolean);
        }
        
        // Assicurati che tutti i campi array esistano
        parsedData.allergie = parsedData.allergie || [];
        parsedData.preferenze = parsedData.preferenze || [];
        
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

  // Nuova funzione per gestire checkbox array (allergie/preferenze)
  const handleArrayChange = (field: keyof FormData, value: string, checked: boolean) => {
    console.log('📝 Array change:', field, value, checked); // DEBUG
    
    const currentArray = formData[field] as string[];
    let newArray: string[];
    
    if (checked) {
      // Aggiungi se non già presente
      newArray = currentArray.includes(value) ? currentArray : [...currentArray, value];
    } else {
      // Rimuovi se presente
      newArray = currentArray.filter(item => item !== value);
    }
    
    const newFormData = { ...formData, [field]: newArray };
    setFormData(newFormData);
    
    // Cancella il timeout precedente se esiste
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Imposta un nuovo timeout per l'auto-save - SOLO se client-side
    if (isClient) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Auto-saving triggered for array:', field); // DEBUG
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
    handleArrayChange, // Nuova funzione esportata
    clearSavedData,
    resetFormData,
    loadSavedData
  };
};