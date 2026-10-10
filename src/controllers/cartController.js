const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: cart ko populate karke response-friendly shape mein banana
// Deleted/unavailable products ko safely handle karta hai
const buildCartResponse = async (cart) => {
  let total = 0;
  const items = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.productId);

    // Agar product delete ho chuka hai, is item ko response mein skip kar do
    // (lekin cart document se nahi hatate yahan - sirf display ke waqt ignore karte hain)
    if (!product) {
      items.push({
        productId: item.productId,
        quantity: item.quantity,
        available: false,
        message: 'This product is no longer available',
      });
      continue;
    }

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    items.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      itemTotal,
      available: true,
    });
  }

  return {
    cartId: cart._id,
    items,
    total,
  };
};

// @route   GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Normally register ke waqt hi cart ban jati hai, lekin safety ke liye
      return res.status(200).json({ success: true, cart: { items: [], total: 0 } });
    }

    const cartResponse = await buildCartResponse(cart);
    res.status(200).json({ success: true, cart: cartResponse });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/cart/items
const addItemToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !isValidId(productId)) {
      return res.status(400).json({ success: false, message: 'Valid productId is required' });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const newTotalQty = currentQtyInCart + quantity;

    if (product.stock < newTotalQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} available`,
      });
    }

    if (existingItem) {
      existingItem.quantity = newTotalQty;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();

    const cartResponse = await buildCartResponse(cart);
    res.status(200).json({ success: true, message: 'Item added to cart', cart: cartResponse });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/cart/items/:productId
const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!isValidId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} available`,
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((item) => item.productId.toString() === productId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    item.quantity = quantity; // yahan REPLACE hota hai, add nahi
    await cart.save();

    const cartResponse = await buildCartResponse(cart);
    res.status(200).json({ success: true, message: 'Cart item updated', cart: cartResponse });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/cart/items/:productId
const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemExists = cart.items.some((item) => item.productId.toString() === productId);
    if (!itemExists) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await cart.save();

    const cartResponse = await buildCartResponse(cart);
    res.status(200).json({ success: true, message: 'Item removed from cart', cart: cartResponse });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ success: true, message: 'Cart cleared', cart: { items: [], total: 0 } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addItemToCart, updateCartItem, removeCartItem, clearCart };