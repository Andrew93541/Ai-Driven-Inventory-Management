// Reports & Analytics JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const reportsContent = document.getElementById('reportsContent');
const monthlyUsageChart = document.getElementById('monthlyUsageChart');
const departmentChart = document.getElementById('departmentChart');
const categoryChart = document.getElementById('categoryChart');
const statusChart = document.getElementById('statusChart');

// Global Variables
let reportsCharts = {};

// Initialize Reports
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('reportsContent')) {
        loadReportsData();
    }
});

// Load Reports Data
async function loadReportsData() {
    try {
        showLoading();
        
        // Load all report data in parallel
        const [monthlyData, departmentData, categoryData, statusData] = await Promise.all([
            fetchWithAuth(`${API_BASE_URL}/reports/monthly-usage`),
            fetchWithAuth(`${API_BASE_URL}/reports/department-distribution`),
            fetchWithAuth(`${API_BASE_URL}/reports/category-distribution`),
            fetchWithAuth(`${API_BASE_URL}/reports/request-status-distribution`)
        ]);
        
        // Initialize charts
        initializeReportsCharts();
        
        // Update charts with data
        updateMonthlyUsageChart(monthlyData.data);
        updateDepartmentChart(departmentData.data);
        updateCategoryChart(categoryData.data);
        updateStatusChart(statusData.data);
        
    } catch (error) {
        console.error('Error loading reports data:', error);
        showToast('Failed to load reports data', 'error');
    } finally {
        hideLoading();
    }
}

// Initialize Reports Charts
function initializeReportsCharts() {
    // Monthly Usage Chart
    if (monthlyUsageChart) {
        reportsCharts.monthlyUsage = new Chart(monthlyUsageChart, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Total Usage',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Request Count',
                    data: [],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Usage Trends'
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Total Usage'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Request Count'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }
    
    // Department Distribution Chart
    if (departmentChart) {
        reportsCharts.departmentDistribution = new Chart(departmentChart, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#667eea',
                        '#f59e0b',
                        '#10b981',
                        '#ef4444',
                        '#8b5cf6',
                        '#06b6d4'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Department-wise Usage Distribution'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Category Distribution Chart
    if (categoryChart) {
        reportsCharts.categoryDistribution = new Chart(categoryChart, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Total Usage',
                    data: [],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Category-wise Usage Distribution'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Usage'
                        }
                    }
                }
            }
        });
    }
    
    // Request Status Distribution Chart
    if (statusChart) {
        reportsCharts.statusDistribution = new Chart(statusChart, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#f59e0b', // Pending
                        '#10b981', // Approved
                        '#ef4444', // Declined
                        '#667eea'  // Completed
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Request Status Distribution'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Update Monthly Usage Chart
function updateMonthlyUsageChart(data) {
    if (!reportsCharts.monthlyUsage || !data.monthlyData) return;
    
    const chart = reportsCharts.monthlyUsage;
    chart.data.labels = data.monthlyData.map(item => item.monthName);
    chart.data.datasets[0].data = data.monthlyData.map(item => item.totalUsed);
    chart.data.datasets[1].data = data.monthlyData.map(item => item.requestCount);
    chart.update();
}

// Update Department Chart
function updateDepartmentChart(data) {
    if (!reportsCharts.departmentDistribution || !data.departmentData) return;
    
    const chart = reportsCharts.departmentDistribution;
    chart.data.labels = data.departmentData.map(item => formatDepartment(item.department));
    chart.data.datasets[0].data = data.departmentData.map(item => item.totalUsed);
    chart.update();
}

// Update Category Chart
function updateCategoryChart(data) {
    if (!reportsCharts.categoryDistribution || !data.categoryData) return;
    
    const chart = reportsCharts.categoryDistribution;
    chart.data.labels = data.categoryData.map(item => formatCategory(item.category));
    chart.data.datasets[0].data = data.categoryData.map(item => item.totalUsed);
    chart.update();
}

// Update Status Chart
function updateStatusChart(data) {
    if (!reportsCharts.statusDistribution || !data.statusData) return;
    
    const chart = reportsCharts.statusDistribution;
    chart.data.labels = data.statusData.map(item => formatStatus(item.status));
    chart.data.datasets[0].data = data.statusData.map(item => item.count);
    chart.update();
}

// Export Reports
async function exportReport(reportType) {
    try {
        showLoading();
        
        const response = await fetchWithAuth(`${API_BASE_URL}/reports/export/${reportType}`);
        
        if (response.success) {
            // Create and download file
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showToast(`${reportType} report exported successfully`, 'success');
        } else {
            showToast(response.message || 'Failed to export report', 'error');
        }
        
    } catch (error) {
        console.error('Error exporting report:', error);
        showToast('Failed to export report', 'error');
    } finally {
        hideLoading();
    }
}

// Generate Custom Report
async function generateCustomReport() {
    const startDate = document.getElementById('customStartDate')?.value;
    const endDate = document.getElementById('customEndDate')?.value;
    const reportType = document.getElementById('customReportType')?.value;
    
    if (!startDate || !endDate || !reportType) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetchWithAuth(`${API_BASE_URL}/reports/custom`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startDate,
                endDate,
                reportType
            })
        });
        
        if (response.success) {
            // Display custom report
            displayCustomReport(response.data);
            showToast('Custom report generated successfully', 'success');
        } else {
            showToast(response.message || 'Failed to generate custom report', 'error');
        }
        
    } catch (error) {
        console.error('Error generating custom report:', error);
        showToast('Failed to generate custom report', 'error');
    } finally {
        hideLoading();
    }
}

// Display Custom Report
function displayCustomReport(data) {
    const modalHTML = `
        <div class="modal" id="customReportModal">
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Custom Report</h3>
                    <button class="modal-close" onclick="closeModal('customReportModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="report-content">
                        <div class="report-summary">
                            <h4>Report Summary</h4>
                            <div class="summary-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Period:</span>
                                    <span class="stat-value">${data.startDate} to ${data.endDate}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Items:</span>
                                    <span class="stat-value">${data.totalItems || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Usage:</span>
                                    <span class="stat-value">${data.totalUsage || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Requests:</span>
                                    <span class="stat-value">${data.totalRequests || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div class="report-details">
                            <h4>Detailed Data</h4>
                            <div class="table-container">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Category</th>
                                            <th>Department</th>
                                            <th>Usage</th>
                                            <th>Requests</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.details ? data.details.map(item => `
                                            <tr>
                                                <td>${item.name}</td>
                                                <td>${formatCategory(item.category)}</td>
                                                <td>${formatDepartment(item.department)}</td>
                                                <td>${item.usage}</td>
                                                <td>${item.requests}</td>
                                            </tr>
                                        `).join('') : '<tr><td colspan="5" class="text-center">No data available</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('customReportModal')">Close</button>
                    <button class="btn btn-primary" onclick="exportCustomReport()">Export CSV</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    document.getElementById('customReportModal').classList.add('show');
}

// Export Custom Report
function exportCustomReport() {
    // Implementation for exporting custom report
    showToast('Export custom report - to be implemented', 'info');
}

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Utility Functions
function formatDepartment(department) {
    return department.charAt(0).toUpperCase() + department.slice(1);
}

function formatCategory(category) {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'approved': 'Approved',
        'declined': 'Declined',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

// Export functions for global access
window.exportReport = exportReport;
window.generateCustomReport = generateCustomReport;
window.closeModal = closeModal; 