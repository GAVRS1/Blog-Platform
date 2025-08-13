import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import { ThemeProvider } from './context/ThemeProvider';
import ThemeToggle from './components/ThemeToggle';
import './styles/global.css';

function App() {
  useEffect(() => {
    // PWA установка
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Показать кнопку установки
      const installBanner = document.createElement('div');
      installBanner.className = 'pwa-install show';
      installBanner.innerHTML = `
        <p>Установить приложение?</p>
        <button onclick="installPWA()">Установить</button>
        <button onclick="this.parentElement.remove()">Закрыть</button>
      `;
      document.body.appendChild(installBanner);
    });

    window.installPWA = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <header className="top-nav">
          <nav>
            <a href="/">Главная</a>
            <a href="/profile">Мой профиль</a>
            <a href="/login">Войти</a>
          </nav>
          <ThemeToggle />
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;