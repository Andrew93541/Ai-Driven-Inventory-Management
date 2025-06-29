// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global Variables
let currentUser = null;
let charts = {};

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelectorAll('.nav-item');
const pageContents = document.querySelectorAll('.page-content');
const pageTitle = document.getElementById('pageTitle');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');

// Dashboard Overview Elements
const totalItemsEl = document.getElementById('totalItems');
const lowStockAlertsEl = document.getElementById('lowStockAlerts');
const pendingRequestsEl = document.getElementById('pendingRequests');
const monthlyUsageEl = document.getElementById('monthlyUsage');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await initializeDashboard();
});

// Initialize Dashboard
async function initializeDashboard() {
    try {
        // Check authentication
        if (!isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        // Load user data
        await loadUserData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup role-based UI
        setupRoleBasedUI();
        
        // Load dashboard data
        await loadDashboardData();
        
        // Initialize charts
        initializeCharts();
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showToast('Failed to initialize dashboard', 'error');
    }
}

// Check Authentication
function isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user;
}

// Load User Data
async function loadUserData() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        currentUser = user;
        
        // Update UI with user info
        userName.textContent = user.name;
        userRole.textContent = `${user.role} - ${user.department}`;
        
        // Add role and department classes
        document.body.classList.add(`user-${user.role}`);
        document.body.classList.add(`dept-${user.department}`);
        
    } catch (error) {
        console.error('Error loading user data:', error);
        throw error;
    }
}

// Setup Role-Based UI
function setupRoleBasedUI() {
    if (!currentUser) return;

    // Hide admin-only features for staff
    if (currentUser.role === 'staff') {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => el.style.display = 'none');
        
        // Update navigation items
        const adminNavItems = document.querySelectorAll('.nav-item.admin-only');
        adminNavItems.forEach(item => item.style.display = 'none');
    }

    // Show department-specific content
    const departmentElements = document.querySelectorAll(`.dept-${currentUser.department}`);
    departmentElements.forEach(el => el.style.display = 'block');

    // Hide other department content for staff
    if (currentUser.role === 'staff') {
        const otherDeptElements = document.querySelectorAll('[class*="dept-"]:not(.dept-' + currentUser.department + ')');
        otherDeptElements.forEach(el => el.style.display = 'none');
    }

    // Update page titles and descriptions based on department
    updateDepartmentSpecificContent();
}

// Update Department-Specific Content
function updateDepartmentSpecificContent() {
    if (!currentUser) return;

    const deptInfo = {
        lab: {
            title: 'Laboratory Management',
            description: 'Manage lab equipment, chemicals, and scientific instruments'
        },
        library: {
            title: 'Library Management',
            description: 'Manage books, journals, and library resources'
        },
        sports: {
            title: 'Sports Equipment Management',
            description: 'Manage sports equipment and athletic facilities'
        },
        hostel: {
            title: 'Hostel Management',
            description: 'Manage hostel furniture and amenities'
        },
        admin: {
            title: 'Administrative Management',
            description: 'Manage office supplies and administrative resources'
        },
        general: {
            title: 'General Inventory Management',
            description: 'Manage general inventory and supplies'
        }
    };

    const info = deptInfo[currentUser.department] || deptInfo.general;
    
    // Update page title if it's a generic title
    const currentTitle = pageTitle.textContent;
    if (currentTitle === 'Dashboard' || currentTitle === 'Inventory Management') {
        pageTitle.textContent = info.title;
    }

    // Update department description
    const deptDescEl = document.getElementById('departmentDescription');
    if (deptDescEl) {
        deptDescEl.textContent = info.description;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.querySelector('a').dataset.page;
            navigateToPage(page);
        });
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// Navigation
function navigateToPage(page) {
    // Update active nav item
    navItems.forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
    
    // Update page title
    const titles = {
        dashboard: currentUser.role === 'admin' ? 'Dashboard' : `${currentUser.department} Dashboard`,
        inventory: currentUser.role === 'admin' ? 'Inventory Management' : `${currentUser.department} Inventory`,
        requests: currentUser.role === 'admin' ? 'Request Management' : 'My Requests',
        forecast: currentUser.role === 'admin' ? 'AI Forecast' : `${currentUser.department} Forecast`,
        reports: currentUser.role === 'admin' ? 'Reports & Analytics' : `${currentUser.department} Reports`
    };
    pageTitle.textContent = titles[page] || 'Dashboard';
    
    // Show/hide page content
    pageContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(page + 'Content').classList.add('active');
    
    // Load page-specific data
    switch (page) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'inventory':
            loadInventoryData();
            break;
        case 'requests':
            loadRequestsData();
            break;
        case 'forecast':
            loadForecastData();
            break;
        case 'reports':
            loadReportsData();
            break;
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        showLoading();
        
        // Load overview statistics
        const [itemStats, requestStats, dashboardReport] = await Promise.all([
            fetchWithAuth(`${API_BASE_URL}/items/stats/overview`),
            fetchWithAuth(`${API_BASE_URL}/requests/stats/overview`),
            fetchWithAuth(`${API_BASE_URL}/reports/dashboard`)
        ]);
        
        // Update overview cards
        updateOverviewCards(itemStats.data, requestStats.data, dashboardReport.data);
        
        // Update charts
        updateDashboardCharts(dashboardReport.data);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
    } finally {
        hideLoading();
    }
}

// Update Overview Cards
function updateOverviewCards(itemStats, requestStats, dashboardReport) {
    if (totalItemsEl) totalItemsEl.textContent = itemStats.totalItems || 0;
    if (lowStockAlertsEl) lowStockAlertsEl.textContent = itemStats.lowStock || 0;
    if (pendingRequestsEl) pendingRequestsEl.textContent = requestStats.pendingRequests || 0;
    if (monthlyUsageEl) monthlyUsageEl.textContent = dashboardReport.overview?.lastMonthUsage?.totalUsed || 0;
}

// Initialize Charts
function initializeCharts() {
    // Monthly Usage Chart
    const monthlyCtx = document.getElementById('monthlyUsageChart');
    if (monthlyCtx) {
        charts.monthlyUsage = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Monthly Usage',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Department Chart
    const deptCtx = document.getElementById('departmentChart');
    if (deptCtx) {
        charts.department = new Chart(deptCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe',
                        '#00f2fe'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Update Dashboard Charts
function updateDashboardCharts(data) {
    // Update monthly usage chart
    if (charts.monthlyUsage && data.monthlyData) {
        charts.monthlyUsage.data.labels = data.monthlyData.map(item => item.monthName);
        charts.monthlyUsage.data.datasets[0].data = data.monthlyData.map(item => item.totalUsed);
        charts.monthlyUsage.update();
    }
    
    // Update department chart
    if (charts.department && data.topDepartments) {
        charts.department.data.labels = data.topDepartments.map(dept => dept._id);
        charts.department.data.datasets[0].data = data.topDepartments.map(dept => dept.totalUsed);
        charts.department.update();
    }
}

// Load Inventory Data
async function loadInventoryData() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/items`);
        const items = response.data.items;
        
        // Update inventory table
        updateInventoryTable(items);
        
    } catch (error) {
        console.error('Error loading inventory data:', error);
        showToast('Failed to load inventory data', 'error');
    }
}

// Update Inventory Table
function updateInventoryTable(items) {
    const tbody = document.getElementById('itemsTableBody');
    if (!tbody) return;
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No items found</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${formatCategory(item.category)}</td>
            <td>${formatDepartment(item.department)}</td>
            <td>${item.quantity} ${item.unit}</td>
            <td>
                <span class="status-badge status-${getStockStatus(item)}">
                    ${getStockStatusText(item)}
                </span>
            </td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editItem('${item._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                ${currentUser.role === 'admin' ? `
                    <button class="btn btn-outline btn-sm" onclick="deleteItem('${item._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Load Requests Data
async function loadRequestsData() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/requests`);
        const requests = response.data.requests;
        
        // Update requests table
        updateRequestsTable(requests);
        
    } catch (error) {
        console.error('Error loading requests data:', error);
        showToast('Failed to load requests data', 'error');
    }
}

// Update Requests Table
function updateRequestsTable(requests) {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    
    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No requests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = requests.map(request => `
        <tr>
            <td>${request.itemId?.name || 'N/A'}</td>
            <td>${request.userId?.name || 'N/A'}</td>
            <td>${request.quantity}</td>
            <td>
                <span class="status-badge status-${request.status}">
                    ${request.status}
                </span>
            </td>
            <td>${formatDate(request.requestedDate)}</td>
            <td>
                ${request.status === 'pending' && currentUser.role === 'admin' ? `
                    <button class="btn btn-outline btn-sm" onclick="approveRequest('${request._id}')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="declineRequest('${request._id}')">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Load Forecast Data
async function loadForecastData() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/forecast`);
        const forecast = response.data;
        
        // Update forecast summary
        updateForecastSummary(forecast.summary);
        
        // Update forecast table
        updateForecastTable(forecast.forecast);
        
    } catch (error) {
        console.error('Error loading forecast data:', error);
        showToast('Failed to load forecast data', 'error');
    }
}

// Update Forecast Summary
function updateForecastSummary(summary) {
    const criticalEl = document.getElementById('criticalRiskCount');
    const highEl = document.getElementById('highRiskCount');
    const mediumEl = document.getElementById('mediumRiskCount');
    const lowEl = document.getElementById('lowRiskCount');
    
    if (criticalEl) criticalEl.textContent = summary.criticalRisk || 0;
    if (highEl) highEl.textContent = summary.highRisk || 0;
    if (mediumEl) mediumEl.textContent = summary.mediumRisk || 0;
    if (lowEl) lowEl.textContent = summary.lowRisk || 0;
}

// Update Forecast Table
function updateForecastTable(forecast) {
    const tbody = document.getElementById('forecastTableBody');
    if (!tbody) return;
    
    if (forecast.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No forecast data available</td></tr>';
        return;
    }
    
    tbody.innerHTML = forecast.map(item => `
        <tr>
            <td>${item.item.name}</td>
            <td>${item.item.currentStock}</td>
            <td>${item.predictedUsage}</td>
            <td>
                <span class="status-badge status-${item.stockRisk}">
                    ${item.stockRisk}
                </span>
            </td>
            <td>${item.daysUntilStockout || 'N/A'}</td>
            <td>${item.recommendation}</td>
        </tr>
    `).join('');
}

// Load Reports Data
async function loadReportsData() {
    try {
        const [monthlyReport, categoryReport] = await Promise.all([
            fetchWithAuth(`${API_BASE_URL}/reports/monthly-usage`),
            fetchWithAuth(`${API_BASE_URL}/reports/category-distribution`)
        ]);
        
        // Update report charts
        updateReportCharts(monthlyReport.data, categoryReport.data);
        
    } catch (error) {
        console.error('Error loading reports data:', error);
        showToast('Failed to load reports data', 'error');
    }
}

// Update Report Charts
function updateReportCharts(monthlyData, categoryData) {
    // Monthly Report Chart
    const monthlyReportCtx = document.getElementById('monthlyReportChart');
    if (monthlyReportCtx) {
        new Chart(monthlyReportCtx, {
            type: 'bar',
            data: {
                labels: monthlyData.monthlyData.map(item => item.monthName),
                datasets: [{
                    label: 'Total Used',
                    data: monthlyData.monthlyData.map(item => item.totalUsed),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Category Report Chart
    const categoryReportCtx = document.getElementById('categoryReportChart');
    if (categoryReportCtx) {
        new Chart(categoryReportCtx, {
            type: 'pie',
            data: {
                labels: categoryData.categoryData.map(item => item.category),
                datasets: [{
                    data: categoryData.categoryData.map(item => item.totalUsed),
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe',
                        '#00f2fe'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Utility Functions
function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    }).then(response => {
        if (response.status === 401) {
            logout();
            throw new Error('Unauthorized');
        }
        return response.json();
    });
}

function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.remove('hidden');
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.add('hidden');
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function formatCategory(category) {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDepartment(department) {
    return department.charAt(0).toUpperCase() + department.slice(1);
}

function getStockStatus(item) {
    if (item.quantity === 0) return 'out_of_stock';
    if (item.quantity <= item.minStockLevel) return 'low_stock';
    return 'in_stock';
}

function getStockStatusText(item) {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.minStockLevel) return 'Low Stock';
    return 'In Stock';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Global functions for table actions
window.editItem = function(id) {
    showToast('Edit functionality coming soon', 'info');
};

window.deleteItem = function(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        showToast('Delete functionality coming soon', 'info');
    }
};

window.approveRequest = function(id) {
    showToast('Approve functionality coming soon', 'info');
};

window.declineRequest = function(id) {
    showToast('Decline functionality coming soon', 'info');
}; 