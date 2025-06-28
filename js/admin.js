import { showToast } from './common.js';

// Global Variables
let allOrders = [];
let currentView = 'dashboard';

// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const pageTitle = document.getElementById('page-title');
const contentArea = document.getElementById('content-area');
const refreshBtn = document.getElementById('refresh-btn');

// Helper Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusBadgeClass(status) {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
        case 'pending': return 'status-pending';
        case 'confirmed': return 'status-confirmed';
        case 'shipped': return 'status-shipped';
        case 'delivered': return 'status-delivered';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-pending';
    }
}

function generateOrderId(fullId) {
    return fullId.substring(4, 12).toUpperCase();
}

// Data Management
function loadOrders() {
    allOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    return allOrders;
}

function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        orders[orderIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        
        // Also update in user orders
        const userOrders = JSON.parse(localStorage.getItem('freshmartOrders') || '[]');
        const userOrderIndex = userOrders.findIndex(order => order.id === orderId);
        if (userOrderIndex !== -1) {
            userOrders[userOrderIndex].status = newStatus;
            userOrders[userOrderIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('freshmartOrders', JSON.stringify(userOrders));
        }
        
        return true;
    }
    return false;
}

// Mobile Menu
function toggleMobileMenu() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('hidden');
}

function closeMobileMenu() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.add('hidden');
}

// Navigation
function navigateTo(view) {
    currentView = view;
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'bg-[#6ec88e]', 'text-white');
        link.classList.add('text-gray-700');
    });
    
    const activeLink = document.querySelector(`[href="#${view}"]`);
    if (activeLink) {
        activeLink.classList.add('active', 'bg-[#6ec88e]', 'text-white');
        activeLink.classList.remove('text-gray-700');
    }

    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        orders: 'Orders Management',
        customers: 'Customer Management',
        analytics: 'Analytics & Reports'
    };
    pageTitle.textContent = titles[view] || 'Dashboard';

    // Load content
    loadContent(view);
    closeMobileMenu();
}

// Content Loading Functions
function loadDashboard() {
    const orders = loadOrders();
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const todayOrders = orders.filter(o => {
        const orderDate = new Date(o.orderDate);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
    }).length;

    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- Stats Cards -->
            <div class="dashboard-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="dashboard-card bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Orders</p>
                            <p class="text-2xl font-semibold text-gray-900">${totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-yellow-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-yellow-600">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Pending Orders</p>
                            <p class="text-2xl font-semibold text-gray-900">${pendingOrders}</p>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-green-600">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p class="text-2xl font-semibold text-gray-900">₹${totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-purple-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-purple-600">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Today's Orders</p>
                            <p class="text-2xl font-semibold text-gray-900">${todayOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Orders -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-medium text-gray-900">Recent Orders</h3>
                        <button onclick="navigateTo('orders')" class="text-[#6ec88e] hover:text-green-600 font-medium text-sm">
                            View All
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    ${renderRecentOrders(orders.slice(0, 5))}
                </div>
            </div>
        </div>
    `;
}

function renderRecentOrders(orders) {
    if (orders.length === 0) {
        return '<p class="text-gray-500 text-center py-8">No orders found</p>';
    }

    return orders.map(order => `
        <div class="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-[#6ec88e] rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">#${generateOrderId(order.id)}</span>
                </div>
                <div>
                    <p class="font-medium text-gray-900">${order.userName}</p>
                    <p class="text-sm text-gray-500">${formatDate(order.orderDate)}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-semibold text-gray-900">₹${order.totalAmount.toFixed(2)}</p>
                <span class="status-badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
            </div>
        </div>
    `).join('');
}

function loadOrdersView() {
    loadOrders();
    const orders = allOrders;
    
    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- Filters -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex flex-col sm:flex-row gap-4">
                    <select id="status-filter" class="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#6ec88e] focus:border-transparent">
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <input type="date" id="date-filter" class="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#6ec88e] focus:border-transparent">
                    <input type="text" id="search-filter" placeholder="Search by order ID or customer name" class="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-[#6ec88e] focus:border-transparent">
                </div>
            </div>

            <!-- Orders List -->
            <div id="orders-list" class="space-y-4">
                ${renderOrdersList(orders)}
            </div>
        </div>
    `;

    // Add filter event listeners
    document.getElementById('status-filter').addEventListener('change', filterOrders);
    document.getElementById('date-filter').addEventListener('change', filterOrders);
    document.getElementById('search-filter').addEventListener('input', filterOrders);
}

function renderOrdersList(orders) {
    if (orders.length === 0) {
        return `
            <div class="bg-white rounded-lg shadow p-12 text-center">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-400">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                <p class="text-gray-500">No orders match your current filters.</p>
            </div>
        `;
    }

    return orders.map(order => `
        <div class="order-card bg-white rounded-lg shadow overflow-hidden">
            <div class="p-6">
                <!-- Order Header -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Order #${generateOrderId(order.id)}</h3>
                        <p class="text-sm text-gray-500">${formatDate(order.orderDate)}</p>
                        <p class="text-sm text-gray-600">Customer: ${order.userName}</p>
                    </div>
                    <div class="mt-3 sm:mt-0 flex flex-col sm:items-end gap-2">
                        <span class="status-badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
                        <p class="text-lg font-bold text-gray-900">₹${order.totalAmount.toFixed(2)}</p>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="mb-4">
                    <h4 class="font-medium text-gray-900 mb-2">Items (${order.items.length})</h4>
                    <div class="space-y-2">
                        ${order.items.map(item => `
                            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div class="flex items-center gap-3">
                                    <img src="${item.image}" alt="${item.name}" class="w-10 h-10 rounded object-cover">
                                    <div>
                                        <p class="font-medium text-sm">${item.name}</p>
                                        <p class="text-xs text-gray-500">₹${item.price} × ${item.quantity}</p>
                                    </div>
                                </div>
                                <p class="font-semibold text-sm">₹${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Delivery Address -->
                <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-1">Delivery Address</h4>
                    <p class="text-sm text-gray-600">
                        ${order.deliveryAddress.streetAddress}<br>
                        ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}<br>
                        Phone: ${order.deliveryAddress.phoneNumber}
                    </p>
                </div>

                <!-- Order Actions -->
                <div class="order-actions flex flex-col sm:flex-row gap-2">
                    ${order.status === 'Pending' ? `
                        <button onclick="updateStatus('${order.id}', 'Confirmed')" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium touch-button">
                            Confirm Order
                        </button>
                        <button onclick="updateStatus('${order.id}', 'Cancelled')" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium touch-button">
                            Cancel Order
                        </button>
                    ` : ''}
                    ${order.status === 'Confirmed' ? `
                        <button onclick="updateStatus('${order.id}', 'Shipped')" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium touch-button">
                            Mark as Shipped
                        </button>
                    ` : ''}
                    ${order.status === 'Shipped' ? `
                        <button onclick="updateStatus('${order.id}', 'Delivered')" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium touch-button">
                            Mark as Delivered
                        </button>
                    ` : ''}
                    <button onclick="viewOrderDetails('${order.id}')" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium touch-button">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterOrders() {
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    const searchFilter = document.getElementById('search-filter').value.toLowerCase();

    let filteredOrders = allOrders;

    // Filter by status
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => 
            order.status.toLowerCase() === statusFilter.toLowerCase()
        );
    }

    // Filter by date
    if (dateFilter) {
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.orderDate).toDateString();
            const filterDate = new Date(dateFilter).toDateString();
            return orderDate === filterDate;
        });
    }

    // Filter by search
    if (searchFilter) {
        filteredOrders = filteredOrders.filter(order => 
            order.id.toLowerCase().includes(searchFilter) ||
            order.userName.toLowerCase().includes(searchFilter) ||
            order.userEmail.toLowerCase().includes(searchFilter)
        );
    }

    document.getElementById('orders-list').innerHTML = renderOrdersList(filteredOrders);
}

function loadCustomers() {
    const orders = loadOrders();
    const customers = {};
    
    orders.forEach(order => {
        if (!customers[order.userId]) {
            customers[order.userId] = {
                id: order.userId,
                name: order.userName,
                email: order.userEmail,
                totalOrders: 0,
                totalSpent: 0,
                lastOrder: order.orderDate
            };
        }
        customers[order.userId].totalOrders++;
        customers[order.userId].totalSpent += order.totalAmount;
        if (new Date(order.orderDate) > new Date(customers[order.userId].lastOrder)) {
            customers[order.userId].lastOrder = order.orderDate;
        }
    });

    const customerList = Object.values(customers);

    contentArea.innerHTML = `
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Customer List</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${customerList.map(customer => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div class="text-sm font-medium text-gray-900">${customer.name}</div>
                                        <div class="text-sm text-gray-500">${customer.email}</div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${customer.totalOrders}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹${customer.totalSpent.toFixed(2)}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(customer.lastOrder)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function loadAnalytics() {
    const orders = loadOrders();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    // Calculate monthly revenue
    const monthlyRevenue = {};
    orders.forEach(order => {
        const month = new Date(order.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount;
    });

    contentArea.innerHTML = `
        <div class="space-y-6">
            <!-- Analytics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Total Revenue</h3>
                    <p class="text-3xl font-bold text-green-600">₹${totalRevenue.toFixed(2)}</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Average Order Value</h3>
                    <p class="text-3xl font-bold text-blue-600">₹${avgOrderValue.toFixed(2)}</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Total Orders</h3>
                    <p class="text-3xl font-bold text-purple-600">${orders.length}</p>
                </div>
            </div>

            <!-- Monthly Revenue -->
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
                <div class="space-y-3">
                    ${Object.entries(monthlyRevenue).map(([month, revenue]) => `
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600">${month}</span>
                            <span class="font-semibold text-gray-900">₹${revenue.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function loadContent(view) {
    switch (view) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'orders':
            loadOrdersView();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        default:
            loadDashboard();
    }
}

// Global Functions for Order Management
window.updateStatus = function(orderId, newStatus) {
    if (updateOrderStatus(orderId, newStatus)) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        loadContent(currentView);
    } else {
        showToast('Failed to update order status', 'error');
    }
};

window.viewOrderDetails = function(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details:\n\nOrder ID: ${order.id}\nCustomer: ${order.userName}\nTotal: ₹${order.totalAmount}\nStatus: ${order.status}\nDate: ${formatDate(order.orderDate)}`);
    }
};

window.navigateTo = navigateTo;

// Event Listeners
mobileMenuBtn.addEventListener('click', toggleMobileMenu);
sidebarOverlay.addEventListener('click', closeMobileMenu);
refreshBtn.addEventListener('click', () => {
    loadContent(currentView);
    showToast('Data refreshed', 'success', 2000);
});

// Navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('href').substring(1);
        navigateTo(view);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadContent('dashboard');
    showToast('Admin dashboard loaded', 'success', 2000);
});