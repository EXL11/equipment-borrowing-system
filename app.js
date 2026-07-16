/* ==========================================================================
   INITIAL SEED DATA (ACADEMIC / STUDENT ENVIRONMENT)
   ========================================================================== */
const DEFAULT_USERS = {
    "admin": {
        username: "admin",
        password: "password",
        name: "อาจารย์สมศักดิ์ (IT Admin)",
        department: "เทคโนโลยีธุรกิจดิจิทัล",
        role: "admin",
        avatar: "T"
    },
    "somchai": {
        username: "somchai",
        password: "password",
        name: "ธนากร เกษทองมา",
        department: "นักศึกษา ปี 3",
        role: "user",
        avatar: "S"
    },
    "somying": {
        username: "somying",
        password: "password",
        name: "สมหญิง รักดี",
        department: "นักศึกษา ปี 2",
        role: "user",
        avatar: "S"
    }
};

const DEFAULT_EQUIPMENT = [
    {
        id: "eq-1",
        name: "Notebook Dell Latitude 5420",
        category: "Notebook",
        code: "BTEC-NB-001",
        specs: "Intel Core i5-1135G7, RAM 16GB, SSD 512GB, Windows 11",
        status: "Available", // Available or Borrowed
        borrowedBy: null // { username, name, department, borrowDate, expectedReturnDate }
    },
    {
        id: "eq-2",
        name: "MacBook Pro M3 Pro 14\"",
        category: "Notebook",
        code: "BTEC-NB-002",
        specs: "Apple M3 Pro Chip, 18GB Unified Memory, SSD 512GB, macOS Sonoma",
        status: "Borrowed",
        borrowedBy: {
            username: "somchai",
            name: "ธนากร เกษทองมา",
            department: "นักศึกษา ปี 3",
            borrowDate: "2026-05-20",
            expectedReturnDate: "2026-05-27"
        }
    },
    {
        id: "eq-3",
        name: "Notebook HP EliteBook 840 G8",
        category: "Notebook",
        code: "BTEC-NB-003",
        specs: "Intel Core i7-1185G7, RAM 16GB, SSD 512GB, Windows 10 Pro",
        status: "Available",
        borrowedBy: null
    },
    {
        id: "eq-4",
        name: "Wireless Mouse Logistics MX Master 3S",
        category: "Mouse",
        code: "BTEC-MS-001",
        specs: "8000 DPI, Silent Click, Bluetooth / Logi Bolt, Ergonomic Design",
        status: "Available",
        borrowedBy: null
    },
    {
        id: "eq-5",
        name: "Wireless Mouse Logistics Pebble M350",
        category: "Mouse",
        code: "BTEC-MS-002",
        specs: "Ultra-portable, Silent clicking, Bluetooth and USB Receiver",
        status: "Available",
        borrowedBy: null
    },
    {
        id: "eq-6",
        name: "Mechanical Keyboard Royal Kludge RK84",
        category: "Keyboard",
        code: "BTEC-KB-001",
        specs: "75% Layout, Hot-swappable tactile Brown Switch, RGB backlit",
        status: "Available",
        borrowedBy: null
    },
    {
        id: "eq-7",
        name: "Keyboard Logitech K380 Multi-Device",
        category: "Keyboard",
        code: "BTEC-KB-002",
        specs: "Slim, compact Bluetooth keyboard for PC, laptop, phone or tablet",
        status: "Available",
        borrowedBy: null
    },
    {
        id: "eq-8",
        name: "Dell USB-C Charger 65W",
        category: "Charger",
        code: "BTEC-CG-001",
        specs: "Power Delivery (PD) Fast charger with USB Type-C Cable",
        status: "Available",
        borrowedBy: null
    },
    {
        id: "eq-9",
        name: "MacBook USB-C Power Adapter 96W",
        category: "Charger",
        code: "BTEC-CG-002",
        specs: "Apple USB-C Power Adapter for rapid charging (includes USB-C to MagSafe 3 cable)",
        status: "Borrowed",
        borrowedBy: {
            username: "somying",
            name: "สมหญิง รักดี",
            department: "นักศึกษา ปี 2",
            borrowDate: "2026-05-24",
            expectedReturnDate: "2026-05-31"
        }
    }
];

const DEFAULT_HISTORY = [
    {
        id: "hist-1",
        timestamp: "2026-05-20T10:15:30.000Z",
        type: "borrow", // borrow or return
        userId: "somchai",
        userName: " ธนากร เกษทองมา",
        userDept: "นักศึกษา ปี 3",
        itemId: "eq-2",
        itemName: "MacBook Pro M3 Pro 14\"",
        itemCode: "BTEC-NB-002",
        borrowDate: "2026-05-20",
        expectedReturnDate: "2026-05-27",
        actualReturnDate: null,
        status: "Borrowed" // Borrowed or Returned
    },
    {
        id: "hist-2",
        timestamp: "2026-05-24T09:42:15.000Z",
        type: "borrow",
        userId: "somying",
        userName: "สมหญิง รักดี",
        userDept: "นักศึกษา ปี 2",
        itemId: "eq-9",
        itemName: "MacBook USB-C Power Adapter 96W",
        itemCode: "BTEC-CG-002",
        borrowDate: "2026-05-24",
        expectedReturnDate: "2026-05-31",
        actualReturnDate: null,
        status: "Borrowed"
    }
];

/* ==========================================================================
   STATE MACHINE
   ========================================================================== */
let state = {
    currentUser: null,
    users: {},
    equipment: [],
    history: [],
    filters: {
        equipmentSearch: "",
        equipmentCategory: "all",
        historySearch: ""
    }
};

/* ==========================================================================
   INITIALIZATION & API CONFIG
   ========================================================================== */
// ป้อน URL หลังบ้านที่ได้รับจาก Render ที่นี่ (เช่น "https://equipment-borrowing-api.onrender.com/api")
const DEPLOYED_API_URL = "https://equipment-borrowing-system.onrender.com/api";

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:"
    ? "http://localhost:5000/api"
    : DEPLOYED_API_URL;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Load data from Server or fallback to LocalStorage
    await loadState();

    // 2. Setup standard Event Listeners
    setupEventListeners();

    // 3. Render initial date
    updateLiveDate();

    // 4. Check if session exists
    checkCurrentSession();

    // Re-initialize Lucide Icons for dynamic content
    lucide.createIcons();
});

async function loadState() {
    try {
        // Try fetching equipment from backend server
        const eqRes = await fetch(`${API_URL}/equipment`);
        if (eqRes.ok) {
            state.equipment = await eqRes.json();
            // Backup to localstorage in case of later disconnects
            localStorage.setItem("dept_equipment", JSON.stringify(state.equipment));
        } else {
            throw new Error();
        }

        // Try fetching users
        const usersRes = await fetch(`${API_URL}/users`);
        if (usersRes.ok) {
            const usersArray = await usersRes.json();
            state.users = {};
            usersArray.forEach(u => {
                state.users[u.username] = u;
            });
            localStorage.setItem("dept_users", JSON.stringify(state.users));
        } else {
            throw new Error();
        }

        // Try fetching session (stored locally in sessionStorage)
        const storedUser = sessionStorage.getItem("dept_current_user");
        if (storedUser) {
            state.currentUser = JSON.parse(storedUser);
        }

        // Try fetching history
        const userRole = state.currentUser ? state.currentUser.role : 'user';
        const username = state.currentUser ? state.currentUser.username : '';
        const histRes = await fetch(`${API_URL}/history?username=${username}&userRole=${userRole}`);
        if (histRes.ok) {
            state.history = await histRes.json();
            localStorage.setItem("dept_history", JSON.stringify(state.history));
        } else {
            throw new Error();
        }

        console.log("Central Server is Online. SQLite Database connected.");
        state.isOffline = false;
    } catch (err) {
        console.warn("Central Server is Offline. Falling back to local browser LocalStorage.");
        state.isOffline = true;
        loadStateFromStorage();
    }
}

function loadStateFromStorage() {
    const storedEquipment = localStorage.getItem("dept_equipment");
    const storedHistory = localStorage.getItem("dept_history");
    const storedUser = sessionStorage.getItem("dept_current_user");
    const storedUsers = localStorage.getItem("dept_users");

    if (storedUsers) {
        state.users = JSON.parse(storedUsers);
    } else {
        state.users = { ...DEFAULT_USERS };
        localStorage.setItem("dept_users", JSON.stringify(state.users));
    }

    if (storedEquipment) {
        state.equipment = JSON.parse(storedEquipment);
    } else {
        state.equipment = [...DEFAULT_EQUIPMENT];
        localStorage.setItem("dept_equipment", JSON.stringify(state.equipment));
    }

    if (storedHistory) {
        state.history = JSON.parse(storedHistory);
    } else {
        state.history = [...DEFAULT_HISTORY];
        localStorage.setItem("dept_history", JSON.stringify(state.history));
    }

    if (storedUser) {
        state.currentUser = JSON.parse(storedUser);
    }
}

function saveStateToStorage() {
    localStorage.setItem("dept_equipment", JSON.stringify(state.equipment));
    localStorage.setItem("dept_history", JSON.stringify(state.history));
}

function saveUsersToStorage() {
    localStorage.setItem("dept_users", JSON.stringify(state.users));
}

function updateLiveDate() {
    const dateEl = document.getElementById("live-date");
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', locale: 'th-TH' };
        const today = new Date();
        dateEl.textContent = today.toLocaleDateString('th-TH', options);
    }
}

/* ==========================================================================
   AUTHENTICATION LOGIC
   ========================================================================== */
function setupEventListeners() {
    // Login form submission
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById("username").value.trim().toLowerCase();
            const passwordInput = document.getElementById("password").value;
            handleLogin(usernameInput, passwordInput);
        });
    }

    // Toggle Login / Register forms
    const linkGoRegister = document.getElementById("link-go-register");
    const linkGoLogin = document.getElementById("link-go-login");
    const registerForm = document.getElementById("register-form");

    if (linkGoRegister) {
        linkGoRegister.addEventListener("click", (e) => {
            e.preventDefault();
            if (loginForm) loginForm.classList.add("hidden");
            if (registerForm) registerForm.classList.remove("hidden");
            const errEl = document.getElementById("login-error");
            if (errEl) errEl.style.display = "none";
        });
    }

    if (linkGoLogin) {
        linkGoLogin.addEventListener("click", (e) => {
            e.preventDefault();
            if (registerForm) registerForm.classList.add("hidden");
            if (loginForm) loginForm.classList.remove("hidden");
            const errEl = document.getElementById("register-error");
            if (errEl) errEl.style.display = "none";
        });
    }

    // Register Form Submission
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleRegister();
        });
    }

    // Logout button
    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    // Tab Switching Sidebar
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetTab = item.getAttribute("data-tab");
            switchTab(targetTab);
        });
    });

    // Category Filter Pills
    const filterPills = document.querySelectorAll(".filter-pill");
    filterPills.forEach(pill => {
        pill.addEventListener("click", () => {
            filterPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            state.filters.equipmentCategory = pill.getAttribute("data-category");
            renderEquipmentGrid();
        });
    });

    // Equipment Search Input
    const searchEq = document.getElementById("search-equipment");
    if (searchEq) {
        searchEq.addEventListener("input", (e) => {
            state.filters.equipmentSearch = e.target.value.trim().toLowerCase();
            renderEquipmentGrid();
        });
    }

    // History Search Input
    const searchHist = document.getElementById("search-history");
    if (searchHist) {
        searchHist.addEventListener("input", (e) => {
            state.filters.historySearch = e.target.value.trim().toLowerCase();
            renderHistoryTable();
        });
    }

    // Borrow Modal Controls
    const btnCancelBorrow = document.getElementById("btn-cancel-borrow");
    const btnCloseModal = document.getElementById("btn-close-modal");
    if (btnCancelBorrow) btnCancelBorrow.addEventListener("click", hideBorrowModal);
    if (btnCloseModal) btnCloseModal.addEventListener("click", hideBorrowModal);

    // Borrow Form Submit
    const borrowForm = document.getElementById("borrow-form");
    if (borrowForm) {
        borrowForm.addEventListener("submit", (e) => {
            e.preventDefault();
            executeBorrowAction();
        });
    }

    // Admin: Add Equipment Form
    const addEquipmentForm = document.getElementById("add-equipment-form");
    if (addEquipmentForm) {
        addEquipmentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleAddEquipment();
        });
    }

    // Admin: Edit Modal Controls
    const btnCancelEdit = document.getElementById("btn-cancel-edit");
    const btnCloseEditModal = document.getElementById("btn-close-edit-modal");
    if (btnCancelEdit) btnCancelEdit.addEventListener("click", hideEditModal);
    if (btnCloseEditModal) btnCloseEditModal.addEventListener("click", hideEditModal);

    // Admin: Edit Form Submit
    const editForm = document.getElementById("edit-form");
    if (editForm) {
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();
            executeEditAction();
        });
    }

    // Admin: Toggle Borrower Details in Edit Modal when status dropdown changes
    const editEqStatus = document.getElementById("edit-eq-status");
    if (editEqStatus) {
        editEqStatus.addEventListener("change", (e) => {
            const borrowerDetails = document.getElementById("edit-borrower-details");
            const isBorrowed = e.target.value === "Borrowed";

            if (isBorrowed) {
                borrowerDetails.classList.remove("hidden");
                document.getElementById("edit-borrower-username").required = true;
                document.getElementById("edit-borrower-name").required = true;
                document.getElementById("edit-borrower-dept").required = true;
                document.getElementById("edit-borrower-date").required = true;
                document.getElementById("edit-borrower-return").required = true;

                // Fill with active user as borrow default if fields are empty
                if (!document.getElementById("edit-borrower-username").value && state.currentUser) {
                    document.getElementById("edit-borrower-username").value = state.currentUser.username;
                    document.getElementById("edit-borrower-name").value = state.currentUser.name;
                    document.getElementById("edit-borrower-dept").value = state.currentUser.department;
                    document.getElementById("edit-borrower-date").value = getLocalDateString(new Date());

                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    document.getElementById("edit-borrower-return").value = getLocalDateString(nextWeek);
                }
            } else {
                borrowerDetails.classList.add("hidden");
                document.getElementById("edit-borrower-username").required = false;
                document.getElementById("edit-borrower-name").required = false;
                document.getElementById("edit-borrower-dept").required = false;
                document.getElementById("edit-borrower-date").required = false;
                document.getElementById("edit-borrower-return").required = false;
            }
        });
    }
}

function checkCurrentSession() {
    if (state.currentUser) {
        showDashboard();
    } else {
        showLoginForm();
    }
}

async function handleLogin(username, password) {
    const errorEl = document.getElementById("login-error");
    const errorTextEl = document.getElementById("error-text");

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (res.ok) {
            const data = await res.json();
            state.currentUser = data.user;
            sessionStorage.setItem("dept_current_user", JSON.stringify(state.currentUser));

            if (errorEl) errorEl.style.display = "none";
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";

            state.isOffline = false;
            await loadState();

            showToast(`ยินดีต้อนรับครับคุณ ${state.currentUser.name}!`, "success");
            showDashboard();
        } else {
            const data = await res.json().catch(() => ({}));
            if (errorEl && errorTextEl) {
                errorTextEl.textContent = data.message || "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง";
                errorEl.style.display = "flex";
            }
            showToast("ล็อกอินล้มเหลว กรุณาตรวจสอบข้อมูล", "error");
        }
    } catch (err) {
        console.warn("Auth server is offline, trying local auth:", err);
        if (state.users[username] && state.users[username].password === password) {
            state.currentUser = state.users[username];
            sessionStorage.setItem("dept_current_user", JSON.stringify(state.currentUser));

            if (errorEl) errorEl.style.display = "none";
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";

            state.isOffline = true;
            loadStateFromStorage();

            showToast(`[โหมดออฟไลน์] ยินดีต้อนรับครับคุณ ${state.currentUser.name}!`, "warning");
            showDashboard();
        } else {
            if (errorEl && errorTextEl) {
                errorTextEl.textContent = "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง หรือระบบเซิร์ฟเวอร์ขัดข้อง";
                errorEl.style.display = "flex";
            }
            showToast("ล็อกอินล้มเหลว กรุณาตรวจสอบข้อมูล", "error");
        }
    }
}

async function handleRegister() {
    const usernameInput = document.getElementById("reg-username").value.trim().toLowerCase();
    const passwordInput = document.getElementById("reg-password").value;
    const nameInput = document.getElementById("reg-name").value.trim();
    const deptInput = document.getElementById("reg-dept").value.trim();

    const errorEl = document.getElementById("register-error");
    const errorTextEl = document.getElementById("register-error-text");

    if (!usernameInput || !passwordInput || !nameInput || !deptInput) {
        if (errorEl && errorTextEl) {
            errorTextEl.textContent = "กรุณากรอกข้อมูลให้ครบถ้วนทุกฟิลด์";
            errorEl.style.display = "flex";
        }
        showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "error");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput,
                name: nameInput,
                department: deptInput
            })
        });

        if (res.ok) {
            const data = await res.json();
            state.users[usernameInput] = data.user;
            saveUsersToStorage();

            if (errorEl) errorEl.style.display = "none";
            document.getElementById("register-form").reset();

            showToast(`สมัครบัญชีผู้ใช้ "${usernameInput}" สำเร็จแล้ว! สามารถเข้าสู่ระบบได้เลย`, "success");

            const loginForm = document.getElementById("login-form");
            const registerForm = document.getElementById("register-form");
            if (registerForm) registerForm.classList.add("hidden");
            if (loginForm) {
                loginForm.classList.remove("hidden");
                document.getElementById("username").value = usernameInput;
                document.getElementById("password").focus();
            }
            state.isOffline = false;
        } else {
            const data = await res.json().catch(() => ({}));
            if (errorEl && errorTextEl) {
                errorTextEl.textContent = data.message || "สมัครบัญชีผู้ใช้งานไม่สำเร็จ";
                errorEl.style.display = "flex";
            }
            showToast(data.message || "สมัครบัญชีผู้ใช้งานไม่สำเร็จ", "error");
        }
    } catch (err) {
        console.warn("Register server is offline, trying local registration:", err);
        if (state.users[usernameInput]) {
            if (errorEl && errorTextEl) {
                errorTextEl.textContent = "ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น";
                errorEl.style.display = "flex";
            }
            showToast("ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว", "error");
            return;
        }

        const newUser = {
            username: usernameInput,
            password: passwordInput,
            name: nameInput,
            department: deptInput,
            role: "user",
            avatar: nameInput.charAt(0).toUpperCase()
        };

        state.users[usernameInput] = newUser;
        saveUsersToStorage();

        if (errorEl) errorEl.style.display = "none";
        document.getElementById("register-form").reset();

        showToast(`[โหมดออฟไลน์] สมัครบัญชีผู้ใช้ "${usernameInput}" สำเร็จแล้ว! สามารถเข้าสู่ระบบได้เลย`, "warning");

        const loginForm = document.getElementById("login-form");
        const registerForm = document.getElementById("register-form");
        if (registerForm) registerForm.classList.add("hidden");
        if (loginForm) {
            loginForm.classList.remove("hidden");
            document.getElementById("username").value = usernameInput;
            document.getElementById("password").focus();
        }
        state.isOffline = true;
    }
}

function handleLogout() {
    state.currentUser = null;
    sessionStorage.removeItem("dept_current_user");
    showToast("ออกจากระบบเรียบร้อยแล้ว", "warning");
    showLoginForm();
}

/* ==========================================================================
   NAVIGATION / VIEW SWITCHING
   ========================================================================== */
function showLoginForm() {
    document.getElementById("login-section").classList.remove("hidden");
    document.getElementById("dashboard-section").classList.add("hidden");
}

function showDashboard() {
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("dashboard-section").classList.remove("hidden");

    // Configure sidebar user info
    const avatarEl = document.getElementById("user-avatar");
    const avatarInitialEl = document.getElementById("user-avatar-initial");
    const displayNameEl = document.getElementById("user-display-name");
    const displayDeptEl = document.getElementById("user-display-dept");
    const roleBadgeEl = document.getElementById("user-role-badge");

    if (state.currentUser) {
        avatarInitialEl.textContent = state.currentUser.avatar;
        displayNameEl.textContent = state.currentUser.name;
        displayDeptEl.textContent = state.currentUser.department;

        if (state.currentUser.role === "admin") {
            roleBadgeEl.textContent = "อาจารย์ผู้ดูแล";
            roleBadgeEl.className = "badge badge-blue";
            document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("hidden"));
        } else {
            roleBadgeEl.textContent = "นักศึกษา";
            roleBadgeEl.className = "badge badge-purple";
            document.querySelectorAll(".admin-only").forEach(el => el.classList.add("hidden"));
        }
    }

    switchTab("equipment-tab");
    updateDashboardStats();
    renderEquipmentGrid();
    renderMyBorrowedItems();
    renderHistoryTable();
}

function switchTab(tabId) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach(tab => tab.classList.remove("active"));

    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => item.classList.remove("active"));

    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.add("active");

    const activeMenuItem = document.querySelector(`.menu-item[data-tab="${tabId}"]`);
    if (activeMenuItem) activeMenuItem.classList.add("active");

    const headerTitle = document.getElementById("current-tab-title");
    const headerSubtitle = document.getElementById("current-tab-subtitle");

    if (tabId === "equipment-tab") {
        headerTitle.textContent = "รายการอุปกรณ์ทั้งหมด";
        headerSubtitle.textContent = "ตรวจสอบ ค้นหา และกดยืมอุปกรณ์การเรียนที่พร้อมใช้งานภายในสาขาวิชา";
        renderEquipmentGrid();
    } else if (tabId === "my-items-tab") {
        headerTitle.textContent = "อุปกรณ์ที่ฉันยืมเรียน";
        headerSubtitle.textContent = "ตารางแสดงรายการอุปกรณ์การเรียนทั้งหมดที่คุณทำการยืมค้างไว้ในขณะนี้";
        renderMyBorrowedItems();
    } else if (tabId === "history-tab") {
        if (state.currentUser && state.currentUser.role === 'admin') {
            headerTitle.textContent = "ประวัติการยืม-คืนของแผนก";
            headerSubtitle.textContent = "บันทึกข้อมูลธุรกรรมการยืมและคืนทั้งหมดในแผนกเพื่อการตรวจสอบ (สิทธิ์ Admin IT)";
        } else {
            headerTitle.textContent = "ประวัติการยืม-คืนของฉัน";
            headerSubtitle.textContent = "บันทึกประวัติและธุรกรรมการยืม-คืนอุปกรณ์การเรียนของคุณเองทั้งหมด";
        }
        renderHistoryTable();
    } else if (tabId === "admin-tab") {
        headerTitle.textContent = "แผงควบคุมของคณาจารย์ (Admin Control Panel)";
        headerSubtitle.textContent = "สำหรับขึ้นทะเบียนอุปกรณ์ใหม่ ตรวจเช็คยอดเครื่องมือ และรีเซ็ตระบบฐานข้อมูล";
        renderAdminUserList();
    }

    lucide.createIcons();
}

/* ==========================================================================
   DASHBOARD / STATS COMPUTATION
   ========================================================================== */
function updateDashboardStats() {
    const total = state.equipment.length;
    const available = state.equipment.filter(e => e.status === "Available").length;
    const borrowed = total - available;
    const borrowRate = total > 0 ? Math.round((borrowed / total) * 100) : 0;

    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-available").textContent = available;
    document.getElementById("stat-borrowed").textContent = borrowed;
    document.getElementById("stat-rate").textContent = `${borrowRate}%`;

    if (state.currentUser) {
        const myItemsCount = state.equipment.filter(
            e => (e.status === "Borrowed" || e.status === "Pending") && e.borrowedBy && e.borrowedBy.username === state.currentUser.username
        ).length;

        const myItemsBadge = document.getElementById("my-borrow-count");
        if (myItemsCount > 0) {
            myItemsBadge.textContent = myItemsCount;
            myItemsBadge.classList.remove("hidden");
        } else {
            myItemsBadge.classList.add("hidden");
        }
    }
}

/* ==========================================================================
   RENDERERS
   ========================================================================== */
function renderEquipmentGrid() {
    const container = document.getElementById("equipment-grid-container");
    if (!container) return;

    container.innerHTML = "";

    const searchFilter = state.filters.equipmentSearch;
    const categoryFilter = state.filters.equipmentCategory;

    const filteredItems = state.equipment.filter(item => {
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        const matchesSearch = item.name.toLowerCase().includes(searchFilter) ||
            item.code.toLowerCase().includes(searchFilter) ||
            item.specs.toLowerCase().includes(searchFilter);
        return matchesCategory && matchesSearch;
    });

    if (filteredItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; padding: 40px 0;">
                <i data-lucide="package-search" class="empty-icon"></i>
                <h3>ไม่พบรายการอุปกรณ์</h3>
                <p>ขออภัย ไม่พบอุปกรณ์การเรียนที่ตรงกับคำค้นหาหรือหมวดหมู่ที่คุณเลือกในขณะนี้</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    filteredItems.forEach(item => {
        const isBorrowed = item.status === "Borrowed";
        const isPending = item.status === "Pending";
        let statusBadgeClass = "badge-purple";
        let statusText = "พร้อมให้ยืม";
        let cardBorderGlow = "";
        let actionButtonHTML = "";

        if (isBorrowed) {
            statusBadgeClass = "badge-orange";
            statusText = "กำลังถูกใช้งาน";
            cardBorderGlow = "border: 1px solid rgba(234, 88, 12, 0.25);";

            if (state.currentUser && item.borrowedBy && item.borrowedBy.username === state.currentUser.username) {
                actionButtonHTML = `
                    <button class="btn btn-danger btn-block btn-glow btn-sm" onclick="returnEquipment('${item.id}')">
                        <i data-lucide="corner-down-left"></i>
                        <span>กดคืนอุปกรณ์</span>
                    </button>
                `;
            } else {
                actionButtonHTML = `
                    <button class="btn btn-outline btn-block btn-sm" disabled>
                        <i data-lucide="lock"></i>
                        <span>ไม่ว่าง (ถูกยืมใช้งาน)</span>
                    </button>
                `;
            }
        } else if (isPending) {
            statusBadgeClass = "badge-pending";
            statusText = "รออนุมัติ";
            cardBorderGlow = "border: 1px solid rgba(14, 165, 233, 0.25);";

            if (state.currentUser && state.currentUser.role === 'admin') {
                actionButtonHTML = `
                    <div style="display: flex; gap: 8px; width: 100%;">
                        <button class="btn btn-primary btn-block btn-glow btn-sm" onclick="approveBorrow('${item.id}')" style="background: linear-gradient(135deg, #10B981, #059669); border-color: #10B981; flex: 1;">
                            <i data-lucide="check"></i>
                            <span>อนุมัติ</span>
                        </button>
                        <button class="btn btn-danger btn-block btn-glow btn-sm" onclick="rejectBorrow('${item.id}')" style="background: linear-gradient(135deg, #EF4444, #DC2626); border-color: #EF4444; flex: 1;">
                            <i data-lucide="x"></i>
                            <span>ปฏิเสธ</span>
                        </button>
                    </div>
                `;
            } else if (state.currentUser && item.borrowedBy && item.borrowedBy.username === state.currentUser.username) {
                actionButtonHTML = `
                    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                        <button class="btn btn-outline btn-block btn-sm" disabled style="color: #0284c7; border-color: #7dd3fc; background: rgba(14, 165, 233, 0.05);">
                            <i data-lucide="clock"></i>
                            <span>รออาจารย์อนุมัติการยืม</span>
                        </button>
                        <button class="btn btn-danger btn-block btn-glow btn-sm" onclick="rejectBorrow('${item.id}')" style="padding: 8px 16px; font-size: 0.8rem;">
                            <i data-lucide="trash-2"></i>
                            <span>ยกเลิกคำขอ</span>
                        </button>
                    </div>
                `;
            } else {
                actionButtonHTML = `
                    <button class="btn btn-outline btn-block btn-sm" disabled>
                        <i data-lucide="lock"></i>
                        <span>ไม่ว่าง (รออนุมัติ)</span>
                    </button>
                `;
            }
        } else {
            actionButtonHTML = `
                <button class="btn btn-primary btn-block btn-glow btn-sm" onclick="showBorrowModal('${item.id}')">
                    <i data-lucide="bookmark"></i>
                    <span>กดยืมอุปกรณ์เรียน</span>
                </button>
            `;
        }

        let categoryIcon = "laptop";
        if (item.category === "Mouse") categoryIcon = "mouse";
        else if (item.category === "Keyboard") categoryIcon = "keyboard";
        else if (item.category === "Charger") categoryIcon = "zap";

        const card = document.createElement("div");
        card.className = "equipment-card animate-zoom";
        card.style = cardBorderGlow;

        card.innerHTML = `
            <div>
                <div class="card-header-top">
                    <div class="card-icon-box">
                        <i data-lucide="${categoryIcon}"></i>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                        <span class="badge ${statusBadgeClass}">${statusText}</span>
                        ${state.currentUser && state.currentUser.role === 'admin' ? `
                            <div class="admin-card-actions">
                                <button class="btn-admin-action" onclick="showEditModal('${item.id}')" title="แก้ไขข้อมูลอุปกรณ์">
                                    <i data-lucide="edit-3"></i>
                                </button>
                                <button class="btn-admin-action btn-admin-danger" onclick="deleteEquipment('${item.id}')" title="ลบเครื่องมืออุปกรณ์">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="card-body-details">
                    <span class="asset-code">${item.code}</span>
                    <h4 title="${item.name}">${item.name}</h4>
                    <p class="spec-text" title="${item.specs}">${item.specs}</p>
                    
                    ${(isBorrowed || isPending) && item.borrowedBy ? `
                        <div class="borrow-info-block">
                            <span><i data-lucide="user"></i> ผู้ใช้: <strong>${item.borrowedBy.name}</strong></span>
                            <span><i data-lucide="book-open"></i> ชั้นเรียน: <strong>${item.borrowedBy.department}</strong></span>
                            <span><i data-lucide="calendar"></i> ${isPending ? 'ขอรับภายใน' : 'คืนภายใน'}: <strong>${formatThaiDate(item.borrowedBy.expectedReturnDate)}</strong></span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="card-footer-actions">
                ${actionButtonHTML}
            </div>
        `;

        container.appendChild(card);
    });

    lucide.createIcons();
}

function renderMyBorrowedItems() {
    const tableBody = document.getElementById("my-borrow-table-body");
    const emptyState = document.getElementById("my-borrow-empty");
    const tableWrapper = document.querySelector("#my-items-tab .glass-table-wrapper");
    const infoBanner = document.querySelector("#my-items-tab .info-banner");

    if (!tableBody || !state.currentUser) return;

    tableBody.innerHTML = "";

    const myBorrowed = state.equipment.filter(
        item => (item.status === "Borrowed" || item.status === "Pending") && item.borrowedBy && item.borrowedBy.username === state.currentUser.username
    );

    if (myBorrowed.length === 0) {
        if (emptyState) emptyState.classList.remove("hidden");
        if (tableWrapper) tableWrapper.classList.add("hidden");
        if (infoBanner) infoBanner.classList.add("hidden");
        return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (tableWrapper) tableWrapper.classList.remove("hidden");
    if (infoBanner) infoBanner.classList.remove("hidden");

    myBorrowed.forEach(item => {
        let categoryIcon = "laptop";
        if (item.category === "Mouse") categoryIcon = "mouse";
        else if (item.category === "Keyboard") categoryIcon = "keyboard";
        else if (item.category === "Charger") categoryIcon = "zap";

        const isPending = item.status === "Pending";
        let actionBtnHTML = "";
        let statusBadgeHTML = "";
        let returnDateHTML = "";

        if (isPending) {
            statusBadgeHTML = `<span class="badge badge-pending">รออนุมัติ</span>`;
            returnDateHTML = `<span style="color: #0284c7; font-weight:700;">รอการอนุมัติ</span>`;
            actionBtnHTML = `
                <button class="btn btn-danger btn-block btn-glow btn-xs" onclick="rejectBorrow('${item.id}')">
                    <i data-lucide="trash-2"></i> ยกเลิกคำขอ
                </button>
            `;
        } else {
            statusBadgeHTML = `<span class="badge badge-orange">ยืมใช้งาน</span>`;
            returnDateHTML = `<strong style="color: var(--accent-orange);">${formatThaiDate(item.borrowedBy.expectedReturnDate)}</strong>`;
            actionBtnHTML = `
                <button class="btn btn-outline btn-glow btn-xs" onclick="returnEquipment('${item.id}')" style="border-color: rgba(220, 38, 38, 0.3); color: var(--accent-red);">
                    <i data-lucide="corner-down-left"></i> กดคืน
                </button>
            `;
        }

        const row = document.createElement("tr");
        row.className = "table-row-item";
        row.innerHTML = `
            <td style="font-family: monospace; font-weight: 700; color: var(--accent-blue);">${item.code}</td>
            <td>
                <div class="table-item-name">
                    <div class="table-icon-wrapper">
                        <i data-lucide="${categoryIcon}"></i>
                    </div>
                    <div>
                        <div style="font-weight:700; color: var(--text-primary);">${item.name}</div>
                        <div style="font-size:0.75rem; color: var(--text-muted);">${item.specs}</div>
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span class="badge badge-blue" style="width:fit-content;">${item.category}</span>
                    ${statusBadgeHTML}
                </div>
            </td>
            <td>${formatThaiDate(item.borrowedBy.borrowDate)}</td>
            <td>${returnDateHTML}</td>
            <td>
                ${actionBtnHTML}
            </td>
        `;
        tableBody.appendChild(row);
    });

    lucide.createIcons();
}

function renderHistoryTable() {
    const tableBody = document.getElementById("history-table-body");
    const emptyState = document.getElementById("history-empty");
    const tableWrapper = document.querySelector("#history-tab .glass-table-wrapper");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    const searchFilter = state.filters.historySearch;

    const filteredHistory = state.history.filter(log => {
        // Enforce separation: only admins see everything. Regular users only see their own logs.
        const isAuthorized = state.currentUser && (state.currentUser.role === 'admin' || log.userId === state.currentUser.username);
        if (!isAuthorized) return false;

        return log.userName.toLowerCase().includes(searchFilter) ||
            log.userDept.toLowerCase().includes(searchFilter) ||
            log.itemName.toLowerCase().includes(searchFilter) ||
            log.itemCode.toLowerCase().includes(searchFilter);
    });

    filteredHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (filteredHistory.length === 0) {
        if (emptyState) emptyState.classList.remove("hidden");
        if (tableWrapper) tableWrapper.classList.add("hidden");
        return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (tableWrapper) tableWrapper.classList.remove("hidden");

    filteredHistory.forEach(log => {
        const isBorrow = log.type === "borrow";
        let typeBadgeHTML = "";
        let returnDateHTML = "-";

        if (isBorrow) {
            if (log.status === "Borrowed") {
                typeBadgeHTML = `<span class="badge badge-orange"><i data-lucide="clock" style="width:10px;height:10px;margin-right:4px;"></i>ยืมใช้เรียน</span>`;
            } else if (log.status === "Pending") {
                typeBadgeHTML = `<span class="badge badge-pending"><i data-lucide="clock" style="width:10px;height:10px;margin-right:4px;"></i>รออาจารย์อนุมัติ</span>`;
            } else if (log.status === "Rejected") {
                typeBadgeHTML = `<span class="badge badge-red"><i data-lucide="x" style="width:10px;height:10px;margin-right:4px;"></i>ปฏิเสธการยืม</span>`;
            } else if (log.status === "Cancelled") {
                typeBadgeHTML = `<span class="badge badge-red"><i data-lucide="trash-2" style="width:10px;height:10px;margin-right:4px;"></i>ยกเลิกคำขอ</span>`;
            } else {
                typeBadgeHTML = `<span class="badge badge-blue">รอส่งมอบ</span>`;
            }
        } else {
            typeBadgeHTML = `<span class="badge badge-green"><i data-lucide="check" style="width:10px;height:10px;margin-right:4px;"></i>คืนอุปกรณ์แล้ว</span>`;
        }

        if (log.actualReturnDate) {
            returnDateHTML = formatThaiDate(log.actualReturnDate);
        } else if (log.expectedReturnDate) {
            returnDateHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">กำหนดคืน: ${formatThaiDate(log.expectedReturnDate)}</span>`;
        }

        const logDate = new Date(log.timestamp);
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const formattedTimestamp = `${formatThaiDate(log.timestamp.split('T')[0])} ${logDate.toLocaleTimeString('th-TH', timeOptions)} น.`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td style="font-size: 0.8rem;">${formattedTimestamp}</td>
            <td>
                <div style="font-weight:700; color: var(--text-primary);">${log.userName}</div>
                <div style="font-size: 0.75rem; color: var(--accent-indigo); font-weight:600;">${log.userDept}</div>
            </td>
            <td>
                <div style="font-weight:600; color: var(--text-primary);">${log.itemName}</div>
                <div style="font-family: monospace; font-size:0.75rem; color: var(--text-muted);">${log.itemCode}</div>
            </td>
            <td>${formatThaiDate(log.borrowDate)}</td>
            <td>${returnDateHTML}</td>
            <td>${typeBadgeHTML}</td>
        `;
        tableBody.appendChild(row);
    });

    lucide.createIcons();
}

/* ==========================================================================
   BORROW ACTION FLOW
   ========================================================================== */
function showBorrowModal(itemId) {
    const item = state.equipment.find(e => e.id === itemId);
    if (!item || !state.currentUser) return;

    document.getElementById("borrow-item-id").value = item.id;
    document.getElementById("modal-item-name").textContent = item.name;
    document.getElementById("modal-item-code").textContent = item.code;

    const modalIcon = document.getElementById("modal-item-icon");
    if (modalIcon) {
        let categoryIcon = "laptop";
        if (item.category === "Mouse") categoryIcon = "mouse";
        else if (item.category === "Keyboard") categoryIcon = "keyboard";
        else if (item.category === "Charger") categoryIcon = "zap";
        modalIcon.setAttribute("data-lucide", categoryIcon);
    }

    document.getElementById("modal-borrower-name").textContent = state.currentUser.name;
    document.getElementById("modal-borrower-dept").textContent = state.currentUser.department;

    const todayStr = getLocalDateString(new Date());
    document.getElementById("modal-borrow-date").textContent = formatThaiDate(todayStr);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const expectedReturnInput = document.getElementById("expected-return-date");
    expectedReturnInput.value = getLocalDateString(nextWeek);
    expectedReturnInput.min = todayStr;

    const modal = document.getElementById("borrow-modal");
    modal.classList.remove("hidden");

    lucide.createIcons();
}

function hideBorrowModal() {
    const modal = document.getElementById("borrow-modal");
    if (modal) modal.classList.add("hidden");
    document.getElementById("borrow-form").reset();
}

async function executeBorrowAction() {
    const itemId = document.getElementById("borrow-item-id").value;
    const expectedReturnVal = document.getElementById("expected-return-date").value;

    if (!itemId || !expectedReturnVal) {
        showToast("กรุณาระบุวันส่งคืนอุปกรณ์ให้ถูกต้อง", "error");
        return;
    }

    const itemIndex = state.equipment.findIndex(e => e.id === itemId);
    if (itemIndex === -1) {
        showToast("ไม่พบอุปกรณ์", "error");
        hideBorrowModal();
        return;
    }

    const todayStr = getLocalDateString(new Date());

    try {
        const res = await fetch(`${API_URL}/equipment/${itemId}/borrow`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: state.currentUser.username,
                name: state.currentUser.name,
                department: state.currentUser.department,
                expectedReturnDate: expectedReturnVal
            })
        });

        if (res.ok) {
            state.isOffline = false;
            await loadState();

            updateDashboardStats();
            renderEquipmentGrid();
            renderMyBorrowedItems();
            renderHistoryTable();

            hideBorrowModal();
            showToast(`ยืนยันการยืมอุปกรณ์ "${state.equipment.find(e => e.id === itemId).name}" เสร็จสิ้น!`, "success");
        } else {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "ทำรายการยืมอุปกรณ์ไม่สำเร็จ", "error");
            hideBorrowModal();
        }
    } catch (err) {
        console.warn("Borrow server offline, falling back to local execution:", err);
        if (state.equipment[itemIndex].status === "Borrowed") {
            showToast("อุปกรณ์มีผู้กดยืมไปก่อนหน้าแล้ว (โหมดออฟไลน์)", "error");
            hideBorrowModal();
            return;
        }

        const borrowMeta = {
            username: state.currentUser.username,
            name: state.currentUser.name,
            department: state.currentUser.department,
            borrowDate: todayStr,
            expectedReturnDate: expectedReturnVal
        };

        state.equipment[itemIndex].status = "Borrowed";
        state.equipment[itemIndex].borrowedBy = borrowMeta;

        const newLog = {
            id: "hist-" + Date.now(),
            timestamp: new Date().toISOString(),
            type: "borrow",
            userId: state.currentUser.username,
            userName: state.currentUser.name,
            userDept: state.currentUser.department,
            itemId: itemId,
            itemName: state.equipment[itemIndex].name,
            itemCode: state.equipment[itemIndex].code,
            borrowDate: todayStr,
            expectedReturnDate: expectedReturnVal,
            actualReturnDate: null,
            status: "Borrowed"
        };

        state.history.push(newLog);

        state.isOffline = true;
        saveStateToStorage();
        updateDashboardStats();
        renderEquipmentGrid();
        renderMyBorrowedItems();
        renderHistoryTable();

        hideBorrowModal();
        showToast(`[โหมดออฟไลน์] ยืนยันการยืมอุปกรณ์ "${state.equipment[itemIndex].name}" เสร็จสิ้น!`, "warning");
    }
}

/* ==========================================================================
   RETURN ACTION FLOW
   ========================================================================== */
async function returnEquipment(itemId) {
    const itemIndex = state.equipment.findIndex(e => e.id === itemId);
    if (itemIndex === -1) {
        showToast("ไม่พบอุปกรณ์", "error");
        return;
    }

    const item = state.equipment[itemIndex];
    const borrower = item.borrowedBy;
    const todayStr = getLocalDateString(new Date());

    if (state.currentUser.role !== "admin" && (!borrower || borrower.username !== state.currentUser.username)) {
        showToast("สิทธิ์การคืนเฉพาะนักศึกษาผู้ยืมหรืออาจารย์ผู้ดูแลเท่านั้น", "error");
        return;
    }

    if (!confirm(`คุณต้องการยืนยันการส่งคืนอุปกรณ์การเรียน "${item.name}" ใช่หรือไม่?`)) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/equipment/${itemId}/return`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: state.currentUser.username,
                userRole: state.currentUser.role
            })
        });

        if (res.ok) {
            state.isOffline = false;
            await loadState();

            updateDashboardStats();
            renderEquipmentGrid();
            renderMyBorrowedItems();
            renderHistoryTable();

            showToast(`ส่งคืนอุปกรณ์ "${state.equipment.find(e => e.id === itemId).name}" เข้าระบบห้องแผนกเรียบร้อย!`, "success");
        } else {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "เกิดข้อผิดพลาดในการส่งคืนอุปกรณ์", "error");
        }
    } catch (err) {
        console.warn("Return server offline, falling back to local execution:", err);
        if (state.equipment[itemIndex].status === "Available") {
            showToast("อุปกรณ์คืนเข้าระบบเรียบร้อยแล้ว (โหมดออฟไลน์)", "error");
            return;
        }

        const activeHistoryIndex = state.history.findIndex(
            h => h.itemId === itemId && h.userId === borrower.username && h.status === "Borrowed"
        );

        if (activeHistoryIndex !== -1) {
            state.history[activeHistoryIndex].status = "Returned";
            state.history[activeHistoryIndex].actualReturnDate = todayStr;
        }

        const returnLog = {
            id: "hist-" + Date.now(),
            timestamp: new Date().toISOString(),
            type: "return",
            userId: borrower.username,
            userName: borrower.name,
            userDept: borrower.department,
            itemId: itemId,
            itemName: item.name,
            itemCode: item.code,
            borrowDate: borrower.borrowDate,
            expectedReturnDate: borrower.expectedReturnDate,
            actualReturnDate: todayStr,
            status: "Returned"
        };
        state.history.push(returnLog);

        state.equipment[itemIndex].status = "Available";
        state.equipment[itemIndex].borrowedBy = null;

        state.isOffline = true;
        saveStateToStorage();
        updateDashboardStats();
        renderEquipmentGrid();
        renderMyBorrowedItems();
        renderHistoryTable();

        showToast(`[โหมดออฟไลน์] ส่งคืนอุปกรณ์ "${item.name}" เข้าระบบเรียบร้อย!`, "warning");
    }
}

/* ==========================================================================
   APPROVE & REJECT ACTION FLOW
   ========================================================================== */
async function approveBorrow(itemId) {
    if (state.currentUser.role !== "admin") {
        showToast("สิทธิ์การอนุมัติเฉพาะผู้ดูแลระบบเท่านั้น", "error");
        return;
    }

    const item = state.equipment.find(e => e.id === itemId);
    if (!item) return;

    if (!confirm(`คุณต้องการยืนยันการอนุมัติให้คุณ "${item.borrowedBy ? item.borrowedBy.name : 'นักศึกษา'}" ยืม "${item.name}" ใช่หรือไม่?`)) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/equipment/${itemId}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userRole: state.currentUser.role
            })
        });

        if (res.ok) {
            state.isOffline = false;
            await loadState();

            updateDashboardStats();
            renderEquipmentGrid();
            renderMyBorrowedItems();
            renderHistoryTable();

            showToast(`อนุมัติคำขอการยืมอุปกรณ์ "${item.name}" เรียบร้อยแล้ว!`, "success");
        } else {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "เกิดข้อผิดพลาดในการอนุมัติการยืม", "error");
        }
    } catch (err) {
        console.warn("Approve server offline, falling back to local execution:", err);
        const itemIndex = state.equipment.findIndex(e => e.id === itemId);
        if (itemIndex !== -1 && state.equipment[itemIndex].status === "Pending") {
            state.equipment[itemIndex].status = "Borrowed";
            const activeHistoryIndex = state.history.findIndex(
                h => h.itemId === itemId && h.status === "Pending"
            );
            if (activeHistoryIndex !== -1) {
                state.history[activeHistoryIndex].status = "Borrowed";
            }
            state.isOffline = true;
            saveStateToStorage();
            updateDashboardStats();
            renderEquipmentGrid();
            renderMyBorrowedItems();
            renderHistoryTable();
            showToast(`[โหมดออฟไลน์] อนุมัติการยืมอุปกรณ์ "${item.name}" เรียบร้อย!`, "warning");
        }
    }
}

async function rejectBorrow(itemId) {
    const item = state.equipment.find(e => e.id === itemId);
    if (!item) return;

    const isUserRoleAdmin = state.currentUser.role === "admin";
    const promptMsg = isUserRoleAdmin 
        ? `คุณต้องการปฏิเสธคำขอการยืมอุปกรณ์ "${item.name}" ใช่หรือไม่?`
        : `คุณต้องการยกเลิกคำขอการยืมอุปกรณ์ "${item.name}" ใช่หรือไม่?`;

    if (!confirm(promptMsg)) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/equipment/${itemId}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: state.currentUser.username,
                userRole: state.currentUser.role
            })
        });

        if (res.ok) {
            state.isOffline = false;
            await loadState();

            updateDashboardStats();
            renderEquipmentGrid();
            renderMyBorrowedItems();
            renderHistoryTable();

            const toastMsg = isUserRoleAdmin ? "ปฏิเสธคำขอการยืมอุปกรณ์เสร็จสิ้น" : "ยกเลิกคำขอการยืมอุปกรณ์เรียบร้อยแล้ว";
            showToast(toastMsg, "success");
        } else {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "เกิดข้อผิดพลาดในการดำเนินรายการ", "error");
        }
    } catch (err) {
        console.warn("Reject server offline, falling back to local execution:", err);
        const itemIndex = state.equipment.findIndex(e => e.id === itemId);
        if (itemIndex !== -1 && state.equipment[itemIndex].status === "Pending") {
            state.equipment[itemIndex].status = "Available";
            state.equipment[itemIndex].borrowedBy = null;

            const activeHistoryIndex = state.history.findIndex(
                h => h.itemId === itemId && h.status === "Pending"
            );
            if (activeHistoryIndex !== -1) {
                state.history[activeHistoryIndex].status = isUserRoleAdmin ? "Rejected" : "Cancelled";
            }

            state.isOffline = true;
            saveStateToStorage();
            updateDashboardStats();
            renderEquipmentGrid();
            renderMyBorrowedItems();
            renderHistoryTable();
            showToast(`[โหมดออฟไลน์] ดำเนินการปฏิเสธ/ยกเลิกรายการเสร็จสิ้น!`, "warning");
        }
    }
}

/* ==========================================================================
   ADMIN SETTINGS ACTIONS
   ========================================================================== */
async function handleAddEquipment() {
    const name = document.getElementById("eq-name").value.trim();
    const category = document.getElementById("eq-category").value;
    const code = document.getElementById("eq-code").value.trim().toUpperCase();
    const specs = document.getElementById("eq-spec").value.trim() || "ไม่มีรายละเอียดสเปก";

    if (!name || !code) {
        showToast("กรุณากรอกข้อมูลชื่ออุปกรณ์และรหัสครุภัณฑ์", "error");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/equipment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                category,
                code,
                specs,
                userRole: state.currentUser.role
            })
        });

        if (res.ok) {
            state.isOffline = false;
            await loadState();

            document.getElementById("add-equipment-form").reset();

            updateDashboardStats();
            renderEquipmentGrid();
            showToast(`ขึ้นทะเบียนและขึ้นบอร์ดอุปกรณ์ "${name}" สำเร็จ`, "success");

            switchTab("equipment-tab");
        } else {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "ไม่สามารถเพิ่มอุปกรณ์ได้", "error");
        }
    } catch (err) {
        console.warn("Add equipment server offline, falling back to local execution:", err);
        if (state.equipment.some(e => e.code === code)) {
            showToast(`รหัสอุปกรณ์ "${code}" นี้ขึ้นทะเบียนไว้แล้ว (โหมดออฟไลน์)`, "error");
            return;
        }

        const newEq = {
            id: "eq-" + Date.now(),
            name: name,
            category: category,
            code: code,
            specs: specs,
            status: "Available",
            borrowedBy: null
        };

        state.equipment.push(newEq);
        state.isOffline = true;
        saveStateToStorage();

        document.getElementById("add-equipment-form").reset();

        updateDashboardStats();
        renderEquipmentGrid();
        showToast(`[โหมดออฟไลน์] ขึ้นทะเบียนอุปกรณ์ "${name}" สำเร็จ`, "warning");

        switchTab("equipment-tab");
    }
}

async function resetSystemData() {
    if (confirm("🚨 คำเตือนคณาจารย์! คุณแน่ใจที่จะล้างข้อมูลอุปกรณ์และประวัติการเรียนการยืมเพื่อรีเซ็ตกลับเป็นค่าเริ่มต้นใช่หรือไม่?")) {
        try {
            const res = await fetch(`${API_URL}/admin/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userRole: state.currentUser.role
                })
            });

            if (res.ok) {
                state.isOffline = false;
                await loadState();

                updateDashboardStats();
                renderEquipmentGrid();
                renderMyBorrowedItems();
                renderHistoryTable();

                showToast("รีเซ็ตระบบฐานข้อมูลการยืมแผนกเทคโนโลยีธุรกิจดิจิทัลสำเร็จ", "success");
                switchTab("equipment-tab");
            } else {
                const data = await res.json().catch(() => ({}));
                showToast(data.error || "ไม่สามารถรีเซ็ตระบบได้", "error");
            }
        } catch (err) {
            console.warn("Reset server offline, falling back to local reset:", err);

            localStorage.removeItem("dept_equipment");
            localStorage.removeItem("dept_history");
            localStorage.removeItem("dept_users");

            state.isOffline = true;
            loadStateFromStorage();
            updateDashboardStats();
            renderEquipmentGrid();
            renderMyBorrowedItems();
            renderHistoryTable();

            showToast("[โหมดออฟไลน์] รีเซ็ตระบบฐานข้อมูลสำเร็จ", "warning");
            switchTab("equipment-tab");
        }
    }
}

/* ==========================================================================
   CSV EXPORTER
   ========================================================================== */
function exportHistoryToCSV() {
    // Only export logs that the user is authorized to view
    const historyToExport = state.history.filter(log => {
        return state.currentUser && (state.currentUser.role === 'admin' || log.userId === state.currentUser.username);
    });

    if (historyToExport.length === 0) {
        showToast("ไม่พบข้อมูลรายงานประวัติเพื่อส่งออกในขณะนี้", "error");
        return;
    }

    let csvContent = "\uFEFF";
    csvContent += "วันเวลาทำรายการ,ประเภทธุรกรรม,ชื่อผู้ทำรายการ,ระดับชั้น,รหัสครุภัณฑ์,ชื่ออุปกรณ์,วันที่เริ่มยืม,กำหนดวันส่งคืน,วันที่ส่งคืนจริง,สถานะ\n";

    historyToExport.forEach(log => {
        const typeStr = log.type === "borrow" ? "ยืมเรียน" : "ส่งคืน";
        const returnDateStr = log.actualReturnDate || "";
        const expectedDateStr = log.expectedReturnDate || "";
        const statusStr = log.status === "Borrowed" ? "กำลังใช้เรียน (ค้างส่ง)" : "คืนแล้ว";
        const formattedTimestamp = new Date(log.timestamp).toLocaleString("th-TH");

        csvContent += `"${formattedTimestamp}","${typeStr}","${log.userName}","${log.userDept}","${log.itemCode}","${log.itemName}","${log.borrowDate}","${expectedDateStr}","${returnDateStr}","${statusStr}"\n`;
    });

    const filename = state.currentUser.role === "admin" ? "digital_biz_tech_all_history" : `my_history_${state.currentUser.username}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${getLocalDateString(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("ดาวน์โหลดรายงานประวัติการยืม-คืนเสร็จสมบูรณ์", "success");
}

/* ==========================================================================
   UTILITY HELPER FUNCTIONS
   ========================================================================== */
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconName = "check-circle-2";
    let iconClass = "toast-success-icon";

    if (type === "error") {
        iconName = "x-circle";
        iconClass = "toast-error-icon";
    } else if (type === "warning") {
        iconName = "alert-triangle";
        iconClass = "toast-warning-icon";
    }

    toast.innerHTML = `
        <i data-lucide="${iconName}" class="${iconClass}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = "slideOutRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards";
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 4000);
}

const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(120%); opacity: 0; }
}
`;
document.head.appendChild(styleSheet);

function getLocalDateString(date) {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
}

function formatThaiDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;

    const thaiMonths = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];

    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;

    return `${day} ${month} ${year}`;
}

/* ==========================================================================
   ADMIN MANAGEMENT ACTIONS (EDIT & DELETE)
   ========================================================================== */
function showEditModal(itemId) {
    const item = state.equipment.find(e => e.id === itemId);
    if (!item) return;

    // Prefill equipment details
    document.getElementById("edit-item-id").value = item.id;
    document.getElementById("edit-eq-name").value = item.name;
    document.getElementById("edit-eq-category").value = item.category;
    document.getElementById("edit-eq-code").value = item.code;
    document.getElementById("edit-eq-spec").value = item.specs;
    document.getElementById("edit-eq-status").value = item.status;

    const borrowerDetails = document.getElementById("edit-borrower-details");
    const isBorrowed = item.status === "Borrowed";

    if (isBorrowed && item.borrowedBy) {
        borrowerDetails.classList.remove("hidden");
        document.getElementById("edit-borrower-username").value = item.borrowedBy.username || "";
        document.getElementById("edit-borrower-name").value = item.borrowedBy.name || "";
        document.getElementById("edit-borrower-dept").value = item.borrowedBy.department || "";
        document.getElementById("edit-borrower-date").value = item.borrowedBy.borrowDate || "";
        document.getElementById("edit-borrower-return").value = item.borrowedBy.expectedReturnDate || "";

        document.getElementById("edit-borrower-username").required = true;
        document.getElementById("edit-borrower-name").required = true;
        document.getElementById("edit-borrower-dept").required = true;
        document.getElementById("edit-borrower-date").required = true;
        document.getElementById("edit-borrower-return").required = true;
    } else {
        borrowerDetails.classList.add("hidden");
        document.getElementById("edit-borrower-username").value = "";
        document.getElementById("edit-borrower-name").value = "";
        document.getElementById("edit-borrower-dept").value = "";
        document.getElementById("edit-borrower-date").value = "";
        document.getElementById("edit-borrower-return").value = "";

        document.getElementById("edit-borrower-username").required = false;
        document.getElementById("edit-borrower-name").required = false;
        document.getElementById("edit-borrower-dept").required = false;
        document.getElementById("edit-borrower-date").required = false;
        document.getElementById("edit-borrower-return").required = false;
    }

    const modal = document.getElementById("edit-modal");
    if (modal) modal.classList.remove("hidden");

    lucide.createIcons();
}

function hideEditModal() {
    const modal = document.getElementById("edit-modal");
    if (modal) modal.classList.add("hidden");
    document.getElementById("edit-form").reset();
}

async function executeEditAction() {
    const itemId = document.getElementById("edit-item-id").value;
    const nameVal = document.getElementById("edit-eq-name").value.trim();
    const categoryVal = document.getElementById("edit-eq-category").value;
    const codeVal = document.getElementById("edit-eq-code").value.trim().toUpperCase();
    const specVal = document.getElementById("edit-eq-spec").value.trim();
    const statusVal = document.getElementById("edit-eq-status").value;

    const itemIndex = state.equipment.findIndex(e => e.id === itemId);
    if (itemIndex === -1) {
        showToast("ไม่พบอุปกรณ์ตัวนี้ในระบบ", "error");
        hideEditModal();
        return;
    }

    let borrowedBy = null;
    if (statusVal === "Borrowed") {
        const username = document.getElementById("edit-borrower-username").value.trim();
        const name = document.getElementById("edit-borrower-name").value.trim();
        const department = document.getElementById("edit-borrower-dept").value.trim();
        const borrowDate = document.getElementById("edit-borrower-date").value;
        const expectedReturnDate = document.getElementById("edit-borrower-return").value;

        if (!username || !name || !department || !borrowDate || !expectedReturnDate) {
            showToast("กรุณากรอกรายละเอียดผู้ยืมใช้งานให้ครบถ้วน", "error");
            return;
        }

        borrowedBy = { username, name, department, borrowDate, expectedReturnDate };
    }

    try {
        const res = await fetch(`${API_URL}/equipment/${itemId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: nameVal,
                category: categoryVal,
                code: codeVal,
                specs: specVal,
                status: statusVal,
                borrowedBy: borrowedBy,
                userRole: state.currentUser.role
            })
        });

        if (res.ok) {
            state.isOffline = false;
            await loadState();

            updateDashboardStats();
            renderEquipmentGrid();
            renderMyBorrowedItems();
            renderHistoryTable();

            hideEditModal();
            showToast(`แก้ไขและบันทึกครุภัณฑ์ "${nameVal}" เรียบร้อยแล้ว`, "success");
        } else {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
        }
    } catch (err) {
        console.warn("Edit equipment server offline, falling back to local execution:", err);
        if (state.equipment.some(e => e.code === codeVal && e.id !== itemId)) {
            showToast(`รหัสครุภัณฑ์ "${codeVal}" ซ้ำกับอุปกรณ์เครื่องอื่น (โหมดออฟไลน์)`, "error");
            return;
        }

        if (statusVal === "Borrowed") {
            if (state.equipment[itemIndex].status !== "Borrowed") {
                const newLog = {
                    id: "hist-" + Date.now(),
                    timestamp: new Date().toISOString(),
                    type: "borrow",
                    userId: borrowedBy.username,
                    userName: borrowedBy.name,
                    userDept: borrowedBy.department,
                    itemId: itemId,
                    itemName: nameVal,
                    itemCode: codeVal,
                    borrowDate: borrowedBy.borrowDate,
                    expectedReturnDate: borrowedBy.expectedReturnDate,
                    actualReturnDate: null,
                    status: "Borrowed"
                };
                state.history.push(newLog);
            }
        } else {
            if (state.equipment[itemIndex].status === "Borrowed" && state.equipment[itemIndex].borrowedBy) {
                const prevBorrower = state.equipment[itemIndex].borrowedBy;
                const activeHistoryIndex = state.history.findIndex(
                    h => h.itemId === itemId && h.userId === prevBorrower.username && h.status === "Borrowed"
                );
                const todayStr = getLocalDateString(new Date());

                if (activeHistoryIndex !== -1) {
                    state.history[activeHistoryIndex].status = "Returned";
                    state.history[activeHistoryIndex].actualReturnDate = todayStr;
                }

                const returnLog = {
                    id: "hist-" + Date.now(),
                    timestamp: new Date().toISOString(),
                    type: "return",
                    userId: prevBorrower.username,
                    userName: prevBorrower.name,
                    userDept: prevBorrower.department,
                    itemId: itemId,
                    itemName: nameVal,
                    itemCode: codeVal,
                    borrowDate: prevBorrower.borrowDate,
                    expectedReturnDate: prevBorrower.expectedReturnDate,
                    actualReturnDate: todayStr,
                    status: "Returned"
                };
                state.history.push(returnLog);
            }
        }

        state.equipment[itemIndex].name = nameVal;
        state.equipment[itemIndex].category = categoryVal;
        state.equipment[itemIndex].code = codeVal;
        state.equipment[itemIndex].specs = specVal;
        state.equipment[itemIndex].status = statusVal;
        state.equipment[itemIndex].borrowedBy = borrowedBy;

        state.isOffline = true;
        saveStateToStorage();
        updateDashboardStats();
        renderEquipmentGrid();
        renderMyBorrowedItems();
        renderHistoryTable();

        hideEditModal();
        showToast(`[โหมดออฟไลน์] แก้ไขและบันทึกครุภัณฑ์ "${nameVal}" เรียบร้อยแล้ว`, "warning");
    }
}

async function deleteEquipment(itemId) {
    const item = state.equipment.find(e => e.id === itemId);
    if (!item) {
        showToast("ไม่พบอุปกรณ์ตัวนี้ในระบบ", "error");
        return;
    }

    if (state.currentUser.role !== "admin") {
        showToast("สิทธิ์ในการลบครุภัณฑ์เฉพาะอาจารย์ผู้ดูแลเท่านั้น", "error");
        return;
    }

    if (!confirm(`🚨 คุณแน่ใจที่จะต้องการลบและยกเลิกครุภัณฑ์ "${item.name}" (รหัส: ${item.code}) ออกจากแผนกเทคโนโลยีธุรกิจดิจิทัลใช่หรือไม่?`)) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/equipment/${itemId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userRole: state.currentUser.role
            })
        });

        if (res.ok) {
            state.isOffline = false;
            await loadState();

            updateDashboardStats();
            renderEquipmentGrid();
            renderMyBorrowedItems();
            renderHistoryTable();

            showToast(`ลบครุภัณฑ์ "${item.name}" ออกจากระบบห้องแผนกเรียบร้อย`, "success");
        } else {
            const data = await res.json().catch(() => ({}));
            showToast(data.error || "เกิดข้อผิดพลาดในการลบอุปกรณ์", "error");
        }
    } catch (err) {
        console.warn("Delete equipment server offline, falling back to local execution:", err);

        state.equipment = state.equipment.filter(e => e.id !== itemId);

        state.isOffline = true;
        saveStateToStorage();
        updateDashboardStats();
        renderEquipmentGrid();
        renderMyBorrowedItems();
        renderHistoryTable();

        showToast(`[โหมดออฟไลน์] ลบครุภัณฑ์ "${item.name}" ออกจากระบบเรียบร้อย`, "warning");
    }
}

function renderAdminUserList() {
    const container = document.getElementById("admin-user-list-preview");
    if (!container) return;

    container.innerHTML = "";

    // Convert state.users dictionary to array
    const usersList = Object.values(state.users);

    if (usersList.length === 0) {
        container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted);">ไม่มีบัญชีผู้ใช้งานในระบบ</div>`;
        return;
    }

    usersList.forEach(user => {
        const isAdmin = user.role === "admin";
        const roleClass = isAdmin ? "admin" : "user";
        const roleLabel = isAdmin ? "อาจารย์ Admin" : user.department || "นักศึกษา";
        const initial = user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : "U");

        const pill = document.createElement("div");
        pill.className = "user-pill";
        pill.innerHTML = `<span class="role ${roleClass}">${initial}</span> ${user.name} (${roleLabel})`;
        container.appendChild(pill);
    });
}
