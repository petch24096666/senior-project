const User = {
  registerUser: "INSERT INTO users (`fullname`, `email`, `password`) VALUES (?, ?, ?)",
  checkEmailExists: "SELECT * FROM users WHERE email = ?",
  loginUser: "SELECT * FROM users WHERE `email` = ?",
};

export default User;
