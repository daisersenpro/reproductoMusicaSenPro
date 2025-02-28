import React from 'react';
import MusicPlayer from './components/MusicPlayer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">SenPro Play Music</h1>
      <MusicPlayer />
      <div className="mt-8 text-center text-gray-600 max-w-md">
        <p className="mb-2 font-semibold">Características:</p>
        <ul className="text-left list-disc pl-6 space-y-1 mb-4">
          <li>Selecciona archivos de música desde tu dispositivo</li>
          <li>Funciona sin internet una vez instalada</li>
          <li>Controles completos de reproducción</li>
          <li>Interfaz intuitiva y fácil de usar</li>
        </ul>
        
        <p className="mb-2 font-semibold">Cómo crear un acceso directo en tu celular:</p>
        <ol className="text-left list-decimal pl-6 space-y-2">
          <li>Abre esta página en tu navegador preferido (Chrome, Brave, etc.)</li>
          <li>En Chrome/Brave: Toca el menú (tres puntos) y selecciona "Añadir a pantalla de inicio"</li>
          <li>En Safari: Toca el ícono de compartir y selecciona "Añadir a pantalla de inicio"</li>
          <li>Esto creará un acceso directo en tu pantalla de inicio</li>
          <li>La próxima vez, solo toca ese ícono para abrir el reproductor directamente</li>
        </ol>
        <p className="mt-4 text-sm italic">Nota: Para seleccionar música, usa cualquiera de los dos botones en la parte superior del reproductor.</p>
      </div>
    </div>
  );
}

export default App;