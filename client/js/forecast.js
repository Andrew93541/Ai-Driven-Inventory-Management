// AI Forecast JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const forecastContent = document.getElementById('forecastContent');
const forecastSummary = document.getElementById('forecastSummary');
const forecastTable = document.getElementById('forecastTable');

// Global Variables
let currentForecast = [];
let forecastCharts = {};

// Initialize Forecast
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('forecastContent')) {
        loadForecastData();
    }
});

// Load Forecast Data
async function loadForecastData() {
    try {
        showLoading();
        
        const response = await fetchWithAuth(`${API_BASE_URL}/forecast`);
        
        if (response.success) {
            currentForecast = response.data.forecast;
            updateForecastSummary(response.data.summary);
            updateForecastTable(currentForecast);
            initializeForecastCharts();
        } else {
            showToast(response.message || 'Failed to load forecast data', 'error');
        }
        
    } catch (error) {
        console.error('Error loading forecast data:', error);
        showToast('Failed to load forecast data', 'error');
    } finally {
        hideLoading();
    }
}

// Update Forecast Summary
function updateForecastSummary(summary) {
    if (!forecastSummary) return;
    
    const summaryHTML = `
        <div class="forecast-summary">
            <div class="summary-card">
                <div class="summary-icon critical">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="summary-content">
                    <h4>Critical Risk</h4>
                    <p>${summary.criticalRisk} items</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon high">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="summary-content">
                    <h4>High Risk</h4>
                    <p>${summary.highRisk} items</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon medium">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="summary-content">
                    <h4>Medium Risk</h4>
                    <p>${summary.mediumRisk} items</p>
                </div>
            </div>
            <div class="summary-card">
                <div class="summary-icon low">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="summary-content">
                    <h4>Low Risk</h4>
                    <p>${summary.lowRisk} items</p>
                </div>
            </div>
        </div>
    `;
    
    forecastSummary.innerHTML = summaryHTML;
}

// Update Forecast Table
function updateForecastTable(forecast) {
    if (!forecastTable) return;
    
    if (forecast.length === 0) {
        forecastTable.innerHTML = '<tr><td colspan="7" class="text-center">No forecast data available</td></tr>';
        return;
    }
    
    const rows = forecast.map(item => {
        const riskClass = `risk-${item.stockRisk}`;
        const daysUntilStockout = item.daysUntilStockout !== null ? 
            `${item.daysUntilStockout} days` : 'N/A';
        
        return `
            <tr class="${riskClass}">
                <td>
                    <div class="item-info">
                        <strong>${item.item.name}</strong>
                        <small>${formatCategory(item.item.category)}</small>
                    </div>
                </td>
                <td>
                    <span class="stock-level ${getStockStatusClass(item.item)}">
                        ${item.item.currentStock} / ${item.item.minStockLevel}
                    </span>
                </td>
                <td>${item.averageMonthlyUsage.toFixed(1)}</td>
                <td>${item.predictedUsage}</td>
                <td>
                    <span class="risk-badge ${riskClass}">
                        ${formatRiskLevel(item.stockRisk)}
                    </span>
                </td>
                <td>${daysUntilStockout}</td>
                <td>
                    <div class="recommendation">
                        <span class="recommendation-text">${item.recommendation}</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    forecastTable.innerHTML = rows;
}

// Initialize Forecast Charts
function initializeForecastCharts() {
    // Risk Distribution Chart
    const riskCtx = document.getElementById('riskDistributionChart');
    if (riskCtx) {
        const riskData = {
            critical: currentForecast.filter(item => item.stockRisk === 'critical').length,
            high: currentForecast.filter(item => item.stockRisk === 'high').length,
            medium: currentForecast.filter(item => item.stockRisk === 'medium').length,
            low: currentForecast.filter(item => item.stockRisk === 'low').length
        };
        
        forecastCharts.riskDistribution = new Chart(riskCtx, {
            type: 'doughnut',
            data: {
                labels: ['Critical', 'High', 'Medium', 'Low'],
                datasets: [{
                    data: [riskData.critical, riskData.high, riskData.medium, riskData.low],
                    backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Stock Risk Distribution'
                    }
                }
            }
        });
    }
    
    // Usage Trend Chart
    const trendCtx = document.getElementById('usageTrendChart');
    if (trendCtx) {
        const topItems = currentForecast.slice(0, 5);
        
        forecastCharts.usageTrend = new Chart(trendCtx, {
            type: 'bar',
            data: {
                labels: topItems.map(item => item.item.name),
                datasets: [{
                    label: 'Current Stock',
                    data: topItems.map(item => item.item.currentStock),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }, {
                    label: 'Predicted Usage',
                    data: topItems.map(item => item.predictedUsage),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 5 Items - Stock vs Predicted Usage'
                    }
                }
            }
        });
    }
}

// Utility Functions
function getStockStatusClass(item) {
    if (item.currentStock === 0) return 'out-of-stock';
    if (item.currentStock <= item.minStockLevel) return 'low-stock';
    return 'in-stock';
}

function formatCategory(category) {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatRiskLevel(risk) {
    const riskMap = {
        'critical': 'Critical',
        'high': 'High',
        'medium': 'Medium',
        'low': 'Low'
    };
    return riskMap[risk] || risk;
}

// Export functions for global access
window.loadForecastData = loadForecastData; 