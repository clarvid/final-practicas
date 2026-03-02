// Cuenta regresiva continua hasta 29 de marzo de 2026 (hora local)
(function(){
  // Meses en JS: 0 = enero, 2 = marzo
  const target = new Date(2026, 2, 29, 0, 0, 0, 0);

  // Continuous countdown elements
  const contDays = document.getElementById('cont-days');
  const contHours = document.getElementById('cont-hours');
  const contMinutes = document.getElementById('cont-minutes');
  const contSeconds = document.getElementById('cont-seconds');
  const finishedCont = document.getElementById('finished-cont');

  // Work-hours countdown elements
  const workDayName = document.getElementById('work-day-name');
  const workHours = document.getElementById('work-hours');
  const workMinutes = document.getElementById('work-minutes');
  const workSeconds = document.getElementById('work-seconds');
  const finishedWork = document.getElementById('finished-work');

  function pad(n){ return String(n).padStart(2,'0'); }

  function secsToParts(sec){
    const days = Math.floor(sec / (3600*24));
    const hours = Math.floor((sec % (3600*24)) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return {days,hours,minutes,seconds};
  }

  function updateContinuous(now){
    let diff = target - now;
    if (diff <= 0){
      document.getElementById('countdown-cont').hidden = true;
      finishedCont.hidden = false;
      return;
    }
    const sec = Math.floor(diff / 1000);
    const p = secsToParts(sec);
    contDays.textContent = p.days;
    contHours.textContent = pad(p.hours);
    contMinutes.textContent = pad(p.minutes);
    contSeconds.textContent = pad(p.seconds);
  }

  function getWorkHoursForDay(date){
    const dow = date.getDay(); // 0 Sun .. 6 Sat
    if (dow === 0 || dow === 6) return null;
    const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
    const start = new Date(y,m,d,8,0,0,0);
    const end = new Date(y,m,d,(dow===5)?17:18,0,0,0);
    return {start,end};
  }

  function isWithinWorkHours(now){
    const w = getWorkHoursForDay(now);
    if (!w) return false;
    return now >= w.start && now < w.end;
  }

  function nextWorkStart(after){
    let d = new Date(after.getFullYear(), after.getMonth(), after.getDate(), 0,0,0,0);
    // if after is within today's work start before start, start may be today
    for (let i=0;i<14;i++){
      const candidate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0,0);
      const w = getWorkHoursForDay(candidate);
      if (w){
        // if same day and after before start -> return start
        if (after < w.start) return w.start;
        // if after before end and after >= start -> return after (we're in work hours)
        if (after >= w.start && after < w.end) return after;
      }
      // next day
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1, 0,0,0,0);
    }
    return null;
  }

  function businessDaysRemaining(now, target){
    if (now >= target) return 0;
    // Determine first day to count: if currently within work hours, include today; if after work hours or weekend, start next workday
    let startDate;
    if (isWithinWorkHours(now)){
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0,0);
    } else {
      const nextStart = nextWorkStart(now);
      if (!nextStart) return 0;
      startDate = new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate(), 0,0,0,0);
    }

    const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0,0,0,0);
    let count = 0;
    for (let d = new Date(startDate); d < targetDate; d.setDate(d.getDate()+1)){
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) count++;
    }
    return count;
  }

  function updateWork(now){
    if (now >= target){
      document.getElementById('countdown-work').hidden = true;
      finishedWork.hidden = false;
      return;
    }
    // determine which day to display (today if in work hours, otherwise next work start day)
    const nextStart = nextWorkStart(now);
    const displayDate = isWithinWorkHours(now) ? now : (nextStart || now);
    const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    workDayName.textContent = dayNames[displayDate.getDay()];

    // time left in current work period (if in work hours) or time until next work start
    if (isWithinWorkHours(now)){
      const w = getWorkHoursForDay(now);
      const remMs = w.end - now;
      const parts = secsToParts(Math.floor(remMs/1000));
      workHours.textContent = pad(parts.hours);
      workMinutes.textContent = pad(parts.minutes);
      workSeconds.textContent = pad(parts.seconds);
    } else {
      if (!nextStart){
        workHours.textContent = '00';
        workMinutes.textContent = '00';
        workSeconds.textContent = '00';
      } else {
        const remMs = nextStart - now;
        const parts = secsToParts(Math.floor(remMs/1000));
        workHours.textContent = pad(parts.days*24 + parts.hours);
        workMinutes.textContent = pad(parts.minutes);
        workSeconds.textContent = pad(parts.seconds);
      }
    }
  }

  function tick(){
    const now = new Date();
    updateContinuous(now);
    updateWork(now);
  }

  tick();
  setInterval(tick, 1000);

  // --- Alarm: 10 minutes before end of workday ---
  const alarmToggle = document.getElementById('alarm-toggle');
  const nextAlarmEl = document.getElementById('next-alarm');
  const alarmBanner = document.getElementById('alarm-banner');
  const alarmDismiss = document.getElementById('alarm-dismiss');

  let alarmTimer = null;
  let beepInterval = null;
  let audioCtx = null;

  function formatDateTime(dt){
    if (!dt) return '—';
    return dt.toLocaleString();
  }

  function computeAlarmForDate(date){
    const w = getWorkHoursForDay(date);
    if (!w) return null;
    // alarm 10 minutes before end
    return new Date(w.end.getTime() - 10*60*1000);
  }

  function findNextAlarm(after){
    for (let i=0;i<14;i++){
      const d = new Date(after.getFullYear(), after.getMonth(), after.getDate()+i, 0,0,0,0);
      const alarm = computeAlarmForDate(d);
      if (alarm && alarm > after) return alarm;
    }
    return null;
  }

  function scheduleAlarm(){
    clearAlarmTimer();
    if (!alarmToggle.checked) {
      nextAlarmEl.textContent = 'Próxima alarma: —';
      return;
    }
    const now = new Date();
    const next = findNextAlarm(now);
    if (!next){
      nextAlarmEl.textContent = 'Próxima alarma: —';
      return;
    }
    const ms = next - now;
    nextAlarmEl.textContent = 'Próxima alarma: ' + formatDateTime(next);
    alarmTimer = setTimeout(()=>{ triggerAlarm(next); }, ms);
  }

  function clearAlarmTimer(){
    if (alarmTimer) { clearTimeout(alarmTimer); alarmTimer = null; }
  }

  function playBeepOnce(duration=600){
    try{
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      o.connect(g);
      g.connect(audioCtx.destination);
      g.gain.value = 0.0001;
      o.start();
      // ramp up
      g.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
      setTimeout(()=>{
        g.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
        o.stop(audioCtx.currentTime + 0.06);
      }, duration);
    }catch(e){
      // ignore audio errors
    }
  }

  function triggerAlarm(alarmTime){
    // show banner and start periodic beeps
    alarmBanner.hidden = false;
    // try to unlock audio on first user gesture if needed
    try{ if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); }catch(e){}
    playBeepOnce(700);
    beepInterval = setInterval(()=> playBeepOnce(700), 3000);
    // schedule next alarm for following workday
    // when dismissed, schedule next
  }

  function stopAlarm(){
    alarmBanner.hidden = true;
    if (beepInterval) { clearInterval(beepInterval); beepInterval = null; }
    try{ if (audioCtx && audioCtx.state !== 'closed') { /* keep context for reuse */ } }catch(e){}
  }

  // event handlers
  if (alarmToggle){
    // restore preference
    const saved = localStorage.getItem('alarmEnabled');
    if (saved === '1') alarmToggle.checked = true;
    alarmToggle.addEventListener('change', ()=>{
      localStorage.setItem('alarmEnabled', alarmToggle.checked ? '1':'0');
      scheduleAlarm();
    });
  }

  if (alarmDismiss){
    alarmDismiss.addEventListener('click', ()=>{
      stopAlarm();
      // schedule next alarm
      scheduleAlarm();
    });
  }

  // schedule initially
  scheduleAlarm();

  // also re-evaluate alarm schedule every minute (in case of system sleep/resume)
  setInterval(()=> scheduleAlarm(), 60*1000);
})();
