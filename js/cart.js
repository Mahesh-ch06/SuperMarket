import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp,
    Timestamp 
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { firebaseConfig, showToast } from './common.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    let cartItems = [];
    const mainContent = document.getElementById('main-content');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const modalContentElement = confirmationModal.querySelector('div');
    
    let actionToConfirm = null;

    // Helper to open the confirmation modal with animation
    function openConfirmationModal(message, onConfirmCallback) {
        confirmationMessage.textContent = message;
        actionToConfirm = onConfirmCallback;
        confirmationModal.classList.remove('hidden');
        setTimeout(() => {
            confirmationModal.classList.remove('opacity-0');
            modalContentElement.classList.remove('-translate-y-10');
        }, 10);
    }

    // Helper to close the confirmation modal with animation
    function closeConfirmationModal() {
        confirmationModal.classList.add('opacity-0');
        modalContentElement.classList.add('-translate-y-10');
        setTimeout(() => {
            confirmationModal.classList.add('hidden');
            actionToConfirm = null;
        }, 300);
    }

    function loadCart() {
        const savedCart = localStorage.getItem('freshmartCart');
        cartItems = savedCart ? JSON.parse(savedCart) : [];
    }

    function saveCart() {
        localStorage.setItem('freshmartCart', JSON.stringify(cartItems));
    }
    
    function updateCart(productId, change) {
        const item = cartItems.find(i => i.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cartItems = cartItems.filter(i => i.id !== productId);
            }
        }
        saveCart();
        renderCart();
    }

    function removeItem(productId) {
        openConfirmationModal('Are you sure you want to remove this item?', () => {
            cartItems = cartItems.filter(i => i.id !== productId);
            saveCart();
            renderCart();
            closeConfirmationModal();
            showToast('Item removed from cart!', 'success');
        });
    }

    function emptyCart() {
        openConfirmationModal('Are you sure you want to empty your cart?', () => {
            cartItems = [];
            saveCart();
            renderCart();
            closeConfirmationModal();
            showToast('Cart emptied successfully!', 'success');
        });
    }

    function setButtonLoading(button, isLoading, originalText) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `
                <div class="spinner mr-2"></div>
                <span>Processing...</span>
            `;
        } else {
            button.disabled = false;
            button.innerHTML = `<span>${originalText}</span>`;
        }
    }

    async function proceedToCheckout() {
        console.log('🛒 Checkout initiated');
        console.log('Current user:', currentUser);
        console.log('Cart items:', cartItems);

        if (!currentUser) {
            console.log('❌ User not logged in');
            openConfirmationModal('You need to be logged in to place an order. Do you want to go to the login page?', () => {
                window.location.href = 'login.html';
                closeConfirmationModal();
            });
            return;
        }

        if (cartItems.length === 0) {
            console.log('❌ Cart is empty');
            showToast('Your cart is empty. Please add items before checking out.', 'info');
            return;
        }

        openConfirmationModal('Proceed to checkout with your current items?', async () => {
            closeConfirmationModal();

            const checkoutBtn = document.getElementById('checkout-btn');
            setButtonLoading(checkoutBtn, true, 'Proceed to Checkout');

            try {
                console.log('💰 Calculating total...');
                const grandTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                console.log('Grand total:', grandTotal);
                
                const orderData = {
                    userId: currentUser.uid,
                    userName: currentUser.displayName || currentUser.email || 'Guest User',
                    userEmail: currentUser.email || 'No email provided',
                    items: cartItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: parseFloat(item.price),
                        quantity: parseInt(item.quantity),
                        image: item.image || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop',
                        unit: item.unit || 'unit',
                        subtotal: parseFloat((item.price * item.quantity).toFixed(2))
                    })),
                    totalAmount: parseFloat(grandTotal.toFixed(2)),
                    orderDate: serverTimestamp(),
                    status: 'Pending',
                    paymentStatus: 'Pending',
                    deliveryAddress: {
                        street: 'Default Address',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        pincode: '400001',
                        country: 'India'
                    },
                    orderNotes: '',
                    estimatedDelivery: Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                console.log('📦 Order data prepared:', orderData);
                console.log('🔥 Adding order to Firestore...');
                const docRef = await addDoc(collection(db, "orders"), orderData);
                
                console.log('✅ Order placed successfully with ID:', docRef.id);
                
                showToast('🎉 Order placed successfully!', 'success', 4000);
                showToast('📧 Order confirmation sent to your email!', 'info', 3000);

                cartItems = [];
                saveCart();
                renderCart();
                
                setTimeout(() => {
                    showToast('Redirecting to My Orders...', 'info', 2000);
                    setTimeout(() => {
                        window.location.href = 'my_orders.html';
                    }, 1000);
                }, 2000);

            } catch (error) {
                console.error("❌ Error placing order:", error);
                showToast(`❌ Failed to place order: ${error.message}`, 'error', 6000);
            } finally {
                setButtonLoading(checkoutBtn, false, 'Proceed to Checkout');
            }
        });
    }

    function renderCart() {
        loadCart();
        mainContent.innerHTML = '';

        if (cartItems.length === 0) {
            mainContent.innerHTML = `
                <div class="text-center py-12 sm:py-20 px-4">
                    <div class="max-w-md mx-auto">
                        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                        <p class="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                        <a href="shop.html" class="inline-block rounded-xl h-12 sm:h-14 px-6 sm:px-8 bg-[#6ec88e] text-[#111813] text-base font-bold tracking-[0.015em] hover:bg-green-500 transition-colors touch-button">
                            Start Shopping
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        let subtotal = 0;
        let cartListHTML = '';

        cartItems.forEach(item => {
            const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
            const itemTotal = item.price * quantity;
            subtotal += itemTotal;
            cartListHTML += `
                <div class="cart-item flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b py-4 last:border-b-0">
                    <div class="cart-item-info flex items-center gap-4 w-full sm:w-auto">
                        <img src="${item.image || 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'}" alt="${item.name}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover flex-shrink-0">
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-gray-800 text-sm sm:text-base truncate">${item.name}</p>
                            <p class="text-xs sm:text-sm text-gray-500">₹${item.price.toFixed(2)} / ${item.unit || 'unit'}</p>
                        </div>
                    </div>
                    <div class="cart-item-controls flex items-center justify-between w-full sm:w-auto gap-4">
                        <div class="quantity-controls flex items-center gap-3">
                            <button class="quantity-btn p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center touch-button" data-id="${item.id}" data-change="-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 sm:w-4 sm:h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" /></svg>
                            </button>
                            <span class="w-8 text-center text-gray-800 font-medium text-sm sm:text-base">${quantity}</span>
                            <button class="quantity-btn p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center touch-button" data-id="${item.id}" data-change="1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 sm:w-4 sm:h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            </button>
                        </div>
                        <div class="item-total font-semibold text-gray-800 text-sm sm:text-base min-w-[80px] text-right">₹${itemTotal.toFixed(2)}</div>
                        <button class="remove-button text-red-500 hover:text-red-700 font-medium transition-colors p-2 touch-button" data-id="${item.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 sm:w-6 sm:h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L4.74 6.75M9 12.75h.008v.008H9v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 6.75V15" />
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });
        
        const grandTotal = subtotal;

        const cartPageHTML = `
            <div class="max-w-4xl mx-auto py-6 sm:py-10 px-4">
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Your Shopping Cart</h2>
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="p-4 sm:p-6">
                        <div id="cart-items-container">
                            ${cartListHTML}
                        </div>
                    </div>
                    <div class="mobile-cart-summary bg-gray-50 sm:bg-transparent">
                        <div class="sm:p-6">
                            <div class="flex flex-col items-end gap-4">
                                <div class="w-full sm:w-1/2 lg:w-1/3 space-y-2">
                                    <div class="flex justify-between text-base sm:text-lg">
                                        <span class="font-medium text-gray-600">Subtotal:</span>
                                        <span class="font-semibold text-gray-800">₹${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div class="flex justify-between text-lg sm:text-xl border-t pt-2">
                                        <span class="font-bold text-gray-800">Grand Total:</span>
                                        <span class="font-bold text-gray-900">₹${grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-3 mt-4">
                                    <button id="empty-cart-btn" class="w-full sm:w-auto rounded-xl h-12 px-6 bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-colors touch-button">Empty Cart</button>
                                    <button id="checkout-btn" class="w-full sm:w-auto rounded-xl h-12 px-6 bg-[#6ec88e] text-[#111813] font-bold hover:bg-green-500 transition-colors touch-button">Proceed to Checkout</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        mainContent.innerHTML = cartPageHTML;
        addCartActionListeners();
    }

    function addCartActionListeners() {
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const change = parseInt(e.currentTarget.dataset.change);
                updateCart(id, change);
            });
        });

        document.querySelectorAll('.remove-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                removeItem(id);
            });
        });

        document.getElementById('empty-cart-btn')?.addEventListener('click', emptyCart);
        document.getElementById('checkout-btn')?.addEventListener('click', proceedToCheckout);
    }
    
    // Confirmation Modal Listeners
    confirmBtn.addEventListener('click', () => {
        if(actionToConfirm) {
            actionToConfirm();
        }
    });

    cancelBtn.addEventListener('click', () => {
        closeConfirmationModal();
    });

    // Listen for Firebase Auth state changes
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        console.log('🔐 Auth state changed:', user ? `Logged in as ${user.email}` : 'Not logged in');
        renderCart();
    });
});