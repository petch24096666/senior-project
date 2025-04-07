const User = {
  // Original queries
  registerUser: "INSERT INTO users (`fullname`, `email`, `password`) VALUES (?, ?, ?)",
  checkEmailExists: "SELECT * FROM users WHERE email = ?",
  loginUser: "SELECT * FROM users WHERE `email` = ?",
  
  // New queries for Supabase integration
  registerWithProvider: "INSERT INTO users (`fullname`, `email`, `password`, `provider`, `token`) VALUES (?, ?, ?, ?, ?)",
  updateUserToken: "UPDATE users SET `token` = ?, `updated_at` = NOW() WHERE `email` = ?",
  updateGoogleToken: "UPDATE users SET `google_token` = ?, `updated_at` = NOW() WHERE `email` = ?",
  updateMicrosoftToken: "UPDATE users SET `microsoft_token` = ?, `updated_at` = NOW() WHERE `email` = ?",
  updatePassword: "UPDATE users SET `password` = ?, `updated_at` = NOW() WHERE `email` = ?",
  getUserByEmail: "SELECT * FROM users WHERE `email` = ?",
  
  // For OAuth users
  createOAuthUser: "INSERT INTO users (`email`, `provider`, `token`, `created_at`, `updated_at`) VALUES (?, ?, ?, NOW(), NOW())",
  updateOAuthUser: "UPDATE users SET `token` = ?, `provider` = ?, `updated_at` = NOW() WHERE `email` = ?"
};

export default User;