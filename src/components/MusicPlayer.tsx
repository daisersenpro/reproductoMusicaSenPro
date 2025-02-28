import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Music, FolderSearch, RefreshCw } from 'lucide-react';

interface Song {
  name: string;
  artist: string;
  file: File;
  url: string;
}

const MusicPlayer: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLInputElement>(null);
  const volumeBarRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error al reproducir:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSongIndex, songs]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (volumeBarRef.current) {
        volumeBarRef.current.value = (isMuted ? 0 : volume).toString();
      }
    }
  }, [volume, isMuted]);

  // Intenta escanear automáticamente al cargar la aplicación en dispositivos móviles
  // pero solo si el usuario ha dado permiso explícito
  useEffect(() => {
    // Verificamos si estamos en un dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    // Verificamos si el usuario ya ha dado permiso anteriormente (usando localStorage)
    const hasAutoScanPermission = localStorage.getItem('autoScanPermission') === 'true';
    
    if (isMobile && hasAutoScanPermission) {
      // Mostramos un mensaje para que el usuario sepa que puede escanear
      setScanStatus('Puedes escanear tu música usando el botón "Escanear música"');
      setTimeout(() => {
        setScanStatus('');
      }, 5000);
    }
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const newSongs: Song[] = [];
    
    files.forEach(file => {
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const nameParts = file.name.split('-');
        let artist = 'Desconocido';
        let name = file.name.replace(/\.[^/.]+$/, "");
        
        if (nameParts.length > 1) {
          artist = nameParts[0].trim();
          name = nameParts.slice(1).join('-').replace(/\.[^/.]+$/, "").trim();
        }
        
        newSongs.push({
          name,
          artist,
          file,
          url
        });
      }
    });
    
    setSongs(prevSongs => {
      const updatedSongs = [...prevSongs, ...newSongs];
      if (newSongs.length > 0 && prevSongs.length === 0) {
        setCurrentSongIndex(0);
      }
      return updatedSongs;
    });

    return newSongs.length;
  };
  
  const scanDeviceMusic = async () => {
    setIsScanning(true);
    setScanStatus('Preparando para escanear...');
    
    try {
      // Verificamos si la API de selección de archivos está disponible
      if ('showDirectoryPicker' in window) {
        setScanStatus('Selecciona la carpeta de música...');
        
        try {
          // Usamos showDirectoryPicker para seleccionar una carpeta completa
          // @ts-ignore - TypeScript no reconoce showDirectoryPicker en todos los entornos
          const directoryHandle = await window.showDirectoryPicker();
          
          setScanStatus('Escaneando archivos en la carpeta seleccionada...');
          
          const files: File[] = [];
          for await (const [name, handle] of directoryHandle.entries()) {
            if (handle.kind === 'file') {
              const file = await handle.getFile();
              if (file.type.startsWith('audio/')) {
                files.push(file);
              }
            }
          }
          
          const addedSongs = processFiles(files);
          
          // Guardamos la preferencia del usuario para futuras visitas
          localStorage.setItem('autoScanPermission', 'true');
          
          setScanStatus(`¡Listo! Se añadieron ${addedSongs} canciones.`);
          setTimeout(() => {
            setIsScanning(false);
            setScanStatus('');
          }, 3000);
        } catch (error) {
          // El usuario canceló la selección o hubo un error
          console.error('Error o cancelación al seleccionar archivos:', error);
          setScanStatus('Selección de archivos cancelada.');
          setTimeout(() => {
            setIsScanning(false);
            setScanStatus('');
          }, 2000);
        }
      } else {
        // Fallback para navegadores que no soportan la API moderna
        setScanStatus('Tu navegador no soporta el escaneo automático. Por favor, usa el botón "Seleccionar archivos".');
        setTimeout(() => {
          setIsScanning(false);
          setScanStatus('');
          
          // Activamos automáticamente el selector de archivos tradicional
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.click();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error general al escanear música:', error);
      setScanStatus('Hubo un problema. Intenta seleccionar los archivos manualmente.');
      setTimeout(() => {
        setIsScanning(false);
        setScanStatus('');
      }, 3000);
    }
  };
  
  const handlePlayPause = () => {
    if (songs.length === 0) return;
    setIsPlaying(!isPlaying);
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (progressBarRef.current) {
        progressBarRef.current.value = audioRef.current.currentTime.toString();
      }
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      if (progressBarRef.current) {
        progressBarRef.current.max = audioRef.current.duration.toString();
      }
    }
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handlePrevious = () => {
    if (songs.length === 0) return;
    
    if (currentTime > 3) {
      // Si ha pasado más de 3 segundos, reinicia la canción actual
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      // Si no, va a la canción anterior
      setCurrentSongIndex(prevIndex => 
        prevIndex === 0 ? songs.length - 1 : prevIndex - 1
      );
    }
  };
  
  const handleNext = () => {
    if (songs.length === 0) return;
    
    setCurrentSongIndex(prevIndex => 
      prevIndex === songs.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      handleNext();
    }
  };
  
  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const selectSong = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };
  
  const currentSong = songs[currentSongIndex];
  
  return (
    <div className="w-full max-w-md mx-auto bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <h2 className="text-xl font-bold text-center">SenPro Play Music</h2>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between mb-4 gap-2">
          <label className="flex-1 flex items-center justify-center py-2 px-3 bg-blue-700 text-white rounded-lg cursor-pointer hover:bg-blue-800 transition-colors">
            <Music className="mr-2" size={18} />
            <span className="text-sm">Seleccionar archivos</span>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileChange} 
              className="hidden" 
              multiple 
            />
          </label>
          
          <button 
            onClick={scanDeviceMusic}
            disabled={isScanning}
            className="flex-1 flex items-center justify-center py-2 px-3 bg-blue-700 text-white rounded-lg cursor-pointer hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            <FolderSearch className="mr-2" size={18} />
            <span className="text-sm">Escanear música</span>
          </button>
        </div>
        
        {(isScanning || scanStatus) && (
          <div className="mb-4 p-3 bg-blue-800 text-white rounded-lg flex items-center">
            {isScanning && <RefreshCw className="animate-spin mr-2" size={18} />}
            <span className="text-sm">{scanStatus}</span>
          </div>
        )}
        
        {currentSong && (
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white truncate">{currentSong.name}</h3>
            <p className="text-sm text-gray-400">{currentSong.artist}</p>
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            ref={progressBarRef}
            type="range"
            min="0"
            max="100"
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={toggleRepeat} 
            className={`p-2 rounded-full ${isRepeat ? 'bg-blue-700 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Repeat size={20} />
          </button>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePrevious} 
              className="p-2 text-gray-400 hover:text-white"
            >
              <SkipBack size={24} />
            </button>
            
            <button 
              onClick={handlePlayPause} 
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button 
              onClick={handleNext} 
              className="p-2 text-gray-400 hover:text-white"
            >
              <SkipForward size={24} />
            </button>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={toggleMute} 
              className="p-2 text-gray-400 hover:text-white"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              ref={volumeBarRef}
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 ml-2"
            />
          </div>
        </div>
      </div>
      
      {songs.length > 0 && (
        <div className="border-t border-gray-700 max-h-60 overflow-y-auto">
          <h3 className="px-4 py-2 font-medium text-gray-400 bg-gray-800 sticky top-0">Lista de reproducción ({songs.length} canciones)</h3>
          <ul>
            {songs.map((song, index) => (
              <li 
                key={index} 
                onClick={() => selectSong(index)}
                className={`px-4 py-2 flex items-center cursor-pointer hover:bg-gray-700 ${index === currentSongIndex ? 'bg-blue-700 text-white' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{song.name}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                </div>
                {index === currentSongIndex && isPlaying && (
                  <div className="flex space-x-1 ml-2">
                    <div className="w-1 h-4 bg-blue-600 animate-pulse"></div>
                    <div className="w-1 h-4 bg-blue-600 animate-pulse delay-75"></div>
                    <div className="w-1 h-4 bg-blue-600 animate-pulse delay-150"></div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}
    </div>
  );
};

export default MusicPlayer;