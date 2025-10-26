import React, { useState, useCallback, useRef } from 'react';
import { PlateAnalysisResult } from './types';
import { analyzePlate } from './services/geminiService';

const Spinner: React.FC = () => (
  <svg
    className="animate-spin h-6 w-6 text-green-400"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

interface ResultDisplayProps {
  imageUrl: string;
  result: PlateAnalysisResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, result }) => {
  const { plateText, confidence } = result;
  const confidencePercentage = (confidence * 100).toFixed(1);

  return (
    <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 mt-8 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-400 mb-6">Resultado da Análise</h2>
        <div className="grid md:grid-cols-2 gap-8">
            <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden border-2 border-gray-700">
                <img src={imageUrl} alt="Veículo analisado com placa destacada" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left">
                <p className="text-lg text-gray-400">Placa Detectada:</p>
                <p className="text-4xl md:text-5xl font-mono font-bold tracking-widest bg-gray-700 text-white px-4 py-2 rounded-md my-2 shadow-inner">
                    {plateText}
                </p>
                <div className="mt-4">
                    <p className="text-lg text-gray-400">Confiança:</p>
                    <div className="flex items-center gap-3 mt-1">
                         <div className="w-48 bg-gray-700 rounded-full h-3">
                            <div className="bg-green-500 h-3 rounded-full" style={{width: `${confidencePercentage}%`}}></div>
                        </div>
                        <p className="text-xl font-semibold text-green-400">{confidencePercentage}%</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modifiedImageUrl, setModifiedImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PlateAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Por favor, selecione um arquivo de imagem válido.");
        return;
      }
      handleReset();
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64Data = await fileToBase64(imageFile);
      const { result: analysisResult, modifiedImageBase64 } = await analyzePlate(base64Data, imageFile.type);
      
      const finalImageUrl = `data:image/png;base64,${modifiedImageBase64}`;

      setModifiedImageUrl(finalImageUrl);
      setResult(analysisResult);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  const handleReset = () => {
      setImageFile(null);
      setPreviewUrl(null);
      setResult(null);
      setError(null);
      setIsLoading(false);
      setModifiedImageUrl(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 bg-grid-gray-700/[0.2]">
      <div className="w-full max-w-4xl text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
          Analisador de Placa de Veículo
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Envie uma imagem de radar e deixe a Gemini AI fazer a mágica.
        </p>

        {!previewUrl && (
             <div 
                className="w-full max-w-lg bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-gray-800 transition-all duration-300"
                onClick={triggerFileSelect}
            >
                <UploadIcon />
                <p className="mt-4 text-lg font-semibold text-gray-300">Arraste e solte ou clique para enviar</p>
                <p className="text-sm text-gray-500">PNG, JPG, WEBP (máx. 4MB)</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                />
            </div>
        )}

        {previewUrl && !result && (
          <div className="w-full flex flex-col items-center animate-fade-in">
             <div className="w-full max-w-md rounded-lg overflow-hidden border-2 border-gray-700 mb-6 shadow-lg">
                <img src={previewUrl} alt="Pré-visualização" className="w-full h-auto object-contain" />
            </div>
            <div className="flex items-center space-x-4">
                <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center min-w-[150px]"
                >
                {isLoading ? <Spinner /> : 'Analisar Placa'}
                </button>
                 <button
                    onClick={handleReset}
                    className="bg-gray-700 text-gray-300 font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors duration-300"
                >
                    Nova Imagem
                </button>
            </div>
          </div>
        )}

        {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative animate-fade-in" role="alert">
                <strong className="font-bold">Erro: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {result && modifiedImageUrl && (
            <>
                <ResultDisplay imageUrl={modifiedImageUrl} result={result} />
                 <button
                    onClick={handleReset}
                    className="mt-8 bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-500 transition-colors duration-300"
                >
                    Analisar Outra Imagem
                </button>
                <div className="w-full max-w-4xl mt-8 text-left animate-fade-in">
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">Resposta da API Gemini (JSON)</h3>
                  <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto border border-gray-700">
                    <code className="text-sm text-green-300 whitespace-pre-wrap font-mono">
                      {JSON.stringify(result, null, 2)}
                    </code>
                  </pre>
                </div>
            </>
        )}
      </div>
       <style>{`
          .bg-grid-gray-700/[0.2] {
            background-image: linear-gradient(to right, rgba(55, 65, 81, 0.2) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(55, 65, 81, 0.2) 1px, transparent 1px);
            background-size: 40px 40px;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
    </div>
  );
}
