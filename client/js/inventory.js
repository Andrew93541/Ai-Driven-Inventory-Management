// Inventory Management JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const departmentFilter = document.getElementById('departmentFilter');
const stockFilter = document.getElementById('stockFilter');
const addItemBtn = document.getElementById('addItemBtn');
const itemsTableBody = document.getElementById('itemsTableBody');

// Global Variables
let currentItems = [];
let currentPage = 1;
let totalPages = 1;

// Initialize Inventory
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('inventoryContent')) {
        setupInventoryEventListeners();
        loadInventoryData();
    }
});

// Setup Event Listeners
function setupInventoryEventListeners() {
    // Search and filters
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleFilterChange);
    }
    
    if (departmentFilter) {
        departmentFilter.addEventListener('change', handleFilterChange);
    }
    
    if (stockFilter) {
        stockFilter.addEventListener('change', handleFilterChange);
    }
    
    // Add item button
    if (addItemBtn) {
        addItemBtn.addEventListener('click', showAddItemModal);
    }
}

// Load Inventory Data
async function loadInventoryData() {
    try {
        showLoading();
        
        const params = new URLSearchParams({
            page: currentPage,
            limit: 10
        });
        
        // Add filters
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        if (categoryFilter && categoryFilter.value) {
            params.append('category', categoryFilter.value);
        }
        if (departmentFilter && departmentFilter.value) {
            params.append('department', departmentFilter.value);
        }
        if (stockFilter && stockFilter.value) {
            params.append('stockStatus', stockFilter.value);
        }
        
        const response = await fetchWithAuth(`${API_BASE_URL}/items?${params}`);
        
        if (response.success) {
            currentItems = response.data.items;
            totalPages = response.data.pagination.totalPages;
            updateInventoryTable(currentItems);
            updatePagination(response.data.pagination);
        } else {
            showToast(response.message || 'Failed to load inventory', 'error');
        }
        
    } catch (error) {
        console.error('Error loading inventory:', error);
        showToast('Failed to load inventory data', 'error');
    } finally {
        hideLoading();
    }
}

// Update Inventory Table
function updateInventoryTable(items) {
    if (!itemsTableBody) return;
    
    if (items.length === 0) {
        itemsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No items found</td></tr>';
        return;
    }
    
    const rows = items.map(item => {
        const isAdmin = currentUser && currentUser.role === 'admin';
        const canEdit = isAdmin || (currentUser && currentUser.department === item.department);
        const canDelete = isAdmin;
        
        return `
            <tr>
                <td>${item.name}</td>
                <td><span class="badge badge-category">${formatCategory(item.category)}</span></td>
                ${isAdmin ? `<td><span class="badge badge-dept">${formatDepartment(item.department)}</span></td>` : ''}
                <td>
                    <span class="stock-level ${getStockStatusClass(item)}">
                        ${item.quantity} ${item.unit || 'pieces'}
                    </span>
                </td>
                <td>
                    <span class="badge badge-status ${getStockStatusClass(item)}">
                        ${getStockStatusText(item)}
                    </span>
                </td>
                <td>${formatDate(item.updatedAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="viewItem('${item._id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${canEdit ? `
                            <button class="btn btn-sm btn-warning" onclick="editItem('${item._id}')" title="Edit Item">
                                <i class="fas fa-edit"></i>
                            </button>
                        ` : ''}
                        ${canDelete ? `
                            <button class="btn btn-sm btn-danger" onclick="deleteItem('${item._id}')" title="Delete Item">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    itemsTableBody.innerHTML = rows;
}

// Handle Search
function handleSearch() {
    currentPage = 1;
    loadInventoryData();
}

// Handle Filter Change
function handleFilterChange() {
    currentPage = 1;
    loadInventoryData();
}

// Show Add Item Modal
function showAddItemModal() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal" id="addItemModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Item</h3>
                    <button class="modal-close" onclick="closeModal('addItemModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addItemForm">
                        <div class="form-group">
                            <label for="itemName">Item Name *</label>
                            <input type="text" id="itemName" name="name" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="itemCategory">Category *</label>
                            <select id="itemCategory" name="category" required class="form-control">
                                <option value="">Select Category</option>
                                <option value="electronics">Electronics</option>
                                <option value="furniture">Furniture</option>
                                <option value="books">Books</option>
                                <option value="sports">Sports</option>
                                <option value="lab_equipment">Lab Equipment</option>
                                <option value="office_supplies">Office Supplies</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="itemQuantity">Quantity *</label>
                            <input type="number" id="itemQuantity" name="quantity" min="0" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="itemDepartment">Department</label>
                            <select id="itemDepartment" name="department" class="form-control" ${currentUser && currentUser.role === 'staff' ? 'disabled' : ''}>
                                <option value="">Select Department</option>
                                <option value="lab">Laboratory</option>
                                <option value="library">Library</option>
                                <option value="sports">Sports</option>
                                <option value="hostel">Hostel</option>
                                <option value="admin">Administration</option>
                                <option value="general">General</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="itemDescription">Description</label>
                            <textarea id="itemDescription" name="description" class="form-control" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="itemLocation">Location</label>
                            <input type="text" id="itemLocation" name="location" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="itemMinStock">Minimum Stock Level</label>
                            <input type="number" id="itemMinStock" name="minStockLevel" min="0" value="5" class="form-control">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('addItemModal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Item</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup form submission
    const form = document.getElementById('addItemForm');
    form.addEventListener('submit', handleAddItem);
    
    // Set department for staff users
    if (currentUser && currentUser.role === 'staff') {
        const deptSelect = document.getElementById('itemDepartment');
        deptSelect.value = currentUser.department;
    }
    
    // Show modal
    document.getElementById('addItemModal').classList.add('show');
}

// Handle Add Item
async function handleAddItem(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const itemData = Object.fromEntries(formData.entries());
        
        // Set department for staff users
        if (currentUser && currentUser.role === 'staff') {
            itemData.department = currentUser.department;
        }
        
        const response = await fetchWithAuth(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });
        
        if (response.success) {
            showToast('Item added successfully', 'success');
            closeModal('addItemModal');
            loadInventoryData();
        } else {
            showToast(response.message || 'Failed to add item', 'error');
        }
        
    } catch (error) {
        console.error('Error adding item:', error);
        showToast('Failed to add item', 'error');
    }
}

// View Item Details
function viewItem(itemId) {
    // Implementation for viewing item details
    showToast('View item details - to be implemented', 'info');
}

// Edit Item
function editItem(itemId) {
    // Implementation for editing item
    showToast('Edit item - to be implemented', 'info');
}

// Delete Item
async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/items/${itemId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            showToast('Item deleted successfully', 'success');
            loadInventoryData();
        } else {
            showToast(response.message || 'Failed to delete item', 'error');
        }
        
    } catch (error) {
        console.error('Error deleting item:', error);
        showToast('Failed to delete item', 'error');
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

function getStockStatusClass(item) {
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= item.minStockLevel) return 'low-stock';
    return 'in-stock';
}

function getStockStatusText(item) {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.minStockLevel) return 'Low Stock';
    return 'In Stock';
}

function formatCategory(category) {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDepartment(department) {
    return department.charAt(0).toUpperCase() + department.slice(1);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Export functions for global access
window.viewItem = viewItem;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.closeModal = closeModal; 