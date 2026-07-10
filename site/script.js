const STORAGE_KEY = "konosuSecretBookingStateV4";

const defaultState = {
  currentUser: null,
  selectedRole: "vip",
  authTab: "login",
  activePage: "mypage",
  vipUser: {
    name: "山田 太郎",
    email: "user@example.com",
    partner: "国際自動車株式会社",
    vipScore: "未判定",
    invited: false,
    invitationReason: "",
    stamps: 2,
    notifications: true
  },
  partners: [
    { id: "p1", name: "スマイルイノベーション矯正歯科", code: "SMILE-VIP-001", target: "格闘家、ボディビルダー", criterion: "提携先内でRFMを順位化し、合計順位スコア上位5%をVIP抽出" },
    { id: "p2", name: "国際自動車株式会社", code: "KM-VIP-002", target: "大企業役員、オーナー経営者、投資家", criterion: "提携先内でRFMを順位化し、合計順位スコア上位5%をVIP抽出" },
    { id: "p3", name: "高級パーソナルジム", code: "GYM-VIP-003", target: "経営者、医師、美容・健康感度の高い富裕層", criterion: "提携先内でRFMを順位化し、合計順位スコア上位5%をVIP抽出" }
  ],
  partnerCustomers: [
    { id: "c1", name: "山田 太郎", partner: "国際自動車株式会社", segment: "オーナー経営者", recentDays: 3, frequency: 12, amount: 150000, amountLabel: "月間決済額", weekdayIdleRate: 45, continuousMonths: 0 },
    { id: "c2", name: "佐藤 花子", partner: "高級パーソナルジム", segment: "医師", recentDays: 5, frequency: 10, amount: 120000, amountLabel: "月額決済額", weekdayIdleRate: 62, continuousMonths: 0 },
    { id: "c3", name: "鈴木 一郎", partner: "スマイルイノベーション矯正歯科", segment: "ボディビルダー", recentDays: 40, frequency: 1, amount: 1100000, amountLabel: "自由診療累計額", weekdayIdleRate: 30, continuousMonths: 8 },
    { id: "c4", name: "田中 美咲", partner: "国際自動車株式会社", segment: "投資家", recentDays: 20, frequency: 3, amount: 30000, amountLabel: "月間決済額", weekdayIdleRate: 20, continuousMonths: 0 },
    { id: "c5", name: "高橋 蓮", partner: "高級パーソナルジム", segment: "美容経営者", recentDays: 4, frequency: 8, amount: 95000, amountLabel: "月額決済額", weekdayIdleRate: 72, continuousMonths: 0 }
  ],
  slots: [
    { id: "s1", store: "津田沼店", room: "Room A", date: "2026-06-15", time: "平日 6:20", price: 9800, plan: "90分 Secret Sauna", published: true },
    { id: "s2", store: "津田沼店", room: "Room B", date: "2026-06-16", time: "平日 8:00", price: 10800, plan: "100分 Morning Luxe", published: true },
    { id: "s3", store: "新宿店", room: "Room A", date: "2026-06-17", time: "平日 10:00", price: 12800, plan: "120分 Executive", published: true },
    { id: "s4", store: "銀座店", room: "Room C", date: "2026-06-18", time: "平日 13:00", price: 15800, plan: "120分 Platinum", published: false }
  ],
  reservations: [
    { id: "r1", userName: "山田 太郎", email: "user@example.com", partner: "国際自動車株式会社", store: "津田沼店", room: "Room A", date: "2026-06-10", time: "平日 6:20", plan: "90分 Secret Sauna", price: 9800, status: "来店済み", createdAt: "2026-06-01" }
  ],
  notices: [
    { id: "n1", title: "シークレット枠のご案内", body: "平日6:20から15:10までのアイドルタイムを、提携先内RFM順位で上位5%に入った方だけに公開しました。", date: "2026-06-14" }
  ],
  bookingDraft: {}
};

const credentials = {
  vip: { label: "VIPユーザー", email: "user@example.com", loginId: "demo1", password: "demo1234", firstPage: "memberMenu" },
  admin: { label: "サウナ管理者", email: "admin@example.com", loginId: "admin1", password: "123456789", firstPage: "systemOverview" },
  partner: { label: "提携先管理者", email: "partner@example.com", loginId: "demo3", password: "demo1234", firstPage: "partnerDashboard" }
};

const menus = {
  vip: [
    ["mypage", "マイページ"],
    ["register", "会員登録"],
    ["invitation", "シークレット招待"],
    ["booking", "予約フォーム"],
    ["myReservations", "マイ予約"],
    ["history", "予約履歴"],
    ["stamps", "スタンプ"],
    ["qr", "QR読み取り"],
    ["settings", "設定"],
    ["notices", "お知らせ"]
  ],
  admin: [
    ["systemOverview", "システム概要"],
    ["clientSettings", "顧客設定"],
    ["partnerOverview", "提携先設定"],
    ["adminDashboard", "管理者ダッシュボード"],
    ["analytics", "分析結果"],
    ["scoring", "VIPスコアリング"],
    ["members", "会員管理"],
    ["reservationAdmin", "予約管理"],
    ["secretSlots", "シークレット枠管理"],
    ["referralCodes", "紹介コード管理"],
    ["noticeAdmin", "お知らせ管理"],
    ["adminAccount", "管理者アカウント"],
    ["adminSettings", "設定"]
  ],
  partner: [
    ["partnerDashboard", "提携先ダッシュボード"],
    ["partnerCustomers", "提携先顧客データ"],
    ["kickbacks", "キックバック確認"]
  ]
};

let state = loadState();
const app = document.getElementById("app");
const logoutButton = document.getElementById("logoutButton");
const appHeader = document.querySelector(".app-header");

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultState);
  try {
    return mergeState(structuredClone(defaultState), JSON.parse(saved));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return structuredClone(defaultState);
  }
}

function mergeState(base, saved) {
  if (!saved || typeof saved !== "object") return base;
  Object.entries(saved).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      base[key] = value;
    } else if (value && typeof value === "object" && base[key] && typeof base[key] === "object" && !Array.isArray(base[key])) {
      base[key] = mergeState({ ...base[key] }, value);
    } else if (value !== undefined) {
      base[key] = value;
    }
  });
  return base;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatYen(value) {
  return `${Number(value || 0).toLocaleString("ja-JP")}円`;
}

function createId(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const item = document.createElement("div");
  item.className = `toast-message ${type === "error" ? "error" : ""}`;
  item.textContent = message;
  toast.appendChild(item);
  setTimeout(() => item.remove(), 2800);
}

function calculateVipEligibility(customer) {
  return calculateRfmVipEligibility(customer);
}

function getVipPipelineStats() {
  const scored = state.partnerCustomers.map((customer) => ({ customer, score: calculateVipEligibility(customer) }));
  return {
    total: scored.length,
    vip: scored.filter((item) => item.score.isVip).length,
    invited: state.vipUser.invited ? 1 : 0,
    rankS: scored.filter((item) => item.score.rank === "S").length,
    rankA: scored.filter((item) => item.score.rank !== "S" && item.score.isVip).length
  };
}

function getKickbackTotal(partnerName = null) {
  return state.reservations
    .filter((reservation) => reservation.status === "来店済み")
    .filter((reservation) => !partnerName || reservation.partner === partnerName)
    .reduce((sum, reservation) => sum + reservation.price * 0.1, 0);
}

function render() {
  logoutButton.classList.toggle("hidden", !state.currentUser);
  document.body.classList.toggle("is-login", !state.currentUser);
  document.body.classList.toggle("is-authenticated", !!state.currentUser);
  document.body.classList.toggle("is-member", state.currentUser?.role === "vip");
  appHeader.classList.toggle("hidden", !state.currentUser);
  if (!state.currentUser) {
    renderLogin();
    return;
  }
  renderShell();
}

function renderLogin() {
  const role = state.selectedRole || "vip";
  const authTab = state.authTab || "login";
  app.innerHTML = `
    <section class="konosu-auth">
      <div class="brand-lockup">
        <div class="brand-row">
          <span class="brand-flame" aria-hidden="true"></span>
          <div>
            <div class="brand-private">PRIVATE SAUNA</div>
            <div class="brand-konosu">KONOSU</div>
          </div>
        </div>
        <p>${authTab === "admin" ? "管理者システム" : "会員制プライベートサウナ予約システム"}</p>
      </div>

      <div class="auth-card ${authTab === "admin" ? "admin-auth-card" : ""}">
        ${authTab === "admin" ? `
          <form id="adminLoginForm" class="auth-form admin-auth-form">
            <label class="form-row"><span>ログインID</span><input id="adminLoginId" value="admin1" placeholder="ログインIDを入力" required></label>
            <label class="form-row"><span>パスワード</span><input id="adminPassword" type="password" value="123456789" placeholder="パスワードを入力" required></label>
            <button class="primary-button auth-submit admin-submit" type="submit">ログイン</button>
            <div class="demo-accounts admin-demo">
              <strong>テスト用アカウント</strong>
              <p>ログインID: admin1</p>
              <p>パスワード: 123456789</p>
            </div>
          </form>
        ` : `
        <div class="auth-tabs">
          <button class="auth-tab ${authTab === "login" ? "active" : ""}" type="button" data-auth-tab="login">ログイン</button>
          <button class="auth-tab ${authTab === "register" ? "active" : ""}" type="button" data-auth-tab="register">新規会員登録</button>
        </div>

        ${authTab === "register" ? `
          <form id="registerAuthForm" class="auth-form">
            <div class="method-box">
              <p class="field-label">登録方法 <span>*</span></p>
              <label class="radio-row"><input type="radio" name="registerMethod" checked> <strong>提携先からの紹介</strong><small>提携先から発行された紹介番号で登録</small></label>
              <label class="radio-row"><input type="radio" name="registerMethod"> <strong>既存会員からの紹介</strong><small>既存会員の会員番号で登録</small></label>
            </div>
            <label class="form-row"><span>お名前 <b>*</b></span><input id="authName" value="山田太郎" required></label>
            <label class="form-row"><span>メールアドレスまたは電話番号 <b>*</b></span><input id="authEmail" type="email" value="example@email.com" required></label>
            <label class="form-row"><span>電話番号</span><input id="authPhone" value="090-1234-5678"></label>
            <label class="form-row"><span>提携先 <b>*</b></span><select id="authPartner" required><option value="">選択してください</option>${state.partners.map((p) => `<option>${p.name}</option>`).join("")}</select></label>
            <label class="form-row"><span>提携先紹介番号 <b>*</b></span><input id="authCode" placeholder="提携先から発行された番号" required></label>
            <p class="help-text">提携先から発行された紹介番号を入力してください<br><strong>テスト用：SMILE2024（スマイルイノベーション）、KOKUSAI24（国際自動車）、ANKO2024（theANKo）</strong></p>
            <label class="form-row"><span>ログインID <b>*</b></span><input id="authLoginId" placeholder="4文字以上の英数字" required></label>
            <p class="sub-help">ログイン時に使用するIDです</p>
            <label class="form-row"><span>パスワード <b>*</b></span><input id="authPassword" type="password" placeholder="6文字以上" required></label>
            <label class="form-row"><span>パスワード（確認） <b>*</b></span><input id="authPasswordConfirm" type="password" placeholder="パスワードを再入力" required></label>
            <label class="terms-box"><input id="authTerms" type="checkbox"> <span>* <u>会員規約</u>に同意します</span></label>
            <button class="primary-button auth-submit" type="submit">会員登録</button>
            <p class="center-note">※ 登録には提携先の会員資格基準を満たしている必要があります</p>
          </form>
        ` : `
          <form id="loginForm" class="auth-form">
            <label class="form-row"><span>ログインID</span><input id="loginId" value="demo1" placeholder="ログインIDを入力" required></label>
            <label class="form-row"><span>パスワード</span><input id="password" type="password" value="demo1234" placeholder="パスワードを入力" required></label>
            <button class="primary-button auth-submit" type="submit">ログイン</button>
            <div class="forgot-links">
              <button type="button">ログインIDを忘れた方</button>
              <span>|</span>
              <button type="button">パスワードを忘れた方</button>
            </div>
            <div class="demo-accounts">
              <strong>テスト用アカウント</strong>
              <p>ログインID: demo1 / パスワード: demo1234</p>
              <p>ログインID: demo2 / パスワード: demo1234</p>
              <p>ログインID: demo3 / パスワード: demo1234</p>
            </div>
          </form>
        `}
        `}
      </div>

      <div class="auth-links">
        ${authTab === "admin" ? `
          <p>※ 管理者のみご利用いただけます</p>
          <button class="admin-link" type="button" data-auth-tab="login">会員ログインへ戻る</button>
        ` : `
          <p>※ 会員番号をお持ちの方のみご利用いただけます</p>
          <button class="admin-link" type="button" data-auth-tab="admin">管理者の方はこちら</button>
        `}
      </div>
    </section>
  `;

  document.querySelector(".konosu-auth").addEventListener("click", (event) => {
    const tabButton = event.target.closest("[data-auth-tab]");
    if (!tabButton) return;
    event.preventDefault();
    state.authTab = tabButton.dataset.authTab;
    state.currentUser = null;
    saveState();
    renderLogin();
  });

  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRole = button.dataset.role;
      saveState();
      renderLogin();
    });
  });

  const registerAuthForm = document.getElementById("registerAuthForm");
  if (registerAuthForm) {
    registerAuthForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("authName").value.trim();
      const email = document.getElementById("authEmail").value.trim();
      const partner = document.getElementById("authPartner").value;
      const code = document.getElementById("authCode").value.trim();
      const password = document.getElementById("authPassword").value;
      const confirm = document.getElementById("authPasswordConfirm").value;
      const accepted = document.getElementById("authTerms").checked;
      if (!name || !email || !partner || !code || !password || !confirm) {
        showToast("必須項目を入力してください。", "error");
        return;
      }
      if (password !== confirm) {
        showToast("パスワード確認が一致しません。", "error");
        return;
      }
      if (!accepted) {
        showToast("会員規約への同意が必要です。", "error");
        return;
      }
      state.vipUser.name = name;
      state.vipUser.email = email;
      state.vipUser.partner = partner;
      state.currentUser = { role: "vip", email, label: "VIPユーザー" };
      state.activePage = "mypage";
      saveState();
      showToast("会員登録が完了しました。");
      render();
    });
  }

  const adminLoginForm = document.getElementById("adminLoginForm");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const loginId = document.getElementById("adminLoginId").value.trim();
      const password = document.getElementById("adminPassword").value.trim();
      const expected = credentials.admin;
      if (loginId !== expected.loginId || password !== expected.password) {
        showToast("管理者IDまたはパスワードが正しくありません。", "error");
        return;
      }
      state.selectedRole = "admin";
      state.currentUser = { role: "admin", email: expected.email, label: expected.label };
      state.activePage = expected.firstPage;
      saveState();
      showToast("管理者としてログインしました。");
      render();
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const loginId = document.getElementById("loginId").value.trim();
    const password = document.getElementById("password").value.trim();
    const found = Object.entries(credentials).find(([, item]) => item.loginId === loginId && item.password === password);
    if (!found) {
      showToast("ログインIDまたはパスワードが正しくありません。", "error");
      return;
    }
    const [roleKey, expected] = found;
    state.selectedRole = roleKey;
    state.currentUser = { role: roleKey, email: expected.email, label: expected.label };
    state.activePage = expected.firstPage;
    saveState();
    showToast(`${expected.label}としてログインしました。`);
    render();
  });
}

function renderShell() {
  const role = state.currentUser.role;
  const active = state.activePage || credentials[role].firstPage;
  if (role === "vip") {
    app.innerHTML = `
      <div class="member-shell">
        <nav class="member-topbar">
          <button class="member-logo" type="button" data-page="mypage">
            <span class="mini-flame" aria-hidden="true"></span>
            <span>PRIVATE SAUNA<br><strong>KONOSU</strong></span>
          </button>
          <div class="member-nav">
            ${[
              ["memberMenu", "メニュー"],
              ["booking", "予約する"],
              ["myReservations", "マイ予約"],
              ["notices", "お知らせ"],
              ["mypage", "マイページ"],
              ["settings", "設定"]
            ].map(([key, label]) => `<button class="member-nav-button ${active === key ? "active" : ""}" data-page="${key}" type="button">${label}</button>`).join("")}
          </div>
          <div class="member-account">
            <div class="member-account-text">
              <strong>デモユーザー1</strong>
              <span>SC-1000-0001</span>
            </div>
            <button class="member-logout" type="button" aria-label="ログアウト" title="ログアウト">
              <span aria-hidden="true"></span>
            </button>
          </div>
        </nav>
        <section class="member-screen" id="screen"></section>
      </div>
    `;
  } else {
    app.innerHTML = `
      <div class="layout ${role === "admin" ? "admin-layout" : ""}">
        <aside class="sidebar ${role === "admin" ? "admin-sidebar" : ""}">
          <p class="eyebrow">Menu</p>
          ${menus[role].map(([key, label]) => `<button class="menu-button ${active === key ? "active" : ""}" data-page="${key}" type="button">${label}</button>`).join("")}
        </aside>
        <section class="screen ${role === "admin" ? "admin-screen" : ""}" id="screen"></section>
      </div>
    `;
  }
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePage = button.dataset.page;
      saveState();
      renderShell();
    });
  });
  document.querySelector(".member-logout")?.addEventListener("click", () => {
    state.currentUser = null;
    state.authTab = "login";
    saveState();
    showToast("ログアウトしました。");
    render();
  });
  renderPage(active);
}

function renderPage(page) {
  const pages = {
    memberMenu: renderMemberMenu,
    mypage: renderMyPage,
    register: renderRegister,
    invitation: renderInvitation,
    booking: renderBooking,
    myReservations: renderMyReservations,
    history: renderHistory,
    stamps: renderStamps,
    qr: renderQr,
    settings: renderVipSettings,
    notices: renderNotices,
    systemOverview: renderSystemOverview,
    clientSettings: renderClientSettings,
    partnerOverview: renderPartnerOverview,
    adminDashboard: renderAdminDashboard,
    analytics: renderAnalytics,
    scoring: renderScoring,
    members: renderMembers,
    reservationAdmin: renderReservationAdmin,
    secretSlots: renderSecretSlots,
    referralCodes: renderReferralCodes,
    noticeAdmin: renderNoticeAdmin,
    adminAccount: renderAdminAccount,
    adminSettings: renderAdminSettings,
    partnerDashboard: renderPartnerDashboard,
    partnerCustomers: renderPartnerCustomers,
    kickbacks: renderKickbacks
  };
  (pages[page] || pages.mypage)();
}

function screenHtml(title, description, body) {
  document.getElementById("screen").innerHTML = `
    <div class="screen-header">
      <div>
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
    </div>
    ${body}
  `;
}

function emptyMessage(items, html) {
  return items.length ? html : `<div class="card"><p>データがありません。</p></div>`;
}

function renderMemberMenu() {
  const user = state.vipUser;
  document.getElementById("screen").innerHTML = `
    <div class="member-home">
      <section class="membership-card">
        <h2>会員証</h2>
        <div class="barcode-panel">
          <div class="barcode" aria-label="会員番号 SC-1000-0001">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <strong>SC-1000-0001</strong>
        </div>
        <p>デモユーザー1様</p>
      </section>

      <section class="profile-strip">
        <div class="avatar-mark">デ</div>
        <div>
          <h3>デモユーザー1様</h3>
          <p>会員番号: SC-1000-0001</p>
        </div>
      </section>

      <section class="home-menu-grid">
        ${[
          ["booking", "calendar", "予約する", state.vipUser.invited ? "シークレット枠の予約" : "招待後に利用可能"],
          ["myReservations", "list", "マイ予約", "予約履歴を確認"],
          ["notices", "notice", "お知らせ", "予約通知・メンテナンス"],
          ["mypage", "person", "マイページ", "会員情報を確認"],
          ["settings", "gear", "設定", "アカウント設定を変更"]
        ].map(([page, icon, title, text]) => `
          <button class="home-menu-card ${page === "booking" && !state.vipUser.invited ? "locked" : ""}" type="button" data-page="${page}">
            <span class="menu-icon ${icon}"></span>
            <span>
              <strong>${title}</strong>
              <small>${text}</small>
            </span>
            <em>›</em>
          </button>
        `).join("")}
      </section>

      <section class="member-benefit">
        <h3>${state.vipUser.invited ? "会員特典" : "招待ステータス"}</h3>
        <p>${state.vipUser.invited ? "アイドルタイム（平日・昼間）限定予約" : "提携先顧客データのVIP判定後にシークレット枠へ招待されます"}</p>
      </section>
    </div>
  `;
  document.querySelectorAll(".home-menu-card[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.page === "booking" && !state.vipUser.invited) {
        showToast("まだシークレット枠に招待されていません。管理者のVIPスコアリングで招待後に予約できます。", "error");
        state.activePage = "invitation";
        saveState();
        renderShell();
        return;
      }
      state.activePage = button.dataset.page;
      saveState();
      renderShell();
    });
  });
}

function renderMyPage() {
  document.getElementById("screen").innerHTML = `
    <section class="member-profile-page">
      <div class="member-page-title">
        <h2>マイページ</h2>
      </div>

      <div class="profile-layout">
        <section class="profile-main-card">
          <div class="profile-card-header">
            <div class="avatar-mark">デ</div>
            <div>
              <h3>デモユーザー1</h3>
              <p>会員番号: SC-1000-0001</p>
            </div>
          </div>

          <div class="profile-info-list">
            <div class="profile-info-row">
              <span class="profile-row-icon person"></span>
              <div><small>会員番号</small><strong>SC-1000-0001</strong></div>
            </div>
            <div class="profile-info-row">
              <span class="profile-row-icon person"></span>
              <div><small>お名前</small><strong>デモユーザー1</strong></div>
            </div>
            <div class="profile-info-row">
              <span class="profile-row-icon mail"></span>
              <div><small>メールアドレス</small><strong>demo1@example.com</strong></div>
            </div>
            <div class="profile-info-row">
              <span class="profile-row-icon phone"></span>
              <div><small>電話番号</small><strong>090-1234-5678</strong></div>
            </div>
            <div class="profile-info-row">
              <span class="profile-row-icon building"></span>
              <div><small>提携先</small><strong>スマイルイノベーション矯正歯科</strong><em>患者様・提携医療機関関係者</em></div>
            </div>
            <div class="profile-info-row">
              <span class="profile-row-icon calendar"></span>
              <div><small>会員登録日</small><strong>2026/6/16</strong></div>
            </div>
          </div>
        </section>

        <aside class="profile-side">
          <section class="profile-side-card">
            <h3>会員特典</h3>
            <p>アイドルタイム限定予約</p>
          </section>
          <section class="profile-side-card referral">
            <h3>友人を紹介</h3>
            <p>あなたの会員番号を共有して、友人をPRIVATE SAUNA KONOSUに招待しましょう。</p>
            <div class="referral-code">
              <small>あなたの紹介コード</small>
              <strong>SC-1000-0001</strong>
            </div>
          </section>
        </aside>
      </div>
    </section>
  `;
}

function renderRegister() {
  screenHtml("会員登録", "試作用の登録フォームです。入力内容は画面上の会員情報に反映されます。", `
    <form id="registerForm" class="card">
      <div class="form-grid">
        <div class="form-row"><label>氏名</label><input id="regName" value="${state.vipUser.name}" required></div>
        <div class="form-row"><label>メールアドレス</label><input id="regEmail" type="email" value="${state.vipUser.email}" required></div>
        <div class="form-row"><label>提携先</label><select id="regPartner">${state.partners.map((p) => `<option ${p.name === state.vipUser.partner ? "selected" : ""}>${p.name}</option>`).join("")}</select></div>
        <div class="form-row"><label>紹介コード</label><input id="regCode" placeholder="例: KM-VIP-002"></div>
      </div>
      <button class="primary-button" type="submit">会員情報を保存</button>
    </form>
  `);
  document.getElementById("registerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    if (!name || !email) return showToast("必須項目を入力してください。", "error");
    state.vipUser.name = name;
    state.vipUser.email = email;
    state.vipUser.partner = document.getElementById("regPartner").value;
    saveState();
    showToast("会員情報を保存しました。");
  });
}

function renderInvitation() {
  screenHtml("シークレット招待", "VIP判定された顧客だけに表示される招待画面です。", `
    <div class="card">
      <h3>${state.vipUser.invited ? "あなたはシークレット枠に招待されています" : "現在、招待はありません"}</h3>
      <p>${state.vipUser.invited ? state.vipUser.invitationReason : "提携先内RFM順位の上位5%に入ると招待が表示されます。"}</p>
      <button class="primary-button" type="button" ${state.vipUser.invited ? "onclick=\"goToPage('booking')\"" : "disabled"}>予約フォームへ</button>
    </div>
  `);
}

function renderBooking() {
  if (!state.vipUser.invited) {
    screenHtml("シークレット専用予約", "招待状を受け取ったVIP顧客のみがアクセスできる予約画面です。", `
      <div class="card invite-locked-card">
        <span class="badge">未招待</span>
        <h3>シークレット枠への招待が必要です</h3>
        <p>提携先から連携された顧客データを管理者がRFM順位で判定し、提携先内の上位5%に入った場合のみ招待が送信されます。</p>
        <button class="secondary-button" type="button" onclick="goToPage('invitation')">招待状況を確認</button>
      </div>
    `);
    return;
  }
  const publishedSlots = state.slots.filter((slot) => slot.published);
  screenHtml("予約フォーム", "店舗、日付、時間帯、部屋、プランを選択します。", `
    <div class="tabs">
      <button class="tab-button active" type="button">入力</button>
      <button class="tab-button" type="button">確認</button>
      <button class="tab-button" type="button">支払い</button>
      <button class="tab-button" type="button">完了</button>
    </div>
    <form id="bookingForm" class="card">
      <div class="form-grid">
        <div class="form-row"><label>予約枠</label><select id="slotSelect" required>${publishedSlots.map((slot) => `<option value="${slot.id}">${slot.store} / ${slot.room} / ${slot.date} / ${slot.time} / ${formatYen(slot.price)}</option>`).join("")}</select></div>
        <div class="form-row"><label>プラン</label><select id="planSelect"><option>90分 Secret Sauna</option><option>100分 Morning Luxe</option><option>120分 Executive</option><option>120分 Platinum</option></select></div>
      </div>
      <div class="button-row">
        <button class="primary-button" type="submit">予約詳細確認へ</button>
      </div>
    </form>
  `);
  document.getElementById("bookingForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const slot = state.slots.find((item) => item.id === document.getElementById("slotSelect").value);
    if (!slot) return showToast("予約枠を選択してください。", "error");
    state.bookingDraft = { ...slot, plan: document.getElementById("planSelect").value };
    saveState();
    showBookingConfirm();
  });
}

function showBookingConfirm() {
  const draft = state.bookingDraft;
  openModal("予約詳細確認", `
    <p><strong>${draft.store}</strong> ${draft.room}</p>
    <p>${draft.date} / ${draft.time}</p>
    <p>${draft.plan} / ${formatYen(draft.price)}</p>
  `, [
    ["戻る", "ghost", closeModal],
    ["支払い情報入力へ", "primary", showPaymentModal]
  ]);
}

function showPaymentModal() {
  const draft = state.bookingDraft;
  openModal("支払い情報入力", `
    <p class="muted">実際の決済は行いません。見た目だけの疑似入力です。</p>
    <div class="form-row"><label>カード番号</label><input placeholder="4242 4242 4242 4242"></div>
    <div class="form-grid">
      <div class="form-row"><label>有効期限</label><input placeholder="12/30"></div>
      <div class="form-row"><label>セキュリティコード</label><input placeholder="123"></div>
    </div>
    <p>決済予定額: <strong>${formatYen(draft.price)}</strong></p>
  `, [
    ["戻る", "ghost", showBookingConfirm],
    ["予約を完了する", "primary", completeBooking]
  ]);
}

function completeBooking() {
  const draft = state.bookingDraft;
  state.reservations.push({
    id: createId("r"),
    userName: state.vipUser.name,
    email: state.vipUser.email,
    partner: state.vipUser.partner,
    store: draft.store,
    room: draft.room,
    date: draft.date,
    time: draft.time,
    plan: draft.plan,
    price: draft.price,
    status: "予約中",
    createdAt: new Date().toISOString().slice(0, 10)
  });
  state.bookingDraft = {};
  saveState();
  openModal("予約完了", "<p>予約が完了しました。マイ予約から内容を確認できます。</p>", [["マイ予約へ", "primary", () => { closeModal(); goToPage("myReservations"); }]]);
  showToast("予約を作成しました。");
}

function renderMyReservations() {
  const reservations = state.reservations.filter((item) => item.email === state.vipUser.email && item.status !== "キャンセル");
  screenHtml("マイ予約", "現在の予約を確認、削除できます。", reservationTable(reservations, true));
}

function renderHistory() {
  const reservations = state.reservations.filter((item) => item.email === state.vipUser.email);
  screenHtml("予約履歴", "予約中、来店済み、キャンセルを含む履歴です。", reservationTable(reservations, false));
}

function reservationTable(reservations, canDelete) {
  return emptyMessage(reservations, `
    <div class="table-wrap"><table>
      <thead><tr><th>店舗</th><th>日時</th><th>部屋</th><th>プラン</th><th>金額</th><th>ステータス</th><th>操作</th></tr></thead>
      <tbody>${reservations.map((r) => `
        <tr>
          <td>${r.store}</td><td>${r.date}<br>${r.time}</td><td>${r.room}</td><td>${r.plan}</td><td>${formatYen(r.price)}</td><td><span class="badge">${r.status}</span></td>
          <td>${canDelete ? `<button class="danger-button" onclick="confirmDeleteReservation('${r.id}')">削除</button>` : "-"}</td>
        </tr>
      `).join("")}</tbody>
    </table></div>
  `);
}

function confirmDeleteReservation(id) {
  openModal("予約削除確認", "<p>この予約を削除します。よろしいですか。</p>", [
    ["キャンセル", "ghost", closeModal],
    ["削除する", "danger", () => {
      state.reservations = state.reservations.filter((item) => item.id !== id);
      saveState();
      closeModal();
      showToast("予約を削除しました。");
      renderShell();
    }]
  ]);
}

function renderVipSettings() {
  screenHtml("設定", "メールアドレス、パスワード、通知設定を変更できます。", `
    <form id="settingsForm" class="card">
      <div class="form-row"><label>メールアドレス変更</label><input id="settingEmail" type="email" value="${state.vipUser.email}" required></div>
      <div class="form-row"><label>パスワード変更</label><input id="settingPassword" type="password" placeholder="新しいパスワード"></div>
      <label><input id="settingNotify" type="checkbox" ${state.vipUser.notifications ? "checked" : ""} style="width:auto; min-height:auto;"> 通知を受け取る</label>
      <div class="button-row"><button class="primary-button" type="submit">保存</button></div>
    </form>
  `);
  document.getElementById("settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.vipUser.email = document.getElementById("settingEmail").value.trim();
    state.vipUser.notifications = document.getElementById("settingNotify").checked;
    saveState();
    showToast("設定を保存しました。");
  });
}

function renderStamps() {
  const stamps = Array.from({ length: 10 }, (_, index) => `<div class="stamp ${index < state.vipUser.stamps ? "filled" : ""}">${index + 1}</div>`).join("");
  screenHtml("スタンプ", "来店ごとにスタンプが増えます。", `<div class="card"><div class="stamp-board">${stamps}</div><p class="muted">現在 ${state.vipUser.stamps} / 10 個</p></div>`);
}

function renderQr() {
  screenHtml("QR読み取り", "実際のカメラは起動せず、ボタンで来店認識を行います。", `
    <div class="card">
      <p>店頭QRを読み取った想定で、最新の予約を来店済みに変更します。</p>
      <button class="primary-button" onclick="completeVisitByQr()">QR読み取り完了</button>
    </div>
  `);
}

function completeVisitByQr() {
  const reservation = [...state.reservations].reverse().find((item) => item.email === state.vipUser.email && item.status === "予約中");
  if (!reservation) return showToast("来店認識できる予約がありません。", "error");
  reservation.status = "来店済み";
  state.vipUser.stamps += 1;
  saveState();
  showToast("来店済みに変更し、スタンプを付与しました。");
  renderShell();
}

function renderNotices() {
  if (state.currentUser?.role === "vip") {
    document.getElementById("screen").innerHTML = `
      <section class="member-notices">
        <div class="member-page-title">
          <h2>お知らせ</h2>
          <p>予約通知やメンテナンス情報などの重要なお知らせ</p>
        </div>
        <div class="notice-filter-tabs">
          <button class="active" type="button">すべて</button>
          <button type="button">お知らせ</button>
          <button type="button">メンテナンス</button>
        </div>
        <div class="member-notice-list">
          <article class="member-notice-card">
            <div class="notice-icon"></div>
            <div>
              <h3>国際自動車とのタクシー配車連携開始</h3>
              <p>PRIVATE SAUNA KONOSUアプリから、国際自動車株式会社のタクシー配車サービスに直接アクセスできるようになりました。サウナご利用後のご帰宅に、ぜひご活用ください。</p>
              <div class="notice-meta"><span>お知らせ</span><time>2026/1/10</time></div>
            </div>
            <span class="notice-arrow">›</span>
          </article>
        </div>
      </section>
    `;
    return;
  }
  screenHtml("お知らせ", "店舗からのお知らせを表示します。", noticesHtml(state.notices));
}

function noticesHtml(notices, canDelete = false) {
  return emptyMessage(notices, `<div class="notice-list">${notices.map((n) => `
    <article class="card"><span class="badge">${n.date}</span><h3>${n.title}</h3><p>${n.body}</p>${canDelete ? `<button class="danger-button" onclick="deleteNotice('${n.id}')">削除</button>` : ""}</article>
  `).join("")}</div>`);
}

function renderSystemOverview() {
  screenHtml("システム概要", "ブランド価値を下げずにアイドルタイムを自動収益化する仕組みです。", `
    <div class="admin-feature-grid">
      <div class="admin-feature-card"><span>01</span><h3>顧客データ連携</h3><p>提携先の既存顧客データを連携し、平日日中に動ける富裕層を抽出します。</p></div>
      <div class="admin-feature-card"><span>02</span><h3>提携先別VIP判定</h3><p>提携先ごとにRFMを順位付けし、合計順位スコア上位5%の顧客だけを判定します。</p></div>
      <div class="admin-feature-card"><span>03</span><h3>シークレット枠招待</h3><p>平日6:20から15:10のアイドルタイム枠を、招待済みVIPだけに公開します。</p></div>
      <div class="admin-feature-card"><span>04</span><h3>収益還元</h3><p>予約後に来店済みとなった実績だけを対象に、提携先へ10%の紹介手数料を自動計算します。</p></div>
    </div>
  `);
}

function renderClientSettings() {
  screenHtml("顧客設定", "PRIVATE SAUNA KONOSUと8DXの前提条件を整理します。", `
    <div class="tabs">
      <button class="tab-button active" type="button">貴社設定</button>
      <button class="tab-button" type="button">自社設定</button>
      <button class="tab-button" type="button">背景</button>
    </div>
    <div class="card-grid">
      <div class="card"><h3>PRIVATE SAUNA KONOSU</h3><p>千葉県習志野市津田沼2-17-1</p><p>高品質な個室サウナの運営・提供</p></div>
      <div class="card"><h3>課題</h3><p>夜間・休日は好調な一方、平日日中の固定費に対して収益を生まない時間帯が存在します。</p></div>
      <div class="card"><h3>アイドルタイム定義</h3><p>都内3店舗・各4部屋・11回/1日</p><p class="muted">6:20から15:10まで</p></div>
      <div class="card"><h3>株式会社 8DX</h3><p>時間制サービス業におけるアイドルタイムの機会損失低減システム導入案を提供します。</p></div>
    </div>
  `);
}

function renderPartnerOverview() {
  screenHtml("提携先設定", "新規優良顧客層と、提携先別のVIP抽出基準です。", `
    <div class="admin-partner-grid">
      ${state.partners.map((partner) => `
        <article class="admin-partner-card">
          <span>${partner.code}</span>
          <h3>${partner.name}</h3>
          <p><strong>見込ユーザー層</strong><br>${partner.target}</p>
          <p><strong>VIP抽出基準</strong><br>${partner.criterion}</p>
        </article>
      `).join("")}
    </div>
  `);
}

function renderAdminDashboard() {
  const todayCount = state.reservations.filter((r) => r.date === "2026-06-14").length;
  const idleCount = state.reservations.filter((r) => r.time.includes("平日")).length;
  const sales = state.reservations.reduce((sum, r) => sum + (r.status !== "キャンセル" ? r.price : 0), 0);
  const vipCount = state.partnerCustomers.filter((c) => calculateVipEligibility(c).isVip).length;
  screenHtml("管理者ダッシュボード", "予約、売上、VIP招待、キックバックを俯瞰します。", `
    <div class="admin-stats-grid">
      <div class="admin-stat-card"><span>本日の予約数</span><strong>${todayCount}</strong></div>
      <div class="admin-stat-card"><span>アイドルタイム予約数</span><strong>${idleCount}</strong></div>
      <div class="admin-stat-card"><span>売上</span><strong>${formatYen(sales)}</strong></div>
      <div class="admin-stat-card"><span>VIP招待数</span><strong>${vipCount}</strong></div>
      <div class="admin-stat-card"><span>キックバック総額</span><strong>${formatYen(getKickbackTotal())}</strong></div>
    </div>
  `);
}

function renderAnalytics() {
  const rows = [
    ["6/10", 9800, 1, 9800, 35],
    ["6/11", 21600, 2, 10800, 48],
    ["6/12", 38400, 3, 12800, 62],
    ["6/13", 28600, 2, 14300, 54],
    ["6/14", 45200, 4, 11300, 76]
  ];
  screenHtml("分析結果", "日別売上、予約数、平均客単価、アイドルタイム稼働率を表示します。", `
    <div class="admin-chart-card">
      ${rows.map(([day, sales, count, average, rate]) => `
        <div class="admin-bar-row"><span>${day}</span><div class="admin-bar-track"><div class="admin-bar-fill" style="width:${rate}%"></div></div><strong>${rate}%</strong></div>
        <p>${formatYen(sales)} / ${count}件 / 平均 ${formatYen(average)}</p>
      `).join("")}
    </div>
  `);
}

function renderScoring() {
  const stats = getVipPipelineStats();
  screenHtml("VIPスコアリング", "提携先DBの顧客データを連携し、提携先ごとのRFM順位と合計順位スコアでランク付けします。", `
    <div class="vip-pipeline-grid">
      <div class="vip-pipeline-card"><span>連携顧客DB</span><strong>${stats.total}件</strong><p>提携先から提供された顧客データ</p></div>
      <div class="vip-pipeline-card"><span>VIP候補</span><strong>${stats.vip}件</strong><p>上位5%以内の優良候補</p></div>
      <div class="vip-pipeline-card"><span>招待可能</span><strong>${stats.vip}件</strong><p>上位5%のSランク顧客</p></div>
      <div class="vip-pipeline-card"><span>招待送信済み</span><strong>${stats.invited}件</strong><p>予約画面アクセス許可済み</p></div>
    </div>
    ${customerTable(true)}
  `);
}

function customerTable(showInvite) {
  return emptyMessage(state.partnerCustomers, `
    <div class="table-wrap"><table>
      <thead><tr><th>顧客名</th><th>提携先</th><th>顧客層</th><th>最新利用日</th><th>頻度</th><th>決済額</th><th>追加条件</th><th>ランク</th><th>RFM順位</th><th>VIP判定</th><th>操作</th></tr></thead>
      <tbody>${state.partnerCustomers.map((c) => {
        const score = calculateVipEligibility(c);
        return `<tr>
          <td>${c.name}</td><td>${c.partner}</td><td>${c.segment || "-"}</td><td>${c.recentDays}日前</td><td>月${c.frequency}回</td><td>${c.amountLabel || "決済額"}<br>${formatYen(c.amount)}</td>
          <td>${c.partner === "高級パーソナルジム" ? `平日昼利用 ${c.weekdayIdleRate}%` : c.partner === "スマイルイノベーション矯正歯科" ? `継続 ${c.continuousMonths}ヶ月` : "-"}</td>
          <td><span class="rank-badge rank-${score.rank.toLowerCase()}">${score.rank}</span></td>
          <td>${score.scoreLabel}<br><span class="muted">${score.checks.map((check) => check.label).join("<br>")}</span></td>
          <td><span class="badge ${score.isVip ? "gold" : ""}">${score.isVip ? "シークレット招待可能" : "通常"}</span></td>
          <td>${showInvite && score.isVip ? `<button class="primary-button" onclick="sendInvitation('${c.id}')">招待送信</button>` : "-"}</td>
        </tr>`;
      }).join("")}</tbody>
    </table></div>
  `);
}

function sendInvitation(customerId) {
  const customer = state.partnerCustomers.find((item) => item.id === customerId);
  const score = calculateVipEligibility(customer);
  state.vipUser.invited = true;
  state.vipUser.name = customer.name;
  state.vipUser.partner = customer.partner;
  state.vipUser.vipScore = score.scoreLabel;
  state.vipUser.invitationReason = `${customer.partner}の顧客DB内でRFM合計順位スコアが上位5%に入ったため、シークレット枠へ招待されました。`;
  saveState();
  showToast(`${customer.name}さんへシークレット招待を送信しました。`);
  renderShell();
}

function renderMembers() {
  const members = [{ id: "m1", name: state.vipUser.name, email: state.vipUser.email, partner: state.vipUser.partner, score: state.vipUser.vipScore }];
  screenHtml("会員管理", "会員一覧、詳細、削除を行います。", `
    <div class="table-wrap"><table>
      <thead><tr><th>氏名</th><th>メール</th><th>提携先</th><th>VIP判定</th><th>操作</th></tr></thead>
      <tbody>${members.map((m) => `<tr><td>${m.name}</td><td>${m.email}</td><td>${m.partner}</td><td>${m.score}</td><td><button class="secondary-button" onclick="showMemberDetail()">詳細</button> <button class="danger-button" onclick="showToast('試作品のため会員削除を疑似実行しました。')">削除</button></td></tr>`).join("")}</tbody>
    </table></div>
  `);
}

function showMemberDetail() {
  openModal("会員詳細", `<p>${state.vipUser.name}</p><p>${state.vipUser.email}</p><p>${state.vipUser.partner}</p><p>VIP判定 ${state.vipUser.vipScore}</p>`, [["閉じる", "primary", closeModal]]);
}

function renderReservationAdmin() {
  screenHtml("予約管理", "予約一覧、ステータス変更、情報変更、削除を行います。", `
    ${reservationAdminTable()}
  `);
}

function reservationAdminTable() {
  return emptyMessage(state.reservations, `
    <div class="table-wrap"><table>
      <thead><tr><th>顧客</th><th>店舗</th><th>日時</th><th>金額</th><th>ステータス</th><th>操作</th></tr></thead>
      <tbody>${state.reservations.map((r) => `
        <tr>
          <td>${r.userName}<br><span class="muted">${r.partner}</span></td><td>${r.store}</td><td>${r.date}<br>${r.time}</td><td>${formatYen(r.price)}</td>
          <td><select onchange="changeReservationStatus('${r.id}', this.value)"><option ${r.status === "予約中" ? "selected" : ""}>予約中</option><option ${r.status === "来店済み" ? "selected" : ""}>来店済み</option><option ${r.status === "キャンセル" ? "selected" : ""}>キャンセル</option></select></td>
          <td><button class="secondary-button" onclick="editReservation('${r.id}')">変更</button> <button class="danger-button" onclick="confirmDeleteReservation('${r.id}')">削除</button></td>
        </tr>
      `).join("")}</tbody>
    </table></div>
  `);
}

function changeReservationStatus(id, status) {
  const reservation = state.reservations.find((item) => item.id === id);
  reservation.status = status;
  saveState();
  showToast("予約ステータスを変更しました。");
  renderShell();
}

function editReservation(id) {
  const reservation = state.reservations.find((item) => item.id === id);
  openModal("予約情報変更", `
    <div class="form-row"><label>日付</label><input id="editDate" type="date" value="${reservation.date}"></div>
    <div class="form-row"><label>時間帯</label><input id="editTime" value="${reservation.time}"></div>
  `, [
    ["キャンセル", "ghost", closeModal],
    ["保存", "primary", () => {
      reservation.date = document.getElementById("editDate").value;
      reservation.time = document.getElementById("editTime").value.trim();
      saveState();
      closeModal();
      showToast("予約情報を変更しました。");
      renderShell();
    }]
  ]);
}

function renderSecretSlots() {
  screenHtml("シークレット枠管理", "店舗、部屋、日付、時間帯、価格、公開状態を管理します。", `
    <form id="slotForm" class="card">
      <div class="form-grid">
        <div class="form-row"><label>店舗</label><input id="slotStore" required></div>
        <div class="form-row"><label>部屋</label><input id="slotRoom" required></div>
        <div class="form-row"><label>日付</label><input id="slotDate" type="date" required></div>
        <div class="form-row"><label>時間帯</label><input id="slotTime" placeholder="平日 13:00" required></div>
        <div class="form-row"><label>価格</label><input id="slotPrice" type="number" required></div>
        <div class="form-row"><label>公開状態</label><select id="slotPublished"><option value="true">公開</option><option value="false">非公開</option></select></div>
      </div>
      <button class="primary-button" type="submit">枠を追加</button>
    </form>
    <div style="height:16px"></div>
    <div class="table-wrap"><table>
      <thead><tr><th>店舗</th><th>部屋</th><th>日付</th><th>時間</th><th>価格</th><th>公開状態</th></tr></thead>
      <tbody>${state.slots.map((s) => `<tr><td>${s.store}</td><td>${s.room}</td><td>${s.date}</td><td>${s.time}</td><td>${formatYen(s.price)}</td><td><span class="badge">${s.published ? "公開" : "非公開"}</span></td></tr>`).join("")}</tbody>
    </table></div>
  `);
  document.getElementById("slotForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const required = ["slotStore", "slotRoom", "slotDate", "slotTime", "slotPrice"].map((id) => document.getElementById(id).value.trim());
    if (required.some((value) => !value)) return showToast("必須項目を入力してください。", "error");
    state.slots.push({ id: createId("s"), store: required[0], room: required[1], date: required[2], time: required[3], price: Number(required[4]), plan: "Secret Sauna", published: document.getElementById("slotPublished").value === "true" });
    saveState();
    showToast("シークレット枠を追加しました。");
    renderShell();
  });
}

function renderReferralCodes() {
  screenHtml("紹介コード管理", "提携先ごとの紹介コードを表示、生成します。", `
    <div class="admin-simple-table table-wrap"><table>
      <thead><tr><th>提携先</th><th>紹介コード</th><th>操作</th></tr></thead>
      <tbody>${state.partners.map((p) => `<tr><td>${p.name}</td><td>${p.code}</td><td><button class="secondary-button" onclick="generateReferralCode('${p.id}')">紹介コード生成</button></td></tr>`).join("")}</tbody>
    </table></div>
  `);
}

function generateReferralCode(id) {
  const partner = state.partners.find((item) => item.id === id);
  partner.code = `KONOSU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  saveState();
  showToast("紹介コードを生成しました。");
  renderShell();
}

function renderNoticeAdmin() {
  screenHtml("お知らせ管理", "新規お知らせ作成と削除を行います。", `
    <form id="noticeForm" class="card admin-notice-form">
      <div class="form-row"><label>タイトル</label><input id="noticeTitle" required></div>
      <div class="form-row"><label>本文</label><textarea id="noticeBody" required></textarea></div>
      <button class="primary-button" type="submit">お知らせ作成</button>
    </form>
    <div class="admin-notice-list">
      ${state.notices.length ? state.notices.map((n) => `
        <article class="admin-notice-item">
          <time>${n.date}</time>
          <h3>${n.title}</h3>
          <p>${n.body}</p>
          <button class="danger-button" onclick="deleteNotice('${n.id}')">削除</button>
        </article>
      `).join("") : `<div class="card"><p>データがありません。</p></div>`}
    </div>
  `);
  document.getElementById("noticeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("noticeTitle").value.trim();
    const body = document.getElementById("noticeBody").value.trim();
    if (!title || !body) return showToast("必須項目を入力してください。", "error");
    state.notices.unshift({ id: createId("n"), title, body, date: new Date().toISOString().slice(0, 10) });
    saveState();
    showToast("お知らせを作成しました。");
    renderShell();
  });
}

function deleteNotice(id) {
  state.notices = state.notices.filter((item) => item.id !== id);
  saveState();
  showToast("お知らせを削除しました。");
  renderShell();
}

function renderAdminAccount() {
  screenHtml("管理者アカウント", "管理者プロフィールの疑似設定画面です。", `
    <section class="admin-info-card">
      <p>admin@example.com</p>
      <p>PRIVATE SAUNA KONOSU 運営管理者</p>
      <button class="primary-button" onclick="showToast('管理者アカウントを保存しました。')">保存</button>
    </section>
  `);
}

function renderAdminSettings() {
  screenHtml("設定", "管理画面の疑似設定です。", `
    <section class="admin-info-card admin-settings-card">
      <label class="admin-check-row">
        <input type="checkbox" checked>
        <span>予約通知を受け取る</span>
      </label>
      <button class="primary-button" onclick="showToast('管理設定を保存しました。')">保存</button>
    </section>
  `);
}

function renderPartnerDashboard() {
  const partnerName = "国際自動車株式会社";
  const customers = state.partnerCustomers.filter((c) => c.partner === partnerName);
  const vipCount = customers.filter((c) => calculateVipEligibility(c).isVip).length;
  const reservationCount = state.reservations.filter((r) => r.partner === partnerName && r.status !== "キャンセル").length;
  screenHtml("提携先ダッシュボード", "提供顧客、VIP判定、予約成立、キックバックを確認します。", `
    <div class="stats-grid">
      <div class="stat-card"><span>提供顧客数</span><strong>${customers.length}</strong></div>
      <div class="stat-card"><span>VIP判定数</span><strong>${vipCount}</strong></div>
      <div class="stat-card"><span>予約成立数</span><strong>${reservationCount}</strong></div>
      <div class="stat-card"><span>キックバック金額</span><strong>${formatYen(getKickbackTotal(partnerName))}</strong></div>
    </div>
  `);
}

function renderPartnerCustomers() {
  const original = state.partnerCustomers;
  state.partnerCustomers = original.filter((c) => c.partner === "国際自動車株式会社");
  screenHtml("提携先顧客データ", "提携先が提供した顧客データとVIP判定です。", customerTable(false));
  state.partnerCustomers = original;
}

function renderKickbacks() {
  const partnerName = "国際自動車株式会社";
  const rows = state.reservations.filter((r) => r.partner === partnerName && r.status === "来店済み");
  screenHtml("キックバック確認", "来店済み予約の10%を報酬として自動計算します。", `
    ${emptyMessage(rows, `<div class="table-wrap"><table>
      <thead><tr><th>予約</th><th>予約金額</th><th>報酬額</th><th>支払い予定ステータス</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${r.userName} / ${r.date} ${r.time}</td><td>${formatYen(r.price)}</td><td>${formatYen(r.price * 0.1)}</td><td><span class="badge success">支払い予定</span></td></tr>`).join("")}</tbody>
    </table></div>`)}
    <div class="card" style="margin-top:14px;"><strong>合計報酬額: ${formatYen(getKickbackTotal(partnerName))}</strong></div>
  `);
}

function openModal(title, body, actions) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = body;
  document.getElementById("modalActions").innerHTML = actions.map(([label, type], index) => `<button class="${type}-button" data-action="${index}" type="button">${label}</button>`).join("");
  document.getElementById("modal").classList.remove("hidden");
  actions.forEach((action, index) => {
    document.querySelector(`[data-action="${index}"]`).addEventListener("click", action[2]);
  });
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function goToPage(page) {
  state.activePage = page;
  saveState();
  renderShell();
}

logoutButton.addEventListener("click", () => {
  state.currentUser = null;
  saveState();
  showToast("ログアウトしました。");
  render();
});

document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", (event) => {
  if (event.target.id === "modal") closeModal();
});

const adminNavItems = [
  ["adminMenu", "メニュー"],
  ["members", "会員管理"],
  ["reservationAdmin", "予約管理"],
  ["analytics", "売上分析"],
  ["referralCodes", "紹介コード管理"],
  ["noticeAdmin", "お知らせ"],
  ["secretSlots", "予約フォーム作成"],
  ["adminAccount", "管理者アカウント"],
  ["adminSettings", "設定"]
];

const adminMenuCards = [
  { page: "members", color: "blue", icon: "users", title: "会員管理", text: "会員情報の閲覧・編集", note: "登録会員数を管理" },
  { page: "reservationAdmin", color: "green", icon: "calendar", title: "予約管理", text: "予約状況の確認・管理", note: "予約・キャンセルを管理" },
  { page: "analytics", color: "pink", icon: "chart", title: "売上分析", text: "売上予測・データ分析", note: "予約・売上を可視化" },
  { page: "referralCodes", color: "purple", icon: "gift", title: "紹介コード管理", text: "紹介コードの発行・管理", note: "提携先コードを管理" },
  { page: "noticeAdmin", color: "orange", icon: "notice", title: "お知らせ", text: "お知らせの作成・配信", note: "会員へ情報配信" },
  { page: "secretSlots", color: "cyan", icon: "clock", title: "予約フォーム作成", text: "予約可能時間帯の設定", note: "早朝・深夜の時間管理" },
  { page: "adminAccount", color: "deepblue", icon: "account", title: "管理者アカウント", text: "アカウント情報の表示", note: "管理者の認証情報" },
  { page: "adminSettings", color: "slate", icon: "settings", title: "設定", text: "システム全般の設定", note: "基本設定・詳細設定" }
];

const adminMembers = [
  { number: "KNS0001", name: "田中太郎", nick: "タロー", email: "tanaka@example.com", partner: "スマイルイノベーション矯正歯科", vip: true, stamp: "1/2", visits: "5回" },
  { number: "KNS0002", name: "佐藤花子", nick: "花ちゃん", email: "sato@example.com", partner: "KOKUSAI", vip: false, stamp: "0/2", visits: "3回" },
  { number: "KNS0003", name: "鈴木一郎", nick: "-", email: "suzuki@example.com", partner: "theANKo", vip: false, stamp: "2/2", visits: "2回" },
  { number: "SC-1000-0001", name: "デモユーザー1", nick: "-", email: "demo1@example.com", partner: "SMILE_INNOVATION", vip: state.vipUser.invited, stamp: "1/2", visits: "3回" },
  { number: "SC-1000-0002", name: "デモユーザー2", nick: "-", email: "demo2@example.com", partner: "KOKUSAI_MOTORS", vip: false, stamp: "2/2", visits: "5回" },
  { number: "SC-1000-0003", name: "デモユーザー3", nick: "あんこ太郎", email: "demo3@example.com", partner: "THE_ANKO", vip: false, stamp: "0/2", visits: "2回" }
];

const adminBookings = [
  { id: "booking0", member: "タロー", number: "KNS0001", datetime: "2026/6/20\n6:00-8:00", people: "1名", price: 3000, discount: "-", payment: 3000, status: "保留", taxi: "要" },
  { id: "booking0", member: "花ちゃん", number: "KNS0002", datetime: "2026/6/23\n23:00-25:00", people: "2名", price: 6000, discount: "-", payment: 6000, status: "保留", taxi: "不要" },
  { id: "booking0", member: "鈴木一郎", number: "KNS0003", datetime: "2026/6/25\n5:00-7:00", people: "1名", price: 3000, discount: "-", payment: 3000, status: "保留", taxi: "不要" }
];

function yen(value) {
  return `¥${Number(value || 0).toLocaleString("ja-JP")}`;
}

function render() {
  logoutButton.classList.toggle("hidden", !state.currentUser);
  document.body.classList.toggle("is-login", !state.currentUser);
  document.body.classList.toggle("is-authenticated", !!state.currentUser);
  document.body.classList.toggle("is-member", state.currentUser?.role === "vip");
  document.body.classList.toggle("is-admin", state.currentUser?.role === "admin");
  appHeader.classList.toggle("hidden", !state.currentUser || state.currentUser?.role === "admin");
  if (!state.currentUser) {
    renderLogin();
    return;
  }
  renderShell();
}

function renderShell() {
  const role = state.currentUser.role;
  const active = state.activePage || (role === "admin" ? "adminMenu" : credentials[role].firstPage);
  if (role === "admin") {
    app.innerHTML = `
      <div class="admin-app-shell">
        <header class="admin-topbar">
          <button class="admin-brand" type="button" data-page="adminMenu">
            <span class="admin-shield" aria-hidden="true"></span>
            <span><small>ADMIN PANEL</small><strong>KONOSU</strong></span>
          </button>
          <nav class="admin-horizontal-nav">
            ${adminNavItems.map(([key, label]) => `<button class="admin-nav-button ${active === key ? "active" : ""}" type="button" data-page="${key}">${label}</button>`).join("")}
          </nav>
          <button class="admin-top-logout" type="button">ログアウト</button>
        </header>
        <section class="admin-content" id="screen"></section>
      </div>
    `;
  } else if (role === "vip") {
    app.innerHTML = `
      <div class="member-shell">
        <nav class="member-topbar">
          <button class="member-logo" type="button" data-page="mypage">
            <span class="mini-flame" aria-hidden="true"></span>
            <span>PRIVATE SAUNA<br><strong>KONOSU</strong></span>
          </button>
          <div class="member-nav">
            ${[
              ["memberMenu", "メニュー"],
              ["booking", "予約する"],
              ["myReservations", "マイ予約"],
              ["notices", "お知らせ"],
              ["mypage", "マイページ"],
              ["settings", "設定"]
            ].map(([key, label]) => `<button class="member-nav-button ${active === key ? "active" : ""}" data-page="${key}" type="button">${label}</button>`).join("")}
          </div>
          <div class="member-account">
            <div class="member-account-text">
              <strong>デモユーザー1</strong>
              <span>SC-1000-0001</span>
            </div>
            <button class="member-logout" type="button" aria-label="ログアウト" title="ログアウト">
              <span aria-hidden="true"></span>
            </button>
          </div>
        </nav>
        <section class="member-screen" id="screen"></section>
      </div>
    `;
  } else {
    app.innerHTML = `
      <div class="layout">
        <aside class="sidebar">
          <p class="eyebrow">Menu</p>
          ${menus[role].map(([key, label]) => `<button class="menu-button ${active === key ? "active" : ""}" data-page="${key}" type="button">${label}</button>`).join("")}
        </aside>
        <section class="screen" id="screen"></section>
      </div>
    `;
  }

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePage = button.dataset.page;
      saveState();
      renderShell();
    });
  });

  document.querySelector(".member-logout")?.addEventListener("click", logoutCurrentUser);
  document.querySelector(".admin-top-logout")?.addEventListener("click", logoutCurrentUser);
  renderPage(active);
}

function logoutCurrentUser() {
  state.currentUser = null;
  state.authTab = "login";
  saveState();
  showToast("ログアウトしました。");
  render();
}

function renderPage(page) {
  const pages = {
    memberMenu: renderMemberMenu,
    mypage: renderMyPage,
    register: renderRegister,
    invitation: renderInvitation,
    booking: renderBooking,
    myReservations: renderMyReservations,
    history: renderHistory,
    stamps: renderStamps,
    qr: renderQr,
    settings: renderVipSettings,
    notices: renderNotices,
    adminMenu: renderAdminMenu,
    systemOverview: renderAdminMenu,
    clientSettings: renderAdminMenu,
    partnerOverview: renderAdminMenu,
    adminDashboard: renderAdminMenu,
    analytics: renderAnalytics,
    scoring: renderScoring,
    members: renderMembers,
    reservationAdmin: renderReservationAdmin,
    secretSlots: renderSecretSlots,
    referralCodes: renderReferralCodes,
    noticeAdmin: renderNoticeAdmin,
    adminAccount: renderAdminAccount,
    adminSettings: renderAdminSettings,
    partnerDashboard: renderPartnerDashboard,
    partnerCustomers: renderPartnerCustomers,
    kickbacks: renderKickbacks
  };
  (pages[page] || (state.currentUser?.role === "admin" ? pages.adminMenu : pages.mypage))();
}

function renderAdminMenu() {
  document.getElementById("screen").innerHTML = `
    <section class="admin-menu-page">
      <div class="admin-page-title">
        <h2>管理者メニュー</h2>
        <p>PRIVATE SAUNA KONOSUの管理機能にアクセスできます</p>
      </div>
      <div class="admin-menu-stats">
        <article class="admin-mini-stat"><span class="line-icon users"></span><strong>156</strong><p>登録会員数</p></article>
        <article class="admin-mini-stat"><span class="line-icon calendar"></span><strong>8</strong><p>本日の予約</p></article>
        <article class="admin-mini-stat"><span class="line-icon gift"></span><strong>12</strong><p>有効な紹介コード</p></article>
        <article class="admin-mini-stat"><span class="line-icon notice"></span><strong>3</strong><p>配信待ちお知らせ</p></article>
      </div>
      <div class="admin-card-grid">
        ${adminMenuCards.map((card) => `
          <button class="admin-menu-card ${card.color}" type="button" data-page="${card.page}">
            <div class="admin-card-head">
              <span class="line-icon ${card.icon}"></span>
              <div><h3>${card.title}</h3><p>${card.text}</p></div>
            </div>
            <div class="admin-card-foot"><span>${card.note}</span><b>›</b></div>
          </button>
        `).join("")}
      </div>
      <section class="admin-flow-card">
        <h3>VIP抽出から予約までの流れ</h3>
        <div class="admin-flow-grid">
          <div><b>1</b><strong>顧客DB連携</strong><p>提携先の既存顧客データを取り込みます。</p></div>
          <div><b>2</b><strong>RFMランク判定</strong><p>提携先ごとのRFM順位で、上位5%以内だけをSランクVIPとして判定します。</p></div>
          <div><b>3</b><strong>シークレット招待</strong><p>Sランクの顧客だけに招待を送信します。</p></div>
          <div><b>4</b><strong>予約と還元</strong><p>来店済み予約だけ10%の報酬対象にします。</p></div>
        </div>
      </section>
    </section>
  `;
  document.querySelectorAll(".admin-menu-card").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePage = button.dataset.page;
      saveState();
      renderShell();
    });
  });
}

function renderMembers() {
  document.getElementById("screen").innerHTML = `
    <section class="admin-list-page">
      <div class="admin-page-title">
        <h2>会員管理</h2>
        <p>登録会員: ${adminMembers.length}名</p>
      </div>
      <label class="admin-search-box">
        <span></span>
        <input id="memberSearch" placeholder="会員番号、氏名で検索..." autocomplete="off">
      </label>
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead>
            <tr><th>会員番号</th><th>氏名</th><th>ニックネーム</th><th>メール</th><th>提携先</th><th>VIP</th><th>スタンプ</th><th>訪問回数</th><th>操作</th></tr>
          </thead>
          <tbody id="memberRows">${memberRowsHtml(adminMembers)}</tbody>
        </table>
      </div>
    </section>
  `;
  document.getElementById("memberSearch").addEventListener("input", (event) => {
    const keyword = event.target.value.trim().toLowerCase();
    const filtered = adminMembers.filter((member) => `${member.number}${member.name}${member.email}${member.partner}`.toLowerCase().includes(keyword));
    document.getElementById("memberRows").innerHTML = memberRowsHtml(filtered);
  });
}

function memberRowsHtml(members) {
  if (!members.length) return `<tr><td colspan="9" class="empty-cell">データがありません</td></tr>`;
  return members.map((member) => `
    <tr>
      <td>${member.number}</td>
      <td>${member.name}</td>
      <td>${member.nick}</td>
      <td>${member.email}</td>
      <td><span class="partner-tag">${member.partner}</span></td>
      <td>${member.vip ? `<span class="vip-chip">VIP</span>` : "-"}</td>
      <td>${member.stamp}</td>
      <td>${member.visits}</td>
      <td><button class="text-link-button" type="button" onclick="showToast('${member.name}の詳細を表示しました。')">詳細</button></td>
    </tr>
  `).join("");
}

function renderReservationAdmin() {
  document.getElementById("screen").innerHTML = `
    <section class="admin-list-page">
      <div class="admin-page-title">
        <h2>予約管理</h2>
        <p>総予約数: 10件　総売上: ¥17,500</p>
      </div>
      <div class="admin-filter-row">
        <label class="admin-search-box"><span></span><input placeholder="会員番号、氏名で検索..."></label>
        <label class="admin-select-box"><span></span><select><option>すべてのステータス</option><option>完了</option><option>保留</option></select></label>
      </div>
      <div class="admin-kpi-grid">
        <article><span>総予約数</span><strong>10</strong></article>
        <article><span>完了</span><strong class="green-number">5</strong></article>
        <article><span>保留</span><strong class="red-number">5</strong></article>
        <article><span>総売上</span><strong class="blue-number">¥17,500</strong></article>
      </div>
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead><tr><th>予約ID</th><th>会員</th><th>日時</th><th>人数</th><th>料金</th><th>割引</th><th>支払額</th><th>ステータス</th><th>タクシー</th><th>操作</th></tr></thead>
          <tbody>
            ${adminBookings.map((booking) => `
              <tr>
                <td>${booking.id}</td>
                <td>${booking.member}<br><small>${booking.number}</small></td>
                <td>${booking.datetime.replace("\n", "<br>")}</td>
                <td>${booking.people}</td>
                <td>${yen(booking.price)}</td>
                <td>${booking.discount}</td>
                <td><strong>${yen(booking.payment)}</strong></td>
                <td><span class="status-chip">${booking.status}</span></td>
                <td><span class="taxi-chip">${booking.taxi}</span></td>
                <td><button class="row-icon edit" onclick="showToast('予約を編集しました。')" type="button"></button><button class="row-icon delete" onclick="showToast('予約を削除しました。')" type="button"></button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalytics() {
  const rows = [
    ["6/10", 9800, 1, 9800, 35],
    ["6/11", 21600, 2, 10800, 48],
    ["6/12", 38400, 3, 12800, 62],
    ["6/13", 28600, 2, 14300, 54],
    ["6/14", 45200, 4, 11300, 76]
  ];
  screenHtml("売上分析", "日別売上、予約数、平均客単価、アイドルタイム稼働率を表示します。", `
    <div class="admin-chart-card admin-sales-card">
      ${rows.map(([day, sales, count, average, rate]) => `
        <div class="admin-bar-row"><span>${day}</span><div class="admin-bar-track"><div class="admin-bar-fill" style="width:${rate}%"></div></div><strong>${rate}%</strong></div>
        <p>${yen(sales)} / ${count}件 / 平均 ${yen(average)}</p>
      `).join("")}
    </div>
  `);
}

adminNavItems.splice(2, 0, ["scoring", "VIP自動抽出"]);

function getCustomerKey(customer) {
  return customer?.id || `${customer?.partner || ""}:${customer?.name || ""}:${customer?.email || ""}`;
}

function numericValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function rankCustomers(customers, valueGetter, direction = "desc") {
  const sorted = [...customers].sort((a, b) => {
    const left = valueGetter(a);
    const right = valueGetter(b);
    if (left === right) return getCustomerKey(a).localeCompare(getCustomerKey(b), "ja");
    return direction === "asc" ? left - right : right - left;
  });
  const ranks = new Map();
  let previousValue;
  let currentRank = 0;
  sorted.forEach((item, index) => {
    const value = valueGetter(item);
    if (index === 0 || value !== previousValue) {
      currentRank = index + 1;
      previousValue = value;
    }
    ranks.set(getCustomerKey(item), currentRank);
  });
  return ranks;
}

function calculatePartnerRfmRows(partnerName) {
  const partnerCustomers = state.partnerCustomers.filter((item) => item.partner === partnerName);
  const count = partnerCustomers.length;
  if (!count) return [];

  const recencyRanks = rankCustomers(partnerCustomers, (item) => numericValue(item.recentDays, 999), "asc");
  const frequencyRanks = rankCustomers(partnerCustomers, (item) => numericValue(item.frequency), "desc");
  const monetaryRanks = rankCustomers(partnerCustomers, (item) => numericValue(item.amount), "desc");

  return partnerCustomers
    .map((item) => {
      const key = getCustomerKey(item);
      const recencyRank = recencyRanks.get(key) || count;
      const frequencyRank = frequencyRanks.get(key) || count;
      const monetaryRank = monetaryRanks.get(key) || count;
      const recencyScore = count - recencyRank + 1;
      const frequencyScore = count - frequencyRank + 1;
      const monetaryScore = count - monetaryRank + 1;
      return {
        customer: item,
        key,
        count,
        recencyRank,
        frequencyRank,
        monetaryRank,
        recencyScore,
        frequencyScore,
        monetaryScore,
        totalScore: recencyScore + frequencyScore + monetaryScore
      };
    })
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      const aRankSum = a.recencyRank + a.frequencyRank + a.monetaryRank;
      const bRankSum = b.recencyRank + b.frequencyRank + b.monetaryRank;
      if (aRankSum !== bRankSum) return aRankSum - bRankSum;
      return a.key.localeCompare(b.key, "ja");
    })
    .map((item, index) => ({ ...item, totalRank: index + 1 }));
}

function calculateRfmVipEligibility(customer) {
  if (!customer) {
    return { checks: [], passedCount: 0, totalCount: 3, rank: "C", scoreLabel: "RFM順位未算出", isVip: false };
  }

  const rows = calculatePartnerRfmRows(customer.partner);
  const current = rows.find((item) => item.key === getCustomerKey(customer));
  if (!current) {
    return { checks: [], passedCount: 0, totalCount: 3, rank: "C", scoreLabel: "RFM順位未算出", isVip: false };
  }

  const vipCutoff = Math.max(1, Math.ceil(current.count * 0.05));
  const isVip = current.totalRank <= vipCutoff;
  const rank = isVip ? "S" : "C";

  return {
    checks: [
      { label: `R ${current.recencyRank}/${current.count}位（直近${customer.recentDays}日前）` },
      { label: `F ${current.frequencyRank}/${current.count}位（月${customer.frequency}回）` },
      { label: `M ${current.monetaryRank}/${current.count}位（${yen(customer.amount)}）` }
    ],
    passedCount: isVip ? 3 : 0,
    totalCount: 3,
    rank,
    scoreLabel: `総合${current.totalRank}/${current.count}位 / VIP基準: 上位5%以内（抽出枠${vipCutoff}名）`,
    isVip,
    rfmScore: current.totalScore,
    vipCutoff
  };
}

function calculateVipEligibility(customer) {
  return calculateRfmVipEligibility(customer);
}

function renderScoring() {
  const stats = getVipPipelineStats();
  screenHtml("VIP自動抽出", "提携先ごとにRFMを順位付けし、合計順位スコア上位5%のSランク顧客だけにシークレット招待を送信します。", `
    <div class="vip-pipeline-grid">
      <div class="vip-pipeline-card"><span>顧客DB</span><strong>${stats.total}件</strong><p>提携先から連携済み</p></div>
      <div class="vip-pipeline-card"><span>VIP判定基準</span><strong>上位5%</strong><p>提携先ごとに個別判定</p></div>
      <div class="vip-pipeline-card"><span>SランクVIP</span><strong>${stats.vip}件</strong><p>上位5%以内の招待対象</p></div>
      <div class="vip-pipeline-card"><span>招待送信済み</span><strong>${stats.invited}件</strong><p>予約画面アクセス許可済み</p></div>
    </div>
    ${customerTable(true)}
  `);
}

function customerTable(showInvite) {
  return emptyMessage(state.partnerCustomers, `
    <div class="admin-table-card"><table class="admin-data-table scoring-table">
      <thead>
        <tr><th>顧客名</th><th>提携先</th><th>顧客層</th><th>最新利用日</th><th>頻度</th><th>決済額</th><th>追加条件</th><th>ランク</th><th>RFM順位</th><th>VIP判定</th><th>操作</th></tr>
      </thead>
      <tbody>${state.partnerCustomers.map((customer) => {
        const score = calculateVipEligibility(customer);
        return `<tr>
          <td>${customer.name}</td>
          <td>${customer.partner}</td>
          <td>${customer.segment || "-"}</td>
          <td>${customer.recentDays}日前</td>
          <td>月${customer.frequency}回</td>
          <td>${customer.amountLabel || "決済額"}<br><strong>${yen(customer.amount)}</strong></td>
          <td>${customer.id === "c2" || customer.id === "c5" ? `平日昼利用 ${customer.weekdayIdleRate}%` : customer.id === "c3" ? `継続 ${customer.continuousMonths}ヶ月` : "-"}</td>
          <td><span class="rank-badge rank-${score.rank.toLowerCase()}">${score.rank}</span></td>
          <td>${score.scoreLabel}<br><span class="muted">${score.checks.map((check) => check.label).join("<br>")}</span></td>
          <td><span class="${score.isVip ? "vip-chip" : "status-chip"}">${score.isVip ? "招待可能" : "通常"}</span></td>
          <td>${showInvite && score.isVip ? `<button class="primary-button" onclick="sendInvitation('${customer.id}')">招待送信</button>` : "-"}</td>
        </tr>`;
      }).join("")}</tbody>
    </table></div>
  `);
}

function sendInvitation(customerId) {
  const customer = state.partnerCustomers.find((item) => item.id === customerId);
  if (!customer) return showToast("顧客データが見つかりません。", "error");
  const score = calculateVipEligibility(customer);
  if (!score.isVip) return showToast("VIP基準未達のため招待できません。", "error");
  state.vipUser.invited = true;
  state.vipUser.name = customer.name;
  state.vipUser.partner = customer.partner;
  state.vipUser.vipScore = `VIPランク ${score.rank} / ${score.scoreLabel}`;
  state.vipUser.invitationReason = `${customer.partner}の顧客DB内でRFM合計順位スコアが上位5%に入り、Sランク顧客として判定されたため、シークレット枠へ招待されました。`;
  saveState();
  showToast(`${customer.name}さんへシークレット招待を送信しました。`);
  renderShell();
}

credentials.admin.firstPage = "adminMenu";
if (state.currentUser?.role === "admin" && ["systemOverview", "clientSettings", "partnerOverview", "adminDashboard"].includes(state.activePage)) {
  state.activePage = "adminMenu";
  saveState();
}

function yen(value) {
  return `¥${Number(value || 0).toLocaleString("ja-JP")}`;
}

function renderReservationAdmin() {
  const bookings = [
    { id: "booking0", member: "タロー", number: "KNS0001", datetime: "2026/6/20\n6:00-8:00", people: "1名", price: 3000, discount: "-", payment: 3000, status: "保留", taxi: "要" },
    { id: "booking0", member: "花ちゃん", number: "KNS0002", datetime: "2026/6/23\n23:00-25:00", people: "2名", price: 6000, discount: "-", payment: 6000, status: "保留", taxi: "不要" },
    { id: "booking0", member: "鈴木一郎", number: "KNS0003", datetime: "2026/6/25\n5:00-7:00", people: "1名", price: 3000, discount: "-", payment: 3000, status: "保留", taxi: "不要" },
    { id: "booking0", member: "タロー", number: "KNS0001", datetime: "2026/6/28\n22:00-24:00", people: "1名", price: 3000, discount: "-", payment: 3000, status: "保留", taxi: "要" },
    { id: "booking0", member: "鈴木一郎", number: "KNS0003", datetime: "2026/6/18\n22:00-24:00", people: "2名", price: 6000, discount: "-", payment: 6000, status: "保留", taxi: "不要" },
    { id: "booking0", member: "花ちゃん", number: "KNS0002", datetime: "2026/6/17\n5:00-7:00", people: "1名", price: 3000, discount: "-", payment: 3000, status: "完了", taxi: "不要" },
    { id: "booking0", member: "タロー", number: "KNS0001", datetime: "2026/6/16\n23:00-25:00", people: "1名", price: 3000, discount: "-", payment: 3000, status: "完了", taxi: "要" },
    { id: "booking0", member: "鈴木一郎", number: "KNS0003", datetime: "2026/6/15\n6:00-8:00", people: "1名", price: 3000, discount: "-¥500", payment: 2500, status: "完了", taxi: "不要" },
    { id: "booking0", member: "花ちゃん", number: "KNS0002", datetime: "2026/6/13\n22:00-24:00", people: "2名", price: 6000, discount: "-", payment: 6000, status: "完了", taxi: "要" },
    { id: "booking0", member: "タロー", number: "KNS0001", datetime: "2026/6/11\n5:00-7:00", people: "1名", price: 3000, discount: "-", payment: 3000, status: "完了", taxi: "不要" }
  ];
  document.getElementById("screen").innerHTML = `
    <section class="admin-list-page">
      <div class="admin-page-title">
        <h2>予約管理</h2>
        <p>総予約数: 10件　総売上: ¥17,500</p>
      </div>
      <div class="admin-filter-row">
        <label class="admin-search-box"><span></span><input placeholder="会員番号、氏名で検索..."></label>
        <label class="admin-select-box"><span></span><select><option>すべてのステータス</option><option>完了</option><option>保留</option></select></label>
      </div>
      <div class="admin-kpi-grid">
        <article><span>総予約数</span><strong>10</strong></article>
        <article><span>完了</span><strong class="green-number">5</strong></article>
        <article><span>保留</span><strong class="red-number">5</strong></article>
        <article><span>総売上</span><strong class="blue-number">¥17,500</strong></article>
      </div>
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead><tr><th>予約ID</th><th>会員</th><th>日時</th><th>人数</th><th>料金</th><th>割引</th><th>支払額</th><th>ステータス</th><th>タクシー</th><th>操作</th></tr></thead>
          <tbody>
            ${bookings.map((booking) => `
              <tr>
                <td>${booking.id}</td>
                <td>${booking.member}<br><small>${booking.number}</small></td>
                <td>${booking.datetime.replace("\n", "<br>")}</td>
                <td>${booking.people}</td>
                <td>${yen(booking.price)}</td>
                <td class="${booking.discount.includes("¥") ? "discount-text" : ""}">${booking.discount}</td>
                <td><strong>${yen(booking.payment)}</strong></td>
                <td><span class="status-chip ${booking.status === "完了" ? "done" : ""}">${booking.status}</span></td>
                <td><span class="taxi-chip ${booking.taxi === "不要" ? "muted-chip" : ""}">${booking.taxi}</span></td>
                <td><button class="row-icon edit" onclick="showToast('予約を編集しました。')" type="button"></button><button class="row-icon delete" onclick="showToast('予約を削除しました。')" type="button"></button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalytics() {
  const actualPoints = "40,265 70,265 100,265 130,265 160,265 190,265 220,265 250,265 280,265 310,265 340,118 370,265 400,38 430,265 460,142 490,118 520,118 550,265 580,265";
  const predictPoints = "610,180 640,174 670,168 700,162 730,156 760,150";
  document.getElementById("screen").innerHTML = `
    <section class="sales-page">
      <div class="admin-page-title">
        <h2>売上分析・予測</h2>
        <p>総売上の実績データからAIが将来の売上を予測します</p>
      </div>
      <div class="sales-summary-grid">
        <article class="sales-summary-card blue"><span class="line-icon users"></span><div><p>総予約数</p><strong>10</strong><small>累計予約</small></div></article>
        <article class="sales-summary-card green"><span class="sales-dollar">$</span><div><p>総売上（実績）</p><strong>¥17,500</strong><small>累計売上</small></div></article>
        <article class="sales-summary-card purple"><span class="sales-target"></span><div><p>予測売上</p><strong>¥13,806</strong><small>今後7日間</small></div></article>
        <article class="sales-summary-card orange"><span class="line-icon chart"></span><div><p>売上トレンド</p><strong>上昇</strong><small>日平均 ¥583</small></div></article>
      </div>
      <div class="sales-controls">
        <div><h3>表示期間</h3><button>週間</button><button class="active dark">月間</button><button>年間</button></div>
        <div><h3>予測期間</h3><button>3日後</button><button class="active purple">7日後</button><button>14日後</button><button>30日後</button></div>
      </div>
      <section class="sales-graph-card">
        <h3>売上予測グラフ</h3>
        <p>青色：実績データ / 紫色：AI予測データ（線形回帰モデルを使用）</p>
        <svg class="sales-svg" viewBox="0 0 820 320" role="img" aria-label="売上予測グラフ">
          <defs>
            <linearGradient id="predictFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#7d46d9" stop-opacity="0.18"/>
              <stop offset="100%" stop-color="#7d46d9" stop-opacity="0.02"/>
            </linearGradient>
          </defs>
          ${[60,105,150,195,240,285].map((y) => `<line x1="40" y1="${y}" x2="780" y2="${y}" />`).join("")}
          ${Array.from({ length: 25 }, (_, index) => `<line x1="${40 + index * 30}" y1="40" x2="${40 + index * 30}" y2="285" />`).join("")}
          <text x="12" y="62">¥6k</text><text x="12" y="123">¥5k</text><text x="12" y="184">¥3k</text><text x="12" y="270">¥0k</text>
          <polyline class="actual-line" points="${actualPoints}" />
          ${actualPoints.split(" ").map((point) => {
            const [x, y] = point.split(",");
            return `<circle class="actual-dot" cx="${x}" cy="${y}" r="4" />`;
          }).join("")}
          <polygon class="predict-area" points="610,180 640,174 670,168 700,162 730,156 760,150 760,265 610,265" />
          <polyline class="predict-line" points="${predictPoints}" />
          ${predictPoints.split(" ").map((point) => {
            const [x, y] = point.split(",");
            return `<circle class="predict-dot" cx="${x}" cy="${y}" r="4" />`;
          }).join("")}
          ${["5/21","5/24","5/27","5/30","6/2","6/5","6/8","6/11","6/14","6/17","6/20","6/23","6/26"].map((label, index) => `<text x="${40 + index * 60}" y="304">${label}</text>`).join("")}
        </svg>
        <div class="graph-legend"><span class="actual"></span>実績売上 <span class="predict"></span>予測売上</div>
      </section>
      <section class="forecast-detail">
        <h3>予測分析詳細</h3>
        <p>アイドルタイム予約の増加により、直近7日間は緩やかな売上上昇が見込まれます。</p>
      </section>
    </section>
  `;
}

function renderAnalytics() {
  const actualPoints = "40,265 70,265 100,265 130,265 160,265 190,265 220,265 250,265 280,265 310,265 340,118 370,265 400,38 430,265 460,142 490,118 520,118 550,265 580,265";
  const predictPoints = "610,180 640,174 670,168 700,162 730,156 760,150";
  const forecastRows = [
    ["6/20", "+1日後", 1747, "199.5%"],
    ["6/21", "+2日後", 1822, "212.3%"],
    ["6/22", "+3日後", 1897, "225.2%"],
    ["6/23", "+4日後", 1972, "238.1%"],
    ["6/24", "+5日後", 2047, "250.9%"],
    ["6/25", "+6日後", 2123, "263.9%"],
    ["6/26", "+7日後", 2198, "276.8%"]
  ];
  const actualRows = [
    ["6/19", "0件", 0, 0],
    ["6/18", "1件", 0, 0],
    ["6/17", "1件", 3000, 3000],
    ["6/16", "1件", 3000, 3000],
    ["6/15", "1件", 2500, 2500],
    ["6/14", "0件", 0, 0],
    ["6/13", "1件", 6000, 6000],
    ["6/12", "0件", 0, 0],
    ["6/11", "1件", 3000, 3000],
    ["6/10", "0件", 0, 0]
  ];
  document.getElementById("screen").innerHTML = `
    <section class="sales-page">
      <div class="admin-page-title">
        <h2>売上分析・予測</h2>
        <p>総売上の実績データからAIが将来の売上を予測します</p>
      </div>
      <div class="sales-summary-grid">
        <article class="sales-summary-card blue"><span class="line-icon users"></span><div><p>総予約数</p><strong>10</strong><small>累計予約</small></div></article>
        <article class="sales-summary-card green"><span class="sales-dollar">$</span><div><p>総売上（実績）</p><strong>¥17,500</strong><small>累計売上</small></div></article>
        <article class="sales-summary-card purple"><span class="sales-target"></span><div><p>予測売上</p><strong>¥13,806</strong><small>今後7日間</small></div></article>
        <article class="sales-summary-card orange"><span class="line-icon chart"></span><div><p>売上トレンド</p><strong>上昇</strong><small>日平均 ¥583</small></div></article>
      </div>
      <div class="sales-controls">
        <div><h3>表示期間</h3><button>週間</button><button class="active dark">月間</button><button>年間</button></div>
        <div><h3>予測期間</h3><button>3日後</button><button class="active purple">7日後</button><button>14日後</button><button>30日後</button></div>
      </div>
      <section class="sales-graph-card">
        <h3>売上予測グラフ</h3>
        <p>青色：実績データ / 紫色：AI予測データ（線形回帰モデルを使用）</p>
        <svg class="sales-svg" viewBox="0 0 820 320" role="img" aria-label="売上予測グラフ">
          <defs><linearGradient id="predictFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#7d46d9" stop-opacity="0.18"/><stop offset="100%" stop-color="#7d46d9" stop-opacity="0.02"/></linearGradient></defs>
          ${[60,105,150,195,240,285].map((y) => `<line x1="40" y1="${y}" x2="780" y2="${y}" />`).join("")}
          ${Array.from({ length: 25 }, (_, index) => `<line x1="${40 + index * 30}" y1="40" x2="${40 + index * 30}" y2="285" />`).join("")}
          <text x="12" y="62">¥6k</text><text x="12" y="123">¥5k</text><text x="12" y="184">¥3k</text><text x="12" y="270">¥0k</text>
          <polyline class="actual-line" points="${actualPoints}" />
          ${actualPoints.split(" ").map((point) => { const [x, y] = point.split(","); return `<circle class="actual-dot" cx="${x}" cy="${y}" r="4" />`; }).join("")}
          <polygon class="predict-area" points="610,180 640,174 670,168 700,162 730,156 760,150 760,265 610,265" />
          <polyline class="predict-line" points="${predictPoints}" />
          ${predictPoints.split(" ").map((point) => { const [x, y] = point.split(","); return `<circle class="predict-dot" cx="${x}" cy="${y}" r="4" />`; }).join("")}
          ${["5/21","5/24","5/27","5/30","6/2","6/5","6/8","6/11","6/14","6/17","6/20","6/23","6/26"].map((label, index) => `<text x="${40 + index * 60}" y="304">${label}</text>`).join("")}
        </svg>
        <div class="graph-legend"><span class="actual"></span>実績売上 <span class="predict"></span>予測売上</div>
      </section>
      <section class="forecast-detail">
        <h3><span class="target-dot"></span>予測分析詳細</h3>
        <div class="forecast-metrics">
          <article><span>予測合計売上</span><strong>¥13,806</strong><p>今後7日間</p></article>
          <article><span>予測日平均売上</span><strong>¥1,972</strong><p>1日あたり</p></article>
          <article><span>トレンド傾向</span><strong>上昇傾向</strong><p>傾き: +75.08</p></article>
        </div>
        <div class="algorithm-note"><strong>AI予測アルゴリズム：</strong>線形回帰モデルを使用して、過去30日間の売上データからトレンドを分析し、今後7日間の売上を予測しています。予測値は <code>y = 75.08x + -505.38</code> の式で算出されます。</div>
      </section>
      <section class="forecast-table-card">
        <h3>予測データ詳細</h3>
        <table>
          <thead><tr><th>日付</th><th>予測売上</th><th>実績比較</th></tr></thead>
          <tbody>
            ${forecastRows.map(([date, offset, sales, ratio]) => `<tr><td>${date} <small>${offset}</small></td><td><span class="purple-pill">¥${sales.toLocaleString("ja-JP")}</span></td><td>日平均 ¥583 の <strong>${ratio}</strong></td></tr>`).join("")}
            <tr class="total-row"><td>合計</td><td><span class="purple-pill strong">¥13,806</span></td><td>7日間の予測合計</td></tr>
          </tbody>
        </table>
      </section>
      <section class="forecast-table-card">
        <h3>実績データ（最新10件）</h3>
        <table>
          <thead><tr><th>日付</th><th>予約数</th><th>平均売上</th><th>総売上</th></tr></thead>
          <tbody>
            ${actualRows.map(([date, count, average, total]) => `<tr><td>${date}</td><td><span class="blue-pill">${count}</span></td><td><span class="orange-pill">¥${average.toLocaleString("ja-JP")}</span></td><td><span class="green-pill">¥${total.toLocaleString("ja-JP")}</span></td></tr>`).join("")}
          </tbody>
        </table>
        <p class="table-footnote">最新10件を表示 / 全30件</p>
      </section>
    </section>
  `;
}

function renderReferralCodes() {
  const rows = [
    ["SMILE2024", "SMILE_INNOVATION", "スマイルイノベーション矯正歯科"],
    ["KOKUSAI24", "KOKUSAI_MOTORS", "国際自動車株式会社"],
    ["ANKO2024", "THE_ANKO", "theANKo"]
  ];
  document.getElementById("screen").innerHTML = `
    <section class="admin-list-page">
      <div class="admin-page-title with-action">
        <div><h2>紹介コード管理</h2><p>発行済み: 3件</p></div>
        <button class="admin-create-button" onclick="showToast('紹介コードを生成しました。')" type="button">＋ 紹介コード生成</button>
      </div>
      <div class="admin-filter-row referral-filter">
        <label class="admin-search-box"><span></span><input placeholder="紹介コード、提携先コード、提携先名で検索..."></label>
        <label class="admin-select-box"><span></span><select><option>すべて</option><option>有効</option><option>無効</option></select></label>
      </div>
      <div class="admin-table-card">
        <table class="admin-data-table referral-table">
          <thead><tr><th>紹介コード</th><th>提携先コード</th><th>提携先名</th><th>ステータス</th><th>操作</th></tr></thead>
          <tbody>
            ${rows.map(([code, partnerCode, partner]) => `<tr><td><strong>${code}</strong> <button class="copy-mini" onclick="showToast('コピーしました。')" type="button"></button></td><td>${partnerCode}</td><td>${partner}</td><td><span class="green-pill">有効</span></td><td><button class="small-gray-button">無効化</button><button class="row-icon delete" onclick="showToast('紹介コードを削除しました。')" type="button"></button></td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderNoticeAdmin() {
  document.getElementById("screen").innerHTML = `
    <section class="admin-list-page">
      <div class="admin-page-title with-action">
        <div><h2>お知らせ</h2><p>登録件数: 0件</p></div>
        <button class="admin-create-button" onclick="showToast('新規お知らせ作成画面を開きました。')" type="button">＋ 新規お知らせ作成</button>
      </div>
      <div class="empty-admin-card">
        <span class="line-icon notice"></span>
        <p>お知らせが登録されていません</p>
      </div>
    </section>
  `;
}

function renderSecretSlots() {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const blanksBefore = Array.from({ length: 1 }, () => "");
  const monthDays = Array.from({ length: 30 }, (_, index) => String(index + 1));
  const blanksAfter = Array.from({ length: 4 }, () => "");
  const cells = [...blanksBefore, ...monthDays, ...blanksAfter];
  document.getElementById("screen").innerHTML = `
    <section class="booking-form-page">
      <div class="admin-page-title">
        <h2>予約フォーム作成</h2>
        <p>予約可能な時間帯を設定します</p>
      </div>
      <section class="idle-info-card">
        <span class="line-icon clock"></span>
        <div>
          <h3>アイドルタイムとは？</h3>
          <p>早朝・深夜など通常営業時間外の時間帯を有効活用するための会員限定予約時間帯です。日付をクリックして個別に設定できます。</p>
        </div>
      </section>
      <section class="calendar-card">
        <div class="calendar-head">
          <button type="button" aria-label="前月">‹</button>
          <h3>2026年 6月</h3>
          <button type="button" aria-label="翌月">›</button>
        </div>
        <div class="calendar-weekdays">
          ${days.map((day) => `<span>${day}</span>`).join("")}
        </div>
        <div class="calendar-grid">
          ${cells.map((day) => day ? `<button class="calendar-cell ${day === "19" ? "today" : ""}" type="button" onclick="showToast('6月${day}日の予約枠設定を開きました。')"><span>${day}</span></button>` : `<div class="calendar-cell empty"></div>`).join("")}
        </div>
        <div class="calendar-legend">
          <span><i class="today"></i>今日</span>
          <span><i class="configured"></i>設定済み</span>
          <span><i class="blocked"></i>予約不可</span>
          <span><i class="none"></i>設定なし</span>
        </div>
      </section>
    </section>
  `;
}

function renderAdminAccount() {
  document.getElementById("screen").innerHTML = `
    <section class="admin-account-page">
      <div class="admin-page-title">
        <h2>管理者アカウント</h2>
      </div>
      <div class="admin-account-grid">
        <section class="admin-profile-card">
          <div class="admin-profile-main">
            <div class="admin-avatar">山</div>
            <div><h3>山田太郎</h3><p>社員番号: 12345</p></div>
          </div>
          <div class="admin-profile-list">
            <div><span class="profile-row-icon user"></span><p>氏名<br><strong>山田太郎</strong></p></div>
            <div><span class="profile-row-icon shield"></span><p>社員番号<br><strong>12345</strong></p></div>
            <div><span class="profile-row-icon mail"></span><p>メールアドレス<br><strong>admin@konosu.com</strong></p></div>
            <div><span class="profile-row-icon shield"></span><p>役割<br><strong>スーパー管理者</strong></p></div>
            <div><span class="profile-row-icon calendar"></span><p>作成日<br><strong>2025/1/10</strong></p></div>
          </div>
        </section>
        <aside class="admin-permission-column">
          <section class="permission-hero">
            <span class="admin-shield"></span>
            <p>アカウント権限</p>
            <h3>スーパー管理者</h3>
          </section>
          <section class="permission-card">
            <h3>管理者権限</h3>
            <ul>
              <li>会員情報の閲覧・編集</li>
              <li>予約管理</li>
              <li>お知らせの作成・配信</li>
              <li>予約フォーム作成設定</li>
              <li>システム設定</li>
            </ul>
          </section>
          <section class="credential-warning">
            <h3>認証情報の管理</h3>
            <p>社員番号、ログインID、メールアドレスは厳重に管理してください。第三者に共有しないようお願いします。</p>
          </section>
        </aside>
      </div>
    </section>
  `;
}

// =========================================================
// demo1 / demo2 member access override
// demo1: general user, no VIP booking
// demo2: invited VIP user, booking enabled
// =========================================================
credentials.vip2 = {
  label: "VIP招待ユーザー",
  email: "demo2@example.com",
  loginId: "demo2",
  password: "demo1234",
  firstPage: "memberMenu"
};

const previousRenderShellForMemberAccess = renderShell;

function isMemberRole(role) {
  return role === "vip" || role === "vip2";
}

function isInvitedVipUser() {
  return state.currentUser?.role === "vip2";
}

function getCurrentMemberProfile() {
  if (isInvitedVipUser()) {
    return {
      name: "デモユーザー2",
      shortName: "デ",
      memberNo: "SC-1000-0002",
      email: "demo2@example.com",
      partner: "国際自動車株式会社",
      status: "招待制VIP会員",
      badge: "INVITED GUEST",
      vip: true
    };
  }

  return {
    name: "デモユーザー1",
    shortName: "デ",
    memberNo: "SC-1000-0001",
    email: "demo1@example.com",
    partner: "スマイルイノベーション矯正歯科",
    status: "一般会員",
    badge: "STANDARD MEMBER",
    vip: false
  };
}

render = function render() {
  const role = state.currentUser?.role;
  logoutButton.classList.toggle("hidden", !state.currentUser);
  document.body.classList.toggle("is-login", !state.currentUser);
  document.body.classList.toggle("is-authenticated", !!state.currentUser);
  document.body.classList.toggle("is-member", isMemberRole(role));
  document.body.classList.toggle("is-vip-invited", isInvitedVipUser());
  document.body.classList.toggle("is-admin", role === "admin");
  appHeader.classList.toggle("hidden", !state.currentUser || role === "admin" || isMemberRole(role));

  if (!state.currentUser) {
    renderLogin();
    return;
  }

  renderShell();
};

renderShell = function renderShell() {
  const role = state.currentUser?.role;
  if (!isMemberRole(role)) {
    previousRenderShellForMemberAccess();
    return;
  }

  const profile = getCurrentMemberProfile();
  const active = state.activePage || "memberMenu";
  state.vipUser.name = profile.name;
  state.vipUser.email = profile.email;
  state.vipUser.partner = profile.partner;
  state.vipUser.invited = profile.vip;
  state.vipUser.vipScore = profile.vip ? "VIPランク S / 招待済み" : "VIP未判定";

  app.innerHTML = `
    <div class="member-shell ${profile.vip ? "vip-member-shell" : "general-member-shell"}">
      <section class="member-screen" id="screen"></section>
    </div>
  `;

  renderPage(active);
};

const previousRenderPageForMemberAccess = renderPage;

renderPage = function renderPage(page) {
  if (isMemberRole(state.currentUser?.role)) {
    const blockedPages = ["booking", "myReservations", "history", "invitation"];
    if (!isInvitedVipUser() && blockedPages.includes(page)) {
      renderMemberMenu();
      showToast("demo1では予約機能を表示しない設定です。", "error");
      return;
    }
  }

  previousRenderPageForMemberAccess(page);
};

function renderMemberMenu() {
  const profile = getCurrentMemberProfile();
  const menuItems = [
    profile.vip ? ["booking", "calendar", "予約する", "シークレット枠を予約"] : null,
    profile.vip ? ["myReservations", "list", "マイ予約", "予約内容を確認"] : null,
    ["notices", "notice", "お知らせ", "予約通知・メンテナンス"],
    ["mypage", "person", "マイページ", "会員情報を確認"],
    ["settings", "gear", "設定", "アカウント設定を変更"]
  ].filter(Boolean);

  document.getElementById("screen").innerHTML = `
    <div class="member-home ${profile.vip ? "vip-home" : "general-home"}">
      ${profile.vip ? `
        <section class="vip-lounge-hero">
          <div>
            <span class="vip-badge">VIP MEMBER</span>
            <span class="vip-badge subtle">INVITED GUEST</span>
          </div>
          <h2>${profile.name}様、特別招待枠へようこそ</h2>
          <p>提携先内RFM順位の上位5%判定により、PRIVATE SAUNA KONOSUのシークレット枠へ招待されています。</p>
        </section>
      ` : `
        <section class="general-locked-hero">
          <span class="standard-badge">STANDARD MEMBER</span>
          <h2>${profile.name}様</h2>
          <p>現在は一般ユーザー向けテストアカウントです。予約機能はVIP会員限定サービスのため利用できません。</p>
        </section>
      `}

      <section class="membership-card ${profile.vip ? "vip-membership-card" : ""}">
        <h2>会員証</h2>
        <div class="barcode-panel">
          <div class="barcode" aria-label="会員番号 ${profile.memberNo}">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <strong>${profile.memberNo}</strong>
        </div>
        <p>${profile.name}様</p>
      </section>

      <section class="profile-strip ${profile.vip ? "vip-profile-strip" : ""}">
        <div class="avatar-mark">${profile.shortName}</div>
        <div>
          <h3>${profile.name}様</h3>
          <p>会員番号: ${profile.memberNo} / ${profile.status}</p>
        </div>
      </section>

      ${profile.vip ? "" : `
        <section class="vip-service-preview">
          <div>
            <span>VIP会員限定サービス</span>
            <h3>シークレット枠予約</h3>
            <p>VIP会員になると、平日日中などの特別なアイドルタイム枠をご利用いただけます。</p>
          </div>
          <button type="button" onclick="goToPage('invitation')">招待状況を見る</button>
        </section>
      `}

      <section class="home-menu-grid">
        ${menuItems.map(([page, icon, title, text]) => `
          <button class="home-menu-card ${profile.vip ? "vip-menu-card" : ""}" type="button" data-page="${page}">
            <span class="menu-icon ${icon}"></span>
            <span>
              <strong>${title}</strong>
              <small>${text}</small>
            </span>
            <em>›</em>
          </button>
        `).join("")}
      </section>

      <section class="member-benefit ${profile.vip ? "vip-benefit" : ""}">
        <h3>${profile.vip ? "招待制VIP特典" : "招待ステータス"}</h3>
        <p>${profile.vip ? "アイドルタイム限定のシークレット予約をご利用いただけます。" : "VIP判定後に招待された会員のみ、予約機能をご利用いただけます。"}</p>
      </section>
    </div>
  `;

  document.querySelectorAll(".home-menu-card[data-page]").forEach((button) => {
    button.addEventListener("click", () => goToPage(button.dataset.page));
  });
};

function renderVipLockedPage() {
  const profile = getCurrentMemberProfile();
  document.getElementById("screen").innerHTML = `
    <section class="vip-locked-page">
      <span class="standard-badge">VIP LIMITED</span>
      <h2>予約機能はVIP会員限定サービスです</h2>
      <p>${profile.name}様の現在のアカウントでは、シークレット枠予約とマイ予約はご利用いただけません。</p>
      <div class="vip-locked-card">
        <h3>VIP会員になると予約機能をご利用いただけます</h3>
        <p>提携先の顧客データをもとにRFM順位判定が行われ、上位5%のお客様にだけ特別招待が届きます。</p>
      </div>
      <button class="primary-button" type="button" onclick="goToPage('memberMenu')">メニューへ戻る</button>
    </section>
  `;
}

function renderInvitation() {
  const profile = getCurrentMemberProfile();
  document.getElementById("screen").innerHTML = `
    <section class="${profile.vip ? "vip-invitation-page" : "vip-locked-page"}">
      <span class="${profile.vip ? "vip-badge" : "standard-badge"}">${profile.vip ? "INVITED GUEST" : "VIP LIMITED"}</span>
      <h2>${profile.vip ? "あなたはシークレット枠に招待されています" : "現在、VIP招待はありません"}</h2>
      <p>${profile.vip ? "提携先内RFM順位で上位5%に入ったため、シークレット枠をご案内しています。" : "VIP会員限定サービスです。招待された会員のみ予約機能をご利用いただけます。"}</p>
      <button class="primary-button" type="button" ${profile.vip ? "onclick=\"goToPage('booking')\"" : "onclick=\"goToPage('memberMenu')\""}>${profile.vip ? "予約フォームへ" : "メニューへ戻る"}</button>
    </section>
  `;
}

renderBooking = function renderBooking() {
  if (!isInvitedVipUser()) {
    renderVipLockedPage();
    return;
  }
  const publishedSlots = getBookableSlots();
  document.getElementById("screen").innerHTML = `
    <section class="vip-booking-page">
      <div class="vip-booking-title">
        <span class="vip-badge">VIP MEMBER</span>
        <h2>シークレット枠予約</h2>
        <p>DBの予約枠を今日以降の予約可能日時として表示しています。</p>
      </div>
      <form id="bookingForm" class="card vip-booking-card">
        <div class="grid-2">
          <label class="form-row"><span>店舗</span><select id="slotSelect" ${publishedSlots.length ? "" : "disabled"}>${publishedSlots.map((slot) => `<option value="${slot.id}">${slot.store} / ${slot.room} / ${slot.date} / ${slot.time}${slot.dateAdjusted ? "（現在日付に補正）" : ""}</option>`).join("")}</select></label>
          <label class="form-row"><span>プラン</span><select id="planSelect"><option>Secret Sauna 90分</option><option>Executive 120分</option><option>Platinum Relax 120分</option></select></label>
        </div>
        <div class="vip-booking-note">
          <strong>INVITED GUEST ONLY</strong>
          <p>${publishedSlots.length ? "この予約枠は一般公開されていません。提携先内RFM順位の上位5%に入った会員だけに表示されます。" : "現在、予約可能なDB枠がありません。管理者画面から枠を追加してください。"}</p>
        </div>
        <button class="primary-button" type="submit" ${publishedSlots.length ? "" : "disabled"}>予約内容を確認する</button>
      </form>
    </section>
  `;
  document.getElementById("bookingForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const slot = getBookableSlots().find((item) => item.id === document.getElementById("slotSelect").value);
    if (!slot) return showToast("予約可能なDB枠がありません。", "error");
    state.bookingDraft = { ...slot, plan: document.getElementById("planSelect").value };
    saveState();
    renderBookingConfirm();
  });
};

renderMyReservations = function renderMyReservations() {
  if (!isInvitedVipUser()) {
    renderVipLockedPage();
    return;
  }
  const profile = getCurrentMemberProfile();
  const reservations = state.reservations.filter((item) => item.email === profile.email && item.status !== "キャンセル");
  screenHtml("マイ予約", "VIPシークレット枠の予約内容を確認できます。", reservationTable(reservations, true));
};

renderHistory = function renderHistory() {
  if (!isInvitedVipUser()) {
    renderVipLockedPage();
    return;
  }
  const profile = getCurrentMemberProfile();
  const reservations = state.reservations.filter((item) => item.email === profile.email);
  screenHtml("予約履歴", "これまでのVIPシークレット枠利用履歴です。", reservationTable(reservations, false));
};
// =========================================================
// Global logout
// 全ページ共通のログアウト処理。保存済みログイン状態を削除してログイン画面へ戻します。
// =========================================================
const globalLogoutButton = document.getElementById("globalLogoutButton");

function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.clear();
}

function returnToLoginScreen() {
  clearAuthStorage();
  state = structuredClone(defaultState);
  state.currentUser = null;
  state.authTab = "login";
  state.activePage = "mypage";
  if (window.history && window.history.replaceState) {
    window.history.replaceState({ page: "login" }, "", window.location.pathname);
  }
  render();
}

logoutCurrentUser = function logoutCurrentUser() {
  showToast("ログアウトしました。");
  returnToLoginScreen();
};

logoutButton?.addEventListener("click", logoutCurrentUser);
globalLogoutButton?.addEventListener("click", logoutCurrentUser);

const renderWithGlobalLogoutButton = render;
render = function render() {
  renderWithGlobalLogoutButton();
  globalLogoutButton?.classList.toggle("hidden", !state.currentUser);
};

window.addEventListener("pageshow", () => {
  if (!localStorage.getItem(STORAGE_KEY) && state.currentUser) {
    returnToLoginScreen();
  }
});

window.addEventListener("popstate", () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    returnToLoginScreen();
  }
});

// =========================================================
// Global back button
// SPA内のページ移動履歴を使って、ログイン後の各画面から前画面へ戻れるようにします。
// =========================================================
const PAGE_HISTORY_KEY = "konosuPageHistory";
const appBackButton = document.createElement("button");
appBackButton.id = "appBackButton";
appBackButton.className = "app-back-button hidden";
appBackButton.type = "button";
appBackButton.innerHTML = `<span aria-hidden="true"></span><strong>戻る</strong>`;
document.body.appendChild(appBackButton);

function getPageHistory() {
  try {
    return JSON.parse(sessionStorage.getItem(PAGE_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function setPageHistory(history) {
  sessionStorage.setItem(PAGE_HISTORY_KEY, JSON.stringify(history.slice(-20)));
}

function getRoleHomePage() {
  if (state.currentUser?.role === "admin") return "adminMenu";
  if (state.currentUser?.role === "partner") return "partnerDashboard";
  return "memberMenu";
}

function rememberPageBeforeMove(nextPage) {
  if (!state.currentUser || !nextPage || state.activePage === nextPage) return;
  const currentPage = state.activePage || getRoleHomePage();
  const history = getPageHistory();
  if (history[history.length - 1] !== currentPage) {
    history.push(currentPage);
    setPageHistory(history);
  }
}

function updateBackButtonVisibility() {
  const homePage = getRoleHomePage();
  const shouldShow = !!state.currentUser && state.activePage && state.activePage !== homePage;
  appBackButton.classList.toggle("hidden", !shouldShow);
}

function goBackInApp() {
  const history = getPageHistory();
  const fallbackPage = getRoleHomePage();
  const previousPage = history.pop() || fallbackPage;
  setPageHistory(history);
  state.activePage = previousPage;
  saveState();
  renderShell();
  updateBackButtonVisibility();
}

document.addEventListener("click", (event) => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) rememberPageBeforeMove(pageButton.dataset.page);
}, true);

appBackButton.addEventListener("click", goBackInApp);

const originalGoToPageWithBack = goToPage;
goToPage = function goToPage(page) {
  rememberPageBeforeMove(page);
  originalGoToPageWithBack(page);
  updateBackButtonVisibility();
};

const renderShellWithBackButton = renderShell;
renderShell = function renderShell() {
  renderShellWithBackButton();
  updateBackButtonVisibility();
};

const renderWithBackButton = render;
render = function render() {
  renderWithBackButton();
  updateBackButtonVisibility();
};

// =========================================================
// Admin DB-backed screens
// =========================================================
const ADMIN_DB_STATUS_RESERVED = "\u4e88\u7d04\u4e2d";
const ADMIN_DB_STATUS_VISITED = "\u6765\u5e97\u6e08\u307f";
const ADMIN_DB_STATUS_CANCELED = "\u30ad\u30e3\u30f3\u30bb\u30eb";
const ADMIN_DB_PARTNER_UNSET = "\u672a\u8a2d\u5b9a";
window.ADMIN_DB_SCREENS_READY = true;

function adminDbEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function adminDbText(value, fallback = "-") {
  const text = value === undefined || value === null || value === "" ? fallback : value;
  return adminDbEscape(text);
}

function adminDbYen(value) {
  return `\u00a5${Number(value || 0).toLocaleString("ja-JP")}`;
}

function adminDbArray(value) {
  return Array.isArray(value) ? value : [];
}

function adminDbTodayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function adminDbAddDaysIso(baseIso, days) {
  const [year, month, day] = String(baseIso).split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + days);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function normalizeSlotForCurrentDate(slot, index = 0) {
  const today = adminDbTodayIso();
  const originalDate = slot?.date || today;
  const date = originalDate >= today ? originalDate : adminDbAddDaysIso(today, index);
  return {
    ...slot,
    date,
    originalDate,
    dateAdjusted: originalDate !== date
  };
}

function getBookableSlots() {
  return adminDbArray(state.slots)
    .filter((slot) => slot.published !== false)
    .sort((a, b) => `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`, "ja"))
    .map((slot, index) => normalizeSlotForCurrentDate(slot, index))
    .sort((a, b) => `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`, "ja"));
}

function getAdminDisplaySlots() {
  return adminDbArray(state.slots)
    .sort((a, b) => `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`, "ja"))
    .map((slot, index) => normalizeSlotForCurrentDate(slot, index));
}

function getAdminCustomerSource() {
  if (Array.isArray(state.customers)) return state.customers;
  if (Array.isArray(state.dbCustomers)) return state.dbCustomers;
  return adminDbArray(state.partnerCustomers);
}

function getAdminReservationSource() {
  return adminDbArray(state.reservations);
}

function isCompletedReservation(reservation) {
  return reservation?.status === ADMIN_DB_STATUS_VISITED || reservation?.status === "visited";
}

function isCanceledReservation(reservation) {
  return reservation?.status === ADMIN_DB_STATUS_CANCELED || reservation?.status === "canceled";
}

function isReservedReservation(reservation) {
  return reservation?.status === ADMIN_DB_STATUS_RESERVED || reservation?.status === "reserved";
}

function getReservationMatchesForCustomer(customer) {
  const email = String(customer.email || "").toLowerCase();
  const name = String(customer.name || "");
  return getAdminReservationSource().filter((reservation) => {
    const reservationEmail = String(reservation.email || "").toLowerCase();
    return (email && reservationEmail === email) || (name && reservation.userName === name);
  });
}

function getDbAdminMembers() {
  return getAdminCustomerSource().map((customer, index) => {
    const score = calculateVipEligibility(customer);
    const reservations = getReservationMatchesForCustomer(customer);
    const completed = reservations.filter(isCompletedReservation).length;
    return {
      id: customer.id || customer.memberNo || `db-member-${index}`,
      number: customer.memberNo || customer.customerCode || customer.id || `DB-${index + 1}`,
      name: customer.name || "-",
      nick: customer.segment || "-",
      email: customer.email || "-",
      partner: customer.partner || ADMIN_DB_PARTNER_UNSET,
      vip: score.isVip,
      stamp: `${completed % 2}/2`,
      visits: `${reservations.length}\u56de`,
      score: score.scoreLabel || "-",
      invitationStatus: customer.invitationStatus || "-"
    };
  });
}

function getDbAdminReservations() {
  return getAdminReservationSource().map((reservation, index) => ({
    id: reservation.id || `db-reservation-${index}`,
    member: reservation.userName || "-",
    number: reservation.email || reservation.id || "-",
    datetime: `${reservation.date || "-"}\n${reservation.time || "-"}`,
    people: "1\u540d",
    price: Number(reservation.price || 0),
    discount: "-",
    payment: isCanceledReservation(reservation) ? 0 : Number(reservation.price || 0),
    status: reservation.status || "-",
    taxi: reservation.partner && reservation.partner !== ADMIN_DB_PARTNER_UNSET ? "\u9023\u643a" : "-",
    store: reservation.store || "-",
    room: reservation.room || "-",
    plan: reservation.plan || "-"
  }));
}

function getDbAdminStats() {
  const reservations = getAdminReservationSource();
  const today = new Date().toISOString().slice(0, 10);
  const billable = reservations.filter((reservation) => !isCanceledReservation(reservation));
  return {
    members: getAdminCustomerSource().length,
    reservations: reservations.length,
    reservationsToday: reservations.filter((reservation) => reservation.date === today).length,
    completed: reservations.filter(isCompletedReservation).length,
    reserved: reservations.filter(isReservedReservation).length,
    canceled: reservations.filter(isCanceledReservation).length,
    sales: billable.reduce((sum, reservation) => sum + Number(reservation.price || 0), 0),
    referralCodes: adminDbArray(state.partners).filter((partner) => partner.code).length,
    notices: adminDbArray(state.notices).length,
    slots: adminDbArray(state.slots).length
  };
}

function getDbSalesRows() {
  const grouped = new Map();
  getAdminReservationSource().forEach((reservation) => {
    const date = reservation.date || (reservation.createdAt || "").slice(0, 10) || "\u65e5\u4ed8\u672a\u8a2d\u5b9a";
    if (!grouped.has(date)) grouped.set(date, { date, count: 0, billableCount: 0, sales: 0 });
    const row = grouped.get(date);
    row.count += 1;
    if (!isCanceledReservation(reservation)) {
      row.billableCount += 1;
      row.sales += Number(reservation.price || 0);
    }
  });
  return Array.from(grouped.values())
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 10)
    .map((row) => ({
      ...row,
      average: row.billableCount ? Math.round(row.sales / row.billableCount) : 0
    }));
}

function renderAdminMenu() {
  const stats = getDbAdminStats();
  document.getElementById("screen").innerHTML = `
    <section class="admin-menu-page">
      <div class="admin-page-title">
        <h2>管理者メニュー</h2>
        <p>DBに保存されている顧客・予約・告知・枠情報を参照しています。</p>
      </div>
      <div class="admin-menu-stats">
        <article class="admin-mini-stat"><span class="line-icon users"></span><strong>${stats.members}</strong><p>DB顧客数</p></article>
        <article class="admin-mini-stat"><span class="line-icon calendar"></span><strong>${stats.reservationsToday}</strong><p>本日の予約</p></article>
        <article class="admin-mini-stat"><span class="line-icon gift"></span><strong>${stats.referralCodes}</strong><p>紹介コード</p></article>
        <article class="admin-mini-stat"><span class="line-icon notice"></span><strong>${stats.notices}</strong><p>お知らせ</p></article>
      </div>
      <div class="admin-card-grid">
        ${adminMenuCards.map((card) => `
          <button class="admin-menu-card ${card.color}" type="button" data-page="${card.page}">
            <div class="admin-card-head">
              <span class="line-icon ${card.icon}"></span>
              <div><h3>${card.title}</h3><p>${card.text}</p></div>
            </div>
            <div class="admin-card-foot"><span>${card.note}</span><b>&gt;</b></div>
          </button>
        `).join("")}
      </div>
      <section class="admin-flow-card">
        <h3>DB参照状況</h3>
        <div class="admin-flow-grid">
          <div><b>1</b><strong>顧客</strong><p>${stats.members}件をcustomersから取得</p></div>
          <div><b>2</b><strong>予約</strong><p>${stats.reservations}件をreservation_summaryから取得</p></div>
          <div><b>3</b><strong>枠</strong><p>${stats.slots}件をreservation_slotsから取得</p></div>
          <div><b>4</b><strong>売上</strong><p>${adminDbYen(stats.sales)}を予約データから集計</p></div>
        </div>
      </section>
    </section>
  `;
  document.querySelectorAll(".admin-menu-card").forEach((button) => {
    button.addEventListener("click", () => {
      state.activePage = button.dataset.page;
      saveState();
      renderShell();
    });
  });
}

function renderMembers() {
  const members = getDbAdminMembers();
  document.getElementById("screen").innerHTML = `
    <section class="admin-list-page">
      <div class="admin-page-title">
        <h2>会員管理</h2>
        <p>DB登録会員: ${members.length}名</p>
      </div>
      <label class="admin-search-box">
        <span></span>
        <input id="memberSearch" placeholder="会員番号、氏名、メール、提携先で検索..." autocomplete="off">
      </label>
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead>
            <tr><th>会員番号</th><th>氏名</th><th>属性</th><th>メール</th><th>提携先</th><th>VIP</th><th>スタンプ</th><th>予約数</th><th>RFM順位</th><th>操作</th></tr>
          </thead>
          <tbody id="memberRows">${memberRowsHtml(members)}</tbody>
        </table>
      </div>
    </section>
  `;
  document.getElementById("memberSearch").addEventListener("input", (event) => {
    const keyword = event.target.value.trim().toLowerCase();
    const filtered = members.filter((member) => `${member.number} ${member.name} ${member.email} ${member.partner} ${member.score}`.toLowerCase().includes(keyword));
    document.getElementById("memberRows").innerHTML = memberRowsHtml(filtered);
    attachMemberDetailButtons(filtered);
  });
  attachMemberDetailButtons(members);
}

function attachMemberDetailButtons(members) {
  document.querySelectorAll(".member-detail-button").forEach((button) => {
    button.addEventListener("click", () => {
      const member = members.find((item) => item.id === button.dataset.memberId);
      showToast(`${member?.name || "会員"}のDB情報を表示しています。`);
    });
  });
}

function memberRowsHtml(members) {
  if (!members.length) return `<tr><td colspan="10" class="empty-cell">DBに会員データがありません</td></tr>`;
  return members.map((member) => `
    <tr>
      <td>${adminDbText(member.number)}</td>
      <td>${adminDbText(member.name)}</td>
      <td>${adminDbText(member.nick)}</td>
      <td>${adminDbText(member.email)}</td>
      <td><span class="partner-tag">${adminDbText(member.partner)}</span></td>
      <td>${member.vip ? `<span class="vip-chip">VIP</span>` : "-"}</td>
      <td>${adminDbText(member.stamp)}</td>
      <td>${adminDbText(member.visits)}</td>
      <td>${adminDbText(member.score)}</td>
      <td><button class="text-link-button member-detail-button" type="button" data-member-id="${adminDbEscape(member.id)}">詳細</button></td>
    </tr>
  `).join("");
}

function renderReservationAdmin() {
  const bookings = getDbAdminReservations();
  const stats = getDbAdminStats();
  document.getElementById("screen").innerHTML = `
    <section class="admin-list-page">
      <div class="admin-page-title">
        <h2>予約管理</h2>
        <p>DB予約数: ${stats.reservations}件 / 売上 ${adminDbYen(stats.sales)}</p>
      </div>
      <div class="admin-kpi-grid">
        <article><span>総予約数</span><strong>${stats.reservations}</strong></article>
        <article><span>来店済み</span><strong class="green-number">${stats.completed}</strong></article>
        <article><span>予約中</span><strong class="red-number">${stats.reserved}</strong></article>
        <article><span>総売上</span><strong class="blue-number">${adminDbYen(stats.sales)}</strong></article>
      </div>
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead><tr><th>予約ID</th><th>会員</th><th>日時</th><th>店舗/部屋</th><th>人数</th><th>料金</th><th>支払額</th><th>ステータス</th><th>提携</th><th>操作</th></tr></thead>
          <tbody>
            ${bookings.length ? bookings.map((booking) => `
              <tr>
                <td>${adminDbText(booking.id)}</td>
                <td>${adminDbText(booking.member)}<br><small>${adminDbText(booking.number)}</small></td>
                <td>${adminDbEscape(booking.datetime).replace("\n", "<br>")}</td>
                <td>${adminDbText(booking.store)}<br><small>${adminDbText(booking.room)}</small></td>
                <td>${adminDbText(booking.people)}</td>
                <td>${adminDbYen(booking.price)}</td>
                <td><strong>${adminDbYen(booking.payment)}</strong></td>
                <td><span class="status-chip ${booking.status === ADMIN_DB_STATUS_VISITED ? "done" : ""}">${adminDbText(booking.status)}</span></td>
                <td><span class="taxi-chip ${booking.taxi === "-" ? "muted-chip" : ""}">${adminDbText(booking.taxi)}</span></td>
                <td><button class="row-icon edit" onclick="showToast('予約情報はDBから参照しています。')" type="button"></button><button class="row-icon delete" onclick="showToast('削除APIは未実装です。')" type="button"></button></td>
              </tr>
            `).join("") : `<tr><td colspan="10" class="empty-cell">DBに予約データがありません</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnalytics() {
  const stats = getDbAdminStats();
  const rows = getDbSalesRows();
  const maxSales = Math.max(...rows.map((row) => row.sales), 1);
  const averageDaily = rows.length ? Math.round(stats.sales / rows.length) : 0;
  const forecastTotal = averageDaily * 7;
  document.getElementById("screen").innerHTML = `
    <section class="sales-page">
      <div class="admin-page-title">
        <h2>売上分析</h2>
        <p>DB予約データを日別に集計しています。</p>
      </div>
      <div class="sales-summary-grid">
        <article class="sales-summary-card blue"><span class="line-icon users"></span><div><p>総予約数</p><strong>${stats.reservations}</strong><small>reservation_summary</small></div></article>
        <article class="sales-summary-card green"><span class="sales-dollar">$</span><div><p>総売上</p><strong>${adminDbYen(stats.sales)}</strong><small>キャンセル除外</small></div></article>
        <article class="sales-summary-card purple"><span class="sales-target"></span><div><p>7日予測</p><strong>${adminDbYen(forecastTotal)}</strong><small>日平均ベース</small></div></article>
        <article class="sales-summary-card orange"><span class="line-icon chart"></span><div><p>平均日商</p><strong>${adminDbYen(averageDaily)}</strong><small>DB集計</small></div></article>
      </div>
      <section class="admin-chart-card admin-sales-card">
        <h3>日別売上</h3>
        ${rows.length ? rows.map((row) => `
          <div class="admin-bar-row"><span>${adminDbText(row.date)}</span><div class="admin-bar-track"><div class="admin-bar-fill" style="width:${Math.max(4, Math.round((row.sales / maxSales) * 100))}%"></div></div><strong>${adminDbYen(row.sales)}</strong></div>
        `).join("") : `<p>DBに売上集計対象の予約がありません。</p>`}
      </section>
      <section class="forecast-table-card">
        <h3>実績データ</h3>
        <table>
          <thead><tr><th>日付</th><th>予約数</th><th>平均単価</th><th>売上</th></tr></thead>
          <tbody>
            ${rows.length ? rows.map((row) => `<tr><td>${adminDbText(row.date)}</td><td><span class="blue-pill">${row.count}件</span></td><td><span class="orange-pill">${adminDbYen(row.average)}</span></td><td><span class="green-pill">${adminDbYen(row.sales)}</span></td></tr>`).join("") : `<tr><td colspan="4">DBに予約データがありません</td></tr>`}
          </tbody>
        </table>
        <p class="table-footnote">最新10日分をDBから表示</p>
      </section>
    </section>
  `;
}

function renderReferralCodes() {
  const partners = adminDbArray(state.partners);
  document.getElementById("screen").innerHTML = `
    <section class="admin-list-page">
      <div class="admin-page-title with-action">
        <div><h2>紹介コード管理</h2><p>DB登録: ${partners.length}件</p></div>
        <button class="admin-create-button" onclick="showToast('紹介コードはDBの提携先データを参照しています。')" type="button">紹介コード確認</button>
      </div>
      <div class="admin-table-card">
        <table class="admin-data-table referral-table">
          <thead><tr><th>紹介コード</th><th>提携先コード</th><th>提携先名</th><th>抽出基準</th><th>ステータス</th></tr></thead>
          <tbody>
            ${partners.length ? partners.map((partner) => `<tr><td><strong>${adminDbText(partner.code || "-")}</strong></td><td>${adminDbText(partner.id)}</td><td>${adminDbText(partner.name)}</td><td>${adminDbText(partner.criterion)}</td><td><span class="green-pill">${partner.code ? "有効" : "未発行"}</span></td></tr>`).join("") : `<tr><td colspan="5" class="empty-cell">DBに提携先データがありません</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderNoticeAdmin() {
  const notices = adminDbArray(state.notices);
  document.getElementById("screen").innerHTML = `
    <section class="admin-list-page">
      <div class="admin-page-title with-action">
        <div><h2>お知らせ管理</h2><p>DB登録件数: ${notices.length}件</p></div>
      </div>
      <form id="noticeForm" class="card admin-notice-form">
        <div class="form-row"><label>タイトル</label><input id="noticeTitle" required></div>
        <div class="form-row"><label>本文</label><textarea id="noticeBody" required></textarea></div>
        <button class="primary-button" type="submit">お知らせ作成</button>
      </form>
      <div class="admin-notice-list">
        ${notices.length ? notices.map((notice) => `
          <article class="admin-notice-item">
            <time>${adminDbText(notice.date)}</time>
            <h3>${adminDbText(notice.title)}</h3>
            <p>${adminDbText(notice.body)}</p>
            <button class="danger-button notice-delete-button" data-notice-id="${adminDbEscape(notice.id)}" type="button">削除</button>
          </article>
        `).join("") : `
          <div class="empty-admin-card">
            <span class="line-icon notice"></span>
            <p>DBにお知らせが登録されていません</p>
          </div>
        `}
      </div>
    </section>
  `;
  document.getElementById("noticeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const title = document.getElementById("noticeTitle").value.trim();
    const body = document.getElementById("noticeBody").value.trim();
    if (!title || !body) return showToast("必須項目を入力してください。", "error");
    state.notices.unshift({ id: createId("n"), title, body, date: new Date().toISOString().slice(0, 10) });
    saveState();
    showToast("お知らせを作成しました。");
    renderShell();
  });
  document.querySelectorAll(".notice-delete-button").forEach((button) => {
    button.addEventListener("click", () => deleteNotice(button.dataset.noticeId));
  });
}

function renderSecretSlots() {
  const slots = getAdminDisplaySlots();
  const today = adminDbTodayIso();
  document.getElementById("screen").innerHTML = `
    <section class="booking-form-page">
      <div class="admin-page-title">
        <h2>予約枠管理</h2>
        <p>DB登録枠: ${slots.length}件 / 予約画面では今日以降の日時として表示</p>
      </div>
      <form id="slotForm" class="card">
        <div class="form-grid">
          <div class="form-row"><label>店舗</label><input id="slotStore" required></div>
          <div class="form-row"><label>部屋</label><input id="slotRoom" required></div>
          <div class="form-row"><label>日付</label><input id="slotDate" type="date" min="${today}" value="${today}" required></div>
          <div class="form-row"><label>時間帯</label><input id="slotTime" placeholder="平日 13:00" required></div>
          <div class="form-row"><label>価格</label><input id="slotPrice" type="number" required></div>
          <div class="form-row"><label>公開状態</label><select id="slotPublished"><option value="true">公開</option><option value="false">非公開</option></select></div>
        </div>
        <button class="primary-button" type="submit">枠を追加</button>
      </form>
      <div style="height:16px"></div>
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead><tr><th>店舗</th><th>部屋</th><th>表示日付</th><th>時間</th><th>プラン</th><th>価格</th><th>公開状態</th><th>DB日付</th></tr></thead>
          <tbody>
            ${slots.length ? slots.map((slot) => `<tr><td>${adminDbText(slot.store)}</td><td>${adminDbText(slot.room)}</td><td>${adminDbText(slot.date)}${slot.dateAdjusted ? `<br><small>現在日付に補正</small>` : ""}</td><td>${adminDbText(slot.time)}</td><td>${adminDbText(slot.plan)}</td><td>${adminDbYen(slot.price)}</td><td><span class="status-chip">${slot.published ? "公開" : "非公開"}</span></td><td>${adminDbText(slot.originalDate || slot.date)}</td></tr>`).join("") : `<tr><td colspan="8" class="empty-cell">DBに予約枠がありません</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
  document.getElementById("slotForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const required = ["slotStore", "slotRoom", "slotDate", "slotTime", "slotPrice"].map((id) => document.getElementById(id).value.trim());
    if (required.some((value) => !value)) return showToast("必須項目を入力してください。", "error");
    state.slots.push({
      id: createId("s"),
      store: required[0],
      room: required[1],
      date: required[2],
      time: required[3],
      price: Number(required[4]),
      plan: "Secret Sauna",
      published: document.getElementById("slotPublished").value === "true"
    });
    saveState();
    showToast("予約枠を追加しました。");
    renderShell();
  });
}

function getActivePartnerName() {
  const partnerNames = adminDbArray(state.partners).map((partner) => partner.name).filter(Boolean);
  const customerPartnerNames = adminDbArray(state.partnerCustomers).map((customer) => customer.partner).filter(Boolean);
  return state.currentUser?.partner || partnerNames[0] || customerPartnerNames[0] || ADMIN_DB_PARTNER_UNSET;
}

function renderPartnerCustomerRows(customers, showInvite = false) {
  if (!customers.length) return `<tr><td colspan="10" class="empty-cell">DBに提携先顧客データがありません</td></tr>`;
  return customers.map((customer) => {
    const score = calculateVipEligibility(customer);
    return `<tr>
      <td>${adminDbText(customer.memberNo || customer.id)}</td>
      <td>${adminDbText(customer.name)}</td>
      <td>${adminDbText(customer.partner)}</td>
      <td>${adminDbText(customer.segment)}</td>
      <td>${adminDbText(customer.recentDays)}日前</td>
      <td>月${adminDbText(customer.frequency)}回</td>
      <td>${adminDbYen(customer.amount)}</td>
      <td><span class="rank-badge rank-${score.rank.toLowerCase()}">${adminDbText(score.rank)}</span></td>
      <td>${adminDbText(score.scoreLabel)}<br><span class="muted">${score.checks.map((check) => adminDbText(check.label)).join("<br>")}</span></td>
      <td>${score.isVip ? `<span class="vip-chip">上位5% VIP</span>` : `<span class="status-chip">対象外</span>`}${showInvite && score.isVip ? `<br><button class="primary-button" onclick="sendInvitation('${adminDbEscape(customer.id)}')">招待送信</button>` : ""}</td>
    </tr>`;
  }).join("");
}

function renderPartnerDashboard() {
  const partnerName = getActivePartnerName();
  const customers = adminDbArray(state.partnerCustomers).filter((customer) => customer.partner === partnerName);
  const reservations = getAdminReservationSource().filter((reservation) => reservation.partner === partnerName && !isCanceledReservation(reservation));
  const vipCount = customers.filter((customer) => calculateVipEligibility(customer).isVip).length;
  const kickback = reservations.filter(isCompletedReservation).reduce((sum, reservation) => sum + Number(reservation.price || 0) * 0.1, 0);
  screenHtml("提携先ダッシュボード", `${partnerName} のDBデータを表示しています。VIP判定基準は提携先内RFM合計順位の上位5%です。`, `
    <div class="stats-grid">
      <div class="stat-card"><span>提供顧客数</span><strong>${customers.length}</strong></div>
      <div class="stat-card"><span>上位5% VIP</span><strong>${vipCount}</strong></div>
      <div class="stat-card"><span>予約成立数</span><strong>${reservations.length}</strong></div>
      <div class="stat-card"><span>キックバック金額</span><strong>${formatYen(kickback)}</strong></div>
    </div>
  `);
}

function renderPartnerCustomers() {
  const partnerName = getActivePartnerName();
  const customers = adminDbArray(state.partnerCustomers).filter((customer) => customer.partner === partnerName);
  screenHtml("提携先顧客データ", `${partnerName} のDB顧客データです。R/F/Mをそれぞれ順位付けし、合計順位が上位5%の顧客だけをVIP判定します。`, `
    <div class="admin-table-card"><table class="admin-data-table scoring-table">
      <thead><tr><th>会員番号</th><th>顧客名</th><th>提携先</th><th>顧客層</th><th>最新利用</th><th>頻度</th><th>決済額</th><th>ランク</th><th>RFM順位</th><th>VIP判定</th></tr></thead>
      <tbody>${renderPartnerCustomerRows(customers)}</tbody>
    </table></div>
  `);
}

function renderKickbacks() {
  const partnerName = getActivePartnerName();
  const rows = getAdminReservationSource().filter((reservation) => reservation.partner === partnerName && isCompletedReservation(reservation));
  const total = rows.reduce((sum, reservation) => sum + Number(reservation.price || 0) * 0.1, 0);
  screenHtml("キックバック確認", `${partnerName} の来店済み予約をDBから集計しています。`, `
    ${emptyMessage(rows, `<div class="table-wrap"><table>
      <thead><tr><th>予約</th><th>予約金額</th><th>報酬額</th><th>支払い予定ステータス</th></tr></thead>
      <tbody>${rows.map((reservation) => `<tr><td>${adminDbText(reservation.userName)} / ${adminDbText(reservation.date)} ${adminDbText(reservation.time)}</td><td>${formatYen(reservation.price)}</td><td>${formatYen(Number(reservation.price || 0) * 0.1)}</td><td><span class="badge success">支払い予定</span></td></tr>`).join("")}</tbody>
    </table></div>`)}
    <div class="card" style="margin-top:14px;"><strong>合計報酬額: ${formatYen(total)}</strong></div>
  `);
}

render();
