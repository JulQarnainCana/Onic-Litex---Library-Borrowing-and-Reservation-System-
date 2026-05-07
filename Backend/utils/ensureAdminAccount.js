const bcrypt = require("bcryptjs");
const User = require("../models/User");

const ensureAdminAccount = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const adminName = (process.env.ADMIN_NAME || "Admin").trim();

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      existingAdmin.status = "active";
      await existingAdmin.save();
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
    status: "active"
  });

  console.log(`Default admin account created for ${adminEmail}`);
};

module.exports = ensureAdminAccount;
