// ==========================================
// THRIFT BY SUHAIB - MAIN JAVASCRIPT
// ==========================================

// =========================
// LOCAL PRODUCTS
// =========================

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
        description:
            "Premium thrift find with a lightweight and breathable fabric. Neon green and black colorway, perfect for gym, running and casual wear. First come, first served."
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
        description:
            "Minimal, clean and timeless vintage mule with a soft suede-style upper. Comfortable slip-on design, lightweight and versatile. Thrift by Suhaib — curated pre-loved finds."
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
        description:
            "A unique vintage rugby piece for your streetwear rotation. Blue, white and orange colorway. Preloved. Premium. You. First come, first served."
    }
];


// =========================
// GOOGLE SHEETS API
// =========================

const PRODUCTS_API_URL =
    "https://script.google.com/macros/s/AKfycbwZnzPc2J22Z7rQLxeuXwPGRdX42O6BUy7mG161Bl6uozOIyfZ4-pQ3KIXMo3D02qqv/exec";

let products = [...localProducts];


// This lets product.html wait until Sheet products are loaded
window.productsReady = Promise.resolve();


// =========================
// LOAD PRODUCTS FROM SHEET
// =========================

function loadProducts() {

    window.productsReady = new Promise(function(resolve) {

        const callbackName =
            "__thriftProducts_" + Date.now();

        const script =
            document.createElement("script");

        let finished = false;


        function finish(result) {

            if (finished) return;

            finished = true;

            delete window[callbackName];

            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }

            resolve(result);
        }


        // Google Sheet response
        window[callbackName] = function(sheetProducts) {

            try {

                if (!Array.isArray(sheetProducts)) {
                    throw new Error("Invalid product data.");
                }


                const cleanedProducts =
                    sheetProducts.map(function(product) {

                        return {
                            id: String(product.id || "").trim(),

                            name: String(product.name || "").trim(),

                            price:
                                Number(
                                    String(product.price || "")
                                        .replace(/,/g, "")
                                ) || 0,

                            category:
                                String(product.category || "").trim(),

                            size:
                                String(product.size || "").trim(),

                            condition:
                                String(product.condition || "").trim(),

                            stock:
                                Number(product.stock) || 0,

                            image:
                                String(product.image || "").trim(),

                            description:
                                String(product.description || "").trim()
                        };

                    });


                // Keep local products
                // If same ID exists in Sheet, Sheet version updates it
                const sheetIds =
                    new Set(
                        cleanedProducts.map(function(product) {
                            return product.id;
                        })
                    );


                const remainingLocalProducts =
                    localProducts.filter(function(product) {
                        return !sheetIds.has(product.id);
                    });


                products = [
                    ...remainingLocalProducts,
                    ...cleanedProducts
                ];


                console.log(
                    "Products loaded:",
                    products
                );


                renderProducts();

                finish(products);

            } catch (error) {

                console.error(
                    "Google Sheet data error:",
                    error
                );

                products = [...localProducts];

                renderProducts();

                finish(products);
            }
        };


        script.onerror = function() {

            console.error(
                "Could not load Google Sheet products."
            );

            products = [...localProducts];

            renderProducts();

            finish(products);
        };


        script.src =
            PRODUCTS_API_URL +
            "?callback=" +
            encodeURIComponent(callbackName) +
            "&t=" +
            Date.now();


        document.head.appendChild(script);

    });


    return window.productsReady;
}


// =========================
// CART
// =========================

const whatsappNumber = "923372491957";

let cart =
    JSON.parse(
        localStorage.getItem("thriftCart")
    ) || [];

let currentCategory = "all";


// =========================
// PAGE LOAD
// =========================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateCartCount();

        loadProducts();

    }
);


// =========================
// PRODUCT IMAGE
// =========================

function getImage(product) {

    if (
        !product.image ||
        product.image.trim() === ""
    ) {
        return `<div class="no-image">IMAGE</div>`;
    }

    return `
        <img
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
        >
    `;
}


// =========================
// RENDER PRODUCTS
// =========================

function renderProducts() {

    const container =
        document.getElementById(
            "products-container"
        );

    if (!container) return;


    const searchInput =
        document.getElementById(
            "search-input"
        );


    const searchTerm =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filteredProducts =
        products.filter(function(product) {

            const matchesCategory =
                currentCategory === "all" ||
                product.category === currentCategory;


            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(searchTerm) ||

                product.category
                    .toLowerCase()
                    .includes(searchTerm);


            return (
                matchesCategory &&
                matchesSearch
            );

        });


    if (filteredProducts.length === 0) {

        container.innerHTML =
            `<div class="no-products">
                No products found.
            </div>`;

        return;
    }


    container.innerHTML =
        filteredProducts
            .map(function(product) {

                const stockClass =
                    product.stock <= 0
                        ? "out-of-stock"
                        : "";


                const stockText =
                    product.stock > 0
                        ? "Available"
                        : "Sold Out";


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
                                ·
                                ${stockText}
                            </div>

                        </div>

                    </article>
                `;

            })
            .join("");
}


// =========================
// SEARCH
// =========================

function searchProducts() {
    renderProducts();
}


// =========================
// CATEGORY
// =========================

function setCategory(
    category,
    button
) {

    currentCategory = category;


    document
        .querySelectorAll(".category-btn")
        .forEach(function(btn) {

            btn.classList.remove("active");

        });


    if (button) {
        button.classList.add("active");
    }


    renderProducts();
}


// =========================
// OPEN PRODUCT
// =========================

function openProduct(productId) {

    window.location.href =
        "product.html?id=" +
        encodeURIComponent(productId);
}


// =========================
// ADD TO CART
// =========================

function addToCart(productId) {

    const product =
        products.find(function(item) {
            return item.id === productId;
        });


    if (!product) return;


    if (product.stock <= 0) {

        alert(
            "Sorry, this product is sold out."
        );

        return;
    }


    const alreadyInCart =
        cart.some(function(item) {
            return item.id === productId;
        });


    if (alreadyInCart) {

        alert(
            "This product is already in your cart."
        );

        return;
    }


    cart.push({

        id: product.id,

        name: product.name,

        price: product.price

    });


    saveCart();

    updateCartCount();


    alert(
        "Product added to cart."
    );
}


// =========================
// REMOVE FROM CART
// =========================

function removeFromCart(productId) {

    cart =
        cart.filter(function(item) {
            return item.id !== productId;
        });


    saveCart();

    updateCartCount();

    renderCart();
}


// =========================
// SAVE CART
// =========================

function saveCart() {

    localStorage.setItem(
        "thriftCart",
        JSON.stringify(cart)
    );
}


// =========================
// CART COUNT
// =========================

function updateCartCount() {

    const countElement =
        document.getElementById(
            "cart-count"
        );


    if (countElement) {

        countElement.textContent =
            cart.length;

    }
}


// =========================
// OPEN CART
// =========================

function openCart() {

    const modal =
        document.getElementById(
            "cart-modal"
        );


    if (!modal) return;


    modal.classList.add("show");

    renderCart();
}


// =========================
// CLOSE CART
// =========================

function closeCart() {

    const modal =
        document.getElementById(
            "cart-modal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }
}


// =========================
// RENDER CART
// =========================

function renderCart() {

    const container =
        document.getElementById(
            "cart-items"
        );


    const totalElement =
        document.getElementById(
            "cart-total"
        );


    if (!container) return;


    if (cart.length === 0) {

        container.innerHTML =
            `<p>Your cart is empty.</p>`;


        if (totalElement) {
            totalElement.textContent =
                "Rs. 0";
        }

        return;
    }


    let total = 0;


    container.innerHTML =
        cart.map(function(item) {

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

        })
        .join("");


    if (totalElement) {

        totalElement.textContent =
            "Rs. " +
            total.toLocaleString();

    }
}


// =========================
// ORDER PRODUCT
// =========================

function orderProduct(productId) {

    const product =
        products.find(function(item) {
            return item.id === productId;
        });


    if (!product) return;


    const message =
        "Assalamualaikum! I want to order:\n\n" +

        "Product: " +
        product.name +
        "\n" +

        "Price: Rs. " +
        Number(product.price).toLocaleString() +
        "\n" +

        "Size: " +
        (product.size || "N/A") +
        "\n\n" +

        "Please confirm availability.";


    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        url,
        "_blank"
    );
}


// =========================
// CHECKOUT WHATSAPP
// =========================

function checkoutWhatsApp() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;
    }


    let message =
        "Assalamualaikum! I want to order:\n\n";


    let total = 0;


    cart.forEach(
        function(item, index) {

            message +=
                (index + 1) +
                ". " +
                item.name +
                " — Rs. " +
                Number(item.price).toLocaleString() +
                "\n";


            total += Number(item.price);

        }
    );


    message +=
        "\nTotal: Rs. " +
        total.toLocaleString() +
        "\n\nPlease confirm availability.";


    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        url,
        "_blank"
    );
}


// =========================
// OPEN WHATSAPP
// =========================

function openWhatsApp() {

    const message =
        "Assalamualaikum! I have a question about Thrift by Suhaib.";


    const url =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        url,
        "_blank"
    );
}


// =========================
// CLOSE CART WHEN CLICKING OUTSIDE
// =========================

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "cart-modal"
            );


        if (!modal) return;


        if (
            event.target === modal &&
            modal.classList.contains("show")
        ) {

            closeCart();

        }

    }
);
