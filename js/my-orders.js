// My Orders page specific JavaScript

let currentUser = null;
let allOrders = [];

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

// localStorage Order Management
function getOrdersFromLocalStorage(userId) {
    const allOrders = JSON.parse(localStorage.getItem('freshmartOrders') || '[]');
    return allOrders.filter(order => order.userId === userId);
}

function updateOrderInLocalStorage(orderId, updates) {
    const allOrders = JSON.parse(localStorage.getItem('freshmartOrders') || '[]');
    const orderIndex = allOrders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        allOrders[orderIndex] = { ...allOrders[orderIndex], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('freshmartOrders', JSON.stringify(allOrders));
        return true;
    }
    return false;
}

// Fetch and Render Orders
async function fetchAndRenderOrders(userId) {
    try {
        showLoading(true);
        
        // Get orders from localStorage
        allOrders = getOrdersFromLocalStorage(userId);

        // Sort orders by date in descending order (most recent first)
        allOrders.sort((a, b) => {
            const dateA = new Date(a.orderDate);
            const dateB = new Date(b.orderDate);
            return dateB - dateA;
        });

        renderOrders(allOrders);
        
    } catch (error) {
        console.error("Error fetching orders:", error);
        window.FreshMartCommon.showToast(`Failed to load orders: ${error.message}`, 'error', 5000);
        showEmptyState('Error loading orders. Please try again later.', true);
    } finally {
        showLoading(false);
    }
}

function renderOrders(orders) {
    const ordersContainer = document.getElementById('orders-container');
    
    if (orders.length === 0) {
        showEmptyState('You haven\'t placed any orders yet.');
        return;
    }

    let ordersHtml = '';
    orders.forEach(order => {
        const orderDate = formatDate(order.orderDate);
        const orderId = generateOrderId(order.id);
        const statusClass = getStatusBadgeClass(order.status);
        
        let itemsHtml = order.items.map(item => `
            <div class="order-item flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="order-item-info flex items-center gap-3 mb-2 sm:mb-0">
                    <img src="${item.image || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'}" 
                         alt="${item.name}" 
                         class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-900 text-sm sm:text-base truncate">${item.name}</h4>
                        <p class="text-xs sm:text-sm text-gray-500">₹${item.price} × ${item.quantity} ${item.unit || 'unit'}</p>
                    </div>
                </div>
                <div class="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-2">
                    <span class="text-sm text-gray-600 sm:hidden">Total:</span>
                    <span class="font-semibold text-gray-900 text-sm sm:text-base">₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        `).join('');

        ordersHtml += `
            <div class="order-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div class="p-4 sm:p-6">
                    <!-- Order Header -->
                    <div class="order-header flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-100">
                        <div class="mb-3 sm:mb-0">
                            <h3 class="font-bold text-lg sm:text-xl text-gray-900">Order #${orderId}</h3>
                            <p class="text-sm text-gray-500 mt-1">Placed on ${orderDate}</p>
                            ${order.userName ? `<p class="text-sm text-gray-500">Customer: ${order.userName}</p>` : ''}
                        </div>
                        <div class="flex flex-col sm:items-end gap-2">
                            <span class="status-badge ${statusClass}">${order.status}</span>
                            <button class="toggle-details text-sm text-[#6ec88e] hover:text-green-600 font-medium flex items-center gap-1 touch-button" data-order-id="${order.id}">
                                <span>View Details</span>
                                <svg class="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="order-summary flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div class="mb-3 sm:mb-0">
                            <p class="text-sm text-gray-600">${order.items.length} item${order.items.length > 1 ? 's' : ''}</p>
                            <p class="text-xs text-gray-500 mt-1">Order ID: ${order.id}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-2xl font-bold text-gray-900">₹${order.totalAmount.toFixed(2)}</p>
                            <p class="text-sm text-gray-500">Total Amount</p>
                        </div>
                    </div>

                    <!-- Expandable Order Details -->
                    <div class="order-details mt-4" id="details-${order.id}">
                        <div class="border-t border-gray-100 pt-4">
                            <h4 class="font-semibold text-gray-900 mb-3">Order Items</h4>
                            <div class="order-items space-y-2">
                                ${itemsHtml}
                            </div>
                            
                            <!-- Delivery Information -->
                            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h5 class="font-semibold text-gray-900 mb-2">Delivery Information</h5>
                                <div class="text-sm text-gray-600 space-y-1">
                                    <p><strong>Address:</strong> ${order.deliveryAddress.street}, ${order.deliveryAddress.city}</p>
                                    <p><strong>State:</strong> ${order.deliveryAddress.state} - ${order.deliveryAddress.pincode}</p>
                                    <p><strong>Estimated Delivery:</strong> ${formatDate(order.estimatedDelivery)}</p>
                                    <p><strong>Payment Status:</strong> <span class="font-medium">${order.paymentStatus}</span></p>
                                </div>
                            </div>
                            
                            <!-- Order Actions -->
                            <div class="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-100">
                                ${order.status.toLowerCase() === 'pending' ? `
                                    <button class="cancel-order flex-1 sm:flex-none rounded-lg h-10 px-4 bg-red-100 text-red-700 font-medium hover:bg-red-200 transition-colors touch-button" data-order-id="${order.id}">
                                        Cancel Order
                                    </button>
                                ` : ''}
                                <button class="reorder-btn flex-1 sm:flex-none rounded-lg h-10 px-4 bg-[#6ec88e] text-[#111813] font-medium hover:bg-green-500 transition-colors touch-button" data-order-items='${JSON.stringify(order.items)}'>
                                    Reorder Items
                                </button>
                                <button class="track-order flex-1 sm:flex-none rounded-lg h-10 px-4 bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors touch-button" data-order-id="${order.id}">
                                    Track Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    ordersContainer.innerHTML = ordersHtml;
    addOrderEventListeners();
}

function showEmptyState(message, isError = false) {
    const ordersContainer = document.getElementById('orders-container');
    const iconColor = isError ? 'text-red-400' : 'text-gray-400';
    const iconPath = isError 
        ? 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
        : 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z';

    ordersContainer.innerHTML = `
        <div class="text-center py-12 sm:py-20">
            <div class="max-w-md mx-auto">
                <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 sm:w-10 sm:h-10 ${iconColor}">
                        <path stroke-linecap="round" stroke-linejoin="round" d="${iconPath}" />
                    </svg>
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">${isError ? 'Error Loading Orders' : 'No Orders Found'}</h3>
                <p class="text-gray-600 mb-6">${message}</p>
                ${!isError ? `
                    <a href="shop.html" class="inline-block rounded-xl h-12 sm:h-14 px-6 sm:px-8 bg-[#6ec88e] text-[#111813] text-base font-bold tracking-[0.015em] hover:bg-green-500 transition-colors touch-button">
                        Start Shopping
                    </a>
                ` : `
                    <button onclick="location.reload()" class="inline-block rounded-xl h-12 sm:h-14 px-6 sm:px-8 bg-[#6ec88e] text-[#111813] text-base font-bold tracking-[0.015em] hover:bg-green-500 transition-colors touch-button">
                        Try Again
                    </button>
                `}
            </div>
        </div>
    `;
}

function showLoading(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    const ordersContainer = document.getElementById('orders-container');
    
    if (show) {
        loadingIndicator.classList.remove('hidden');
        ordersContainer.innerHTML = '';
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

function addOrderEventListeners() {
    // Toggle order details
    document.querySelectorAll('.toggle-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.currentTarget.dataset.orderId;
            const detailsElement = document.getElementById(`details-${orderId}`);
            const icon = e.currentTarget.querySelector('svg');
            
            if (detailsElement.classList.contains('expanded')) {
                detailsElement.classList.remove('expanded');
                icon.style.transform = 'rotate(0deg)';
                e.currentTarget.querySelector('span').textContent = 'View Details';
            } else {
                detailsElement.classList.add('expanded');
                icon.style.transform = 'rotate(180deg)';
                e.currentTarget.querySelector('span').textContent = 'Hide Details';
            }
        });
    });

    // Cancel order
    document.querySelectorAll('.cancel-order').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const orderId = e.currentTarget.dataset.orderId;
            if (confirm('Are you sure you want to cancel this order?')) {
                try {
                    const success = updateOrderInLocalStorage(orderId, { status: "Cancelled" });
                    if (success) {
                        window.FreshMartCommon.showToast('Order cancelled successfully!', 'success');
                        fetchAndRenderOrders(currentUser.uid);
                    } else {
                        window.FreshMartCommon.showToast('Failed to cancel order. Please try again.', 'error');
                    }
                } catch (error) {
                    console.error("Error cancelling order:", error);
                    window.FreshMartCommon.showToast('Failed to cancel order. Please try again.', 'error');
                }
            }
        });
    });

    // Reorder items
    document.querySelectorAll('.reorder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderItems = JSON.parse(e.currentTarget.dataset.orderItems);
            
            // Add items to cart
            const existingCart = JSON.parse(localStorage.getItem('freshmartCart') || '[]');
            
            orderItems.forEach(item => {
                const existingItem = existingCart.find(cartItem => cartItem.id === item.id);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    existingCart.push({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image,
                        unit: item.unit
                    });
                }
            });
            
            localStorage.setItem('freshmartCart', JSON.stringify(existingCart));
            window.FreshMartCommon.showToast('Items added to cart successfully!', 'success');
            
            // Redirect to cart after a short delay
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 1500);
        });
    });

    // Track order
    document.querySelectorAll('.track-order').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.currentTarget.dataset.orderId;
            window.FreshMartCommon.showToast(`Order tracking for #${generateOrderId(orderId)} - Feature coming soon!`, 'info');
        });
    });
}

function filterOrders() {
    const statusFilter = document.getElementById('statusFilter');
    if (!statusFilter) return;
    
    const selectedStatus = statusFilter.value;
    let filteredOrders = allOrders;
    
    if (selectedStatus !== 'all') {
        filteredOrders = allOrders.filter(order => 
            order.status.toLowerCase() === selectedStatus.toLowerCase()
        );
    }
    
    renderOrders(filteredOrders);
}

// Initialize My Orders page
function initializeMyOrdersPage() {
    const statusFilter = document.getElementById('statusFilter');
    const refreshBtn = document.getElementById('refreshBtn');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterOrders);
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (currentUser) {
                fetchAndRenderOrders(currentUser.uid);
                window.FreshMartCommon.showToast('Orders refreshed!', 'info', 2000);
            }
        });
    }
}

// Export for use in other modules
window.FreshMartMyOrders = {
    formatDate,
    getStatusBadgeClass,
    generateOrderId,
    getOrdersFromLocalStorage,
    updateOrderInLocalStorage,
    fetchAndRenderOrders,
    renderOrders,
    showEmptyState,
    showLoading,
    addOrderEventListeners,
    filterOrders,
    initializeMyOrdersPage
};