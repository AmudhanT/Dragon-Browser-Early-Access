
import React, { useRef, useState } from 'react';
import { useDragon } from '../DragonContext';
import DragonHeader from '../components/DragonHeader';
import { 
  Palette, Search, Check, Monitor, 
  ChevronRight, Zap, ShieldCheck,
  Download, Upload,
  Clock, Trash2, LayoutGrid, Sun, Moon,
  Info, Mic, Globe, Sparkles, Plus, Image as ImageIcon, Code, BellOff,
  Camera, RefreshCcw,
  Smartphone, Bell, PlayCircle, Square, MapPin, Cookie, Database, Ghost, FileText, Settings as SettingsIcon, Languages,
  WifiOff, Volume2, Clipboard, ChevronDown, CheckCircle, Eraser, Shield, MoveUp, MoveDown, X, Radar
} from 'lucide-react';
import { SearchEngine, AppSettings, ThemeMode, ToolbarConfig, PermissionState, BrowserViewMode } from '../types';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { LANGUAGE_OPTIONS } from '../utils/i18n';

const WALLPAPER_PRESETS = [
  { id: 'default', name: 'Dragon', url: 'https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg' },
  { id: 'void', name: 'Void', url: '' },
  { id: 'neon_tokyo', name: 'Neon City', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1920&auto=format&fit=crop' },
  { id: 'deep_space', name: 'Cosmos', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop' },
  { id: 'northern_lights', name: 'Aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1920&auto=format&fit=crop' },
  { id: 'crimson_flow', name: 'Inferno', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop' },
  { id: 'rainy_glass', name: 'Rain', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1920&auto=format&fit=crop' },
  { id: 'cyber_grid', name: 'Matrix', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1920&auto=format&fit=crop' },
];

export const Settings: React.FC<{ mode: BrowserViewMode }> = ({ mode }) => {
  const { settings, updateSettings, navigateTo, navigateBack, t, checkAndRequestNotificationPermission, purgeAllData, architect, clearGlobalData } = useDragon();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [clearingState, setClearingState] = useState<string | null>(null);

  const [pickerMode, setPickerMode] = useState<'app' | 'preferred' | 'target' | 'never' | null>(null);
  const [languageSearchQuery, setLanguageSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  const getLanguageDetails = (code: string) => LANGUAGE_OPTIONS.find(l => l.code === code) || { code, label: code, flag: '🌐' };

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-black text-white">
        <div className="animate-spin w-8 h-8 border-4 border-dragon-ember border-t-transparent rounded-full mb-4"></div>
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Loading Configuration...</p>
      </div>
    );
  }

  const handleToggle = (key: keyof AppSettings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateSettings({ wallpaper: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToolbarToggle = (key: keyof ToolbarConfig) => {
    updateSettings({ 
      toolbarConfig: { ...settings.toolbarConfig, [key]: !settings.toolbarConfig[key] } 
    });
  };

  const handleClearGlobalData = async (type: 'cookies' | 'cache') => {
    setClearingState(type);
    await clearGlobalData(type);
    setTimeout(() => setClearingState(null), 1500);
  };

  const renderToggle = (label: string, value: boolean, onToggle: () => void, icon?: React.ReactNode) => (
    <div className="flex items-center justify-between p-5 bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 transition-all shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400">{icon}</div>
        <span className="text-[13px] font-bold uppercase tracking-tight text-slate-800 dark:text-slate-200">{label}</span>
      </div>
      <button onClick={onToggle} className={`w-12 h-7 rounded-full relative transition-all duration-300 shadow-inner ${value ? 'bg-dragon-ember' : 'bg-slate-300 dark:bg-slate-700'}`}>
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  const GlobalPermissionRow = ({ 
    settingKey, 
    label, 
    icon,
    options = ['allow', 'ask', 'block']
  }: { 
    settingKey: keyof AppSettings, 
    label: string, 
    icon: React.ReactNode,
    options?: PermissionState[] | ('allow' | 'block')[]
  }) => {
    const currentState = settings[settingKey] as string;
    const isOpen = openDropdown === settingKey;

    const getStatusColor = (state: string) => {
      if (state === 'allow') return 'text-green-500';
      if (state === 'block') return 'text-red-500';
      return 'text-blue-400';
    };

    return (
      <div className="flex flex-col border-b border-slate-100 dark:border-white/5 last:border-0 bg-white dark:bg-dragon-navy/50 first:rounded-t-2xl last:rounded-b-2xl overflow-hidden">
        <button
          onClick={() => setOpenDropdown(isOpen ? null : settingKey)}
          className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group w-full"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:text-dragon-ember transition-colors`}>
              {icon}
            </div>
            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">{label}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(currentState)}`}>
              {currentState === 'ask' ? 'Ask' : currentState.charAt(0).toUpperCase() + currentState.slice(1)}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="px-5 pb-5 pt-0 bg-slate-50 dark:bg-black/20 grid grid-cols-3 gap-2 animate-fade-in">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  updateSettings({ [settingKey]: option });
                  setOpenDropdown(null);
                }}
                className={`
                  py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-1
                  ${currentState === option 
                    ? (option === 'allow' ? 'bg-green-500/10 border-green-500/30 text-green-500' : option === 'block' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400')
                    : 'bg-white dark:bg-white/5 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                  }
                `}
              >
                {option === currentState && <CheckCircle size={10} strokeWidth={4} />}
                {option === 'ask' ? 'Ask' : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMainMenu = () => (
    <div className="space-y-4 animate-fade-in">
      {[
        { id: BrowserViewMode.GENERAL, label: t('general'), icon: <SettingsIcon size={20} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: BrowserViewMode.APPEARANCE, label: t('appearance'), icon: <Palette size={20} />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { id: BrowserViewMode.PRIVACY, label: t('privacy'), icon: <ShieldCheck size={20} />, color: 'text-green-500', bg: 'bg-green-500/10' },
        { id: BrowserViewMode.SITE_SETTINGS, label: t('site_settings'), icon: <Globe size={20} />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { id: BrowserViewMode.STORAGE, label: t('storage'), icon: <Database size={20} />, color: 'text-red-500', bg: 'bg-red-500/10' },
        { id: BrowserViewMode.LANGUAGES, label: t('languages'), icon: <Languages size={20} />, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        { id: BrowserViewMode.ABOUT, label: t('about'), icon: <Info size={20} />, color: 'text-slate-500', bg: 'bg-slate-500/10' },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => navigateTo(item.id)}
          className="w-full flex items-center gap-4 p-5 bg-white dark:bg-dragon-navy/50 border border-slate-200 dark:border-white/5 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm active:scale-95 group"
        >
          <div className={`p-3 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
            {item.icon}
          </div>
          <div className="flex-1 text-left">
            <span className="text-[13px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">{item.label}</span>
          </div>
          <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
        </button>
      ))}
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-white/5">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Search Engine</span>
           <div className="flex gap-2">
             {(['dragon', 'google', 'bing'] as SearchEngine[]).map((eng) => (
               <button
                 key={eng}
                 onClick={() => updateSettings({ searchEngine: eng })}
                 className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                   settings.searchEngine === eng 
                   ? 'bg-dragon-ember text-white border-dragon-ember' 
                   : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-transparent hover:bg-slate-200 dark:hover:bg-white/10'
                 }`}
               >
                 {eng}
               </button>
             ))}
           </div>
        </div>
        
        <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Pull to Refresh", settings.pullToRefreshEnabled, () => handleToggle('pullToRefreshEnabled'), <RefreshCcw size={18} />)}</div>
        <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Show Speed Dial", settings.showSpeedDial, () => handleToggle('showSpeedDial'), <LayoutGrid size={18} />)}</div>
        <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Floating Features", settings.floatingFeaturesEnabled, () => handleToggle('floatingFeaturesEnabled'), <Zap size={18} />)}</div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 p-5">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">{t('system_mode')}</span>
        <div className="flex gap-2">
          {[
            { id: 'light', label: t('light'), icon: <Sun size={14} /> },
            { id: 'dark', label: t('dark'), icon: <Moon size={14} /> },
            { id: 'system', label: t('auto'), icon: <Smartphone size={14} /> }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => updateSettings({ themeMode: mode.id as ThemeMode })}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                settings.themeMode === mode.id 
                ? 'bg-dragon-ember text-white border-dragon-ember' 
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-transparent'
              }`}
            >
              {mode.icon} {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 p-5">
         <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('background')}</span>
            <button onClick={() => fileInputRef.current?.click()} className="text-[9px] font-bold text-dragon-cyan uppercase tracking-widest hover:underline flex items-center gap-1">
               <Upload size={10} /> {t('upload')}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
         </div>
         <div className="grid grid-cols-4 gap-2">
            {WALLPAPER_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => updateSettings({ wallpaper: p.id })}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${settings.wallpaper === p.id && !settings.wallpaper.startsWith('data:') ? 'border-dragon-ember' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                {p.url ? <img src={p.url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black flex items-center justify-center text-[8px] text-white font-bold">VOID</div>}
              </button>
            ))}
            {settings.wallpaper.startsWith('data:') && (
               <button className="aspect-square rounded-xl overflow-hidden border-2 border-dragon-ember">
                  <img src={settings.wallpaper} className="w-full h-full object-cover" />
               </button>
            )}
         </div>
         
         <div className="mt-6">
            <div className="flex justify-between mb-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('wallpaper_blur')}</span>
               <span className="text-[10px] font-bold text-slate-400">{settings.wallpaperBlur}px</span>
            </div>
            <input 
              type="range" min="0" max="20" step="1" 
              value={settings.wallpaperBlur} 
              onChange={(e) => updateSettings({ wallpaperBlur: parseInt(e.target.value) })}
              className="w-full accent-dragon-ember h-1 bg-slate-200 dark:bg-white/10 rounded-full appearance-none"
            />
         </div>
      </div>

      <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
         <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('toolbar_layout')}</span>
         </div>
         {Object.keys(settings.toolbarConfig).map((key) => (
            <div key={key} className="border-b border-slate-100 dark:border-white/5 last:border-0">
               {renderToggle(key.replace('show', '').replace(/([A-Z])/g, ' $1').trim(), settings.toolbarConfig[key as keyof ToolbarConfig], () => handleToolbarToggle(key as keyof ToolbarConfig))}
            </div>
         ))}
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="border-b border-slate-100 dark:border-white/5">{renderToggle(t('ad_blocker'), settings.adBlockEnabled, () => handleToggle('adBlockEnabled'), <Shield size={18} className="text-green-500" />)}</div>
        <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Dragon Breath", settings.dragonBreath, () => handleToggle('dragonBreath'), <Zap size={18} className="text-orange-500" />)}</div>
        <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Private Search", settings.stealthFlight, () => handleToggle('stealthFlight'), <Ghost size={18} className="text-purple-500" />)}</div>
        <div className="border-b border-slate-100 dark:border-white/5">{renderToggle(t('do_not_track'), settings.doNotTrack, () => handleToggle('doNotTrack'), <Radar size={18} />)}</div>
        <div className="border-b border-slate-100 dark:border-white/5">{renderToggle(t('secure_dns'), settings.secureDns, () => handleToggle('secureDns'), <Globe size={18} />)}</div>
        <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("History Storage", settings.historyEnabled, () => handleToggle('historyEnabled'), <Clock size={18} />)}</div>
      </div>

      <button onClick={() => { if(confirm('Delete all history, cookies, and cache?')) purgeAllData(); }} className="w-full p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 text-red-500 font-black uppercase text-xs tracking-widest hover:bg-red-500/20 transition-all active:scale-95">
         <Trash2 size={16} /> {t('clear_data')}
      </button>
    </div>
  );

  const renderSiteSettings = () => (
    <div className="space-y-8 animate-fade-in">
       <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-blue-500">Global Permissions</h3>
          <div className="rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
            <GlobalPermissionRow settingKey="cameraPermission" label="Camera" icon={<Camera size={18} />} />
            <GlobalPermissionRow settingKey="microphonePermission" label="Microphone" icon={<Mic size={18} />} />
            <GlobalPermissionRow settingKey="locationPermission" label="Location" icon={<MapPin size={18} />} />
            <GlobalPermissionRow settingKey="mediaPermission" label="Photos & Videos" icon={<ImageIcon size={18} />} />
            <GlobalPermissionRow settingKey="soundPermission" label="Sound" icon={<Volume2 size={18} />} options={['allow', 'block']} />
            <GlobalPermissionRow settingKey="clipboardPermission" label="Clipboard" icon={<Clipboard size={18} />} />
            <GlobalPermissionRow settingKey="notificationsPermission" label="Notifications" icon={<Bell size={18} />} />
          </div>
       </div>

       <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-purple-500">Content Defaults</h3>
          <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
            <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("JavaScript", settings.javaScriptEnabled, () => handleToggle('javaScriptEnabled'), <Code size={18} className="text-yellow-500" />)}</div>
            
            <div className="border-b border-slate-100 dark:border-white/5">
               <div className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4"><div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400"><Cookie size={18} className="text-orange-400" /></div><span className="text-[13px] font-bold uppercase tracking-tight text-slate-800 dark:text-slate-200">Cookies</span></div>
                  <button onClick={() => updateSettings({ cookiePolicy: settings.cookiePolicy === 'block' ? 'allow' : 'block' })} className={`w-12 h-7 rounded-full relative transition-all duration-300 shadow-inner ${settings.cookiePolicy !== 'block' ? 'bg-dragon-ember' : 'bg-slate-300 dark:bg-slate-700'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${settings.cookiePolicy !== 'block' ? 'translate-x-6' : 'translate-x-1'}`} /></button>
               </div>
            </div>

            <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Images", settings.imagesEnabled, () => handleToggle('imagesEnabled'), <ImageIcon size={18} className="text-purple-500" />)}</div>
            <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Autoplay Video", settings.autoplayEnabled, () => handleToggle('autoplayEnabled'), <PlayCircle size={18} className="text-red-500" />)}</div>
            <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Pop-ups and Redirects", settings.popupsEnabled, () => handleToggle('popupsEnabled'), <Square size={18} className="text-blue-500" />)}</div>
            <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Desktop Site by Default", settings.isDesktopMode, () => handleToggle('isDesktopMode'), <Monitor size={18} className="text-slate-500" />)}</div>
            <div>{renderToggle("Force Dark Mode", settings.forceDarkModeGlobal, () => handleToggle('forceDarkModeGlobal'), <Moon size={18} className="text-slate-400" />)}</div>
          </div>
       </div>

       <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-green-500">Storage</h3>
          <div className="grid grid-cols-2 gap-3">
             <button 
               onClick={() => handleClearGlobalData('cookies')}
               className={`flex flex-col items-center justify-center gap-2 p-5 bg-white dark:bg-dragon-navy/50 border border-slate-200 dark:border-white/5 rounded-2xl transition-all active:scale-95 group ${clearingState === 'cookies' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' : ''}`}
             >
               <div className={`p-3 rounded-xl bg-slate-100 dark:bg-white/5 ${clearingState === 'cookies' ? 'text-green-500' : 'text-slate-400 group-hover:text-red-500'} transition-colors`}>
                 {clearingState === 'cookies' ? <Check size={20} /> : <Trash2 size={20} />}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${clearingState === 'cookies' ? 'text-green-600 dark:text-green-500' : 'text-slate-600 dark:text-slate-300'}`}>
                 {clearingState === 'cookies' ? 'Cleared' : 'Clear All Cookies'}
               </span>
             </button>

             <button 
               onClick={() => handleClearGlobalData('cache')}
               className={`flex flex-col items-center justify-center gap-2 p-5 bg-white dark:bg-dragon-navy/50 border border-slate-200 dark:border-white/5 rounded-2xl transition-all active:scale-95 group ${clearingState === 'cache' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' : ''}`}
             >
               <div className={`p-3 rounded-xl bg-slate-100 dark:bg-white/5 ${clearingState === 'cache' ? 'text-green-500' : 'text-slate-400 group-hover:text-orange-500'} transition-colors`}>
                 {clearingState === 'cache' ? <Check size={20} /> : <Eraser size={20} />}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${clearingState === 'cache' ? 'text-green-600 dark:text-green-500' : 'text-slate-600 dark:text-slate-300'}`}>
                 {clearingState === 'cache' ? 'Cleared' : 'Clear Cache'}
               </span>
             </button>
          </div>
       </div>
    </div>
  );

  const renderStorageSettings = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 p-5">
         <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500"><Download size={20} /></div>
            <div>
               <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight block">{t('downloads_folder')}</span>
               <span className="text-[9px] font-bold text-slate-400 break-all">{settings.downloadLocation}</span>
            </div>
         </div>
         <div className="flex gap-2">
            <button className="flex-1 py-3 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 relative overflow-hidden group">
               {t('change_path')}
               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" {...({ webkitdirectory: "", directory: "" } as any)} onChange={(e: any) => {
                  if (e.target.files && e.target.files.length > 0) {
                     const path = `/Internal Storage/Downloads/${e.target.files[0].name.split('/')[0] || 'Custom'}`; 
                     updateSettings({ downloadLocation: path });
                  }
               }} />
            </button>
         </div>
      </div>

      <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
         <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Data Saver", settings.dataSaverEnabled, () => handleToggle('dataSaverEnabled'), <WifiOff size={18} />)}</div>
         <div className="border-b border-slate-100 dark:border-white/5">{renderToggle("Mute Download Notifications", settings.muteDownloadNotifications, () => handleToggle('muteDownloadNotifications'), <BellOff size={18} />)}</div>
      </div>
    </div>
  );

  const renderAboutSettings = () => (
    <div className="space-y-6 animate-fade-in text-center py-8">
       <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl border border-slate-200 dark:border-white/10 mb-6">
          <img src="https://i.ibb.co/CKVTVSbg/IMG-20251221-WA0021.jpg" className="w-16 h-16 rounded-xl object-cover" />
       </div>
       <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-1">Dragon Browser</h2>
          <p className="text-[10px] font-bold text-dragon-ember uppercase tracking-[0.3em]">Version 1.1.0 (Stable)</p>
       </div>
       
       <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6 text-left space-y-4 max-w-sm mx-auto">
          <div className="flex justify-between">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Architect</span>
             <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{architect}</span>
          </div>
          <div className="flex justify-between">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Build ID</span>
             <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">2025.05.21.RC1</span>
          </div>
          <div className="flex justify-between">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engine</span>
             <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Dragon/537.36</span>
          </div>
       </div>

       <button onClick={() => alert("You are running the latest version.")} className="px-6 py-3 bg-white dark:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
          Check for Updates
       </button>
    </div>
  );

  const renderLanguageSettings = () => {
    const moveLanguage = (code: string, direction: 'up' | 'down') => {
      const current = [...settings.preferredLanguages];
      const index = current.indexOf(code);
      if (index === -1) return;
      if (direction === 'up' && index > 0) {
        [current[index], current[index - 1]] = [current[index - 1], current[index]];
      } else if (direction === 'down' && index < current.length - 1) {
        [current[index], current[index + 1]] = [current[index + 1], current[index]];
      }
      updateSettings({ preferredLanguages: current });
    };

    const removeLanguage = (code: string) => {
      if (settings.preferredLanguages.length <= 1) {
        alert("You must have at least one preferred language.");
        return;
      }
      const current = settings.preferredLanguages.filter(c => c !== code);
      updateSettings({ preferredLanguages: current });
    };

    const addLanguage = (code: string) => {
      if (pickerMode === 'app') {
        updateSettings({ language: code });
      } else if (pickerMode === 'preferred') {
        if (!settings.preferredLanguages.includes(code)) {
          updateSettings({ preferredLanguages: [...settings.preferredLanguages, code] });
        }
      } else if (pickerMode === 'target') {
        updateSettings({ 
          translationSettings: { ...settings.translationSettings, targetLanguage: code }
        });
      } else if (pickerMode === 'never') {
        if (!settings.translationSettings.neverTranslate.includes(code)) {
          updateSettings({ 
            translationSettings: { 
              ...settings.translationSettings, 
              neverTranslate: [...settings.translationSettings.neverTranslate, code] 
            }
          });
        }
      }
      setPickerMode(null);
      setLanguageSearchQuery('');
    };

    const removeNeverLanguage = (code: string) => {
      const current = settings.translationSettings.neverTranslate.filter(c => c !== code);
      updateSettings({
        translationSettings: { ...settings.translationSettings, neverTranslate: current }
      });
    };

    if (pickerMode) {
      const filteredLanguages = LANGUAGE_OPTIONS.filter(lang => 
        lang.label.toLowerCase().includes(languageSearchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(languageSearchQuery.toLowerCase())
      );

      return (
        <div className="space-y-4 animate-slide-in-right">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => { setPickerMode(null); setLanguageSearchQuery(''); }} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400">
              <ChevronDown className="rotate-90" size={20} />
            </button>
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              {pickerMode === 'app' ? 'Select Interface Language' : 
               pickerMode === 'preferred' ? 'Add Preferred Language' :
               pickerMode === 'target' ? 'Select Target Language' : 'Add to Never Translate'}
            </span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search languages..."
              value={languageSearchQuery}
              onChange={(e) => setLanguageSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-dragon-navy/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-dragon-ember/50 shadow-inner"
              autoFocus
            />
            {languageSearchQuery && (
              <button 
                onClick={() => setLanguageSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => addLanguage(lang.code)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all border-b border-slate-100 dark:border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl shadow-sm rounded-full overflow-hidden">{lang.flag}</span>
                    <span className="text-[13px] font-bold uppercase tracking-tight text-slate-800 dark:text-slate-200">
                      {lang.label}
                    </span>
                  </div>
                  {((pickerMode === 'app' && settings.language === lang.code) ||
                    (pickerMode === 'preferred' && settings.preferredLanguages.includes(lang.code)) ||
                    (pickerMode === 'target' && settings.translationSettings.targetLanguage === lang.code) ||
                    (pickerMode === 'never' && settings.translationSettings.neverTranslate.includes(lang.code))) && 
                    <CheckCircle size={18} className="text-dragon-ember" />
                  }
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No matching languages found</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    const appLang = getLanguageDetails(settings.language);
    const targetLang = getLanguageDetails(settings.translationSettings.targetLanguage || settings.language);

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-blue-500">App Interface</h3>
          <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
            <button 
              onClick={() => setPickerMode('app')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl shadow-sm rounded-full overflow-hidden">{appLang.flag}</span>
                <div className="text-left">
                  <span className="text-[13px] font-bold uppercase tracking-tight text-slate-800 dark:text-slate-200 block">{appLang.label}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Interface Language</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-end px-2">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-purple-500">Preferred Languages</h3>
             <button onClick={() => setPickerMode('preferred')} className="text-[9px] font-bold text-dragon-cyan uppercase tracking-widest hover:underline flex items-center gap-1">
               <Plus size={10} /> Add
             </button>
          </div>
          <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
            {settings.preferredLanguages.map((code, idx) => {
              const lang = getLanguageDetails(code);
              return (
                <div key={code} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl shadow-sm rounded-full overflow-hidden">{lang.flag}</span>
                    <span className="text-[13px] font-bold uppercase tracking-tight text-slate-800 dark:text-slate-200">{lang.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => moveLanguage(code, 'up')} 
                      disabled={idx === 0}
                      className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <MoveUp size={14} />
                    </button>
                    <button 
                      onClick={() => moveLanguage(code, 'down')} 
                      disabled={idx === settings.preferredLanguages.length - 1}
                      className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <MoveDown size={14} />
                    </button>
                    <button 
                      onClick={() => removeLanguage(code)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {settings.preferredLanguages.length === 0 && (
               <div className="p-6 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">No languages added</div>
            )}
          </div>
          <p className="px-4 text-[9px] text-slate-500 font-medium leading-relaxed">
            Websites will show content in the first language that matches, based on this order.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-2 border-l-2 border-dragon-ember">Translation</h3>
          <div className="bg-white dark:bg-dragon-navy/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
            <div className="border-b border-slate-100 dark:border-white/5">
              {renderToggle("Offer to Translate", settings.translationSettings.offerTranslate, () => updateSettings({ translationSettings: { ...settings.translationSettings, offerTranslate: !settings.translationSettings.offerTranslate } }), <Languages size={18} />)}
            </div>
            
            {settings.translationSettings.offerTranslate && (
              <>
                <button 
                  onClick={() => setPickerMode('target')}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all border-b border-slate-100 dark:border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 dark:text-slate-400"><Globe size={18} /></div>
                    <div className="text-left">
                      <span className="text-[13px] font-bold uppercase tracking-tight text-slate-800 dark:text-slate-200 block">Translate Into</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{targetLang.label}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </button>

                <div className="p-5">
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">Never Translate</span>
                      <button onClick={() => setPickerMode('never')} className="text-[9px] font-bold text-dragon-cyan uppercase tracking-widest hover:underline flex items-center gap-1"><Plus size={10} /> Add</button>
                   </div>
                   
                   <div className="flex flex-wrap gap-2">
                      {settings.translationSettings.neverTranslate.map(code => (
                        <div key={code} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                           <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{getLanguageDetails(code).label}</span>
                           <button onClick={() => removeNeverLanguage(code)} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
                        </div>
                      ))}
                      {settings.translationSettings.neverTranslate.length === 0 && (
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-50">None</span>
                      )}
                   </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getHeaderTitle = () => {
    switch(mode) {
      case BrowserViewMode.GENERAL: return t('general').toUpperCase();
      case BrowserViewMode.APPEARANCE: return t('appearance').toUpperCase();
      case BrowserViewMode.SITE_SETTINGS: return t('site_settings').toUpperCase();
      case BrowserViewMode.PRIVACY: return t('privacy').toUpperCase();
      case BrowserViewMode.STORAGE: return t('storage').toUpperCase();
      case BrowserViewMode.ABOUT: return t('about').toUpperCase();
      case BrowserViewMode.LANGUAGES: return t('languages').toUpperCase();
      default: return t('settings').toUpperCase();
    }
  };

  const getHeaderSubtitle = () => {
    switch(mode) {
      case BrowserViewMode.SETTINGS: return t('browser_controls').toUpperCase();
      default: return t('set_preferences').toUpperCase();
    }
  };

  return (
    <div 
      className={`flex flex-col h-full bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 overflow-hidden relative`}
    >
      <DragonHeader 
        title={getHeaderTitle()} 
        subtitle={getHeaderSubtitle()} 
        onBack={() => {
          if (pickerMode) {
            setPickerMode(null);
            setLanguageSearchQuery('');
          } else {
            navigateBack();
          }
        }} 
      />
      {mode === BrowserViewMode.SETTINGS && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#0a0a0a]/95 backdrop-blur-xl z-40 sticky top-0 flex justify-center border-b border-slate-200 dark:border-white/5">
          <div className="relative group w-full max-w-4xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-dragon-ember transition-colors" />
            <input type="text" placeholder={t('search_settings')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-base font-medium focus:outline-none focus:border-dragon-ember/50 shadow-inner text-slate-900 dark:text-white" />
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto no-scrollbar pb-safe-bottom bg-slate-50 dark:bg-black">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {searchQuery ? (
             <div className="py-20 text-center space-y-4 opacity-30">
               <Ghost size={48} className="mx-auto text-slate-400" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">{t('search_not_available')}</p>
             </div>
          ) : (
             (() => {
                switch(mode) {
                  case BrowserViewMode.GENERAL: return renderGeneralSettings();
                  case BrowserViewMode.APPEARANCE: return renderAppearanceSettings();
                  case BrowserViewMode.SITE_SETTINGS: return renderSiteSettings();
                  case BrowserViewMode.PRIVACY: return renderPrivacySettings();
                  case BrowserViewMode.STORAGE: return renderStorageSettings();
                  case BrowserViewMode.ABOUT: return renderAboutSettings();
                  case BrowserViewMode.LANGUAGES: return renderLanguageSettings();
                  default: return renderMainMenu();
                }
             })()
          )}
        </div>
      </div>
    </div>
  );
};
