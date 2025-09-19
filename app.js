// Simple client-side JS to handle navigation, dummy auth, upload flow, and webcam
(function(){
  const authKey = 'fitscout_user';

  function isLoggedIn(){ return !!localStorage.getItem(authKey); }
  function login(email){ localStorage.setItem(authKey,email); }
  function logout(){ localStorage.removeItem(authKey); window.location = 'index.html'; }

  // Wire login form
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const email = document.getElementById('email').value;
      login(email);
      window.location = 'home.html';
    });
  }

  // Logout buttons
  ['logoutBtn','logoutBtn2','logoutBtn3','logoutBtn4'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.addEventListener('click', e=>{ e.preventDefault(); logout(); });
  });

  // Protect pages except index & login
  const path = location.pathname.split('/').pop();
  if(!isLoggedIn() && !['index.html','login.html',''].includes(path)){
    window.location = 'login.html';
  }

  // Theme toggle: persist in localStorage
  const themeKey = 'fitscout_theme';
  function applyTheme(t){
    if(t === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    localStorage.setItem(themeKey, t);
  }
  const saved = localStorage.getItem(themeKey) || 'dark';
  applyTheme(saved);
  // wire any theme toggle buttons (there may be several on pages)
  document.querySelectorAll('#themeToggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const next = document.documentElement.classList.contains('light') ? 'dark' : 'light';
      applyTheme(next);
    });
  });

  // Take test flow
  const videoInput = document.getElementById('videoInput');
  const analyzer = document.getElementById('analyzer');
  const results = document.getElementById('results');
  if(videoInput){
    videoInput.addEventListener('change', ()=>{
      if(videoInput.files && videoInput.files.length){
        analyzer.classList.remove('hidden');
        results.classList.add('hidden');
        // fake progress animation
        setTimeout(()=>{
          analyzer.classList.add('hidden');
          results.classList.remove('hidden');
          // animate progress bars inside results
          results.querySelectorAll('.progress span').forEach(span=>{
            const target = Number(span.getAttribute('data-target')) || 60;
            span.style.transition = 'width 1.2s ease';
            setTimeout(()=>{ span.style.width = target + '%'; }, 80);
          });
        }, 2200 + Math.random()*1800);
      }
    });
  }

  // Submit Video button handling
  const submitBtn = document.getElementById('submitVideo');
  const submitMsg = document.getElementById('submitMsg');
  if(submitBtn){
    submitBtn.addEventListener('click', ()=>{
      if(!videoInput || !videoInput.files || !videoInput.files.length){
        submitMsg.innerText = 'Please choose a video first.'; return;
      }
      submitBtn.disabled = true; submitBtn.innerText = 'Submitting...'; submitMsg.innerText = '';
      // fake upload delay
      setTimeout(()=>{
        submitBtn.innerText = 'Submitted ✓';
        submitMsg.innerText = 'Your video was submitted and added to test history.';
        // persist to localStorage as a new history item
        try{
          const key = 'fitscout_history';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          const now = new Date().toISOString().slice(0,10);
          const newItem = {date:now, type:'Uploaded Video', value:videoInput.files[0].name, badge:'bronze'};
          existing.unshift(newItem);
          localStorage.setItem(key, JSON.stringify(existing));
        }catch(e){ console.error(e); }
        // if dashboard present, prepend the new item visually
        if(historyCards){
          const d = {date:new Date().toISOString().slice(0,10), type:'Uploaded Video', value:videoInput.files[0].name, badge:'bronze'};
          const div = document.createElement('div'); div.className='history-item';
          div.innerHTML = `<div><strong>${d.type}</strong><div class='muted'>${d.date}</div></div><div>${d.value} <span class='badge ${d.badge}'>${d.badge}</span></div>`;
          historyCards.prepend(div);
        }
      }, 1400 + Math.random()*1200);
    });
  }

  // Inject dummy history on dashboard
  const historyCards = document.getElementById('historyCards');
  if(historyCards){
    const stored = JSON.parse(localStorage.getItem('fitscout_history') || '[]');
    const dummy = [
      {date:'2025-09-18', type:'Vertical Jump', value:'45 cm', badge:'gold'},
      {date:'2025-09-12', type:'Sprint 20m', value:'3.2 s', badge:'silver'},
      {date:'2025-09-05', type:'Sit-ups', value:'22 reps', badge:'gold'},
      {date:'2025-08-27', type:'Endurance Run', value:'12:30', badge:'bronze'},
      {date:'2025-08-15', type:'Push-ups', value:'30 reps', badge:'silver'},
      {date:'2025-07-30', type:'Agility Drill', value:'15.4 s', badge:'bronze'},
      {date:'2025-07-10', type:'Vertical Jump', value:'40 cm', badge:'silver'},
      {date:'2025-06-22', type:'Sit-ups', value:'18 reps', badge:'bronze'}
    ];
    const combined = stored.concat(dummy);
    combined.forEach(d=>{
      const div = document.createElement('div'); div.className='history-item';
      div.innerHTML = `<div><strong>${d.type}</strong><div class='muted'>${d.date}</div></div><div>${d.value} <span class='badge ${d.badge}'>${d.badge}</span></div>`;
      historyCards.appendChild(div);
    });
    // animate progress bar when dashboard is present
    const pb = document.getElementById('progressBar');
    const iv = document.getElementById('improveVal');
    if(pb && iv){
      setTimeout(()=>{ pb.querySelector('span').style.width = iv.innerText + '%'; }, 400);
    }
  }

  // Render leaderboard if present
  const lbTable = document.getElementById('leaderboard');
  const lbFilter = document.getElementById('lbFilter');
  const leaderboardData = [
    {rank:1,name:'A. Johnson',sport:'football',score:982},
    {rank:2,name:'B. Kaur',sport:'basketball',score:960},
    {rank:3,name:'C. Patel',sport:'athletics',score:940},
    {rank:4,name:'D. Smith',sport:'cricket',score:920},
    {rank:5,name:'E. Gomez',sport:'general',score:900},
    {rank:6,name:'F. Lee',sport:'football',score:885},
    {rank:7,name:'G. Rossi',sport:'basketball',score:870},
    {rank:8,name:'H. Okafor',sport:'athletics',score:860},
    {rank:9,name:'I. Chen',sport:'cricket',score:850},
    {rank:10,name:'J. Lopez',sport:'general',score:835}
  ];
  function renderLeaderboard(filter){
    if(!lbTable) return;
    const tbody = lbTable.querySelector('tbody'); tbody.innerHTML='';
    const rows = leaderboardData.filter(r=>!filter||filter==='all'?true:r.sport===filter);
    rows.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.rank}</td><td>${r.name}</td><td>${r.sport}</td><td>${r.score}</td>`;
      tbody.appendChild(tr);
    });
  }
  if(lbTable){
    renderLeaderboard('all');
    if(lbFilter) lbFilter.addEventListener('change', ()=>{ renderLeaderboard(lbFilter.value); });
  }

  // Welcome message with user's name
  const welcomeMsg = document.getElementById('welcomeMsg');
  const userEmail = localStorage.getItem('fitscout_user');
  if(welcomeMsg && userEmail){
    const name = userEmail.split('@')[0];
    welcomeMsg.innerText = `Welcome back, ${name}`;
    // subtle animation
    welcomeMsg.style.opacity = 0; setTimeout(()=>{ welcomeMsg.style.transition='opacity .8s ease'; welcomeMsg.style.opacity=1; }, 120);
  }

  // Practice mode - webcam
  const preview = document.getElementById('preview');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const feedback = document.getElementById('feedback');
  const practiceTitle = document.getElementById('practiceTitle');
  const practiceDesc = document.getElementById('practiceDesc');
  let stream;
  async function startCamera(){
    try{
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}, audio:false});
      if(preview) preview.srcObject = stream;
      if(feedback) feedback.innerText = 'Great Posture!';
      // show sport-specific guidance when camera starts
      const params = new URLSearchParams(location.search);
      const sport = params.get('sport') || 'general';
      if(feedback) feedback.innerText = ({
        football: 'Dribble smoothly — watch your posture',
        basketball: 'Focus on jump and follow-through',
        athletics: 'Drive from the hips at start',
        cricket: 'Keep eyes on the ball — stable stance',
        general: 'Keep Going! Maintain form'
      }[sport] || 'Keep Going!');
      // set titles
      if(practiceTitle) practiceTitle.innerText = ({ football: 'Football — Dribble & Jump', basketball: 'Basketball — Jump Shot Practice', athletics: 'Athletics — Sprint Start', cricket: 'Cricket — Batting Swing', general: 'General Fitness — Conditioning' }[sport] || 'Practice Mode');
      if(practiceDesc) practiceDesc.innerText = ({ football: 'Dribble and jump detection guidance', basketball: 'Work on jump shot timing and form', athletics: 'Focus on explosive start posture', cricket: 'Improve swing mechanics and stance', general: 'Reps and form for general fitness' }[sport] || 'Sport practice');
    }catch(err){
      if(feedback) feedback.innerText = 'Camera access denied';
    }
  }
  function stopCamera(){ if(stream){ stream.getTracks().forEach(t=>t.stop()); if(preview) preview.srcObject = null; if(feedback) feedback.innerText='Practice stopped'; }}
  if(startBtn) startBtn.addEventListener('click', ()=>{ startCamera(); });
  if(stopBtn) stopBtn.addEventListener('click', ()=>{ stopCamera(); });

  // Toggle button states
  if(startBtn && stopBtn){
    startBtn.addEventListener('click', ()=>{ startBtn.classList.add('active'); stopBtn.classList.remove('active'); });
    stopBtn.addEventListener('click', ()=>{ stopBtn.classList.add('active'); startBtn.classList.remove('active'); });
  }

  // small feedback ticker
  if(feedback){
    const msgs = ['Keep Going!','Great Posture!','Push a bit harder!','Nice Consistency!'];
    setInterval(()=>{ feedback.innerText = msgs[Math.floor(Math.random()*msgs.length)]; }, 2500);
  }

})();
