const API_BASE = "";

function toFormBody(data) {
  return new URLSearchParams(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== null)
  );
}

async function apiRequest(path, data = null) {
  const options = data
    ? {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: toFormBody(data)
      }
    : {};

  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    throw new Error(await response.text());
  }

  const contentType = response.headers.get("Content-Type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}

function mergeServerState(payload) {
  if (!payload || typeof state === "undefined") return;

  state.partners = payload.partners?.length ? payload.partners : state.partners;
  state.dbCustomers = Array.isArray(payload.customers) ? payload.customers : [];
  state.partnerCustomers = payload.partnerCustomers?.length ? payload.partnerCustomers : state.partnerCustomers;
  state.slots = payload.slots?.length ? payload.slots : state.slots;
  state.reservations = payload.reservations?.length ? payload.reservations : state.reservations;
  state.notices = payload.notices?.length ? payload.notices : state.notices;
  saveState();
  render();
}

async function hydrateFromDatabase() {
  try {
    const payload = await apiRequest("/api/bootstrap");
    mergeServerState(payload);
    showToast("データベースと同期しました");
  } catch (error) {
    console.warn(error);
    showToast("DB同期なしで画面を表示しています", "error");
  }
}

if (typeof showBookingConfirm === "function" && typeof renderBookingConfirm !== "function") {
  window.renderBookingConfirm = showBookingConfirm;
}

const originalCompleteBookingForApi = completeBooking;
completeBooking = async function completeBookingWithApi() {
  const draft = { ...state.bookingDraft };
  const profile = typeof getCurrentMemberProfile === "function" ? getCurrentMemberProfile() : state.vipUser;

  originalCompleteBookingForApi();
  const newestReservation = state.reservations[state.reservations.length - 1];

  try {
    await apiRequest("/api/reservations", {
      external_reservation_id: newestReservation?.id,
      external_slot_id: draft.id,
      user_name: profile.name || state.vipUser.name,
      email: profile.email || state.vipUser.email,
      partner_name: profile.partner || state.vipUser.partner,
      store: draft.store,
      room: draft.room,
      slot_date: draft.date,
      slot_time: draft.time,
      plan: draft.plan,
      price: draft.price,
      status: "reserved"
    });
    showToast("予約をDBへ保存しました");
  } catch (error) {
    console.warn(error);
    showToast("予約のDB保存に失敗しました", "error");
  }
};

const originalSendInvitationForApi = sendInvitation;
sendInvitation = async function sendInvitationWithApi(customerId) {
  const customer = state.partnerCustomers.find((item) => item.id === customerId);
  originalSendInvitationForApi(customerId);

  if (!customer) return;

  try {
    await apiRequest("/api/invitations", {
      external_customer_id: customer.id,
      customer_name: customer.name,
      partner_name: customer.partner,
      status: "sent"
    });
  } catch (error) {
    console.warn(error);
    showToast("招待のDB保存に失敗しました", "error");
  }
};

const originalRenderSecretSlotsForApi = renderSecretSlots;
renderSecretSlots = function renderSecretSlotsWithApi() {
  originalRenderSecretSlotsForApi();
  const slotForm = document.getElementById("slotForm");
  if (!slotForm || slotForm.dataset.apiSyncAttached) return;

  slotForm.dataset.apiSyncAttached = "true";
  slotForm.addEventListener("submit", async () => {
    const newest = state.slots[state.slots.length - 1];
    if (!newest) return;

    try {
      await apiRequest("/api/slots", {
        external_slot_id: newest.id,
        store: newest.store,
        room: newest.room,
        slot_date: newest.date,
        slot_time: newest.time,
        plan: newest.plan,
        price: newest.price,
        published: newest.published ? "1" : "0"
      });
      showToast("予約枠をDBへ保存しました");
    } catch (error) {
      console.warn(error);
      showToast("予約枠のDB保存に失敗しました", "error");
    }
  });
};

const originalRenderNoticeAdminForApi = renderNoticeAdmin;
renderNoticeAdmin = function renderNoticeAdminWithApi() {
  originalRenderNoticeAdminForApi();
  const noticeForm = document.getElementById("noticeForm");
  if (!noticeForm || noticeForm.dataset.apiSyncAttached) return;

  noticeForm.dataset.apiSyncAttached = "true";
  noticeForm.addEventListener("submit", async () => {
    const newest = state.notices[0];
    if (!newest) return;

    try {
      await apiRequest("/api/notices", {
        external_notice_id: newest.id,
        title: newest.title,
        body: newest.body,
        notice_date: newest.date
      });
      showToast("お知らせをDBへ保存しました");
    } catch (error) {
      console.warn(error);
      showToast("お知らせのDB保存に失敗しました", "error");
    }
  });
};

hydrateFromDatabase();

// The original admin pages are a design prototype with hard-coded rows. These
// replacements render only the records returned from /api/bootstrap.
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char]);
}

function adminData() {
  return {
    customers: Array.isArray(state.dbCustomers) ? state.dbCustomers : [],
    reservations: Array.isArray(state.reservations) ? state.reservations : [],
    notices: Array.isArray(state.notices) ? state.notices : []
  };
}

function adminScreen(title, subtitle, body) {
  const screen = document.getElementById("screen");
  if (!screen) return;
  screen.innerHTML = `<section class="admin-list-page"><div class="admin-page-title"><h2>${title}</h2><p>${subtitle}</p></div>${body}</section>`;
}

renderAdminMenu = function renderAdminMenuFromDatabase() {
  const { customers, reservations, notices } = adminData();
  const sales = reservations.filter((row) => row.status !== "キャンセル").reduce((sum, row) => sum + Number(row.price || 0), 0);
  adminScreen("管理メニュー", "DBの最新データを表示しています", `
    <div class="admin-menu-stats">
      <article class="admin-mini-stat"><strong>${customers.length}</strong><p>登録会員数</p></article>
      <article class="admin-mini-stat"><strong>${reservations.length}</strong><p>予約件数</p></article>
      <article class="admin-mini-stat"><strong>${yen(sales)}</strong><p>予約売上</p></article>
      <article class="admin-mini-stat"><strong>${notices.length}</strong><p>お知らせ件数</p></article>
    </div><p class="muted">各メニューから、会員・予約・お知らせの詳細を確認できます。</p>`);
};

renderMembers = function renderMembersFromDatabase() {
  const { customers } = adminData();
  const rows = customers.map((member) => `<tr><td>${escapeHtml(member.code)}</td><td>${escapeHtml(member.name)}</td><td>${escapeHtml(member.email || "-")}</td><td><span class="partner-tag">${escapeHtml(member.partner || "-")}</span></td><td>${member.vip ? '<span class="vip-chip">VIP</span>' : "-"}</td><td>${Number(member.visits || 0)}回</td></tr>`).join("") || '<tr><td colspan="6" class="empty-cell">DBに会員データがありません</td></tr>';
  adminScreen("会員管理", `登録会員: ${customers.length}名`, `<div class="admin-table-card"><table class="admin-data-table"><thead><tr><th>会員番号</th><th>氏名</th><th>メール</th><th>提携先</th><th>VIP</th><th>利用回数</th></tr></thead><tbody>${rows}</tbody></table></div>`);
};

renderReservationAdmin = function renderReservationAdminFromDatabase() {
  const { reservations } = adminData();
  const active = reservations.filter((row) => row.status !== "キャンセル");
  const sales = active.reduce((sum, row) => sum + Number(row.price || 0), 0);
  const rows = reservations.map((row) => `<tr><td>${escapeHtml(row.id)}</td><td>${escapeHtml(row.userName || "-")}<br><small>${escapeHtml(row.email || "")}</small></td><td>${escapeHtml(row.date || "-")}<br><small>${escapeHtml(row.time || "")}</small></td><td>${escapeHtml(row.store || "-")} ${escapeHtml(row.room || "")}</td><td>${escapeHtml(row.plan || "-")}</td><td><strong>${yen(row.price)}</strong></td><td><span class="status-chip">${escapeHtml(row.status || "予約中")}</span></td></tr>`).join("") || '<tr><td colspan="7" class="empty-cell">DBに予約データがありません</td></tr>';
  adminScreen("予約管理", `予約件数: ${reservations.length}件 / 売上: ${yen(sales)}`, `<div class="admin-kpi-grid"><article><span>予約件数</span><strong>${reservations.length}</strong></article><article><span>有効予約</span><strong>${active.length}</strong></article><article><span>売上</span><strong>${yen(sales)}</strong></article></div><div class="admin-table-card"><table class="admin-data-table"><thead><tr><th>予約ID</th><th>会員</th><th>日時</th><th>店舗・ルーム</th><th>プラン</th><th>支払額</th><th>状態</th></tr></thead><tbody>${rows}</tbody></table></div>`);
};

renderAnalytics = function renderAnalyticsFromDatabase() {
  const { reservations } = adminData();
  const byDate = new Map();
  reservations.filter((row) => row.status !== "キャンセル").forEach((row) => {
    const item = byDate.get(row.date) || { count: 0, sales: 0 };
    item.count += 1; item.sales += Number(row.price || 0); byDate.set(row.date, item);
  });
  const rows = [...byDate.entries()].sort(([left], [right]) => String(right).localeCompare(String(left))).map(([date, item]) => `<tr><td>${escapeHtml(date)}</td><td>${item.count}件</td><td>${yen(item.sales)}</td></tr>`).join("") || '<tr><td colspan="3" class="empty-cell">集計対象の予約がありません</td></tr>';
  adminScreen("売上分析", "予約DBを日付ごとに集計しています", `<div class="admin-table-card"><table class="admin-data-table"><thead><tr><th>利用日</th><th>予約件数</th><th>売上</th></tr></thead><tbody>${rows}</tbody></table></div>`);
};

renderNoticeAdmin = function renderNoticesFromDatabase() {
  const { notices } = adminData();
  const rows = notices.map((notice) => `<article class="admin-notice-item"><time>${escapeHtml(notice.date)}</time><h3>${escapeHtml(notice.title)}</h3><p>${escapeHtml(notice.body)}</p></article>`).join("") || '<p class="empty-cell">DBにお知らせがありません</p>';
  adminScreen("お知らせ", `登録件数: ${notices.length}件`, `<div class="admin-notice-list">${rows}</div>`);
};
