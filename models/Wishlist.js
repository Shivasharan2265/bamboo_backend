const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate products in wishlist
wishlistSchema.index({ customer: 1, "items.product": 1 }, { unique: true });

// Static method to get wishlist with populated products
wishlistSchema.statics.getWishlistWithProducts = async function (customerId) {
  console.log(`🔍 Fetching wishlist for customer: ${customerId}`);
  
  const wishlist = await this.findOne({ customer: customerId, isActive: true })
    .populate({
      path: "items.product",
      // Include both price and prices fields to be safe
      select: "name title images price prices variants discount active slug sku stockCount",
    });

  console.log("📦 Raw populated wishlist:", wishlist);
  
  if (wishlist && wishlist.items) {
    console.log(`📦 Wishlist has ${wishlist.items.length} items`);
    
    // Debug each item with price information
    wishlist.items.forEach((item, index) => {
      console.log(`🔍 Item ${index} price debug:`, {
        productId: item.product?._id,
        productTitle: item.product?.title?.en,
        price: item.product?.price,
        prices: item.product?.prices,
        hasPrice: !!item.product?.price,
        hasPrices: !!item.product?.prices
      });
    });
  }
  
  return wishlist;
};

module.exports = mongoose.model("Wishlist", wishlistSchema);