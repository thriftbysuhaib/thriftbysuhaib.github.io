// ==========================================
// THRIFT BY SUHAIB - MAIN JAVASCRIPT
// ==========================================


// ==========================================
// PRODUCTS
// ==========================================
// Yahan baad mein apne products add kar sakte ho.
// Har product ka unique "id" hona chahiye.

// ==========================================
// PRODUCTS
// ==========================================

// Existing website products
const localProducts = [

    {
        id: "upper-1",
        name: "Nike Dri-FIT Half Zip",
        price: 1200,
        category: "uppers",
        size: "M",
        condition: "Excellent",
        stock: 1,
        image: "nike-upper.jpeg",
        description: "Premium thrift find with a lightweight and breathable fabric. Neon green and black colorway, perfect for gym, running and casual wear. First come, first served."
    },

    {
        id: "footwear-1",
        name: "Made in Korea | Vintage Mule",
        price: 1500,
        category: "footwear",
        size: "EU 40 / US 7",
        condition: "Good",
        stock: 1,
        image: "korean-boram.jpeg",
        description: "Minimal, clean and timeless vintage mule with a soft suede-style upper. Comfortable slip-on design, lightweight and versatile. Thrift by Suhaib — curated pre-loved finds."
    },

    {
        id: "upper-2",
        name: "Vintage Rugby Jersey",
        price: 1000,
        category: "uppers",
        size: "XL",
        condition: "9/10",
        stock: 1,
        image: "rugby-jersey.jpeg",
        description: "A unique vintage rugby piece for your streetwear rotation. Blue, white and orange colorway. Preloved. Premium. You. First come, first served."
    }

];

// Google Sheets API
const PRODUCTS_API_URL =
    "https://script.google.com/macros/s/AKfycbwZnzPc2J22Z7rQLxeuXwPGRdX42O6BUy7mG161Bl6uozOIyfZ4-pQ3KIXMo3D02qqv/exec";

// Final products list
let products = [...localProducts];

// Load products from Google Sheet
async function loadProducts() {

    try {

        const response = await fetch(
            PRODUCTS_API_URL + "?t=" + Date.now()
        );

        if (!response.ok) {
            throw new Error("Could not load products.");
        }

        const sheetProducts = await response.json();
alert("Sheet se " + sheetProducts.length + " products mile!");
        const cleanedProducts = sheetProducts.map(function (product) {

            return {
                id: String(product.id || ""),
                name: String(product.name || ""),
                price: Number(product.price) || 0,
                category: String(product.category || ""),
                size: String(product.size || ""),
                condition: String(product.condition || ""),
                stock: Number(product.stock) || 0,
                image: String(product.image || ""),
                description: String(product.description || "")
            };

        });

        // Sheet products are added to existing products
        const existingIds = localProducts.map(function (product) {
            return product.id;
        });

        products = [
            ...localProducts,
            ...cleanedProducts.filter(function (product) {
                return !existingIds.includes(product.id);
            })
        ];

        renderProducts();

    } catch (error) {

        console.error("Google Sheet error:", error);

        // Website still works with existing products
        products = [...localProducts];

        renderProducts();

    }

}


// ==========================================
// SETTINGS
// ==========================================

// IMPORTANT:
// Apna WhatsApp number yahan baad mein add karna.
// Pakistan format: 92XXXXXXXXXX

const whatsappNumber = "923372491957";


// ==========================================
// CART
// ==========================================

let cart = JSON.parse(localStorage.getItem("thriftCart")) || [];


// ==========================================
// CURRENT CATEGORY
// ==========================================

let currentCategory = "all";


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    updateCartCount();

    loadProducts();

});


// ==========================================
// GET PRODUCT IMAGE
// ==========================================

function getImage(product) {

    if (!product.image || product.image.trim() === "") {
        return `
            <div class="no-image">
                IMAGE
            </div>
        `;
    }

    return `
        <img
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
        >
    `;
}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function renderProducts() {

    const container = document.getElementById("products-container");

    if (!container) {
        return;
    }

    const searchInput = document.getElementById("search-input");

    const searchTerm = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";


    const filteredProducts = products.filter(function (product) {

        const matchesCategory =
            currentCategory === "all" ||
            product.category === currentCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;

    });


    if (filteredProducts.length === 0) {

        container.innerHTML = `
            <div class="no-products">
                No products found.
            </div>
        `;

        return;
    }


    container.innerHTML = filteredProducts.map(function (product) {

        const stockClass =
            product.stock <= 0 ? "out-of-stock" : "";

        const stockText =
            product.stock > 0 ? "Available" : "Sold Out";


        return `

            <article
                class="product-card ${stockClass}"
                onclick="openProduct('${product.id}')"
            >

                <div class="product-image">
                    ${getImage(product)}
                </div>

                <div class="product-info">

                    <div class="product-category">
                        ${product.category}
                    </div>

                    <h3 class="product-name">
                        ${product.name}
                    </h3>

                    <div class="product-price">
                        Rs. ${Number(product.price).toLocaleString()}
                    </div>

                    <div class="product-size">
                        Size: ${product.size || "N/A"}
                        · ${stockText}
                    </div>

                </div>

            </article>

        `;

    }).join("");

}


// ==========================================
// SEARCH
// ==========================================

function searchProducts() {

    renderProducts();

}


// ==========================================
// CATEGORY FILTER
// ==========================================

function setCategory(category, button) {

    currentCategory = category;


    document.querySelectorAll(".category-btn").forEach(function (btn) {

        btn.classList.remove("active");

    });


    if (button) {
        button.classList.add("active");
    }


    renderProducts();

}


// ==========================================
// OPEN PRODUCT DETAIL PAGE
// ==========================================

function openProduct(productId) {

    window.location.href =
        "product.html?id=" + encodeURIComponent(productId);

}


// ==========================================
// ADD TO CART
// ==========================================

function addToCart(productId) {

    const product = products.find(function (item) {

        return item.id === productId;

    });


    if (!product) {
        return;
    }


    if (product.stock <= 0) {

        alert("Sorry, this product is sold out.");

        return;
    }


    const alreadyInCart = cart.some(function (item) {

        return item.id === productId;

    });


    if (alreadyInCart) {

        alert("This product is already in your cart.");

        return;
    }


    cart.push({
        id: product.id,
        name: product.name,
        price: product.price
    });


    saveCart();

    updateCartCount();

    alert("Product added to cart.");

}


// ==========================================
// REMOVE FROM CART
// ==========================================

function removeFromCart(productId) {

    cart = cart.filter(function (item) {

        return item.id !== productId;

    });


    saveCart();

    updateCartCount();

    renderCart();

}


// ==========================================
// SAVE CART
// ==========================================

function saveCart() {

    localStorage.setItem(
        "thriftCart",
        JSON.stringify(cart)
    );

}


// ==========================================
// CART COUNT
// ==========================================

function updateCartCount() {

    const countElement =
        document.getElementById("cart-count");


    if (countElement) {

        countElement.textContent = cart.length;

    }

}


// ==========================================
// OPEN CART
// ==========================================

function openCart() {

    const modal =
        document.getElementById("cart-modal");


    if (!modal) {
        return;
    }


    modal.classList.add("show");

    renderCart();

}


// ==========================================
// CLOSE CART
// ==========================================

function closeCart() {

    const modal =
        document.getElementById("cart-modal");


    if (modal) {

        modal.classList.remove("show");

    }

}


// ==========================================
// DISPLAY CART
// ==========================================

function renderCart() {

    const container =
        document.getElementById("cart-items");

    const totalElement =
        document.getElementById("cart-total");


    if (!container) {
        return;
    }


    if (cart.length === 0) {

        container.innerHTML = `
            <p>Your cart is empty.</p>
        `;


        if (totalElement) {
            totalElement.textContent = "Rs. 0";
        }

        return;
    }


    let total = 0;


    container.innerHTML = cart.map(function (item) {

        total += Number(item.price);


        return `

            <div class="cart-item">

                <div>

                    <div class="cart-item-name">
                        ${item.name}
                    </div>

                    <div>
                        Rs. ${Number(item.price).toLocaleString()}
                    </div>

                </div>


                <button
                    class="remove-item"
                    onclick="removeFromCart('${item.id}')"
                >
                    Remove
                </button>

            </div>

        `;

    }).join("");


    if (totalElement) {

        totalElement.textContent =
            "Rs. " + total.toLocaleString();

    }

}


// ==========================================
// WHATSAPP - SINGLE PRODUCT
// ==========================================

function orderProduct(productId) {

    const product = products.find(function (item) {

        return item.id === productId;

    });


    if (!product) {
        return;
    }


    const message =
        "Assalamualaikum! I want to order:\n\n" +
        "Product: " + product.name + "\n" +
        "Price: Rs. " + Number(product.price).toLocaleString() + "\n" +
        "Size: " + (product.size || "N/A") + "\n\n" +
        "Please confirm availability.";


    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


    window.open(url, "_blank");

}


// ==========================================
// WHATSAPP - CART
// ==========================================

function checkoutWhatsApp() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }


    let message =
        "Assalamualaikum! I want to order:\n\n";


    let total = 0;


    cart.forEach(function (item, index) {

        message +=
            (index + 1) +
            ". " +
            item.name +
            " — Rs. " +
            Number(item.price).toLocaleString() +
            "\n";


        total += Number(item.price);

    });


    message +=
        "\nTotal: Rs. " +
        total.toLocaleString() +
        "\n\nPlease confirm availability.";


    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


    window.open(url, "_blank");

}


// ==========================================
// GENERAL WHATSAPP BUTTON
// ==========================================

function openWhatsApp() {

    const message =
        "Assalamualaikum! I have a question about Thrift by Suhaib.";


    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


    window.open(url, "_blank");

}


// ==========================================
// CLOSE CART WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener("click", function (event) {

    const modal =
        document.getElementById("cart-modal");


    if (!modal) {
        return;
    }


    if (
        event.target === modal &&
        modal.classList.contains("show")
    ) {

        closeCart();

    }

});
