// Autenticação com Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDEWNiLU8uNtXVJJmW10_b89iCffadfHwg",
  authDomain: "sabia-1b8e4.firebaseapp.com",
  projectId: "sabia-1b8e4",
  storageBucket: "sabia-1b8e4.firebasestorage.app",
  messagingSenderId: "4263516305",
  appId: "1:4263516305:web:5a9837a326560337288730",
  measurementId: "G-0PCBD6N8NG"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Variáveis de controle
let isLoggedIn = false;
let currentUser = null;

// Elementos do DOM
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const btnGoogle = document.querySelector('.btn-google');
const panelAuth = document.querySelector('.panel-auth');

// Função para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para exibir mensagem
function showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `auth-message auth-message-${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background-color: ${type === 'error' ? '#EF4444' : '#10B981'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

// Função para mostrar perfil do usuário
function showUserProfile(user) {
  if (panelAuth) {
    const userEmail = user.email || 'Usuário';
    const userName = user.displayName || userEmail.split('@')[0];
    
    panelAuth.innerHTML = `
      <div class="user-profile-logged">
        <div class="user-avatar-logged">
          ${user.photoURL ? 
            `<img src="${user.photoURL}" alt="Avatar" class="avatar-img">` : 
            `<div class="avatar-placeholder">${userName.charAt(0).toUpperCase()}</div>`
          }
        </div>
        <h2 class="user-name-logged">${userName}</h2>
        <p class="user-email-logged">${userEmail}</p>
        
        <div class="user-stats-logged">
          <div class="stat-logged">
            <strong>0</strong>
            <span>Visualizações</span>
          </div>
          <div class="stat-logged">
            <strong>0</strong>
            <span>Likes</span>
          </div>
        </div>
        
        <button id="btn-logout" class="btn-logout">Sair</button>
      </div>
    `;
    
    // Adiciona evento ao botão de sair
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', handleLogout);
    }
  }
}

// Função de login/cadastro com email
async function handleEmailAuth(email) {
  try {
    // Primeiro tenta fazer login
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, 'tempPassword123');
      showMessage('Login realizado com sucesso!', 'success');
      return userCredential.user;
    } catch (loginError) {
      // Se falhar, cria nova conta
      if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/wrong-password') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, 'tempPassword123');
        showMessage('Conta criada com sucesso!', 'success');
        return userCredential.user;
      }
      throw loginError;
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    let errorMessage = 'Erro ao fazer login. Tente novamente.';
    if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Senha muito fraca.';
    }
    
    showMessage(errorMessage, 'error');
    throw error;
  }
}

// Função de login com Google
async function handleGoogleLogin() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    showMessage('Login com Google realizado!', 'success');
    return result.user;
  } catch (error) {
    console.error('Erro no login com Google:', error);
    showMessage('Erro ao fazer login com Google.', 'error');
    throw error;
  }
}


// Função de logout
async function handleLogout() {
  try {
    await signOut(auth);
    showMessage('Logout realizado com sucesso!', 'success');
    location.reload();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    showMessage('Erro ao fazer logout.', 'error');
  }
}

// Event listeners
if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authEmail.value.trim();
    
    if (!email) {
      showMessage('Por favor, insira um email.', 'error');
      return;
    }
    
    if (!isValidEmail(email)) {
      showMessage('Email inválido.', 'error');
      return;
    }
    
    try {
      await handleEmailAuth(email);
    } catch (error) {
      console.error('Erro:', error);
    }
  });
}

if (btnGoogle) {
  btnGoogle.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await handleGoogleLogin();
    } catch (error) {
      console.error('Erro:', error);
    }
  });
}

// (Apple button removido)

// Monitora estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Usuário autenticado:', user);
    isLoggedIn = true;
    currentUser = user;
    showUserProfile(user);
  } else {
    console.log('Nenhum usuário autenticado');
    isLoggedIn = false;
    currentUser = null;
  }
});

// (Apple redirect fallback removido)

// Exporta funções úteis
export { auth, handleEmailAuth, handleGoogleLogin, handleLogout, isLoggedIn, currentUser };
