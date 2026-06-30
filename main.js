/* ================================================
   PORTFOLIO JAVASCRIPT
   Event handling | DOM manipulation | Validation
   Arrays | Functions | Task Management
   ================================================ */

'use strict';

// ---- UTILITY FUNCTIONS ----
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- NAVBAR ----
(function initNavbar() {
  const navbar    = $('.navbar');
  const hamburger = $('.hamburger');
  const navLinks  = $('.nav-links');

  if (!navbar) return;

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar.style.background = window.scrollY > 40
      ? 'rgba(10,15,30,0.97)'
      : 'rgba(10,15,30,0.85)';
  });

  // Mobile toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Active nav link based on current page
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ---- FADE-IN OBSERVER ----
(function initFadeObserver() {
  const elements = $$('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
})();

// ---- TYPEWRITER EFFECT (Hero) ----
(function initTypewriter() {
  const el = $('.hero-title');
  if (!el) return;

  const phrases = [
    'Software Developer',
    'App Designer',
    'Tech Entrepreneur',
    'UI/UX Specialist',
    'Founder @ AppNaija'
  ];

  let pi = 0, ci = 0, deleting = false;

  function type() {
    const current = phrases[pi];
    if (deleting) {
      ci--;
    } else {
      ci++;
    }

    el.innerHTML = escapeHTML(current.slice(0, ci)) + '<span class="cursor"></span>';

    let delay = deleting ? 50 : 90;
    if (!deleting && ci === current.length) {
      delay = 2000;
      deleting = true;
    } else if (deleting && ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  type();
})();

// ---- COUNTER ANIMATION (Stats) ----
(function initCounters() {
  const counters = $$('.stat-num[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      let current = 0;
      const step = Math.ceil(target / 50);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + (el.dataset.suffix || '');
        if (current >= target) clearInterval(timer);
      }, 30);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


/* ============================================
   ACADEMIC PLANNER
   ============================================ */
(function initPlanner() {
  const form         = $('#task-form');
  if (!form) return;

  const taskList     = $('#task-list');
  const tasksEmpty   = $('#tasks-empty');
  const countEl      = $('#tasks-count');
  const filterBtns   = $$('.filter-btn');

  let tasks          = loadTasks();
  let currentFilter  = 'all';

  // ---- Storage ----
  function loadTasks() {
    try {
      return JSON.parse(localStorage.getItem('portfolio_tasks') || '[]');
    } catch { return []; }
  }

  function saveTasks() {
    localStorage.setItem('portfolio_tasks', JSON.stringify(tasks));
  }

  // ---- Render ----
  function render() {
    const filtered = tasks.filter(t => {
      if (currentFilter === 'all')       return true;
      if (currentFilter === 'active')    return !t.completed;
      if (currentFilter === 'completed') return t.completed;
      return t.category === currentFilter;
    });

    taskList.innerHTML = '';

    if (filtered.length === 0) {
      tasksEmpty.style.display = 'block';
    } else {
      tasksEmpty.style.display = 'none';
      filtered.forEach(task => {
        taskList.appendChild(createTaskEl(task));
      });
    }

    const total     = tasks.length;
    const done      = tasks.filter(t => t.completed).length;
    countEl.textContent = `${done}/${total} completed`;
  }

  function createTaskEl(task) {
    const div = document.createElement('div');
    div.className = `task-item${task.completed ? ' completed' : ''}`;
    div.dataset.id = task.id;

    const priorityClass = `priority-${task.priority}`;
    const checked = task.completed ? 'checked' : '';

    div.innerHTML = `
      <button class="task-checkbox ${checked}" title="Toggle complete" aria-label="Mark complete">
        ${task.completed ? '✓' : ''}
      </button>
      <div class="task-body">
        <div class="task-text">${escapeHTML(task.text)}</div>
        <div class="task-meta">
          <span class="task-priority ${priorityClass}">${task.priority}</span>
          <span class="task-category-label">${escapeHTML(task.category)}</span>
          ${task.due ? `<span class="task-due">📅 ${formatDate(task.due)}</span>` : ''}
        </div>
      </div>
      <button class="task-delete" title="Delete task" aria-label="Delete task">✕</button>
    `;

    // Toggle complete
    div.querySelector('.task-checkbox').addEventListener('click', () => {
      const t = tasks.find(t => t.id === task.id);
      if (t) { t.completed = !t.completed; saveTasks(); render(); }
    });

    // Delete
    div.querySelector('.task-delete').addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      render();
    });

    return div;
  }

  // ---- Add Task ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text     = $('#task-text').value.trim();
    const priority = $('#task-priority').value;
    const category = $('#task-category').value;
    const due      = $('#task-due').value;

    if (!text) {
      $('#task-text').focus();
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      text,
      priority,
      category,
      due,
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();
    form.reset();
    currentFilter = 'all';
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
    render();
    taskList.firstChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // ---- Filters ----
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  // Initial render
  render();
})();


/* ============================================
   CONTACT FORM VALIDATION
   ============================================ */
(function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const fields = {
    name:    { el: $('#cf-name'),    errorEl: $('#err-name') },
    email:   { el: $('#cf-email'),   errorEl: $('#err-email') },
    phone:   { el: $('#cf-phone'),   errorEl: $('#err-phone') },
    message: { el: $('#cf-message'), errorEl: $('#err-message') },
  };

  const successEl = $('#form-success');

  // ---- Validators ----
  const validators = {
    name(v)    { return v.trim().length >= 2; },
    email(v)   { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
    phone(v)   { return /^\d{7,15}$/.test(v.trim().replace(/[\s\-\+\(\)]/g, '')); },
    message(v) { return v.trim().length >= 10; },
  };

  const errorMessages = {
    name:    'Please enter your full name (at least 2 characters).',
    email:   'Please enter a valid email address.',
    phone:   'Phone number must contain only digits (7–15 digits).',
    message: 'Message must be at least 10 characters.',
  };

  function validateField(name) {
    const { el, errorEl } = fields[name];
    const valid = validators[name](el.value);
    el.classList.toggle('error', !valid);
    errorEl.textContent = valid ? '' : errorMessages[name];
    errorEl.classList.toggle('show', !valid);
    return valid;
  }

  // Live validation on blur
  Object.keys(fields).forEach(name => {
    fields[name].el.addEventListener('blur', () => validateField(name));
    fields[name].el.addEventListener('input', () => {
      if (fields[name].el.classList.contains('error')) validateField(name);
    });
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = Object.keys(fields).map(name => validateField(name));
    if (results.every(Boolean)) {
      form.style.display = 'none';
      successEl.classList.add('show');
    } else {
      // Focus first error
      const firstError = Object.keys(fields).find(name => !validators[name](fields[name].el.value));
      if (firstError) fields[firstError].el.focus();
    }
  });

  // Reset button
  const resetBtn = $('#form-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.style.display = '';
      successEl.classList.remove('show');
      Object.values(fields).forEach(({ el, errorEl }) => {
        el.classList.remove('error');
        errorEl.classList.remove('show');
      });
    });
  }
})();


/* ============================================
   PROJECT FILTERS (Projects page)
   ============================================ */
(function initProjectFilter() {
  const filterBtns = $$('.proj-filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      $$('.project-card').forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.style.display = match ? '' : 'none';
        if (match) card.classList.add('fade-up', 'visible');
      });
    });
  });
})();
