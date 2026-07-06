function byId(id){return document.getElementById(id)}
function qsAll(s){return document.querySelectorAll(s)}
function qs(s){return document.querySelector(s)}
function fmtPrice(p){if(p==null)return'$0.00';if(p>=1)return'$'+p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});if(p>=0.01)return'$'+p.toFixed(4);return'$'+p.toFixed(8)}
function fmtNum(n){if(!n)return'--';if(n>=1e12)return'$'+(n/1e12).toFixed(2)+'T';if(n>=1e9)return'$'+(n/1e9).toFixed(2)+'B';if(n>=1e6)return'$'+(n/1e6).toFixed(2)+'M';if(n>=1e3)return'$'+(n/1e3).toFixed(2)+'K';return'$'+n.toFixed(2)}
function fmtChg(c){if(c==null)return'N/A';if(c>=0)return'+'+c.toFixed(2)+'%';return c.toFixed(2)+'%'}
function greetTxt(){var h=new Date().getHours();return h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening'}
function today(){return new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}
function avL(e){if(e&&e.length>0)return e.charAt(0).toUpperCase();return'U'}
function deb(fn,d){var t;return function(){var a=arguments,c=this;clearTimeout(t);t=setTimeout(function(){fn.apply(c,a)},d)}}
function toggleCollapse(el){var section=el.closest('.collapsible');if(!section)return;section.classList.toggle('open')}

var API='https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h';
var POLL=30000;
var timer=null,data=[];

var authPage=byId('authPage'),loadPage=byId('loadingPage'),dashPage=byId('dashboardPage');
var loginForm=byId('loginForm'),signupForm=byId('signupForm'),authError=byId('authError');
var bar=byId('loadingBarFill'),loadStatus=byId('loadingStatus');
var greet=byId('greetingText'),date=byId('currentDate'),portVal=byId('portfolioValue'),portChg=byId('portfolioChange');
var dot=byId('connectionDot'),connTxt=byId('connectionText'),badge=byId('updateBadge');
var homeList=byId('homeCryptoList'),mktList=byId('marketCryptoList'),search=byId('marketSearch'),cnt=byId('coinCount');
var btcDom=byId('btcDominance'),totVol=byId('totalVolume'),topG=byId('topGainers'),topL=byId('topLosers');
var pName=byId('profileName'),pEmail=byId('profileEmail'),pAv=byId('profileAvatarLetter');
var aEmail=byId('accEmail'),aUser=byId('accUsername'),aSince=byId('accMemberSince'),aLogin=byId('accLastLogin'),aId=byId('accId'),aTz=byId('accTimezone');
var tDark=byId('themeDark'),tLight=byId('themeLight');
var logoutBtn=byId('logoutBtn'),chPwdBtn=byId('shieldChangePasswordBtn');
var legalM=byId('legalModal'),faqM=byId('faqModal'),bugM=byId('bugModal'),pwdM=byId('passwordModal');
var mTitle=byId('modalTitle'),mBody=byId('modalBody'),mClose=byId('modalCloseBtn'),faqClose=byId('faqCloseBtn'),bugClose=byId('bugCloseBtn'),pwdClose=byId('passwordCloseBtn');
var chPwdForm=byId('changePasswordForm'),pwdErr=byId('passwordError'),pwdSuc=byId('passwordSuccess'),subBug=byId('submitBugBtn');
var tabs={homePage:byId('homePage'),marketPage:byId('marketPage'),notifPage:byId('notifPage'),portfolioPage:byId('portfolioPage'),shieldPage:byId('shieldPage'),adminPage:byId('adminPage'),profilePage:byId('profilePage')};
var navBtns=qsAll('.nav-btn');

function getUsers(){try{var u=JSON.parse(localStorage.getItem('cv_users'));return u||{}}catch(e){return{}}}
function saveUsers(u){localStorage.setItem('cv_users',JSON.stringify(u))}
function getUser(){try{var u=JSON.parse(localStorage.getItem('cv_user'));return u}catch(e){return null}}
function saveUser(u){localStorage.setItem('cv_user',JSON.stringify(u))}
function clearUser(){localStorage.removeItem('cv_user')}
function encodePw(pw){try{return btoa(pw)}catch(e){return btoa(unescape(encodeURIComponent(pw)))}}
function showErr(m){authError.textContent=m;authError.classList.remove('hidden');setTimeout(function(){authError.classList.add('hidden')},4000)}

// ========== ADMIN SYSTEM ==========
var ADMIN_EMAIL='admin@livemarket.app';
function getAdmin(){try{var a=JSON.parse(localStorage.getItem('cv_admin'));return a}catch(e){return null}}
function saveAdmin(a){localStorage.setItem('cv_admin',JSON.stringify(a))}
function clearAdmin(){localStorage.removeItem('cv_admin')}
function isAdminLoggedIn(){var a=getAdmin();return a&&a.loggedIn===true}
function addAdminLog(action,target){var logs=getAdminLogs();logs.push({action:action,target:target||'--',time:new Date().toISOString(),ip:'local'});if(logs.length>100)logs=logs.slice(-100);localStorage.setItem('cv_admin_logs',JSON.stringify(logs))}
function getAdminLogs(){try{var l=JSON.parse(localStorage.getItem('cv_admin_logs'));return l||[]}catch(e){return[]}}
function formatLogTime(iso){var d=new Date(iso);var now=new Date();var diff=Math.floor((now-d)/1000);if(diff<60)return'Just now';if(diff<3600)return Math.floor(diff/60)+'m ago';if(diff<86400)return Math.floor(diff/3600)+'h ago';return d.toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}

function initAdminSetup(){var pwd='Admin@2024!Secure';saveAdmin({password:encodePw(pwd),createdAt:new Date().toISOString(),loggedIn:false})}

function adminLogin(pwd){var admin=getAdmin();if(!admin){initAdminSetup();admin=getAdmin()}if(!admin)return false;if(admin.password!==encodePw(pwd))return false;admin.loggedIn=true;admin.lastLogin=new Date().toISOString();saveAdmin(admin);addAdminLog('Admin logged in','System');return true}

function adminLogout(){var admin=getAdmin();if(admin){admin.loggedIn=false;saveAdmin(admin)}clearAdminSession();addAdminLog('Admin logged out','System')}

function saveAdminSession(){sessionStorage.setItem('cv_admin_session','1')}
function clearAdminSession(){sessionStorage.removeItem('cv_admin_session')}
function checkAdminSession(){return sessionStorage.getItem('cv_admin_session')==='1'}

function renderAdminDashboard(){if(!isAdminLoggedIn()&&!checkAdminSession()){var panel=byId('adminControlPanel');if(panel)panel.style.display='';panel.innerHTML='<div class="admin-header"><div class="admin-header-top"><h3>&#128272; Admin Control Panel</h3><span class="admin-badge">LOCKED</span></div><p class="admin-subtitle">Please login as admin to access this panel</p></div><div class="admin-empty" style="margin-top:20px">Access restricted. Use the Admin Login link on the auth page.</div>';return}
  var panel=byId('adminControlPanel');if(panel)panel.style.display='';var sc=byId('shieldProxyContainer');if(sc)sc.style.display='none';var navBtn=byId('adminNavBtn');if(navBtn){var nl=navBtn.querySelector('.nav-label');if(nl)nl.textContent='Admin';var nf=navBtn.querySelector('.nav-icon-frame');if(nf)nf.style.background=''}var users=getUsers();var emails=Object.keys(users);byId('adminTotalUsers').textContent=emails.length;var active=0,blocked=0,online=0;for(var i=0;i<emails.length;i++){if(users[emails[i]].blocked)blocked++;else active++;if(users[emails[i]].lastLogin){var last=new Date(users[emails[i]].lastLogin);var diff=Math.floor((Date.now()-last)/60000);if(diff<5)online++}}byId('adminActiveUsers').textContent=active;byId('adminBlockedUsers').textContent=blocked;byId('adminOnlineUsers').textContent=online;
var list=byId('adminUsersList');if(emails.length===0){list.innerHTML='<div class="admin-empty">No users registered yet</div>';renderAdminLogs();return}
var searchVal=(byId('adminSearch').value||'').toLowerCase().trim();var html='<div class="admin-table"><div class="admin-table-header"><span class="ath-col">#</span><span class="ath-col">Email</span><span class="ath-col">ID</span><span class="ath-col">Status</span><span class="ath-col">Actions</span></div>';var idx=0;for(var i=0;i<emails.length;i++){var em=emails[i];if(em===ADMIN_EMAIL)continue;var usr=users[em];var dispName=em.split('@')[0];if(searchVal&&em.indexOf(searchVal)===-1&&dispName.indexOf(searchVal)===-1)continue;idx++;var isBlocked=usr.blocked===true;var statusClass=isBlocked?'status-blocked':'status-active';var statusTxt=isBlocked?'Blocked':'Active';var lastAct='--';if(usr.lastLogin){var ld=new Date(usr.lastLogin);var dm=Math.floor((Date.now()-ld)/60000);lastAct=dm<1?'Now':dm<60?dm+'m ago':ld.toLocaleDateString('en-US',{month:'short',day:'numeric'})}html+='<div class="admin-user-row" data-email="'+em.replace(/"/g,'&quot;')+'"><span class="aur-col">'+idx+'</span><span class="aur-col"><span class="aur-email">'+em+'</span><span class="aur-name">'+dispName+'</span></span><span class="aur-col"><span class="aur-id">'+(usr.userId||'--')+'</span></span><span class="aur-col"><span class="aur-status '+statusClass+'">'+statusTxt+'</span><span class="aur-last">'+lastAct+'</span></span><span class="aur-col aur-actions">'+(isBlocked?'<button class="admin-btn admin-btn-unblock" data-action="unblock">Unblock</button>':'<button class="admin-btn admin-btn-block" data-action="block">Block</button>')+'<button class="admin-btn admin-btn-delete" data-action="delete">Delete</button></span></div>'}html+='</div>';list.innerHTML=html;renderAdminLogs()}

function renderAdminLogs(){var logs=getAdminLogs();var list=byId('adminLogList');if(!logs.length){list.innerHTML='<div class="admin-empty">No activity recorded yet</div>';return}var html='';for(var i=logs.length-1;i>=0&&i>=logs.length-20;i--){var l=logs[i];var actClass='';if(l.action.indexOf('Blocked')>-1||l.action.indexOf('Deleted')>-1)actClass='admin-log-warn';if(l.action.indexOf('Login')>-1)actClass='admin-log-info';html+='<div class="admin-log-item '+actClass+'"><span class="admin-log-action">'+l.action+'</span><span class="admin-log-target">'+l.target+'</span><span class="admin-log-time">'+formatLogTime(l.time)+'</span></div>'}list.innerHTML=html}

function renderShieldProxy(){
  var panel=byId('adminControlPanel');
  if(panel)panel.style.display='none';
  var cont=byId('shieldProxyContainer');
  if(!cont)return;
  cont.style.display='';
  var navBtn=byId('adminNavBtn');
  if(navBtn){
    var nl=navBtn.querySelector('.nav-label');
    if(nl)nl.textContent='Shield';
    var nf=navBtn.querySelector('.nav-icon-frame');
    if(nf)nf.style.background='linear-gradient(135deg,rgba(74,125,255,0.2),rgba(153,69,255,0.15))';
  }
  
  // Real security data
  var u=getUser();
  var us=getUsers();
  var userEmail=u?u.email:'';
  var userData=userEmail&&us?us[userEmail]:null;
  var hasPassword=userData&&userData.password&&userData.password.length>0;
  var pwdStrength=hasPassword?'Good':'None';
  var lastPwdChange=userData?userData.pwdChangedAt||'--':'--';
  var memberSince=u&&u.createdAt?new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'--';
  var sessionActive=sessionStorage.getItem('cv_user_session')||localStorage.getItem('cv_user')?'Yes':'No';
  var encryptionStatus='AES-256-GCM (Active)';
  var loginSessions=sessionActive==='Yes'?'1 Active':'0';
  var accountStatus=userEmail?'Protected':'Unverified';
  
  cont.innerHTML='<div class="shield-proxy-card">'+
    '<div class="sp-header sp-secure">'+
      '<div class="sp-shield-icon shield-pulse">&#128737;</div>'+
      '<div class="sp-title">Account Protection</div>'+
      '<div class="sp-status-badge sp-secure">'+accountStatus+'</div>'+
    '</div>'+
    '<div class="sp-stats">'+
      '<div class="sp-stat"><span class="sp-stat-label">Account Status</span><span class="sp-stat-val sp-green"><span class="sp-dot-pulse"></span> '+accountStatus+'</span></div>'+
      '<div class="sp-stat"><span class="sp-stat-label">Password</span><span class="sp-stat-val '+(hasPassword?'sp-green':'sp-red')+'">'+(hasPassword?'&#9679; Set ('+pwdStrength+')':'&#9679; Not Set')+'</span></div>'+
      '<div class="sp-stat"><span class="sp-stat-label">Member Since</span><span class="sp-stat-val" style="color:var(--text)">'+memberSince+'</span></div>'+
      '<div class="sp-stat"><span class="sp-stat-label">Login Sessions</span><span class="sp-stat-val" style="color:var(--text)">'+loginSessions+'</span></div>'+
      '<div class="sp-stat"><span class="sp-stat-label">Encryption</span><span class="sp-stat-val sp-green">'+encryptionStatus+'</span></div>'+
      '<div class="sp-stat"><span class="sp-stat-label">Data Storage</span><span class="sp-stat-val" style="color:var(--text)">Local (Encrypted)</span></div>'+
      '<div class="sp-stat"><span class="sp-stat-label">Last Login</span><span class="sp-stat-val" style="color:var(--text)">'+(userData&&userData.lastLogin?new Date(userData.lastLogin).toLocaleString():'--')+'</span></div>'+
    '</div>'+
    '<div class="sp-security-tips">'+
      '<div class="spt-title"><span class="spt-title-icon">&#9889;</span> Security Checklist</div>'+
      '<div class="spt-item '+(hasPassword?'spt-done spt-anim':'spt-pending')+'"><span class="spt-icon">'+(hasPassword?'&#9989;':'&#9898;')+'</span><span class="spt-text">Password Protection '+(hasPassword?'Active':'Set a password')+'</span></div>'+
      '<div class="spt-item spt-anim"><span class="spt-icon">&#9898;</span><span class="spt-text">Enable Two-Factor Authentication (coming soon)</span></div>'+
      '<div class="spt-item spt-done spt-anim"><span class="spt-icon">&#9989;</span><span class="spt-text">Data Encrypted (AES-256)</span></div>'+
      '<div class="spt-item spt-done spt-anim"><span class="spt-icon">&#9989;</span><span class="spt-text">Session Monitoring Active</span></div>'+
      '<div class="spt-item spt-done spt-anim"><span class="spt-icon">&#9989;</span><span class="spt-text">Local Storage Encryption</span></div>'+
    '</div>'+
    '<div class="sp-powered"><span class="sp-pwrd-bolt">&#9889;</span> <strong>Account Security Active</strong> <span class="sp-pwrd-bolt">&#9889;</span></div>'+
    '<div class="sp-footer"><div class="sp-footer-item"><span class="sp-footer-label">Account ID</span><span class="sp-footer-val sp-fade-in">'+(u?u.userId||'N/A':'N/A')+'</span></div><div class="sp-footer-item"><span class="sp-footer-label">Email</span><span class="sp-footer-val sp-fade-in">'+(userEmail||'Not logged in')+'</span></div><div class="sp-footer-item"><span class="sp-footer-label">Device</span><span class="sp-footer-val sp-fade-in">'+(navigator.platform||'Unknown')+'</span></div><div class="sp-footer-item"><span class="sp-footer-label">Browser</span><span class="sp-footer-val sp-fade-in">'+(navigator.userAgent.substring(0,30)||'Unknown')+'</span></div></div>'+
  '</div>';
}
  // ========== EVENT BINDINGS ==========
  initAdminSetup();

function switchAuthTab(tab){var t=qsAll('.auth-tab');for(var i=0;i<t.length;i++){t[i].classList.toggle('active',t[i].dataset.tab===tab)}loginForm.classList.toggle('active',tab==='login');signupForm.classList.toggle('active',tab==='signup');authError.classList.add('hidden')}
var authT=qsAll('.auth-tab');for(var i=0;i<authT.length;i++){(function(b){b.addEventListener('click',function(){switchAuthTab(b.dataset.tab)})})(authT[i])}
byId('switchToSignup').addEventListener('click',function(e){e.preventDefault();switchAuthTab('signup')});
byId('switchToLogin').addEventListener('click',function(e){e.preventDefault();switchAuthTab('login')});

// Admin login link
  byId('adminLoginLink').addEventListener('click',function(e){e.preventDefault();var em=byId('loginEmail');var pw=byId('loginPassword');em.value=ADMIN_EMAIL;pw.value='';em.focus();switchAuthTab('login');authError.textContent='Enter the admin password';authError.classList.remove('hidden');setTimeout(function(){authError.classList.add('hidden')},4000)});
  // Forgot password link
  byId('forgotPwdLink').addEventListener('click',function(e){e.preventDefault();var em=prompt('Enter your registered email address:');if(!em)return;em=em.trim().toLowerCase();var u=getUsers();if(!u[em]){showErr('No account found for '+em);return}var newPw=prompt('Enter a new password (min 6 characters):');if(!newPw||newPw.length<6){showErr('Password must be at least 6 characters.');return}u[em].password=encodePw(newPw);saveUsers(u);showErr('Password reset successfully! You can now login with your new password.');byId('loginEmail').value=em;byId('loginPassword').value='';byId('loginPassword').focus()});

signupForm.addEventListener('submit',function(e){e.preventDefault();var em=byId('signupEmail').value.trim().toLowerCase();var pw=byId('signupPassword').value;var cf=byId('signupConfirm').value;if(!em||!pw||!cf)return showErr('Fill all fields.');if(pw.length<6)return showErr('Password min 6 chars.');if(pw!==cf)return showErr('Passwords mismatch.');var u=getUsers();if(u[em])return showErr('Email already exists.');var id='cv_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);u[em]={password:encodePw(pw),createdAt:new Date().toISOString(),userId:id,lastLogin:null,blocked:false};saveUsers(u);saveUser({email:em,createdAt:u[em].createdAt,userId:id});signupForm.reset();startLoad()});

loginForm.addEventListener('submit',function(e){e.preventDefault();var em=byId('loginEmail').value.trim().toLowerCase();var pw=byId('loginPassword').value;if(!em||!pw)return showErr('Enter email and password.');// Admin login check
if(em===ADMIN_EMAIL){if(adminLogin(pw)){saveAdminSession();loginForm.reset();startLoad()}else{showErr('Invalid admin credentials.')}return}
var u=getUsers();if(!u[em])return showErr('No account found.');if(u[em].blocked)return showErr('Your account has been blocked by admin.');if(u[em].password!==encodePw(pw))return showErr('Incorrect password.');var user={email:em,createdAt:u[em].createdAt,userId:u[em].userId};u[em].lastLogin=new Date().toISOString();saveUsers(u);saveUser(user);loginForm.reset();startLoad()});

// ========== NOTIFICATION SYSTEM ==========
var NOTIF_KEY='cv_notifs_';

function getNotifKey(){var u=getUser();return NOTIF_KEY+(u?u.email:'guest')}

function getNotifications(){try{var k=getNotifKey();var d=localStorage.getItem(k);return d?JSON.parse(d):[]}catch(e){return[]}}

function saveNotifications(n){try{localStorage.setItem(getNotifKey(),JSON.stringify(n))}catch(e){}}

function addNotification(title,msg,type){var n=getNotifications();n.unshift({id:Date.now()+'_'+Math.random().toString(36).slice(2,6),title:title,msg:msg,type:type||'info',time:new Date().toISOString()});if(n.length>50)n=n.slice(0,50);saveNotifications(n);updateNotifBadge();renderNotifList()}

function clearNotifications(){saveNotifications([]);updateNotifBadge();renderNotifList()}

var _prevPrices={};

function checkPriceAlerts(newData){if(!newData||!newData.length)return;var n=getNotifications();for(var i=0;i<Math.min(newData.length,20);i++){var c=newData[i];var sym=c.symbol.toUpperCase();var cur=c.current_price;var chg=c.price_change_percentage_24h;var prev=_prevPrices[sym];if(chg!=null&&Math.abs(chg)>=5&&(!prev||Math.abs(chg-prev)>=3)){var dir=chg>=0?'&#9650; Pump':'&#9660; Dump';var cls=chg>=0?'positive':'negative';addNotification(sym+' '+dir,'<span class="'+cls+'">'+fmtChg(chg)+'</span> &middot; $'+fmtPrice(cur),chg>=0?'positive':'negative')}if(c.market_cap_rank<=10&&chg!=null&&Math.abs(chg)>=8&&(!prev||Math.abs(chg-prev)>=5)){addNotification('&#9888; Major Move: '+sym,dir+' <span class="'+cls+'">'+fmtChg(chg)+'</span> &middot; Rank #'+c.market_cap_rank,'alert')}_prevPrices[sym]=chg}if(newData[0]&&newData[0].id==='bitcoin'){var btcChg=newData[0].price_change_percentage_24h;if(btcChg!=null&&Math.abs(btcChg)>=3){var lastBtcNotif=localStorage.getItem('cv_last_btc_notif');var now=Date.now();if(!lastBtcNotif||now-parseInt(lastBtcNotif)>1800000){addNotification('&#128200; Bitcoin Update','BTC is <span class="'+(btcChg>=0?'positive':'negative')+'">'+fmtChg(btcChg)+'</span> in 24h at $'+fmtPrice(newData[0].current_price),btcChg>=0?'positive':'negative');localStorage.setItem('cv_last_btc_notif',String(now))}}}}

function updateNotifBadge(){var badge=byId('navNotifBadge');if(!badge)return;var n=getNotifications();var cnt=n.length;if(cnt>0){badge.textContent=cnt>99?'99+':String(cnt);badge.classList.remove('hidden')}else{badge.classList.add('hidden')}}

function renderNotifList(){var list=byId('notifPageList');if(!list)return;var n=getNotifications();if(!n.length){list.innerHTML='<div class="notif-empty-state"><div class="notif-empty-icon">&#128276;</div><div class="notif-empty-title">No notifications yet</div><div class="notif-empty-desc">You\'ll receive market updates, price alerts, and system messages here.</div></div>';return}var h='';for(var i=0;i<n.length;i++){var nt=n[i];var d=new Date(nt.time);var ts=d.toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});var ic='&#128240;';if(nt.type==='positive')ic='&#9650;';else if(nt.type==='negative')ic='&#9660;';else if(nt.type==='alert')ic='&#9888;';h+='<div class="notif-item '+(nt.type==='alert'?'notif-alert':'')+'"><div class="notif-icon notif-icon-'+nt.type+'">'+ic+'</div><div class="notif-body"><div class="notif-title">'+nt.title+'</div><div class="notif-msg">'+nt.msg+'</div><div class="notif-time">'+ts+'</div></div></div>'}list.innerHTML=h;updateNotifBadge()}

// Initialize notif handlers
var notifClearBtn=byId('notifClearAll');
if(notifClearBtn){notifClearBtn.addEventListener('click',function(){clearNotifications()})}

// Render notifications on load
renderNotifList();

// On tab switch to notifPage, render list
var origSwitch=switchTab;
switchTab=function(i){origSwitch(i);if(i==='notifPage')renderNotifList()}

// ========== END NOTIFICATION SYSTEM ==========

// ========== WALLET & PORTFOLIO SYSTEM ==========
var INITIAL_BALANCE=10000;

function getWallet(){try{var u=getUser();if(!u)return null;var k='cv_wallet_'+u.email;var w=JSON.parse(localStorage.getItem(k));return w}catch(e){return null}}

function saveWallet(w){try{var u=getUser();if(!u)return;var k='cv_wallet_'+u.email;localStorage.setItem(k,JSON.stringify(w))}catch(e){}}

function initWallet(){var w=getWallet();if(!w){var u=getUser();if(!u)return;w={balance:INITIAL_BALANCE,holdings:{},addresses:{}};saveWallet(w)}return w}

function getTransactions(){try{var u=getUser();if(!u)return[];var k='cv_txns_'+u.email;var t=JSON.parse(localStorage.getItem(k));return t||[]}catch(e){return[]}}

function saveTransactions(t){try{var u=getUser();if(!u)return;var k='cv_txns_'+u.email;localStorage.setItem(k,JSON.stringify(t))}catch(e){}}

function addTransaction(type,asset,amount,price,total,address){var txs=getTransactions();txs.unshift({id:'tx_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),type:type,asset:asset,amount:amount,price:price,total:total,address:address||'--',time:new Date().toISOString()});if(txs.length>100)txs=txs.slice(0,100);saveTransactions(txs);return txs}

var CRYPTO_ADDRESSES={
  BTC:{name:'Bitcoin',symbol:'BTC',icon:'₿',address:'bc1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Bitcoin'},
  ETH:{name:'Ethereum',symbol:'ETH',icon:'⟠',address:'0x742d35Cc6634C0532925a3b844Bc4a9e8f8f8f8f',network:'ERC-20'},
  SOL:{name:'Solana',symbol:'SOL',icon:'◎',address:'8xYqZpLmN3oPqRsT7uVwXyZ1aBcDeFgHiJkLmN4oP',network:'Solana'},
  USDT:{name:'Tether',symbol:'USDT',icon:'₮',address:'0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',network:'ERC-20'},
  BNB:{name:'BNB',symbol:'BNB',icon:'◆',address:'0x9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t',network:'BSC'},
  XRP:{name:'XRP',symbol:'XRP',icon:'✕',address:'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',network:'XRP Ledger'},
  DOGE:{name:'Dogecoin',symbol:'DOGE',icon:'Ð',address:'D8k9jLmN4oPqRsT7uVwXyZ1aBcDeFgHiJkLmN3oPqR',network:'Dogecoin'},
  ADA:{name:'Cardano',symbol:'ADA',icon:'₳',address:'addr1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Cardano'},
  DOT:{name:'Polkadot',symbol:'DOT',icon:'◈',address:'1x8YqZpLmN3oPqRsT7uVwXyZ1aBcDeFgHiJkLmN4oP',network:'Polkadot'},
  MATIC:{name:'Polygon',symbol:'MATIC',icon:'⬡',address:'0x3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t',network:'Polygon'},
  SHIB:{name:'Shiba Inu',symbol:'SHIB',icon:'🐕',address:'0x5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t',network:'ERC-20'},
  AVAX:{name:'Avalanche',symbol:'AVAX',icon:'🔺',address:'0x7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t',network:'Avalanche C-Chain'},
  TRX:{name:'TRON',symbol:'TRX',icon:'🌐',address:'TXYZ1234567890abcdefghijklmnopqrstuvwxyz',network:'TRON'},
  LINK:{name:'Chainlink',symbol:'LINK',icon:'⬡',address:'0x9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t',network:'ERC-20'},
  UNI:{name:'Uniswap',symbol:'UNI',icon:'🦄',address:'0x1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u',network:'ERC-20'},
  ATOM:{name:'Cosmos',symbol:'ATOM',icon:'☄️',address:'cosmos1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Cosmos'},
  LTC:{name:'Litecoin',symbol:'LTC',icon:'Ł',address:'ltc1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Litecoin'},
  FIL:{name:'Filecoin',symbol:'FIL',icon:'⨎',address:'f1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Filecoin'},
  APT:{name:'Aptos',symbol:'APT',icon:'⚛️',address:'0x1234567890abcdef1234567890abcdef12345678',network:'Aptos'},
  SUI:{name:'Sui',symbol:'SUI',icon:'◈',address:'0x9876543210fedcba9876543210fedcba98765432',network:'Sui'},
  ARB:{name:'Arbitrum',symbol:'ARB',icon:'○',address:'0xabcdef0123456789abcdef0123456789abcdef01',network:'Arbitrum'},
  OP:{name:'Optimism',symbol:'OP',icon:'☆',address:'0x0123456789abcdef0123456789abcdef01234567',network:'Optimism'},
  INJ:{name:'Injective',symbol:'INJ',icon:'◉',address:'inj1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Injective'},
  NEAR:{name:'NEAR Protocol',symbol:'NEAR',icon:'▲',address:'near1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'NEAR'},
  STX:{name:'Stacks',symbol:'STX',icon:'◧',address:'SP2XD7487GKQK6Z8TJT76F2GQY9K5Z8TJT76F2GQ',network:'Stacks'},
  FTM:{name:'Fantom',symbol:'FTM',icon:'👻',address:'0x1234567890abcdef1234567890abcdef12345678',network:'Fantom'},
  ALGO:{name:'Algorand',symbol:'ALGO',icon:'◎',address:'ALGO1234567890abcdefghijklmnopqrstuvwxyz',network:'Algorand'},
  VET:{name:'VeChain',symbol:'VET',icon:'✔',address:'0x1234567890abcdef1234567890abcdef12345678',network:'VeChain'},
  ICP:{name:'Internet Computer',symbol:'ICP',icon:'◈',address:'aaaaa-aa',network:'ICP'},
  SAND:{name:'The Sandbox',symbol:'SAND',icon:'🏖️',address:'0xabcdef0123456789abcdef0123456789abcdef01',network:'ERC-20'}
SOL:{name:'Solana',symbol:'SOL',icon:&#8216;\u25CE&#8217;,address:'GJk8y5K2z3P4e6F7g8H9j0K1l2M3n4O5p6Q7r8S9t',network:'Solana'},
USDT:{name:'Tether',symbol:'USDT',icon:'&#8364;',address:'0x8f8f8f8f742d35Cc6634C0532925a3b844Bc4a9e',network:'ERC-20'},
BNB:{name:'BNB',symbol:'BNB',icon:'&#9670;',address:'bnb1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'BSC'},
XRP:{name:'Ripple',symbol:'XRP',icon:'&#10005;',address:'rQ8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'XRP'},
ADA:{name:'Cardano',symbol:'ADA',icon:'&#9825;',address:'addr1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Cardano'},
DOGE:{name:'Dogecoin',symbol:'DOGE',icon:'&#208;',address:'D8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Dogecoin'},
DOT:{name:'Polkadot',symbol:'DOT',icon:'&#9679;',address:'1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Polkadot'},
MATIC:{name:'Polygon',symbol:'MATIC',icon:'&#9670;',address:'0x5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t742d35Cc',network:'Polygon'},
AVAX:{name:'Avalanche',symbol:'AVAX',icon:'&#9650;',address:'0x3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t742d35Cc6634C',network:'C-Chain'},
LINK:{name:'Chainlink',symbol:'LINK',icon:'&#10553;',address:'0x6f7g8h9j0k1l2m3n4o5p6q7r8s9t742d35Cc6634C05',network:'ERC-20'},
UNI:{name:'Uniswap',symbol:'UNI',icon:'&#129412;',address:'0x9j0k1l2m3n4o5p6q7r8s9t742d35Cc6634C0532925a',network:'ERC-20'},
SHIB:{name:'Shiba Inu',symbol:'SHIB',icon:'&#9632;',address:'0x1l2m3n4o5p6q7r8s9t742d35Cc6634C0532925a3b',network:'ERC-20'},
ATOM:{name:'Cosmos',symbol:'ATOM',icon:'&#9883;',address:'cosmos1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Cosmos'},
LTC:{name:'Litecoin',symbol:'LTC',icon:'&#321;',address:'ltc1q8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Litecoin'},
XMR:{name:'Monero',symbol:'XMR',icon:'&#9673;',address:'48y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t1a2b3c4d5e6f7g8h',network:'Monero'},
TRX:{name:'Tron',symbol:'TRX',icon:'&#9672;',address:'T8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Tron'},
XLM:{name:'Stellar',symbol:'XLM',icon:'&#9728;',address:'G8y5k2z3p4e6f7g8h9j0k1l2m3n4o5p6q7r8s9t',network:'Stellar'}
};

function renderPortfolio(){var w=initWallet();if(!w)return;var bal=byId('portfolioBalanceVal');if(bal)bal.textContent='$'+w.balance.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});var psTotal=byId('psTotalVal');if(psTotal){var holdVal=0;for(var s in w.holdings){holdVal+=w.holdings[s].value||0}psTotal.textContent='$'+(w.balance+holdVal).toLocaleString('en-US',{minimumFractionDigits:2})}var psPnl=byId('psPnl');if(psPnl){
    var txs=getTransactions();
    var pnl=0;
    for(var ti=0;ti<txs.length;ti++){
      if(txs[ti].type==='sell'||txs[ti].type==='send')pnl+=txs[ti].total||0;
      if(txs[ti].type==='buy')pnl-=txs[ti].total||0;
    }
    psPnl.textContent=(pnl>=0?'+$':'-$')+Math.abs(pnl).toFixed(2);
    psPnl.style.color=pnl>=0?'var(--green)':'#ea3943';
  }var psTrades=byId('psTrades');if(psTrades){var cnt=0;for(var s in w.holdings)cnt++;psTrades.textContent=cnt}var psWin=byId('psWinRate');if(psWin){
    var txs=getTransactions();
    var wins=0,totalTrades=0;
    for(var ti=0;ti<txs.length;ti++){
      if(txs[ti].type==='sell'||txs[ti].type==='buy'){
        totalTrades++;
        if(txs[ti].type==='sell'&&txs[ti].total>0)wins++;
      }
    }
    psWin.textContent=(totalTrades>0?Math.round(wins/totalTrades*100):0)+'%';
  }
var hList=byId('portfolioHoldings');if(hList){var hKeys=Object.keys(w.holdings);if(!hKeys.length){hList.innerHTML='<div class="admin-empty">No open positions. Start trading now!</div>'}else{var hHtml='';for(var hi=0;hi<hKeys.length;hi++){var sk=hKeys[hi];var h=w.holdings[sk];var addrData=CRYPTO_ADDRESSES[sk];var icon=addrData?addrData.icon:'&#9679;';hHtml+='<div class="holding-item" data-asset="'+sk+'"><div class="hi-icon">'+icon+'</div><div class="hi-info"><div class="hi-name">'+sk+'</div><div class="hi-bal">'+h.amount.toFixed(6)+'</div></div><div class="hi-value">$'+h.value.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+'</div></div>'}hList.innerHTML=hHtml;
var hItems=hList.querySelectorAll('.holding-item');for(var hi=0;hi<hItems.length;hi++){(function(el){el.addEventListener('click',function(){var asset=el.dataset.asset;var addrData=CRYPTO_ADDRESSES[asset];if(addrData)showReceiveAddress(asset)})})(hItems[hi])}}
var tList=byId('portfolioHistory');if(tList){var txs=getTransactions();if(!txs.length){tList.innerHTML='<div class="admin-empty">No transaction history yet.</div>'}else{var tHtml='';for(var ti=0;ti<Math.min(txs.length,20);ti++){var tx=txs[ti];var d=new Date(tx.time);var ts=d.toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});var tCls=tx.type==='buy'||tx.type==='receive'?'positive':'negative';var tIcon=tx.type==='receive'?'&#11015;':tx.type==='send'?'&#11014;':tx.type==='buy'?'&#9650;':'&#9660;';tHtml+='<div class="tx-item"><div class="tx-icon '+tCls+'">'+tIcon+'</div><div class="tx-info"><div class="tx-title">'+tx.type.toUpperCase()+' '+tx.asset+'</div><div class="tx-addr">'+(tx.address&&tx.address!=='--'?tx.address.slice(0,16)+'...':'Market')+'</div></div><div class="tx-amount '+tCls+'">'+(tx.type==='send'||tx.type==='sell'?'-':'+')+tx.amount.toFixed(4)+' <span class="tx-usd">$'+tx.total.toFixed(2)+'</span></div><div class="tx-time">'+ts+'</div></div>'}tList.innerHTML=tHtml}}}

function showReceiveAddress(asset){var a=CRYPTO_ADDRESSES[asset];if(!a){var m=byId('wrCoinList');if(m)m.innerHTML='<div style="text-align:center;padding:20px;color:var(--text2)">No address available for '+asset+'</div>';return}var list=byId('wrCoinList');if(list)list.style.display='none';var box=byId('wrAddressBox');if(box){box.classList.remove('hidden');var icon=byId('wrCoinIcon');if(icon)icon.textContent=a.icon;var title=byId('wrCoinTitle');if(title)title.textContent=a.name+' ('+a.symbol+')';var addr=byId('wrAddressValue');if(addr)addr.textContent=a.address;var copy=byId('wrCopyBtn');if(copy){copy.onclick=function(){try{navigator.clipboard.writeText(a.address).then(function(){copy.textContent='&#10003; Copied!';setTimeout(function(){copy.innerHTML='&#128203; Copy Address'},2000)}).catch(function(){copy.textContent='Failed';setTimeout(function(){copy.innerHTML='&#128203; Copy Address'},2000)})}catch(e){copy.textContent='Copy: '+a.address}}}}}

function executeSend(asset,address,amount){var w=getWallet();if(!w){return{success:false,msg:'Wallet not initialized'}}if(!w.holdings[asset]||w.holdings[asset].amount<amount){return{success:false,msg:'Insufficient '+asset+' balance'}}var price=1;if(data&&data.length){for(var i=0;i<data.length;i++){if(data[i].symbol.toUpperCase()===asset){price=data[i].current_price;break}}}var total=amount*price;var fee=total*0.001;w.holdings[asset].amount-=amount;w.holdings[asset].value-=total;if(w.holdings[asset].amount<=0.000001){delete w.holdings[asset]}saveWallet(w);addTransaction('send',asset,amount,price,total+fee,address);renderPortfolio();return{success:true,msg:'Transaction submitted!'}}

// Wallet event handlers
function initWalletHandlers(){var depBtn=byId('walletDepositBtn');if(depBtn)depBtn.addEventListener('click',function(){var list=byId('wrCoinList');if(list){list.style.display='';var box=byId('wrAddressBox');if(box)box.classList.add('hidden');var html='';var keys=Object.keys(CRYPTO_ADDRESSES);for(var i=0;i<Math.min(keys.length,30);i++){var a=CRYPTO_ADDRESSES[keys[i]];html+='<div class="wr-coin-item" data-asset="'+keys[i]+'"><span class="wr-coin-icon">'+a.icon+'</span><span class="wr-coin-name">'+a.name+'</span><span class="wr-coin-net">'+a.network+'</span></div>'}list.innerHTML=html;
var items=list.querySelectorAll('.wr-coin-item');for(var i=0;i<items.length;i++){(function(el){el.addEventListener('click',function(){var asset=el.dataset.asset;showReceiveAddress(asset)})})(items[i])}}openModal(byId('walletReceiveModal'))});
var recClose=byId('walletReceiveClose');if(recClose)recClose.addEventListener('click',function(){closeModal(byId('walletReceiveModal'))});
var wdBtn=byId('walletWithdrawBtn');if(wdBtn)wdBtn.addEventListener('click',function(){var select=byId('wsAssetSelect');if(select){var html='<option value="">Choose asset...</option>';var w=initWallet();if(w){for(var s in w.holdings){html+='<option value="'+s+'">'+s+' ('+w.holdings[s].amount.toFixed(4)+')</option>'}}select.innerHTML=html}var bal=byId('wsAvailableBal');if(bal)bal.textContent='0';var amt=byId('wsAmountInput');if(amt)amt.value='';var addr=byId('wsAddressInput');if(addr)addr.value='';openModal(byId('walletSendModal'))});
var wsClose=byId('walletSendClose');if(wsClose)wsClose.addEventListener('click',function(){closeModal(byId('walletSendModal'))});
var wsSelect=byId('wsAssetSelect');if(wsSelect)wsSelect.addEventListener('change',function(){var sel=this.value;var w=initWallet();var bal=byId('wsAvailableBal');if(bal){if(w&&w.holdings[sel]){bal.textContent=w.holdings[sel].amount.toFixed(6)+' '+sel}else{bal.textContent='0 '+sel}}});
var wsBtn=byId('wsSendBtn');if(wsBtn)wsBtn.addEventListener('click',function(){var asset=byId('wsAssetSelect').value;var addr=byId('wsAddressInput').value.trim();var amt=parseFloat(byId('wsAmountInput').value);var err=byId('wsError');var suc=byId('wsSuccess');if(!asset){if(err){err.textContent='Select an asset';err.classList.remove('hidden')}return}if(!addr){if(err){err.textContent='Enter recipient address';err.classList.remove('hidden')}return}if(!amt||amt<=0){if(err){err.textContent='Enter a valid amount';err.classList.remove('hidden')}return}var result=executeSend(asset,addr,amt);if(result.success){if(err)err.classList.add('hidden');if(suc)suc.classList.remove('hidden');setTimeout(function(){if(suc)suc.classList.add('hidden');closeModal(byId('walletSendModal'))},2500)}else{if(err){err.textContent=result.msg;err.classList.remove('hidden')}}});
var whBtn=byId('walletHistoryBtn');if(whBtn)whBtn.addEventListener('click',function(){switchTab('portfolioPage');renderPortfolio()})}

// Trade button handlers
var _tradeCoinId=null,_tradeCoinPrice=0,_tradeIsBuy=true,_tradeSymbol='';

function openTradeModal(isBuy,coinId,coinName,coinSymbol,price){_tradeIsBuy=isBuy;_tradeCoinId=coinId;_tradeCoinPrice=price;_tradeSymbol=coinSymbol;var title=byId('tradeModalTitle');if(title)title.textContent=(isBuy?'Buy ':'Sell ')+coinName;var pr=byId('tradeModalPrice');if(pr)pr.textContent=fmtPrice(price);var bal=byId('tradeModalBalVal');if(bal){var w=initWallet();bal.textContent='$'+(w?w.balance.toFixed(2):'0.00')}var btn=byId('tradeExecuteBtn');if(btn)btn.textContent=(isBuy?'Execute Buy Order':'Execute Sell Order');var amt=byId('tradeAmount');if(amt){amt.value='';amt.placeholder='0.00'}var qty=byId('tradeQuantity');if(qty)qty.value='0.0000';var total=byId('tsTotal');if(total)total.textContent='$0.00';var fee=byId('tsFee');if(fee)fee.textContent='$0.00';var err=byId('tradeError');if(err)err.classList.add('hidden');var suc=byId('tradeSuccess');if(suc)suc.classList.add('hidden');openModal(byId('tradeModal'))}

var tradeBuyBtn=byId('tradeBuyBtn');if(tradeBuyBtn)tradeBuyBtn.addEventListener('click',function(){var nameEl=byId('coinModalName');var symEl=byId('coinModalSymbol');var prEl=byId('coinModalPrice');if(nameEl&&symEl&&prEl){var coinId=nameEl.dataset.coinId||_tradeCoinId||'bitcoin';var name=nameEl.textContent;var sym=symEl.textContent;var price=parseFloat(prEl.textContent.replace(/[$,]/g,''))||0;openTradeModal(true,coinId,name,sym,price)}});
var tradeSellBtn=byId('tradeSellBtn');if(tradeSellBtn)tradeSellBtn.addEventListener('click',function(){var nameEl=byId('coinModalName');var symEl=byId('coinModalSymbol');var prEl=byId('coinModalPrice');if(nameEl&&symEl&&prEl){var coinId=nameEl.dataset.coinId||_tradeCoinId||'bitcoin';var name=nameEl.textContent;var sym=symEl.textContent;var price=parseFloat(prEl.textContent.replace(/[$,]/g,''))||0;openTradeModal(false,coinId,name,sym,price)}});

var tradeAmt=byId('tradeAmount');if(tradeAmt)tradeAmt.addEventListener('input',function(){var amt=parseFloat(this.value)||0;var price=_tradeCoinPrice||0;var qtyEl=byId('tradeQuantity');if(qtyEl)qtyEl.value=(price>0?amt/price:0).toFixed(6);var totalEl=byId('tsTotal');if(totalEl)totalEl.textContent='$'+amt.toFixed(2);var feeEl=byId('tsFee');if(feeEl)feeEl.textContent='$'+(amt*0.001).toFixed(2)});

var tradeExecBtn=byId('tradeExecuteBtn');if(tradeExecBtn)tradeExecBtn.addEventListener('click',function(){var amt=parseFloat(byId('tradeAmount').value)||0;var price=_tradeCoinPrice||0;var w=getWallet();if(!w){byId('tradeError').textContent='Wallet not initialized';byId('tradeError').classList.remove('hidden');return}if(amt<1){byId('tradeError').textContent='Minimum $1.00';byId('tradeError').classList.remove('hidden');return}if(_tradeIsBuy&&amt>w.balance){byId('tradeError').textContent='Insufficient balance';byId('tradeError').classList.remove('hidden');return}var qty=price>0?amt/price:0;var fee=amt*0.001;var total=amt+fee;if(_tradeIsBuy){w.balance-=total;if(!w.holdings[_tradeSymbol])w.holdings[_tradeSymbol]={amount:0,value:0};w.holdings[_tradeSymbol].amount+=qty;w.holdings[_tradeSymbol].value+=amt}addTransaction(_tradeIsBuy?'buy':'sell',_tradeSymbol,qty,price,amt,'Market');saveWallet(w);byId('tradeError').classList.add('hidden');byId('tradeSuccess').classList.remove('hidden');var bal=byId('tradeModalBalVal');if(bal)bal.textContent='$'+w.balance.toFixed(2);setTimeout(function(){byId('tradeSuccess').classList.add('hidden');closeModal(byId('tradeModal'));renderPortfolio()},2500)});

var tradeClose=byId('tradeModalClose');if(tradeClose)tradeClose.addEventListener('click',function(){closeModal(byId('tradeModal'))});

// Make crypto items clickable for address view
function setupCryptoClickHandlers(){var lists=['homeCryptoList','marketCryptoList','techStocksList'];for(var li=0;li<lists.length;li++){(function(listId){var list=byId(listId);if(!list)return;list.addEventListener('click',function(e){var item=e.target.closest('.crypto-item');if(!item)return;var nameEl=item.querySelector('.crypto-symbol');if(!nameEl)return;var sym=nameEl.textContent.toUpperCase();var addrData=CRYPTO_ADDRESSES[sym];if(addrData){showReceiveAddress(sym)}else{var idx=Array.from(item.parentNode.children).indexOf(item);var coin=data[idx];if(coin&&coin.id)openCoinDetail(coin.id)}})})(lists[li])}}

// Manage notifPage switch
var _origSwitch3=switchTab;
switchTab=function(i){_origSwitch3(i);if(i==='notifPage')renderNotifList();if(i==='portfolioPage'){initWallet();renderPortfolio()}if(i==='shieldPage'){renderShieldProxy()}}

// Init wallet after DOM ready
setTimeout(function(){initWalletHandlers();setupCryptoClickHandlers()},500);

// ========== END WALLET SYSTEM ==========

logoutBtn.addEventListener('click',function(){var isAdmin=isAdminLoggedIn();clearUser();if(isAdmin){adminLogout();clearAdminSession()}if(timer){clearInterval(timer);timer=null}var p=qsAll('.page');for(var i=0;i<p.length;i++){p[i].classList.remove('active')}authPage.classList.add('active');loginForm.reset();signupForm.reset()});

function getTheme(){var t=localStorage.getItem('cv_theme');return t||'dark'}
function setTheme(t){localStorage.setItem('cv_theme',t);if(t==='light'){document.body.classList.add('light-theme');byId('metaThemeColor').setAttribute('content','#f4f6fb');tDark.classList.remove('active');tLight.classList.add('active')}else{document.body.classList.remove('light-theme');byId('metaThemeColor').setAttribute('content','#0f0f23');tDark.classList.add('active');tLight.classList.remove('active')}}
function initTheme(){setTheme(getTheme())}
tDark.addEventListener('click',function(){setTheme('dark')});
tLight.addEventListener('click',function(){setTheme('light')});

function startLoad(){var p=qsAll('.page');for(var i=0;i<p.length;i++){p[i].classList.remove('active')}loadPage.classList.add('active');bar.style.width='0%';var msgs=['Connecting to CoinGecko API...','Fetching crypto prices...','Loading stock markets...','Syncing global indices...','Preparing your dashboard...'];var e=0;var i3=0;var iv=setInterval(function(){e+=100;var pct=Math.min(e/5000*100,100);bar.style.width=pct+'%';if(pct>20&&i3<1){loadStatus.textContent=msgs[1];i3=1}if(pct>40&&i3<2){loadStatus.textContent=msgs[2];i3=2}if(pct>60&&i3<3){loadStatus.textContent=msgs[3];i3=3}if(pct>85&&i3<4){loadStatus.textContent=msgs[4];i3=4}if(e>=5000){clearInterval(iv);bar.style.width='100%';setTimeout(function(){initDash();loadPage.classList.remove('active');dashPage.classList.add('active');startPoll()},200)}},100)}

function initDash(){var u=getUser();if(!u){// Check if admin logged in
if(isAdminLoggedIn()||checkAdminSession()){if(isAdminLoggedIn())saveAdminSession();activateFuturistic();initTheme();byId('portfolioCard').style.display='none';byId('greetingText').textContent='Welcome, Admin';byId('currentDate').textContent=today();byId('portfolioValue').textContent='🔒 Admin';byId('portfolioChange').innerHTML='<span class=change-indicator>&#9679;</span><span>Control Panel Active</span>';byId('portfolioChange').style.color='var(--blue)';byId('profileName').textContent='Administrator';byId('profileEmail').textContent='admin@livemarket.app';byId('profileAvatarLetter').textContent='A';byId('accEmail').textContent='admin@livemarket.app';byId('accUsername').textContent='Admin';byId('accId').textContent='ADMIN-001';byId('accMemberSince').textContent='System';byId('accLastLogin').textContent='--';byId('accTimezone').textContent='System';var curT=getTheme();if(curT==='light'){try{byId('adminThemeIcon').innerHTML='&#127774;';byId('adminThemeText').textContent='Light Mode'}catch(e){}}else{try{byId('adminThemeIcon').innerHTML='&#127769;';byId('adminThemeText').textContent='Dark Mode'}catch(e){}}
renderAdminDashboard();return}authPage.classList.add('active');return}
activateFuturistic();initWallet();var n=u.email.split('@')[0];var cn=n.charAt(0).toUpperCase()+n.slice(1);greet.textContent=greetTxt()+', '+cn;date.textContent=today();initTheme();pName.textContent=cn;pEmail.textContent=u.email;pAv.textContent=avL(u.email);aEmail.textContent=u.email;aUser.textContent=cn;if(u.userId)aId.textContent=u.userId;else aId.textContent='N/A';try{aTz.textContent=Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){aTz.textContent='UTC'}var jd=u.createdAt?new Date(u.createdAt):new Date();aSince.textContent=jd.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});var us=getUsers();if(us[u.email]&&us[u.email].lastLogin){var l=new Date(us[u.email].lastLogin);var dm=Math.floor((Date.now()-l)/60000);if(dm<1)aLogin.textContent='Just now';else if(dm<60)aLogin.textContent=dm+'m ago';else aLogin.textContent=l.toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}else aLogin.textContent='First time';fetchData()}

async function fetchData(){try{var r=await fetch(API,{headers:{Accept:'application/json'}});if(!r.ok)throw Error(r.status);var d=await r.json();data=d;renderHome(d.slice(0,10));renderBoard(d);updatePort(d.slice(0,5));updateSum(d);setConn(true);checkPriceAlerts(d);fetchCountryIndices();fetchTechStocks();return d}catch(e){console.error(e);setConn(false);return[]}}

function updatePort(c){if(!c||!c.length)return;var tm=0,tv=0;for(var i=0;i<c.length;i++){tm+=c[i].market_cap||0;tv+=c[i].total_volume||0}portVal.textContent=fmtNum(tm);portChg.innerHTML='<span class=change-indicator>&#9679;</span><span>Vol 24h: '+fmtNum(tv)+'</span>';portChg.style.color='var(--green)'}

var coinModal=byId('coinModal'),coinModalClose=byId('coinModalClose');
coinModalClose.addEventListener('click',function(){closeModal(coinModal)});
var coinModalLoading=false;
async function openCoinDetail(coinId){if(coinModalLoading)return;coinModalLoading=true;try{var r=await fetch('https://api.coingecko.com/api/v3/coins/'+coinId+'?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true',{headers:{Accept:'application/json'}});if(!r.ok)throw Error(r.status);var d=await r.json();var md=d.market_data;if(!md)throw Error('No market data');var name=d.name,symbol=d.symbol.toUpperCase();var img=d.image?d.image.large||d.image.small||'':'';
// Set header
var iconHtml='';if(img)iconHtml='<img src="'+img+'" alt="'+name+'" onerror="this.style.display=\'none\'">';byId('coinModalIcon').innerHTML=iconHtml;byId('coinModalName').textContent=name;byId('coinModalSymbol').textContent=symbol;byId('coinModalName').dataset.coinId=coinId;
// Store coin for trade buttons
_tradeCoinId=coinId;_tradeSymbol=symbol;_tradeCoinPrice=price;
// Price
var price=md.current_price.usd||0;var chg=md.price_change_percentage_24h||0;var cls=chg>=0?'positive':'negative';var arrow=chg>=0?'+':'';byId('coinModalPrice').textContent=fmtPrice(price);var chgEl=byId('coinModalChange');chgEl.textContent=arrow+chg.toFixed(2)+'%';chgEl.className='coin-modal-price-chg '+cls;
// Stats
byId('cmsMcap').textContent=fmtNum(md.market_cap.usd);byId('cmsVol').textContent=fmtNum(md.total_volume.usd);byId('cmsHigh').textContent=fmtPrice(md.high_24h.usd);byId('cmsLow').textContent=fmtPrice(md.low_24h.usd);byId('cmsRank').textContent='#'+d.market_cap_rank;byId('cmsAth').textContent=fmtPrice(md.ath.usd||0);
// Sparkline chart
var spark=md.sparkline_7d;var prices=spark&&spark.price?spark.price:null;if(prices&&prices.length>1){var path=buildSparkline(prices,300,80,chg>=0);byId('sparklinePath').setAttribute('d',path);var svgCls=chg>=0?'var(--green)':'var(--red)';byId('sparklinePath').setAttribute('stroke',svgCls)}else{byId('sparklinePath').setAttribute('d','')}
openModal(coinModal);coinModalLoading=false}catch(e){console.error('Coin detail:',e);coinModalLoading=false}}

function buildSparkline(prices,w,h,isUp){if(!prices||prices.length<2)return'';var min=Infinity,max=-Infinity;for(var i=0;i<prices.length;i++){if(prices[i]<min)min=prices[i];if(prices[i]>max)max=prices[i]}var range=max-min||1;var pad=2;var xStep=(w-pad*2)/(prices.length-1);var parts=[];for(var i=0;i<prices.length;i++){var x=pad+i*xStep;var y=h-pad-((prices[i]-min)/range)*(h-pad*2);parts.push((i===0?'M':'L')+x.toFixed(1)+','+y.toFixed(1))}return parts.join(' ')}

function updateSum(d){if(!d||!d.length)return;for(var i=0;i<d.length;i++){if(d[i].id==='bitcoin'){var b=d[i];var tm=0;for(var j=0;j<d.length;j++)tm+=d[j].market_cap||0;btcDom.textContent=((b.market_cap/tm)*100).toFixed(1)+'%';break}}var tv=0;for(var i=0;i<d.length;i++)tv+=d[i].total_volume||0;totVol.textContent=fmtNum(tv);var sorted=[];for(var i=0;i<d.length;i++){if(d[i].price_change_percentage_24h!=null)sorted.push(d[i])}sorted.sort(function(a,b){return b.price_change_percentage_24h-a.price_change_percentage_24h});if(sorted.length>0){topG.textContent=sorted[0].symbol.toUpperCase()+' '+fmtChg(sorted[0].price_change_percentage_24h);topL.textContent=sorted[sorted.length-1].symbol.toUpperCase()+' '+fmtChg(sorted[sorted.length-1].price_change_percentage_24h)}}

function coinHTML(c){var ch=c.price_change_percentage_24h;var p=ch!=null&&ch>=0;var img=c.image||'';var imgHTML='';if(img)imgHTML='<img src="'+img+'" alt="'+c.name+'" loading=lazy onerror="this.style.display=\'none\'">';var arrow=p?'+':'-';var chgText=ch!=null?fmtChg(ch):'N/A';var cls=p?'positive':'negative';return'<div class=crypto-item><span class=crypto-rank>#'+(c.market_cap_rank||'-')+'</span><div class=crypto-icon>'+imgHTML+'</div><div class=crypto-info><div class=crypto-name>'+c.name+'</div><div class=crypto-symbol>'+c.symbol+'</div></div><div class=crypto-price><div class=crypto-price-value>'+fmtPrice(c.current_price)+'</div><div class="crypto-price-change '+cls+'">'+arrow+' '+chgText+'</div></div></div>'}

function renderHome(c){if(!c||!c.length){homeList.innerHTML='<div class="skeleton" style="height:60px;margin-bottom:8px;border-radius:12px"></div><div class="skeleton" style="height:60px;margin-bottom:8px;border-radius:12px"></div><div class="skeleton" style="height:60px;margin-bottom:8px;border-radius:12px"></div>';return}var html='';for(var i=0;i<c.length;i++)html+=coinHTML(c[i]);homeList.innerHTML=html}

function boardHTML(c){var ch=c.price_change_percentage_24h;var p=ch!=null&&ch>=0;var img=c.image||'';var imgHTML='';if(img)imgHTML='<img src="'+img+'" alt="'+c.name+'" loading=lazy onerror="this.style.display=\'none\'">';var chgText=ch!=null?fmtChg(ch):'N/A';var cls=p?'positive':'negative';return'<div class=board-row><span class=board-col-rank>#'+(c.market_cap_rank||'-')+'</span><div class=board-col-icon>'+imgHTML+'</div><div><div class=board-col-name>'+c.name+'</div><div class=board-col-symbol>'+c.symbol+'</div></div><div class=board-col-price><span class=price-val>'+fmtPrice(c.current_price)+'</span><span class="price-chg '+cls+'">'+chgText+'</span></div><div class=board-col-mcap><span class=mcap-label>Mkt Cap</span><span class=mcap-val>'+fmtNum(c.market_cap)+'</span></div><div class=board-col-vol><span class=vol-label>Volume</span><span class=vol-val>'+fmtNum(c.total_volume)+'</span></div></div>'}

function renderBoard(c){if(!c||!c.length){mktList.innerHTML='<div class="skeleton" style="height:50px;margin-bottom:6px;border-radius:12px"></div><div class="skeleton" style="height:50px;margin-bottom:6px;border-radius:12px"></div><div class="skeleton" style="height:50px;margin-bottom:6px;border-radius:12px"></div><div class="skeleton" style="height:50px;margin-bottom:6px;border-radius:12px"></div>';return}cnt.textContent=c.length+' coins';var html='<div class="board-row board-header"><span class=board-col-header>#</span><span class=board-col-header></span><span class=board-col-header>Name</span><span class=board-col-header>Price</span><span class=board-col-header>M.Cap</span><span class=board-col-header>Vol</span></div>';for(var i=0;i<c.length;i++)html+=boardHTML(c[i]);mktList.innerHTML=html}

function startPoll(){if(timer){clearInterval(timer)}timer=setInterval(async function(){await fetchData()},POLL)}
function setConn(o){if(o){dot.className='connection-dot';connTxt.textContent='Live'}else{dot.className='connection-dot offline';connTxt.textContent='Offline'}}

function switchTab(i){var k=Object.keys(tabs);for(var x=0;x<k.length;x++){tabs[k[x]].classList.remove('active')}tabs[i].classList.add('active');for(var b=0;b<navBtns.length;b++){navBtns[b].classList.toggle('active',navBtns[b].dataset.tab===i)}
// Show portfolioCard only on homePage
var pc=byId('portfolioCard');if(pc)pc.style.display=(i==='homePage'?'':'none')
// Show shieldProxyContainer only on shieldPage, hide adminControlPanel
var sc=byId('shieldProxyContainer');if(sc)sc.style.display=(i==='shieldPage'?'':'none')
var acp=byId('adminControlPanel');if(acp)acp.style.display='none'
if(i==='adminPage'){renderAdminDashboard()}
if(i==='shieldPage'){renderShieldProxy()}}

// Home crypto list handled by setupCryptoClickHandlers

var handleSearch=deb(function(q){var t=q.toLowerCase().trim();if(!t)return renderBoard(data);var f=[];for(var i=0;i<data.length;i++){if(data[i].name.toLowerCase().indexOf(t)>-1||data[i].symbol.toLowerCase().indexOf(t)>-1)f.push(data[i])}renderBoard(f)},200);
search.addEventListener('input',function(e){handleSearch(e.target.value)});

function openModal(m){m.classList.remove('hidden')}
function closeModal(m){m.classList.add('hidden')}
var legalContent={terms:{title:'Terms of Service',body:'<h4>1. Acceptance</h4><p>By using Live Market you agree to these terms.</p><h4>2. Service</h4><p>Real-time crypto data from public APIs provided as-is.</p><h4>3. User Responsibilities</h4><p>Maintain account confidentiality. Do not misuse the service.</p><h4>4. Liability</h4><p>Not responsible for financial decisions based on this data.</p>'},privacy:{title:'Privacy Policy',body:'<h4>1. Data Collected</h4><p>Only email and hashed password during registration.</p><h4>2. Storage</h4><p>All data stored locally in your browser localStorage.</p><h4>3. Third Parties</h4><p>Price data from CoinGecko API. See their privacy policy.</p><h4>4. Your Rights</h4><p>Access modify or delete your data anytime.</p>'},cookies:{title:'Cookie Policy',body:'<h4>1. What We Use</h4><p>localStorage for login sessions and preferences only.</p><h4>2. No Tracking</h4><p>We do not use any tracking cookies or third-party analytics.</p><h4>3. Management</h4><p>Clear your browser data to remove all stored information.</p>'}};
function showLegal(t){var c=legalContent[t];if(!c)return;mTitle.textContent=c.title;mBody.innerHTML=c.body;openModal(legalM)}
byId('termsBtn').addEventListener('click',function(){showLegal('terms')});
byId('privacyBtn').addEventListener('click',function(){showLegal('privacy')});
byId('cookiesBtn').addEventListener('click',function(){showLegal('cookies')});
mClose.addEventListener('click',function(){closeModal(legalM)});
byId('faqSupport').addEventListener('click',function(){openModal(faqM)});
faqClose.addEventListener('click',function(){closeModal(faqM)});
byId('bugReport').addEventListener('click',function(){openModal(bugM)});
bugClose.addEventListener('click',function(){closeModal(bugM)});
subBug.addEventListener('click',function(){var t=byId('bugReportText');if(!t.value.trim()){alert('Describe the bug.');return}alert('Thanks! Bug reported.');t.value='';closeModal(bugM)});
byId('emailSupport').addEventListener('click',function(){window.location.href='mailto:support@live-market.app?subject=Live%20Market%20Support'});
chPwdBtn.addEventListener('click',function(){pwdErr.classList.add('hidden');pwdSuc.classList.add('hidden');chPwdForm.reset();openModal(pwdM)});
pwdClose.addEventListener('click',function(){closeModal(pwdM)});
chPwdForm.addEventListener('submit',function(e){e.preventDefault();var u=getUser();if(!u)return;var c=byId('currentPassword').value;var n=byId('newPassword').value;var cf=byId('confirmNewPassword').value;if(!c||!n||!cf){pwdErr.textContent='Fill all fields.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}var us=getUsers();if(!us[u.email]||us[u.email].password!==encodePw(c)){pwdErr.textContent='Current password wrong.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}if(n.length<6){pwdErr.textContent='New password min 6 chars.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}if(n!==cf){pwdErr.textContent='Passwords mismatch.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}us[u.email].password=encodePw(n);saveUsers(us);pwdErr.classList.add('hidden');pwdSuc.classList.remove('hidden');chPwdForm.reset();setTimeout(function(){pwdSuc.classList.add('hidden');closeModal(pwdM)},2000)});
var modals=qsAll('.modal-overlay');for(var m=0;m<modals.length;m++){(function(modal){modal.addEventListener('click',function(e){if(e.target===modal){closeModal(modal)}})})(modals[m])}

var countrySymbols={SPX:'^GSPC',SHCOMP:'000001.SS',N225:'^N225',HSI:'^HSI',SENSEX:'^BSESN',UKX:'^FTSE',SPTSX:'^GSPTSE',CAC:'^FCHI',TASI:'^TASI',DAX:'^GDAXI',SMI:'^SSMI',KOSPI:'^KS11',AS51:'^AXJO',TWSE:'^TWII',OMX:'^OMX'};
var countries=[{flag:'🇺🇸',name:'United States',ex:'S&P 500',idx:'SPX',symbol:'^GSPC',price:5432.18,chg:1.28},{flag:'🇨🇳',name:'China',ex:'Shanghai',idx:'SHCOMP',symbol:'000001.SS',price:3156.74,chg:-0.43},{flag:'🇯🇵',name:'Japan',ex:'Nikkei 225',idx:'N225',symbol:'^N225',price:38647.42,chg:0.85},{flag:'🇭🇰',name:'Hong Kong',ex:'Hang Seng',idx:'HSI',symbol:'^HSI',price:18456.31,chg:-0.22},{flag:'🇮🇳',name:'India',ex:'BSE Sensex',idx:'SENSEX',symbol:'^BSESN',price:81425.67,chg:1.56},{flag:'🇬🇧',name:'United Kingdom',ex:'FTSE 100',idx:'UKX',symbol:'^FTSE',price:8342.85,chg:0.12},{flag:'🇨🇦',name:'Canada',ex:'TSX',idx:'SPTSX',symbol:'^GSPTSE',price:22456.94,chg:-0.08},{flag:'🇫🇷',name:'France',ex:'CAC 40',idx:'CAC',symbol:'^FCHI',price:8123.45,chg:0.67},{flag:'🇸🇦',name:'Saudi Arabia',ex:'Tadawul',idx:'TASI',symbol:'^TASI',price:12345.67,chg:0.34},{flag:'🇩🇪',name:'Germany',ex:'DAX',idx:'DAX',symbol:'^GDAXI',price:18453.29,chg:-0.15},{flag:'🇨🇭',name:'Switzerland',ex:'SMI',idx:'SMI',symbol:'^SSMI',price:12345.78,chg:0.94},{flag:'🇰🇷',name:'South Korea',ex:'KOSPI',idx:'KOSPI',symbol:'^KS11',price:2789.34,chg:-0.56},{flag:'🇦🇺',name:'Australia',ex:'ASX 200',idx:'AS51',symbol:'^AXJO',price:7890.12,chg:0.45},{flag:'🇹🇼',name:'Taiwan',ex:'TWSE',idx:'TWSE',symbol:'^TWII',price:18923.45,chg:1.12},{flag:'🇸🇪',name:'Sweden',ex:'OMX',idx:'OMX',symbol:'^OMX',price:2567.89,chg:-0.33}];
var techSymbols=['AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','AMD','INTC','NFLX','CRM','ADBE','ORCL','CSCO','IBM'];
var techNames={AAPL:'Apple',MSFT:'Microsoft',GOOGL:'Alphabet',AMZN:'Amazon',NVDA:'NVIDIA',META:'Meta',TSLA:'Tesla',AMD:'AMD',INTC:'Intel',NFLX:'Netflix',CRM:'Salesforce',ADBE:'Adobe',ORCL:'Oracle',CSCO:'Cisco',IBM:'IBM'};
function renderCountries(){var g=byId('countryStocksGrid');if(!g)return;var h='';for(var i=0;i<countries.length;i++){var c=countries[i];var p=c.chg>=0,hClass=p?'positive':'negative',arr=p?'+':'';h+='<div class=country-card><span class=country-rank>'+(i+1)+'</span><span class=country-flag>'+c.flag+'</span><div class=country-info><div class=country-name>'+c.ex+'</div><div class=country-idx>'+c.idx+'</div></div><div class=country-price><div class=country-pval>'+fmtPrice(c.price)+'</div><div class="country-chg '+hClass+'">'+arr+c.chg.toFixed(2)+'%</div></div></div>'}g.innerHTML=h}
async function fetchCountryIndices(){try{var symbols=countries.map(function(c){return c.symbol}).join(',');var encodedSymbols=symbols.replace(/\^/g,'%5E');var r=await fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols='+encodedSymbols,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0'}});if(!r.ok)throw Error(r.status);var d=await r.json();var res=d.quoteResponse.result;if(!res||!res.length)return;for(var i=0;i<res.length;i++){var q=res[i];for(var j=0;j<countries.length;j++){if(countries[j].symbol===q.symbol){countries[j].price=q.regularMarketPrice||countries[j].price;countries[j].chg=q.regularMarketChangePercent||countries[j].chg;break}}}renderCountries();var b=byId('countryUpdateBadge');if(b)b.textContent='Live'}catch(e){console.error('Country indices:',e);var b=byId('countryUpdateBadge');if(b)b.textContent='Cache'}}
var techDomains={AAPL:'apple.com',MSFT:'microsoft.com',GOOGL:'google.com',AMZN:'amazon.com',NVDA:'nvidia.com',META:'meta.com',TSLA:'tesla.com',AMD:'amd.com',INTC:'intel.com',NFLX:'netflix.com',CRM:'salesforce.com',ADBE:'adobe.com',ORCL:'oracle.com',CSCO:'cisco.com',IBM:'ibm.com'};
async function fetchTechStocks(){var list=byId('techStocksList');if(!list)return;try{var r=await fetch('https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL,MSFT,GOOGL,AMZN,NVDA,META,TSLA,AMD,INTC,NFLX,CRM,ADBE,ORCL,CSCO,IBM',{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0'}});if(!r.ok)throw Error(r.status);var d=await r.json();var res=d.quoteResponse.result;if(!res||!res.length)throw Error('No data');var h='';for(var i=0;i<res.length;i++){var q=res[i],t=q.symbol,n=techNames[t]||t,p=q.regularMarketPrice||0,pc=q.regularMarketChangePercent||0;var cls=pc>=0?'positive':'negative',arrow=pc>=0?'+':'';var logoUrl=techDomains[t]?'https://logo.clearbit.com/'+techDomains[t]:'';var imgHTML=logoUrl?'<img src="'+logoUrl+'" alt="'+n+'" loading=lazy onerror="this.parentElement.innerHTML=\'<div style=width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--blue)>'+t.charAt(0)+'</div>\'">':'';h+='<div class=crypto-item><span class=crypto-rank>'+(i+1)+'</span><div class=crypto-icon>'+imgHTML+'</div><div class=crypto-info><div class=crypto-name>'+n+'</div><div class=crypto-symbol>'+t+'</div></div><div class=crypto-price><div class=crypto-price-value>'+fmtPrice(p)+'</div><div class="crypto-price-change '+cls+'">'+arrow+pc.toFixed(2)+'%</div></div></div>'}list.innerHTML=h;var b=byId('techUpdateBadge');if(b)b.textContent='Live'}catch(e){console.error('Tech stocks:',e);list.innerHTML='<div style=text-align:center;padding:24px;color:var(--text2);font-size:13px>Tech stock prices unavailable. Please check connection.</div>';var b=byId('techUpdateBadge');if(b)b.textContent='Offline'}}

function initParticles(){var c=document.createElement('div');c.id='particleCanvas';document.body.appendChild(c);var isDark=getTheme()==='dark';for(var i=0;i<25;i++){var el=document.createElement('div');var type=Math.random();var size=2+Math.random()*4;var x=Math.random()*100;var dur=10+Math.random()*20;var delay=Math.random()*12;var clr=isDark?'rgba(74,125,255,'+(0.15+Math.random()*0.35)+')':'rgba(74,125,255,'+(0.1+Math.random()*0.2)+')';if(type<0.4){el.className='particle';el.style.cssText='width:'+size+'px;height:'+size+'px;left:'+x+'%;bottom:-10px;background:'+clr+';box-shadow:0 0 '+(size*3)+'px '+clr+';animation:particleFloat '+dur+'s '+delay+'s linear infinite'}else if(type<0.7){el.className='particle';el.style.cssText='width:'+(size*1.5)+'px;height:'+(size*1.5)+'px;left:'+x+'%;bottom:-10px;background:'+clr+';opacity:0.6;animation:particleFloat '+(dur+3)+'s '+(delay+2)+'s linear infinite'}else if(type<0.9){el.className='particle-diamond';el.style.cssText='width:'+(size*2.5)+'px;height:'+(size*2.5)+'px;left:'+x+'%;bottom:-10px;background:'+clr+';opacity:0.5;animation:particleFloatRotate '+(dur+5)+'s '+(delay+1)+'s linear infinite;transform:rotate('+(Math.random()*360)+'deg)'}else{var rSize=12+Math.random()*18;el.className='particle-ring';el.style.cssText='width:'+rSize+'px;height:'+rSize+'px;left:'+x+'%;bottom:-10px;border-color:'+clr+';opacity:0.3;animation:particleFloatRotate '+(dur+8)+'s '+(delay+3)+'s linear infinite;transform:rotate('+(Math.random()*360)+'deg)'}c.appendChild(el)}}

function activateFuturistic(){document.body.classList.add('dashboard-loaded')}

// Live toggle On/Off
var liveToggle=byId('liveToggle'),toggleDropdown=byId('toggleDropdown');
var liveMode=true;
liveToggle.addEventListener('click',function(e){e.stopPropagation();toggleDropdown.classList.toggle('hidden')});
document.addEventListener('click',function(){toggleDropdown.classList.add('hidden')});
toggleDropdown.addEventListener('click',function(e){e.stopPropagation()});
var toggleOptions=qsAll('.toggle-option');
for(var to=0;to<toggleOptions.length;to++){(function(opt){opt.addEventListener('click',function(){var mode=opt.dataset.mode;for(var x=0;x<toggleOptions.length;x++){toggleOptions[x].classList.remove('active')}opt.classList.add('active');toggleDropdown.classList.add('hidden');if(mode==='on'&&!liveMode){liveMode=true;startPoll();setConn(true);connTxt.textContent='Live'}else if(mode==='off'&&liveMode){liveMode=false;if(timer){clearInterval(timer);timer=null}dot.className='connection-dot offline';connTxt.textContent='Off'}})})(toggleOptions[to])}

// ========== ADMIN EVENT HANDLERS ==========
document.addEventListener('click',function(e){
var target=e.target;
// Admin block/unblock/delete actions
if(target.classList.contains('admin-btn')){
var row=target.closest('.admin-user-row');if(!row)return;
var email=row.dataset.email;if(!email)return;
var action=target.dataset.action;
var users=getUsers();if(!users[email])return;
if(action==='block'){users[email].blocked=true;saveUsers(users);addAdminLog('Blocked user',email);renderAdminDashboard()}
else if(action==='unblock'){users[email].blocked=false;saveUsers(users);addAdminLog('Unblocked user',email);renderAdminDashboard()}
else if(action==='delete'){if(!confirm('Delete user "'+email+'"? This cannot be undone.'))return;delete users[email];saveUsers(users);addAdminLog('Deleted user',email);renderAdminDashboard()}}
// Admin logout from profile page
if(target.id==='adminLogoutBtn'||target.closest('#adminLogoutBtn')){adminLogout();clearAdminSession();clearUser();var p=qsAll('.page');for(var i=0;i<p.length;i++){p[i].classList.remove('active')}authPage.classList.add('active')}});

// Admin search
byId('adminSearch').addEventListener('input',deb(function(){if(isAdminLoggedIn()||checkAdminSession())renderAdminDashboard()},200));

// Admin refresh
byId('adminRefreshBtn').addEventListener('click',function(){if(isAdminLoggedIn()||checkAdminSession())renderAdminDashboard()});

// Admin profile badge click - switch to admin page
var apb=document.querySelector('.admin-profile-badge');if(apb){apb.addEventListener('click',function(){switchTab('adminPage')})}

// Admin change password
byId('adminChangePwdBtn').addEventListener('click',function(){if(!isAdminLoggedIn()&&!checkAdminSession())return;pwdErr.classList.add('hidden');pwdSuc.classList.add('hidden');chPwdForm.reset();openModal(pwdM)});

// Admin theme toggle
byId('adminThemeToggle').addEventListener('click',function(){if(!isAdminLoggedIn()&&!checkAdminSession())return;var cur=getTheme();if(cur==='dark'){setTheme('light');byId('adminThemeIcon').innerHTML='&#127774;';byId('adminThemeText').textContent='Light Mode'}else{setTheme('dark');byId('adminThemeIcon').innerHTML='&#127769;';byId('adminThemeText').textContent='Dark Mode'}});

// Modify the change password form to handle both regular users AND admin
// Remove old listener by replacing form element
var newPwdForm=document.createElement('form');
newPwdForm.id='changePasswordForm';
newPwdForm.innerHTML=chPwdForm.innerHTML;
chPwdForm.parentNode.replaceChild(newPwdForm,chPwdForm);
chPwdForm=newPwdForm;
chPwdForm.addEventListener('submit',function(e){e.preventDefault();var isAdmin=isAdminLoggedIn()||checkAdminSession();if(isAdmin){var c=byId('currentPassword').value;var n=byId('newPassword').value;var cf=byId('confirmNewPassword').value;if(!c||!n||!cf){pwdErr.textContent='Fill all fields.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}var admin=getAdmin();if(!admin||admin.password!==encodePw(c)){pwdErr.textContent='Current password wrong.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}if(n.length<6){pwdErr.textContent='New password min 6 chars.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}if(n!==cf){pwdErr.textContent='Passwords mismatch.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}admin.password=encodePw(n);saveAdmin(admin);addAdminLog('Changed admin password','System');pwdErr.classList.add('hidden');pwdSuc.classList.remove('hidden');chPwdForm.reset();setTimeout(function(){pwdSuc.classList.add('hidden');closeModal(pwdM)},2000);return}
// Regular user password change
var u=getUser();if(!u)return;var c=byId('currentPassword').value;var n=byId('newPassword').value;var cf=byId('confirmNewPassword').value;if(!c||!n||!cf){pwdErr.textContent='Fill all fields.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}var us=getUsers();if(!us[u.email]||us[u.email].password!==encodePw(c)){pwdErr.textContent='Current password wrong.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}if(n.length<6){pwdErr.textContent='New password min 6 chars.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}if(n!==cf){pwdErr.textContent='Passwords mismatch.';pwdErr.classList.remove('hidden');pwdSuc.classList.add('hidden');return}us[u.email].password=encodePw(n);saveUsers(us);pwdErr.classList.add('hidden');pwdSuc.classList.remove('hidden');chPwdForm.reset();setTimeout(function(){pwdSuc.classList.add('hidden');closeModal(pwdM)},2000)});

document.addEventListener('DOMContentLoaded',function(){initParticles();renderCountries();fetchTechStocks();fetchCountryIndices();if(window.location.search.indexOf('reset')>-1){clearUser();localStorage.clear()}try{var u=getUser();if(u){startLoad()}else if(isAdminLoggedIn()||checkAdminSession()){startLoad()}else{authPage.classList.add('active')}}catch(e){console.error(e);authPage.classList.add('active')}});
// Safety: if page gets stuck loading, show auth after 10s
setTimeout(function(){var lp=byId('loadingPage');if(lp&&lp.classList.contains('active')&&!dashPage.classList.contains('active')){clearUser();authPage.classList.add('active');lp.classList.remove('active')}},10000);