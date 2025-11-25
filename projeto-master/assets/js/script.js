document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ Sabiá iniciado com swipe ativo");

  // ======== TEMA (dark/light) ========
  const root = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  root.setAttribute('data-theme', savedTheme);
  if (themeToggleBtn) {
    updateThemeToggleIcon(savedTheme);
    themeToggleBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', current);
      localStorage.setItem('theme', current);
      updateThemeToggleIcon(current);
    });
  }

  function updateThemeToggleIcon(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.textContent = theme === 'light' ? '🌙' : '☀️';
    themeToggleBtn.title = theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro';
  }

  // ========== DADOS DE EXEMPLO ==========
  const profiles = [
    { name: "Ana Silva", title: "Frontend Pleno", location: "São Paulo", bio: "Apaixonada por UI e acessibilidade.", skills: ["React", "Next.js", "UI/UX"], image: "https://i.pravatar.cc/500?img=5" },
    { name: "Bruno Costa", title: "Backend Sênior", location: "Recife", bio: "Especialista em Node.js e arquitetura limpa.", skills: ["Node.js", "AWS", "Docker"], image: "https://i.pravatar.cc/500?img=15" },
    { name: "Carla Mendes", title: "UX Designer", location: "Curitiba", bio: "Design centrado no usuário e pesquisa qualitativa.", skills: ["Figma", "User Research"], image: "https://i.pravatar.cc/500?img=23" }
  ];

  let current = 0;
  // ========== LIKES (persistidos) ==========
  const likes = JSON.parse(localStorage.getItem('likesList')) || [];

  function updateLikesList() {
    const container = document.getElementById('likes-list');
    if (!container) return;
    if (!likes.length) {
      container.innerHTML = '<p class="empty">Nenhuma curtida ainda.</p>';
      return;
    }
    container.innerHTML = likes.map(l => `
      <div class="like-item">
        <img src="${l.image}" alt="${l.name}" class="like-avatar">
        <div class="like-meta"><strong>${l.name}</strong><div class="like-title">${l.title || ''}</div></div>
      </div>
    `).join('');
  }

  // ========= ELEMENTOS =========
  const card = document.querySelector('.swipe-card');
  
  // Verifica se o card existe antes de continuar
  if (!card) {
    console.error('Elemento .swipe-card não encontrado!');
    return;
  }
  
  const img = card.querySelector('.card-image');
  const nameEl = card.querySelector('.card-name');
  const titleEl = card.querySelector('.card-title');
  const locEl = card.querySelector('.card-location');
  const bioEl = card.querySelector('.card-bio');
  const skillsEl = card.querySelector('.card-skills');
  const btnLike = document.getElementById('card-like');
  const btnReject = document.getElementById('card-reject');
  const btnInfo = document.getElementById('card-info');
  const btnSuper = document.getElementById('card-super');
  const endMsg = document.querySelector('.no-more-profiles');

  // ========= FUNÇÕES =========
  function renderProfile() {
    if (current >= profiles.length) {
      card.style.display = 'none';
      endMsg.classList.remove('hidden');
      return;
    }
    const p = profiles[current];
    img.src = p.image;
    nameEl.textContent = p.name;
    titleEl.textContent = p.title;
    locEl.textContent = p.location;
    bioEl.textContent = p.bio;
    skillsEl.innerHTML = p.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
    card.style.transform = "none";
    card.style.opacity = "1";
  }

  function nextProfile() {
    card.classList.add('fade-out');
    setTimeout(() => {
      current++;
      card.classList.remove('fade-out');
      renderProfile();
    }, 400);
  }

  // (removido) Botões da barra inferior foram retirados do layout.

  // ========= SWIPE GESTURE =========
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  const handleGestureStart = (e) => {
    isDragging = true;
    startX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    card.style.transition = "none";
  };

  const handleGestureMove = (e) => {
    if (!isDragging) return;
    currentX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX;
    const rotation = diff / 20;
    card.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
    card.style.opacity = 1 - Math.min(Math.abs(diff) / 300, 0.6);
  };

  const handleGestureEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    card.style.transition = "all 0.3s ease";

    const diff = currentX - startX;
    if (Math.abs(diff) > 120) {
      const direction = diff > 0 ? "right" : "left";
      animateSwipe(direction);
    } else {
      card.style.transform = "translateX(0) rotate(0)";
      card.style.opacity = "1";
    }
  };

  const animateSwipe = (direction) => {
    // se curtiu, salva no likes
    if (direction === "right") {
      const liked = profiles[current];
      if (liked) {
        // evita duplicatas básicas (mesmo nome + imagem)
        const exists = likes.some(l => l.name === liked.name && l.image === liked.image);
        if (!exists) {
          likes.push({ name: liked.name, title: liked.title, image: liked.image });
          localStorage.setItem('likesList', JSON.stringify(likes));
          // atualiza contador de likes no perfil
          const likesCountEl = document.getElementById('user-likes');
          if (likesCountEl) likesCountEl.textContent = likes.length;
          updateLikesList();
        }
      }
    }

    const offset = direction === "right" ? 500 : -500;
    card.style.transition = "all 0.4s ease";
    card.style.transform = `translateX(${offset}px) rotate(${direction === "right" ? 25 : -25}deg)`;
    card.style.opacity = "0";
    setTimeout(nextProfile, 400);
  };

  // Eventos para mouse e toque
  card.addEventListener("mousedown", handleGestureStart);
  card.addEventListener("mousemove", handleGestureMove);
  document.addEventListener("mouseup", handleGestureEnd);

  card.addEventListener("touchstart", handleGestureStart);
  card.addEventListener("touchmove", handleGestureMove);
  card.addEventListener("touchend", handleGestureEnd);

  // Eventos dos botões do card
  if (btnLike) btnLike.addEventListener('click', (e) => { e.preventDefault(); animateSwipe('right'); });
  if (btnReject) btnReject.addEventListener('click', (e) => { e.preventDefault(); animateSwipe('left'); });
  if (btnInfo) btnInfo.addEventListener('click', (e) => { e.preventDefault(); alert('Mais informações do perfil em breve.'); });
  if (btnSuper) btnSuper.addEventListener('click', (e) => { e.preventDefault(); alert('Super Like em breve.'); });

  // ========= PERFIL LOCAL =========
  const user = JSON.parse(localStorage.getItem('userProfile')) || {
    name: "Lucas Lucena",
    status: "Ser contratado",
    title: "Dev Fullstack Jr.",
    company: "Buscando recolocação",
    bio: "Focado em aprender e crescer no mundo da tecnologia."
  };

  function updateUserProfile() {
    const userNameEl = document.getElementById('user-name');
    const userStatusEl = document.getElementById('user-status');
    if (userNameEl) userNameEl.textContent = user.name;
    if (userStatusEl) userStatusEl.textContent = user.status;
    localStorage.setItem('userProfile', JSON.stringify(user));
  }

  const editProfileForm = document.getElementById('edit-profile-form');
  if (editProfileForm) {
    editProfileForm.onsubmit = e => {
      e.preventDefault();
      const editNameEl = document.getElementById('edit-name');
      const editStatusEl = document.getElementById('edit-status');
      const editTitleEl = document.getElementById('edit-title');
      const editCompanyEl = document.getElementById('edit-company');
      const editBioEl = document.getElementById('edit-bio');
      
      if (editNameEl) user.name = editNameEl.value;
      if (editStatusEl) user.status = editStatusEl.value;
      if (editTitleEl) user.title = editTitleEl.value;
      if (editCompanyEl) user.company = editCompanyEl.value;
      if (editBioEl) user.bio = editBioEl.value;
      
      updateUserProfile();
      const editModalOverlay = document.getElementById('edit-modal-overlay');
      if (editModalOverlay) editModalOverlay.classList.remove('open');
    };
  }

  // ========= MODAL =========
  const modal = document.getElementById('edit-modal-overlay');
  const openEditBtn = document.getElementById('open-edit-modal-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  
  if (openEditBtn && modal) {
    openEditBtn.onclick = () => modal.classList.add('open');
  }
  if (modalCloseBtn && modal) {
    modalCloseBtn.onclick = () => modal.classList.remove('open');
  }
  if (modalCancelBtn && modal) {
    modalCancelBtn.onclick = () => modal.classList.remove('open');
  }

  // ======== CURTIDAS MODAL ========
  setTimeout(() => {
    const likesModal = document.getElementById("likes-modal-overlay");
    const likesBtn = document.getElementById("open-likes-modal-btn");
    const likesClose = document.getElementById("likes-close-btn");
    const likesList = document.getElementById("likes-list");

    console.log('Elementos Curtidas:', { likesModal, likesBtn, likesClose, likesList });

    // Simulação de curtidas recebidas
    const likedBy = [
      { name: "Fernanda Souza", role: "UX Designer", image: "https://i.pravatar.cc/100?img=48" },
      { name: "João Lima", role: "Recrutador Tech", image: "https://i.pravatar.cc/100?img=12" },
      { name: "Mariana Costa", role: "CEO - StartHub", image: "https://i.pravatar.cc/100?img=36" }
    ];

    if (likesBtn) {
      likesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Botão Curtidas clicado!');
        if (likesList) {
          likesList.innerHTML = likedBy.map(p => `
            <div class="like-item">
              <img src="${p.image}" alt="${p.name}">
              <div class="like-info">
                <h4>${p.name}</h4>
                <p>${p.role}</p>
              </div>
            </div>
          `).join('');
        }
        if (likesModal) {
          likesModal.classList.add("open");
          console.log('Modal de curtidas aberto');
        }
      });
      console.log('Event listener de curtidas adicionado');
    } else {
      console.error('Botão de curtidas não encontrado!');
    }
    
    if (likesClose) {
      likesClose.addEventListener('click', (e) => {
        e.preventDefault();
        if (likesModal) likesModal.classList.remove("open");
      });
    }

    // Premium modal
    const premiumModal = document.getElementById('premium-modal-overlay');
    const premiumOpenBtn = document.getElementById('open-premium-modal-btn');
    const premiumCloseBtn = document.getElementById('premium-close-btn');
    
    console.log('Elementos Premium:', { premiumModal, premiumOpenBtn, premiumCloseBtn });
    
    if (premiumOpenBtn && premiumModal) {
      premiumOpenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Botão Premium clicado!');
        premiumModal.classList.add('open');
        console.log('Modal premium aberto');
      });
      console.log('Event listener de premium adicionado');
    } else {
      console.error('Botão ou modal premium não encontrado!');
    }
    
    if (premiumCloseBtn && premiumModal) {
      premiumCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        premiumModal.classList.remove('open');
      });
    }
  }, 500); // Aguarda 500ms para garantir que o DOM está pronto

  // ========= FOTO PERFIL =========
  function setupProfilePicUpload() {
    const upload = document.getElementById('profile-pic-upload');
    const photo = document.getElementById('profile-pic-large');
    if (!upload || !photo) return false;

    if (!upload.dataset.bound) {
      upload.addEventListener('change', e => {
        const file = e.target && e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = ev => {
            const imgData = ev.target && ev.target.result;
            if (photo) {
              photo.style.backgroundImage = `url(${imgData})`;
            }
            localStorage.setItem('profilePic', imgData || '');
          };
          reader.readAsDataURL(file);
        }
      });
      upload.dataset.bound = 'true';
    }

    const savedPic = localStorage.getItem('profilePic');
    if (savedPic && photo) {
      photo.style.backgroundImage = `url(${savedPic})`;
    }
    return true;
  }

  // Tenta registrar imediatamente; se ainda não existir (ex.: após login), observa o DOM e registra depois
  if (!setupProfilePicUpload()) {
    const observer = new MutationObserver(() => {
      if (setupProfilePicUpload()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ========= INICIALIZA =========
  // Atualiza contador de likes no perfil
  const likesCountEl = document.getElementById('user-likes');
  if (likesCountEl) likesCountEl.textContent = likes.length;
  
  updateUserProfile();
  updateLikesList();
  renderProfile();
});
