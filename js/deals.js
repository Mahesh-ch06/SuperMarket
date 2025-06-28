import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { firebaseConfig, showToast, updateCartCount, updateUserInterface, initializeCommon } from './common.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const dealsGrid = document.getElementById("deals-grid");

// Deals data
const dealsData = [
    {
        id: 1,
        name: "Fresh Bananas",
        category: "fruits",
        originalPrice: 60,
        salePrice: 35,
        discount: 42,
        image: "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "kg",
        stock: 50,
        description: "Sweet and ripe bananas, perfect for snacking"
    },
    {
        id: 2,
        name: "Organic Apples",
        category: "fruits",
        originalPrice: 180,
        salePrice: 120,
        discount: 33,
        image: "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "kg",
        stock: 30,
        description: "Crisp and juicy organic apples"
    },
    {
        id: 3,
        name: "Fresh Tomatoes",
        category: "vegetables",
        originalPrice: 40,
        salePrice: 25,
        discount: 38,
        image: "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "kg",
        stock: 40,
        description: "Farm fresh tomatoes, perfect for cooking"
    },
    {
        id: 4,
        name: "Green Spinach",
        category: "vegetables",
        originalPrice: 30,
        salePrice: 18,
        discount: 40,
        image: "https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "bunch",
        stock: 25,
        description: "Fresh green spinach leaves"
    },
    {
        id: 5,
        name: "Fresh Milk",
        category: "dairy",
        originalPrice: 60,
        salePrice: 45,
        discount: 25,
        image: "https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "liter",
        stock: 20,
        description: "Pure and fresh dairy milk"
    },
    {
        id: 6,
        name: "Greek Yogurt",
        category: "dairy",
        originalPrice: 120,
        salePrice: 85,
        discount: 29,
        image: "https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "500g",
        stock: 15,
        description: "Creamy Greek yogurt, high in protein"
    },
    {
        id: 7,
        name: "Basmati Rice",
        category: "pantry",
        originalPrice: 150,
        salePrice: 110,
        discount: 27,
        image: "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "kg",
        stock: 35,
        description: "Premium quality basmati rice"
    },
    {
        id: 8,
        name: "Whole Wheat Flour",
        category: "pantry",
        originalPrice: 80,
        salePrice: 60,
        discount: 25,
        image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "kg",
        stock: 45,
        description: "Nutritious whole wheat flour"
    },
    {
        id: 9,
        name: "Fresh Oranges",
        category: "fruits",
        originalPrice: 100,
        salePrice: 70,
        discount: 30,
        image: "https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "kg",
        stock: 28,
        description: "Juicy and vitamin C rich oranges"
    },
    {
        id: 10,
        name: "Bell Peppers",
        category: "vegetables",
        originalPrice: 80,
        salePrice: 55,
        discount: 31,
        image: "https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "kg",
        stock: 22,
        description: "Colorful and crunchy bell peppers"
    },
    {
        id: 11,
        name: "Cheddar Cheese",
        category: "dairy",
        originalPrice: 200,
        salePrice: 150,
        discount: 25,
        image: "https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "200g",
        stock: 18,
        description: "Rich and creamy cheddar cheese"
    },
    {
        id: 12,
        name: "Olive Oil",
        category: "pantry",
        originalPrice: 300,
        salePrice: 220,
        discount: 27,
        image: "https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
        unit: "500ml",
        stock: 12,
        description: "Extra virgin olive oil"
    }
];

// Add to cart function
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('freshmartCart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.salePrice,
            quantity: 1,
            image: product.image,
            unit: product.unit
        });
    }
    
    localStorage.setItem('freshmartCart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.name} added to cart!`, 'success');
}

// Render deals
function renderDeals(deals) {
    dealsGrid.innerHTML = deals.map(deal => `
        <div class="deal-card bg-white rounded-xl shadow-lg overflow-hidden relative float-animation" style="animation-delay: ${Math.random() * 2}s;">
            <div class="discount-badge">
                ${deal.discount}% OFF
            </div>
            <div class="relative">
                <img src="${deal.image}" alt="${deal.name}" class="w-full h-48 object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div class="p-4 sm:p-6">
                <h3 class="font-bold text-lg text-gray-900 mb-2">${deal.name}</h3>
                <p class="text-sm text-gray-600 mb-3">${deal.description}</p>
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <span class="text-2xl font-bold text-[#6ec88e]">₹${deal.salePrice}</span>
                        <span class="text-sm text-gray-500 line-through ml-2">₹${deal.originalPrice}</span>
                        <span class="text-xs text-gray-500 block">per ${deal.unit}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-xs text-gray-500">Stock: ${deal.stock}</span>
                    </div>
                </div>
                <button onclick="addToCart(${JSON.stringify(deal).replace(/"/g, '"')})" 
                        class="w-full bg-[#6ec88e] hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl transition-colors touch-button">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Filter deals
function filterDeals(category) {
    const filteredDeals = category === 'all' ? dealsData : dealsData.filter(deal => deal.category === category);
    renderDeals(filteredDeals);
    
    // Update active filter button
    document.querySelectorAll('.deal-filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-[#6ec88e]', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-[#6ec88e]', 'text-white');
        activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
    }
}

// Countdown timer
function startCountdown() {
    const timer = document.getElementById('timer');
    let hours = 23, minutes = 59, seconds = 45;
    
    setInterval(() => {
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            if (minutes < 0) {
                minutes = 59;
                hours--;
                if (hours < 0) {
                    hours = 23;
                }
            }
        }
        
        timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Make addToCart globally available
window.addToCart = addToCart;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeCommon();
    renderDeals(dealsData);
    startCountdown();

    // Auth state listener
    onAuthStateChanged(auth, (user) => {
        updateUserInterface(user);
    });

    // Deal filter buttons
    document.querySelectorAll('.deal-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterDeals(category);
        });
    });

    // Welcome message
    showToast('Welcome to FreshMart Deals! 🔥', 'success', 3000);
});