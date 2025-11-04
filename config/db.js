// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Add these options to fix SSL issues
      ssl: true,
      sslValidate: false,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // If SSL fails, try without SSL as fallback
    if (error.message.includes('SSL')) {
      console.log('🔄 Trying without SSL...');
      try {
        const fallbackURI = process.env.MONGO_URI.replace('mongodb+srv://', 'mongodb://').replace('?retryWrites=true&w=majority&ssl=true&tlsAllowInvalidCertificates=true', '?retryWrites=true&w=majority&ssl=false');
        const conn = await mongoose.connect(fallbackURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          ssl: false
        });
        console.log(`✅ MongoDB Connected (without SSL): ${conn.connection.host}`);
      } catch (fallbackError) {
        console.error('❌ MongoDB fallback connection failed:', fallbackError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

module.exports = { connectDB };