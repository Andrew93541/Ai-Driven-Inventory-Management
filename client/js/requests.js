// Requests Management JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const requestSearchInput = document.getElementById('requestSearchInput');
const requestStatusFilter = document.getElementById('requestStatusFilter');
const requestDepartmentFilter = document.getElementById('requestDepartmentFilter');
const createRequestBtn = document.getElementById('createRequestBtn');
const requestsTableBody = document.getElementById('requestsTableBody');

// Global Variables
let currentRequests = [];
let currentPage = 1;
let totalPages = 1;

// Initialize Requests
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('requestsContent')) {
        setupRequestsEventListeners();
        loadRequestsData();
    }
});

// Setup Event Listeners
function setupRequestsEventListeners() {
    // Search and filters
    if (requestSearchInput) {
        requestSearchInput.addEventListener('input', debounce(handleRequestSearch, 300));
    }
    
    if (requestStatusFilter) {
        requestStatusFilter.addEventListener('change', handleRequestFilterChange);
    }
    
    if (requestDepartmentFilter) {
        requestDepartmentFilter.addEventListener('change', handleRequestFilterChange);
    }
    
    // Create request button
    if (createRequestBtn) {
        createRequestBtn.addEventListener('click', showCreateRequestModal);
    }
}

// Load Requests Data
async function loadRequestsData() {
    try {
        showLoading();
        
        const params = new URLSearchParams({
            page: currentPage,
            limit: 10
        });
        
        // Add filters
        if (requestSearchInput && requestSearchInput.value) {
            params.append('search', requestSearchInput.value);
        }
        if (requestStatusFilter && requestStatusFilter.value) {
            params.append('status', requestStatusFilter.value);
        }
        if (requestDepartmentFilter && requestDepartmentFilter.value) {
            params.append('department', requestDepartmentFilter.value);
        }
        
        const response = await fetchWithAuth(`${API_BASE_URL}/requests?${params}`);
        
        if (response.success) {
            currentRequests = response.data.requests;
            totalPages = response.data.pagination.totalPages;
            updateRequestsTable(currentRequests);
            updatePagination(response.data.pagination);
        } else {
            showToast(response.message || 'Failed to load requests', 'error');
        }
        
    } catch (error) {
        console.error('Error loading requests:', error);
        showToast('Failed to load requests data', 'error');
    } finally {
        hideLoading();
    }
}

// Update Requests Table
function updateRequestsTable(requests) {
    if (!requestsTableBody) return;
    
    if (requests.length === 0) {
        requestsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No requests found</td></tr>';
        return;
    }
    
    const rows = requests.map(request => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const canApprove = isAdmin && request.status === 'pending';
        const canComplete = request.status === 'approved';
        
        return `
            <tr>
                <td>${request.itemId ? request.itemId.name : 'N/A'}</td>
                <td>${request.quantity}</td>
                <td>${request.reason}</td>
                ${isAdmin ? `<td>${request.userId ? request.userId.name : 'N/A'}</td>` : ''}
                ${isAdmin ? `<td><span class="badge badge-dept">${formatDepartment(request.department)}</span></td>` : ''}
                <td>
                    <span class="badge badge-status badge-${request.status}">
                        ${formatStatus(request.status)}
                    </span>
                </td>
                <td>${formatDate(request.requestedDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="viewRequest('${request._id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${canApprove ? `
                            <button class="btn btn-sm btn-success" onclick="approveRequest('${request._id}')" title="Approve Request">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="declineRequest('${request._id}')" title="Decline Request">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                        ${canComplete ? `
                            <button class="btn btn-sm btn-primary" onclick="completeRequest('${request._id}')" title="Mark Complete">
                                <i class="fas fa-check-double"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    requestsTableBody.innerHTML = rows;
}

// Handle Request Search
function handleRequestSearch() {
    currentPage = 1;
    loadRequestsData();
}

// Handle Request Filter Change
function handleRequestFilterChange() {
    currentPage = 1;
    loadRequestsData();
}

// Show Create Request Modal
function showCreateRequestModal() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal" id="createRequestModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create New Request</h3>
                    <button class="modal-close" onclick="closeModal('createRequestModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="createRequestForm">
                        <div class="form-group">
                            <label for="requestItem">Item *</label>
                            <select id="requestItem" name="itemId" required class="form-control">
                                <option value="">Select Item</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="requestQuantity">Quantity *</label>
                            <input type="number" id="requestQuantity" name="quantity" min="1" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="requestReason">Reason *</label>
                            <textarea id="requestReason" name="reason" required class="form-control" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="requestPriority">Priority</label>
                            <select id="requestPriority" name="priority" class="form-control">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="requestNotes">Additional Notes</label>
                            <textarea id="requestNotes" name="notes" class="form-control" rows="2"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('createRequestModal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create Request</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup form submission
    const form = document.getElementById('createRequestForm');
    form.addEventListener('submit', handleCreateRequest);
    
    // Load available items
    loadAvailableItems();
    
    // Show modal
    document.getElementById('createRequestModal').classList.add('show');
}

// Load Available Items
async function loadAvailableItems() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/items?limit=100`);
        
        if (response.success) {
            const itemSelect = document.getElementById('requestItem');
            const items = response.data.items.filter(item => item.quantity > 0);
            
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item._id;
                option.textContent = `${item.name} (${item.quantity} available)`;
                itemSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

// Handle Create Request
async function handleCreateRequest(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const requestData = Object.fromEntries(formData.entries());
        
        const response = await fetchWithAuth(`${API_BASE_URL}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (response.success) {
            showToast('Request created successfully', 'success');
            closeModal('createRequestModal');
            loadRequestsData();
        } else {
            showToast(response.message || 'Failed to create request', 'error');
        }
        
    } catch (error) {
        console.error('Error creating request:', error);
        showToast('Failed to create request', 'error');
    }
}

// View Request Details
function viewRequest(requestId) {
    // Implementation for viewing request details
    showToast('View request details - to be implemented', 'info');
}

// Approve Request
async function approveRequest(requestId) {
    const reason = prompt('Enter approval reason (optional):');
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/requests/${requestId}/approve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminReason: reason })
        });
        
        if (response.success) {
            showToast('Request approved successfully', 'success');
            loadRequestsData();
        } else {
            showToast(response.message || 'Failed to approve request', 'error');
        }
        
    } catch (error) {
        console.error('Error approving request:', error);
        showToast('Failed to approve request', 'error');
    }
}

// Decline Request
async function declineRequest(requestId) {
    const reason = prompt('Enter decline reason:');
    
    if (!reason) {
        showToast('Please provide a reason for declining', 'error');
        return;
    }
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/requests/${requestId}/decline`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminReason: reason })
        });
        
        if (response.success) {
            showToast('Request declined successfully', 'success');
            loadRequestsData();
        } else {
            showToast(response.message || 'Failed to decline request', 'error');
        }
        
    } catch (error) {
        console.error('Error declining request:', error);
        showToast('Failed to decline request', 'error');
    }
}

// Complete Request
async function completeRequest(requestId) {
    if (!confirm('Mark this request as completed?')) {
        return;
    }
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/requests/${requestId}/complete`, {
            method: 'PUT'
        });
        
        if (response.success) {
            showToast('Request marked as completed', 'success');
            loadRequestsData();
        } else {
            showToast(response.message || 'Failed to complete request', 'error');
        }
        
    } catch (error) {
        console.error('Error completing request:', error);
        showToast('Failed to complete request', 'error');
    }
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
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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

function formatDepartment(department) {
    return department.charAt(0).toUpperCase() + department.slice(1);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Export functions for global access
window.viewRequest = viewRequest;
window.approveRequest = approveRequest;
window.declineRequest = declineRequest;
window.completeRequest = completeRequest;
window.closeModal = closeModal; 
window.handleNewRequest = handleNewRequest; 