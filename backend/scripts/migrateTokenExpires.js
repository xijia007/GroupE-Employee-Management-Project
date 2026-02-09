import dotenv from "dotenv";
import connectDB from "../config/db.js";
import RegistrationToken from "../models/RegistrationToken.js";

dotenv.config();

const HOURS_TO_MS = 3 * 60 * 60 * 1000;

const migrate = async () => {
  await connectDB();

  const tokens = await RegistrationToken.find({
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }],
  })
    .select("_id createdAt createAt")
    .lean();

  let updated = 0;

  for (const token of tokens) {
    const base = token.createdAt || token.createAt || new Date();
    const baseDate = base instanceof Date ? base : new Date(base);
    const expiresAt = new Date(baseDate.getTime() + HOURS_TO_MS);

    await RegistrationToken.updateOne(
      { _id: token._id },
      { $set: { expiresAt } },
    );
    updated += 1;
  }

  console.log(`Updated ${updated} token(s) with expiresAt.`);
  process.exit(0);
};

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
