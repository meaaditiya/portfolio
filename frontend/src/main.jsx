import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

console.log(
  `%c⚡️ Greetings, Code Explorer! ⚡️`,
  'color: white; background: linear-gradient(135deg, #1a1a1a, #2a2a2a); font-size: 18px; padding: 12px 24px; font-weight: 700; border-radius: 10px; border: 1px solid #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); text-shadow: 0 0 5px rgba(255, 255, 255, 0.3); animation: pulse 2s ease-in-out infinite; font-family: "Fira Code", monospace;'
);

console.log(
  `%cYou've unlocked the console — the heart of this digital realm.\n\n` +
  `This application was meticulously crafted with cutting-edge tech and a passion for innovation.\n` +
  `As a curious coder, you're diving into the hidden layers of this creation.\n` +
  `Explore, experiment, and uncover the secrets within the code.\n\n` +
  `— Aaditiya Tyagi`,
  'color: black; font-size: 14px; font-family: "Fira Code", monospace; line-height: 1.6; text-shadow: 0 0 3px rgba(163, 191, 250, 0.5); animation: fadeIn 1.5s ease-in;'
);




  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};


// ✅ Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// 🎯 Render React App
createRoot(document.getElementById('root')).render(
  <App/>
);
window.OneSignalDeferred.push(async function (OneSignal) {
  const isSubscribed = await OneSignal.isPushNotificationsEnabled();

  if (!isSubscribed) {
    const modal = document.getElementById("push-modal");
    if (modal) modal.style.display = "block";
  }
});
document.addEventListener("click", (e) => {
  if (e.target.id === "push-allow") {
    window.OneSignalDeferred.push(async function (OneSignal) {
      OneSignal.setConsentGiven(true);
      OneSignal.showSlidedownPrompt();
    });

    document.getElementById("push-modal")?.remove();
  }

  if (e.target.id === "push-later") {
    document.getElementById("push-modal")?.remove();
  }
});
