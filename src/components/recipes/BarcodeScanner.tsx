import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Search, Star, Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  image_url?: string;
  nutriments: {
    energy_kcal_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    salt_100g?: number;
  };
  ingredients_text?: string;
  allergens?: string;
  categories?: string;
  nutrition_grade?: string;
}

interface BarcodeScannerProps {
  onProductFound: (product: ScannedProduct) => void;
  onClose: () => void;
  isOpen: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onProductFound,
  onClose,
  isOpen
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 📱 RICHIEDI PERMESSI CAMERA
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Camera posteriore per scanner
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setHasPermission(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error('Camera permission denied:', err);
      setHasPermission(false);
      setError('Permesso camera negato. Usa inserimento manuale.');
    }
  };

  // 🔍 LOOKUP PRODOTTO DA OPENFOODFACTS
  const lookupProduct = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [SCANNER] Looking up barcode:', barcode);
      
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        
        // 🔧 NORMALIZZA DATI PRODOTTO
        const normalizedProduct: ScannedProduct = {
          barcode: barcode,
          name: product.product_name || product.product_name_it || product.product_name_en || 'Prodotto sconosciuto',
          brand: product.brands,
          image_url: product.image_url,
          nutriments: {
            energy_kcal_100g: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.energy_kcal_100g,
            proteins_100g: product.nutriments?.proteins_100g,
            carbohydrates_100g: product.nutriments?.carbohydrates_100g,
            fat_100g: product.nutriments?.fat_100g,
            fiber_100g: product.nutriments?.fiber_100g,
            sugars_100g: product.nutriments?.sugars_100g,
            salt_100g: product.nutriments?.salt_100g,
          },
          ingredients_text: product.ingredients_text_it || product.ingredients_text_en || product.ingredients_text,
          allergens: product.allergens,
          categories: product.categories,
          nutrition_grade: product.nutrition_grades
        };
        
        console.log('✅ [SCANNER] Product found:', normalizedProduct);
        setScannedProduct(normalizedProduct);
        
        // Ferma scansione se attiva
        if (isScanning) {
          stopScanning();
        }
        
      } else {
        setError('Prodotto non trovato nel database. Prova con inserimento manuale.');
        console.log('❌ [SCANNER] Product not found for barcode:', barcode);
      }
    } catch (error) {
      console.error('❌ [SCANNER] API Error:', error);
      setError('Errore di connessione. Verifica la connessione internet.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🛑 FERMA SCANSIONE
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // 📱 SIMULA SCANSIONE BARCODE (In produzione useresti una libreria come QuaggaJS)
  const simulateBarcodeScan = () => {
    // Codici di test per demo
    const testBarcodes = [
      '8000500310427', // Barilla Pasta
      '8076809513424', // San Pellegrino
      '8003170087057', // Mutti Pomodori
      '8712566061938', // Ben & Jerry's
      '3017620425035'  // Nutella
    ];
    
    const randomBarcode = testBarcodes[Math.floor(Math.random() * testBarcodes.length)];
    lookupProduct(randomBarcode);
  };

  // 🔄 RESET SCANNER
  const resetScanner = () => {
    setScannedProduct(null);
    setError(null);
    setManualBarcode('');
  };

  // ✅ AGGIUNGI AI PREFERITI
  const addToFavorites = () => {
    if (scannedProduct) {
      onProductFound(scannedProduct);
      
      // Salva in localStorage per tracking
      const favorites = JSON.parse(localStorage.getItem('scannedFavorites') || '[]');
      const newFavorite = {
        ...scannedProduct,
        addedAt: new Date().toISOString(),
        frequency: 1
      };
      
      // Controlla se esiste già
      const existingIndex = favorites.findIndex((f: any) => f.barcode === scannedProduct.barcode);
      if (existingIndex >= 0) {
        favorites[existingIndex].frequency += 1;
      } else {
        favorites.push(newFavorite);
      }
      
      localStorage.setItem('scannedFavorites', JSON.stringify(favorites));
      console.log('✅ [SCANNER] Added to favorites:', scannedProduct.name);
      
      // Chiudi scanner
      onClose();
    }
  };

  // 🧹 CLEANUP EFFETTI
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // 🚪 MODAL OVERLAY
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Search size={24} className="text-green-400" />
            Scanner Prodotti
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* RISULTATO PRODOTTO SCANSIONATO */}
          {scannedProduct && (
            <div className="bg-gray-700 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-4">
                {scannedProduct.image_url && (
                  <img 
                    src={scannedProduct.image_url}
                    alt={scannedProduct.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-white text-lg">{scannedProduct.name}</h4>
                  {scannedProduct.brand && (
                    <p className="text-gray-400 text-sm">{scannedProduct.brand}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">Barcode: {scannedProduct.barcode}</p>
                </div>
                {scannedProduct.nutrition_grade && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    scannedProduct.nutrition_grade === 'a' ? 'bg-green-500' :
                    scannedProduct.nutrition_grade === 'b' ? 'bg-yellow-500' :
                    scannedProduct.nutrition_grade === 'c' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}>
                    {scannedProduct.nutrition_grade.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Valori Nutrizionali */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-600 rounded p-3 text-center">
                  <div className="text-lg font-bold text-white">
                    {scannedProduct.nutriments.energy_kcal_100g?.toFixed(0) || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">kcal/100g</div>
                </div>
                <div className="bg-gray-600 rounded p-3 text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {scannedProduct.nutriments.proteins_100g?.toFixed(1) || 'N/A'}g
                  </div>
                  <div className="text-xs text-gray-400">Proteine</div>
                </div>
                <div className="bg-gray-600 rounded p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {scannedProduct.nutriments.carbohydrates_100g?.toFixed(1) || 'N/A'}g
                  </div>
                  <div className="text-xs text-gray-400">Carboidrati</div>
                </div>
                <div className="bg-gray-600 rounded p-3 text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    {scannedProduct.nutriments.fat_100g?.toFixed(1) || 'N/A'}g
                  </div>
                  <div className="text-xs text-gray-400">Grassi</div>
                </div>
              </div>

              {/* Ingredienti */}
              {scannedProduct.ingredients_text && (
                <div>
                  <h5 className="font-semibold text-white mb-2">🥘 Ingredienti:</h5>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {scannedProduct.ingredients_text.length > 200 
                      ? scannedProduct.ingredients_text.substring(0, 200) + '...'
                      : scannedProduct.ingredients_text
                    }
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={addToFavorites}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Star size={20} />
                  Aggiungi ai Preferiti
                </button>
                <button
                  onClick={resetScanner}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>
          )}

          {/* SCANNER CAMERA */}
          {!scannedProduct && (
            <>
              {/* Camera Scanner */}
              {hasPermission === null && (
                <div className="text-center space-y-4">
                  <div className="text-gray-400 mb-4">
                    <Camera size={48} className="mx-auto mb-2" />
                    Scansiona il codice a barre di un prodotto per ottenere informazioni nutrizionali dettagliate
                  </div>
                  <button
                    onClick={requestCameraPermission}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
                  >
                    <Camera size={20} />
                    Avvia Scanner
                  </button>
                </div>
              )}

              {hasPermission === false && (
                <div className="text-center space-y-4">
                  <div className="text-red-400 mb-4">
                    <AlertCircle size={48} className="mx-auto mb-2" />
                    Camera non disponibile. Usa l'inserimento manuale del codice a barre.
                  </div>
                </div>
              )}

              {isScanning && (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-green-400 w-64 h-20 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={stopScanning}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-4">Inquadra il codice a barre del prodotto</p>
                    <button
                      onClick={simulateBarcodeScan}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      🧪 Test Scansione Demo
                    </button>
                  </div>
                </div>
              )}

              {/* Inserimento Manuale */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="font-semibold text-white mb-4">📝 Inserimento Manuale</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="Inserisci codice a barre (es: 8000500310427)"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => lookupProduct(manualBarcode)}
                    disabled={!manualBarcode || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Search size={20} />
                    )}
                    {isLoading ? 'Ricerca in corso...' : 'Cerca Prodotto'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Errori */}
          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-red-400" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Ricerca prodotto in corso...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;