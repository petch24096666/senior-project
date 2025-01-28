const User = {
    registerUser: "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)",
    getUserByEmail: "SELECT * FROM users WHERE email = ?",
  };
  
  export default User;
  