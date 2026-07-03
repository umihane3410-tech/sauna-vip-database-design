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
