const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DATA_FOLDER = path.join(__dirname, "data");
const BATCH_SIZE = 100; // Insert in chunks for performance

// Load CSV and parse to JSON
function loadCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return [];
  }

  const content = fs.readFileSync(filePath);
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

// Bulk insert data with error tolerance
async function loadTable(table, fileName, mapper) {
  const filePath = path.join(DATA_FOLDER, fileName);
  const rows = loadCSV(filePath);

  if (rows.length === 0) {
    console.warn(`⚠️ No rows to import for ${table}`);
    return;
  }

  const mapped = rows.map(mapper);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
    const chunk = mapped.slice(i, i + BATCH_SIZE);
    try {
      await prisma[table].createMany({
        data: chunk,
        skipDuplicates: true, // optional: skip duplicates
      });
      successCount += chunk.length;
    } catch (error) {
      // fallback to individual inserts for better error logs
      for (const row of chunk) {
        try {
          await prisma[table].create({ data: row });
          successCount++;
        } catch (err) {
          failCount++;
          console.error(`❌ Error inserting into ${table}:`, err.message);
        }
      }
    }
  }

  console.log(`✅ Loaded ${successCount} rows into ${table}${failCount ? `, ${failCount} failed.` : ""}`);
}

// === RUN ALL LOADERS IN ORDER ===
async function main() {
  await loadTable("distributionCenter", "distribution_centers.csv", (row) => ({
    id: row.id,
    name: row.name,
    location: row.location,
  }));

  await loadTable("user", "users.csv", (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    phone: row.phone,
  }));

  await loadTable("product", "products.csv", (row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    category: row.category,
  }));

  await loadTable("order", "orders.csv", (row) => ({
    id: row.id,
    user_id: row.user_id,
    status: row.status,
    created_at: new Date(row.created_at),
  }));

  await loadTable("inventoryItem", "inventory_items.csv", (row) => ({
    id: row.id,
    product_id: row.product_id,
    distribution_center_id: row.distribution_center_id,
    quantity: parseInt(row.quantity),
  }));

  await loadTable("orderItem", "order_items.csv", (row) => ({
    id: row.id,
    order_id: row.order_id,
    product_id: row.product_id,
    quantity: parseInt(row.quantity),
    price: parseFloat(row.price),
  }));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("🚨 Fatal Error:", e);
  prisma.$disconnect();
});
