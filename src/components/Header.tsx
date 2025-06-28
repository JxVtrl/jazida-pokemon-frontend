import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  activeTab: 'list' | 'battle' | 'challenges' | 'history' | 'profile';
  onTabChange: (tab: 'list' | 'battle' | 'challenges' | 'history' | 'profile') => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'list', label: '📋 Ranking', color: 'blue' },
    { id: 'challenges', label: '🥊 Treinadores', color: 'purple' },
    { id: 'history', label: '📜 Histórico', color: 'orange' },
    { id: 'profile', label: '👤 Perfil', color: 'indigo' }
  ] as const;

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getTabClasses = (tabId: string, color: string) => {
    const isActive = activeTab === tabId;
    const baseClasses = "px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm";
    
    if (isActive) {
      const colorClasses = {
        blue: 'bg-blue-500 text-white shadow-lg',
        red: 'bg-red-600 text-white shadow-lg',
        purple: 'bg-purple-600 text-white shadow-lg',
        orange: 'bg-orange-600 text-white shadow-lg',
        indigo: 'bg-indigo-600 text-white shadow-lg'
      };
      return `${baseClasses} ${colorClasses[color as keyof typeof colorClasses]}`;
    }
    
    return `${baseClasses} text-gray-600 hover:text-gray-800 hover:bg-gray-50`;
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Principal */}
        <div className="flex justify-between items-center py-4">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🎮</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Jazida Pokémon Challenge
              </h1>
              <p className="text-sm text-gray-500">Sistema de Batalhas em Tempo Real</p>
            </div>
          </div>

          {/* Informações do Usuário */}
          <div className="flex items-center space-x-5">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">{user?.nome}</p>
                <p className="text-xs text-gray-500">Treinador</p>
              </div>
              
              {/* Avatar com Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:ring-2 hover:ring-blue-300 transition-all"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {user?.nome?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <span className="mr-2">🚪</span>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navegação por Tabs */}
        <div className="border-t border-gray-100">
          <nav className="flex justify-center py-3">
            <div className="bg-gray-50 rounded-xl p-1 shadow-inner flex flex-wrap justify-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={getTabClasses(tab.id, tab.color)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
} 