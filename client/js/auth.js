// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : 'https://ai-inventory-system.onrender.com/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginContent = document.getElementById('loginContent');
const registerContent = document.getElementById('registerContent');
const loadingSpinner = document.getElementById('loadingSpinner');

// Initialize Authentication
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthStatus();
    checkForTestCredentials();
});

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    if (loginTab) {
        loginTab.addEventListener('click', () => switchTab('login'));
    }
    if (registerTab) {
        registerTab.addEventListener('click', () => switchTab('register'));
    }

    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Switch between login and register tabs
function switchTab(tab) {
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginContent.classList.add('active');
        registerContent.classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerContent.classList.add('active');
        loginContent.classList.remove('active');
    }
}

// Check Authentication Status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        // User is already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Check for test credentials from test page
function checkForTestCredentials() {
    const testEmail = localStorage.getItem('testEmail');
    const testPassword = localStorage.getItem('testPassword');
    
    if (testEmail && testPassword) {
        // Auto-fill the login form
        document.getElementById('loginEmail').value = testEmail;
        document.getElementById('loginPassword').value = testPassword;
        
        // Clear the test credentials
        localStorage.removeItem('testEmail');
        localStorage.removeItem('testPassword');
        
        // Show a message
        showToast('Test credentials loaded! Click Login to continue.', 'info');
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showToast('Login successful! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } else {
            showToast(data.message || 'Login failed. Please check your credentials.', 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showToast('Network error. Please check if the server is running.', 'error');
    } finally {
        hideLoading();
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const department = formData.get('department');
    const role = formData.get('role');
    
    // Basic validation
    if (!name || name.length < 2) {
        showToast('Name must be at least 2 characters', 'error');
        return;
    }
    
    if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (!password || password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (!department) {
        showToast('Please select a department', 'error');
        return;
    }
    
    if (!role) {
        showToast('Please select a role', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                department,
                role
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Registration successful! Please login with your new account.', 'success');
            
            // Switch to login tab
            switchTab('login');
            
            // Clear register form
            registerForm.reset();
            
        } else {
            showToast(data.message || 'Registration failed. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Network error. Please check if the server is running.', 'error');
    } finally {
        hideLoading();
    }
}

// Utility Functions
function showLoading() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            ${getToastIcon(type)}
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return '<i class="fas fa-check-circle"></i>';
        case 'error': return '<i class="fas fa-exclamation-circle"></i>';
        case 'warning': return '<i class="fas fa-exclamation-triangle"></i>';
        default: return '<i class="fas fa-info-circle"></i>';
    }
}

function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const toggleBtn = field.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Demo account functions
function fillLoginForm(email, password) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;
    showToast(`Demo account loaded: ${email}`, 'info');
}

// Export functions for global access
window.fillLoginForm = fillLoginForm;
window.togglePasswordVisibility = togglePasswordVisibility; 