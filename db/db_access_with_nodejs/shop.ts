/**
 * shop.ts
 * Core Requirements (per PDF):
 * 1. Database & Collection Setup
 * 2. CRUD Operations
 * 3. Index Optimization
 * 4. Aggregation Pipeline
 * 5. TTL Index
 */
import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME    = 'shop';
const COL_NAME   = 'products';

interface Product {
  _id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: Date;
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db  = client.db(DB_NAME);
  const col = db.collection<Product>(COL_NAME);

  // 1. Database & Collection Setup
  await col.drop().catch(() => {});  
  const initialProducts: Product[] = [
    { _id: 1, name: 'Laptop',    category: 'electronics', price: 1200, stock: 10, createdAt: new Date(Date.now() - 40*86400e3) },
    { _id: 2, name: 'Headphones',category: 'electronics', price: 150,  stock:  5, createdAt: new Date() },
    { _id: 3, name: 'T-Shirt',   category: 'apparel',      price:  25,  stock: 30, createdAt: new Date() },
    { _id: 4, name: 'Coffee Mug',category: 'home',         price:  12,  stock: 20, createdAt: new Date() },
  ];
  await col.insertMany(initialProducts);
  console.log('1. Seeded initial products.');

  // 2. CRUD Operations
  // a) Add 2 new products
  const extra = [
    { _id: 5, name: 'Sneakers',   category: 'apparel',      price:  80, stock: 50, createdAt: new Date() },
    { _id: 6, name: 'Smart Watch',category: 'electronics', price: 200, stock: 25, createdAt: new Date() },
  ];
  await col.insertMany(extra);
  console.log('2a. Added 2 new products.');

  // b) Find all electronics
  const electronics = await col.find({ category: 'electronics' }).toArray();
  console.log('2b. Electronics:', electronics);

  // c) Find products priced 100–500
  const midRange = await col.find({ price: { $gte: 100, $lte: 500 } }).toArray();
  console.log('2c. Price between 100 and 500:', midRange);

  // d) Apply 10% discount to electronics
  await col.updateMany(
    { category: 'electronics' },
    { $mul: { price: 0.9 } }
  );
  console.log('2d. 10% discount applied to electronics.');

  // e) Update stock to 40 for _id:3
  await col.updateOne({ _id: 3 }, { $set: { stock: 40 } });
  console.log('2e. Stock for _id 3 set to 40.');

  // f) Remove products with stock = 0
  const del = await col.deleteMany({ stock: 0 });
  console.log(`2f. Removed ${del.deletedCount} products with stock = 0.`);

  // 3. Index Optimization
  // a) Create compound index on (category ASC, price DESC)
  await col.createIndex({ category: 1, price: -1 });
  console.log('3a. Created compound index {category:1, price:-1}.');

  // b) Explain() without index
  const colNoIdx = db.collection<Product>(COL_NAME);
  // First drop the index, run explain, then recreate it
  await colNoIdx.dropIndex('category_1_price_-1');
  const noIdxExplain = await colNoIdx.find({ category: 'electronics' }).sort({ price: -1 }).explain('executionStats');
  console.log('3b(i). Explain without index:', {
    totalDocsExamined: noIdxExplain.executionStats.totalDocsExamined,
    executionTimeMillis: noIdxExplain.executionStats.executionTimeMillis
  });

  // c) With index
  await colNoIdx.createIndex({ category: 1, price: -1 });
  const withIdxExplain = await colNoIdx.find({ category: 'electronics' }).sort({ price: -1 }).explain('executionStats');
  console.log('3b(ii). Explain with index:', {
    totalDocsExamined: withIdxExplain.executionStats.totalDocsExamined,
    executionTimeMillis: withIdxExplain.executionStats.executionTimeMillis
  });
  console.log('3c. With the compound index, MongoDB can satisfy both filter and sort via the index, avoiding in-memory sorts and full collection scans.');

  // 4. Aggregation Pipeline
  const pipeline = [
    { $group: {
        _id: '$category',
        totalStock: { $sum: '$stock' },
        avgPrice:    { $avg: '$price' }
    }},
    { $match: { avgPrice: { $gt: 500 } } },
    { $sort: { totalStock: -1 } }
  ];
  const aggResults = await col.aggregate(pipeline).toArray();
  console.table(aggResults.map(r => ({
    category:   r._id,
    totalStock: r.totalStock,
    averagePrice: r.avgPrice.toFixed(2)
  })));
  console.log('4. Aggregation pipeline grouped, filtered avgPrice>500, sorted by totalStock.');

  // 5. TTL Index
  // a) Create TTL index on createdAt to expire docs older than 30 days
  await col.createIndex({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
  console.log('5a. Created TTL index on createdAt (30 days).');

  // b) Explain TTL handling
  console.log(`5b. MongoDB’s TTL Monitor runs once a minute and deletes expired documents 
based on the indexed field’s value + expireAfterSeconds. 
This cleanup happens in background and may lag by up to a minute.`);

  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

