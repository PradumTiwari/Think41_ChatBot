const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BATCH_SIZE = 1000;

function loadCSV(fileName) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(path.join(__dirname, 'data', fileName))
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function insertInBatches(data, mapper, model) {
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE).map(mapper);
    try {
      await prisma[model].createMany({ data: batch, skipDuplicates: true });
      console.log(`✅ Inserted ${Math.min(i + BATCH_SIZE, data.length)} / ${data.length} into ${model}`);
    } catch (err) {
      console.error(`❌ Error inserting into ${model}:`, err);
    }
  }
}

async function seed() {
  try {
    // 1. Distribution Centers
    const dcRows = await loadCSV('distribution_centers.csv');
    await insertInBatches(dcRows, (r) => ({
      id: parseInt(r.id),
      name: r.name,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
    }), 'distributionCenter');

    // 2. Users
    const userRows = await loadCSV('users.csv');
    await insertInBatches(userRows, (u) => ({
      id: parseInt(u.id),
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      age: parseInt(u.age),
      gender: u.gender,
      state: u.state,
      street_address: u.street_address,
      postal_code: u.postal_code,
      city: u.city,
      country: u.country,
      latitude: parseFloat(u.latitude),
      longitude: parseFloat(u.longitude),
      traffic_source: u.traffic_source,
      created_at: new Date(u.created_at),
    }), 'user');

    // 3. Products
    const productRows = await loadCSV('products.csv');
    await insertInBatches(productRows, (p) => ({
      id: parseInt(p.id),
      cost: parseFloat(p.cost),
      category: p.category,
      name: p.name,
      brand: p.brand,
      retail_price: parseFloat(p.retail_price),
      department: p.department,
      sku: p.sku,
      distribution_center_id: parseInt(p.distribution_center_id),
    }), 'product');

    // 4. Inventory Items
    const inventoryRows = await loadCSV('inventory_items.csv');
    await insertInBatches(inventoryRows, (i) => ({
      id: parseInt(i.id),
      product_id: parseInt(i.product_id),
      created_at: new Date(i.created_at),
      sold_at: i.sold_at ? new Date(i.sold_at) : null,
      cost: parseFloat(i.cost),
      product_category: i.product_category,
      product_name: i.product_name,
      product_brand: i.product_brand,
      product_retail_price: parseFloat(i.product_retail_price),
      product_department: i.product_department,
      product_sku: i.product_sku,
      product_distribution_center_id: parseInt(i.product_distribution_center_id),
    }), 'inventoryItem');

    // 5. Orders
    const orderRows = await loadCSV('orders.csv');
    await insertInBatches(orderRows, (o) => ({
      order_id: parseInt(o.order_id),
      user_id: parseInt(o.user_id),
      status: o.status,
      gender: o.gender,
      created_at: new Date(o.created_at),
      returned_at: o.returned_at ? new Date(o.returned_at) : null,
      shipped_at: o.shipped_at ? new Date(o.shipped_at) : null,
      delivered_at: o.delivered_at ? new Date(o.delivered_at) : null,
      num_of_item: parseInt(o.num_of_item),
    }), 'order');

    // 6. Order Items
    const orderItemRows = await loadCSV('order_items.csv');
    await insertInBatches(orderItemRows, (oi) => ({
      id: parseInt(oi.id),
      order_id: parseInt(oi.order_id),
      user_id: parseInt(oi.user_id),
      product_id: parseInt(oi.product_id),
      inventory_item_id: parseInt(oi.inventory_item_id),
      status: oi.status,
      created_at: new Date(oi.created_at),
      shipped_at: oi.shipped_at ? new Date(oi.shipped_at) : null,
      delivered_at: oi.delivered_at ? new Date(oi.delivered_at) : null,
      returned_at: oi.returned_at ? new Date(oi.returned_at) : null,
    }), 'orderItem');

    console.log('✅ All data seeded quickly using batches!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
