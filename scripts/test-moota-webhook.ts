import crypto from "crypto";

require("dotenv").config({ path: ".env" });

const WEBOOK_URL = "http://localhost:3000/api/webhooks/moota";
const SECRET = process.env.MOOTA_WEBHOOK_SECRET;

if (!SECRET) {
  console.log("Error: MOOTA_WEBHOOK_SECRET is not set in .env");
  process.exit(1);
}

// Search for an unpaid invoice in your Appwrite DB
// (Change this amount to exactly match an unpaid invoice's totalDue from your DB)
const TEST_AMOUNT = Math.floor(Math.random() * 50000) + 100000;

console.log(`Creating mock Moota CR Mutation for Amount: ${TEST_AMOUNT}`);

const payload = [
  {
    account_number: "12312412312",
    date: new Date().toISOString().slice(0, 19).replace("T", " "), // "2019-11-10 14:33:01"
    description: "TRSF E-BANKING CR",
    amount: TEST_AMOUNT,
    type: "CR",
    note: "Testing webhook moota sandbox",
    balance: 520000,
    created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
    mutation_id: Math.random().toString(36).substring(7),
    token: "KuUhhx12Cw",
    bank_id: "sandbox_bank",
  },
];

const rawBody = JSON.stringify(payload);

// Generate exactly how Moota generates the signature
const signature = crypto
  .createHmac("sha256", SECRET)
  .update(rawBody)
  .digest("hex");

console.log("\nSending Payload to", WEBOOK_URL);
console.log("Signature:", signature);

fetch(WEBOOK_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Signature: signature,
  },
  body: rawBody,
})
  .then(async (res) => {
    console.log("\nResponse Status:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);
  })
  .catch(console.error);
