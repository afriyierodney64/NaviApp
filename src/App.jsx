import React, { useState, useEffect } from 'react';
import { Mic, MapPin, Settings, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CheckCircle, XCircle, Volume2, VolumeX, Vibrate, VibrateOff, Navigation } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  
  // App Settings (Default ON)
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Helper to trigger voice
  const speak = (text) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for accessibility
      window.speechSynthesis.speak(utterance);
    }
  };

  // Helper to trigger phone vibration
  const triggerVibrate = (pattern) => {
    if ('vibrate' in navigator && hapticsEnabled) {
      navigator.vibrate(pattern);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setSpokenText("Main Library");
        speak("Navigating to Main Library. Continue forward.");
        setCurrentScreen('navigation');
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      triggerVibrate(50); // Light tap when listening starts
    };

    recognition.onresult = (event) => {
      const currentTranscript = event.results[0][0].transcript;
      setSpokenText(currentTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (spokenText) {
        speak(`Navigating to ${spokenText}. Continue forward for 50 feet.`);
        setCurrentScreen('navigation');
      }
    };

    recognition.start();
  };

  const startNavigationTo = (place) => {
    setSpokenText(place);
    speak(`Navigating to ${place}. Continue forward for 50 feet.`);
    setCurrentScreen('navigation');
  };

  // --- SCREENS ---

  const HomeScreen = () => (
    <div className="flex flex-col h-full bg-slate-950 text-white p-6 space-y-6 overflow-y-auto pb-8">
      <div className="flex justify-between items-center mb-2 mt-8">
        <h1 className="text-4xl font-extrabold tracking-tight">NaviApp</h1>
      </div>

      <button 
        onClick={handleVoiceSearch}
        className="w-full aspect-square bg-yellow-400 text-slate-900 rounded-[3rem] flex flex-col items-center justify-center space-y-4 shadow-lg active:scale-95 transition-all"
      >
        <Mic size={80} strokeWidth={2.5} />
        <span className="text-4xl font-extrabold">{isListening ? "Listening..." : "Where To?"}</span>
        <span className="text-xl font-bold opacity-75">(Tap to Speak)</span>
      </button>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <button 
          onClick={() => setCurrentScreen('saved')}
          className="bg-slate-800 p-8 rounded-3xl flex flex-col items-center space-y-4 active:bg-slate-700 transition-colors shadow-md"
        >
          <MapPin size={48} className="text-yellow-400" />
          <span className="text-2xl font-bold">Saved</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('settings')}
          className="bg-slate-800 p-8 rounded-3xl flex flex-col items-center space-y-4 active:bg-slate-700 transition-colors shadow-md"
        >
          <Settings size={48} className="text-slate-300" />
          <span className="text-2xl font-bold">Settings</span>
        </button>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="flex flex-col h-full bg-slate-950 text-white p-6 relative">
      <div className="mt-8 mb-8 flex items-center space-x-4">
        <button onClick={() => setCurrentScreen('home')} className="p-4 bg-slate-800 rounded-full active:scale-95 transition-transform">
          <XCircle size={32} />
        </button>
        <h2 className="text-3xl font-extrabold">Settings</h2>
      </div>

      <div className="space-y-4 flex-1">
        {/* Haptics Toggle */}
        <button 
          onClick={() => {
            setHapticsEnabled(!hapticsEnabled);
            if (!hapticsEnabled) navigator.vibrate?.(50); // Test tap
          }}
          className={`w-full p-6 rounded-3xl flex items-center justify-between transition-all ${hapticsEnabled ? 'bg-slate-800' : 'bg-slate-900 border-2 border-slate-800'}`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl ${hapticsEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
              {hapticsEnabled ? <Vibrate size={32} /> : <VibrateOff size={32} />}
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">Phone Haptics</p>
              <p className="text-slate-400 font-medium">Vibrate on missed turns</p>
            </div>
          </div>
          <div className={`w-16 h-8 rounded-full flex items-center p-1 transition-colors ${hapticsEnabled ? 'bg-green-500' : 'bg-slate-700'}`}>
            <div className={`w-6 h-6 bg-white rounded-full transition-transform ${hapticsEnabled ? 'translate-x-8' : 'translate-x-0'}`}></div>
          </div>
        </button>

        {/* Voice Toggle */}
        <button 
          onClick={() => {
            setVoiceEnabled(!voiceEnabled);
            if (!voiceEnabled && 'speechSynthesis' in window) {
              const u = new SpeechSynthesisUtterance("Voice guidance enabled.");
              window.speechSynthesis.speak(u);
            }
          }}
          className={`w-full p-6 rounded-3xl flex items-center justify-between transition-all ${voiceEnabled ? 'bg-slate-800' : 'bg-slate-900 border-2 border-slate-800'}`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl ${voiceEnabled ? 'bg-yellow-400/20 text-yellow-400' : 'bg-slate-800 text-slate-500'}`}>
              {voiceEnabled ? <Volume2 size={32} /> : <VolumeX size={32} />}
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">Voice Guidance</p>
              <p className="text-slate-400 font-medium">Read directions aloud</p>
            </div>
          </div>
          <div className={`w-16 h-8 rounded-full flex items-center p-1 transition-colors ${voiceEnabled ? 'bg-green-500' : 'bg-slate-700'}`}>
            <div className={`w-6 h-6 bg-white rounded-full transition-transform ${voiceEnabled ? 'translate-x-8' : 'translate-x-0'}`}></div>
          </div>
        </button>
      </div>
    </div>
  );

  const SavedScreen = () => (
    <div className="flex flex-col h-full bg-slate-950 text-white p-6 relative">
      <div className="mt-8 mb-8 flex items-center space-x-4">
        <button onClick={() => setCurrentScreen('home')} className="p-4 bg-slate-800 rounded-full active:scale-95 transition-transform">
          <XCircle size={32} />
        </button>
        <h2 className="text-3xl font-extrabold">Saved Places</h2>
      </div>

      <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pb-4">
        {['Main Library', 'Student Union', 'Dormitory'].map((place) => (
          <button 
            key={place}
            onClick={() => startNavigationTo(place)}
            className="w-full bg-slate-800 p-6 rounded-3xl flex items-center space-x-6 active:scale-95 transition-transform shadow-md"
          >
            <div className="bg-slate-700 p-4 rounded-2xl">
              <MapPin size={32} className="text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-white">{place}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const ActiveNavigationScreen = () => {
    const [navStep, setNavStep] = useState(0);

    const navStates = [
      { id: 'forward', icon: ArrowUp, bg: 'bg-yellow-400', textCol: 'text-slate-900', title: 'FORWARD', sub: 'for 50 feet', speech: 'Continue forward.', haptic: 50 },
      { id: 'left', icon: ArrowLeft, bg: 'bg-blue-500', textCol: 'text-white', title: 'TURN LEFT', sub: 'in 20 feet', speech: 'Take your next left.', haptic: [150, 100, 150] },
      { id: 'right', icon: ArrowRight, bg: 'bg-blue-500', textCol: 'text-white', title: 'TURN RIGHT', sub: 'in 30 feet', speech: 'Take your next right.', haptic: [150, 100, 150] },
      { id: 'missed', icon: ArrowDown, bg: 'bg-red-500', textCol: 'text-white', title: 'TURN AROUND', sub: 'Missed Turn', speech: 'Warning. You missed a turn. Please turn around.', haptic: [500, 200, 500, 200, 500] },
      { id: 'arrived', icon: CheckCircle, bg: 'bg-green-500', textCol: 'text-white', title: 'ARRIVED', sub: 'Destination Reached', speech: 'You have arrived at your destination.', haptic: [200, 100, 200, 100, 200] }
    ];

    const currentState = navStates[navStep];
    const IconComponent = currentState.icon;

    const handleCardTap = () => {
      const nextStep = (navStep + 1) % navStates.length;
      setNavStep(nextStep);
      const nextState = navStates[nextStep];
      
      triggerVibrate(nextState.haptic);
      speak(nextState.speech);
    };

    return (
      <div className="flex flex-col h-full bg-slate-950 text-white p-6 relative overflow-hidden">
        {/* Top Info Bar */}
        <div className="flex justify-between items-center mt-6 bg-slate-900 rounded-3xl p-5 shadow-md">
          <div className="flex items-center space-x-4 overflow-hidden">
            <Navigation className={currentState.id === 'missed' ? "text-red-500" : currentState.id === 'arrived' ? "text-green-500" : "text-yellow-400"} size={32} />
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold truncate max-w-[180px]">
                {currentState.id === 'arrived' ? 'Arrived at:' : 'To:'} {spokenText || 'Destination'}
              </span>
              <span className="text-base text-slate-400 font-bold">
                {currentState.id === 'missed' ? 'Rerouting...' : currentState.id === 'arrived' ? '0 ft remaining' : '450 ft remaining'}
              </span>
            </div>
          </div>
          {voiceEnabled && <Volume2 size={32} className={currentState.id === 'missed' ? "text-red-500" : currentState.id === 'arrived' ? "text-green-500" : "text-yellow-400"} />}
        </div>

        {/* Interactive Navigation Card */}
        <button 
          onClick={handleCardTap}
          className={`mt-6 flex-1 rounded-[3rem] flex flex-col items-center justify-center p-6 shadow-xl transition-all duration-300 active:scale-95 border-[8px] border-black/10 ${currentState.bg}`}
        >
          <IconComponent size={140} strokeWidth={3} className={`${currentState.textCol} mb-6`} />
          <h2 className={`text-5xl font-black ${currentState.textCol} tracking-tight text-center leading-none`}>
            {currentState.title.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>)}
          </h2>
          <p className={`text-2xl font-bold mt-4 opacity-90 ${currentState.textCol}`}>
            {currentState.sub}
          </p>
        </button>

        <p className="text-center text-slate-500 text-sm font-bold uppercase tracking-wider mt-4 mb-2">
          [Tap Card To Simulate Journey]
        </p>

        <button 
          onClick={() => {
             window.speechSynthesis.cancel();
             setCurrentScreen('home');
          }}
          className="w-full bg-slate-800 text-white text-2xl font-extrabold py-6 rounded-3xl active:scale-95 transition-transform flex justify-center items-center space-x-3 mt-auto shadow-md"
        >
          <XCircle size={32} />
          <span>END ROUTE</span>
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center font-sans antialiased sm:p-4 overflow-hidden">
      <div className="w-full h-full sm:w-[400px] sm:h-[800px] bg-slate-950 sm:rounded-[3rem] overflow-hidden shadow-2xl relative sm:border-[12px] border-slate-800 flex flex-col">
        {/* Mobile Notch Mockup - Only show on desktop simulation */}
        <div className="hidden sm:flex absolute top-0 inset-x-0 h-6 justify-center z-50">
           <div className="w-1/3 h-5 bg-slate-800 rounded-b-2xl"></div>
        </div>

        <div className="flex-1 relative overflow-hidden h-full">
          {currentScreen === 'home' && <HomeScreen />}
          {currentScreen === 'settings' && <SettingsScreen />}
          {currentScreen === 'saved' && <SavedScreen />}
          {currentScreen === 'navigation' && <ActiveNavigationScreen />}
        </div>
      </div>
    </div>
  );
}
