import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    // Initialize state directly from localStorage to avoid race conditions
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch { return null; }
    });
    const [cartItems, setCartItems] = useState(() => {
        try {
            const storedCart = localStorage.getItem('cartItems');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch { return []; }
    });
    const [favorites, setFavorites] = useState(() => {
        try {
            const storedFavs = localStorage.getItem('favorites');
            return storedFavs ? JSON.parse(storedFavs) : [];
        } catch { return []; }
    });

    const isLoaded = useRef(true); // Already loaded via initializer

    // Save when state changes (safe because initial state came from localStorage)
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const addToCart = (product, variant, quantity = 1) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.productId === product.id && item.variantId === variant.id);
            if (existing) {
                return prev.map(item =>
                    (item.productId === product.id && item.variantId === variant.id) 
                    ? { ...item, quantity: item.quantity + quantity } 
                    : item
                );
            }
            return [...prev, { 
                productId: product.id, 
                productName: product.productName,
                brand: product.brand,
                image: product.image,
                variantId: variant.id,
                variantInfo: variant,
                quantity 
            }];
        });
    };

    const removeFromCart = (productId, variantId) => {
        setCartItems(prev => prev.filter(item => !(item.productId === productId && item.variantId === variantId)));
    };

    const updateQuantity = (productId, variantId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId, variantId);
            return;
        }
        setCartItems(prev =>
            prev.map(item => (item.productId === productId && item.variantId === variantId ? { ...item, quantity } : item))
        );
    };

    const toggleFavorite = (productId) => {
        setFavorites(prev => {
            const exists = prev.includes(productId);
            if (exists) return prev.filter(id => id !== productId);
            return [...prev, productId];
        });
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const favoritesCount = favorites.length;

    return (
        <AppContext.Provider value={{
            user, login, logout,
            cartItems, cartCount, addToCart, removeFromCart, updateQuantity, clearCart,
            favorites, favoritesCount, toggleFavorite
        }}>
            {children}
        </AppContext.Provider>
    );
};
