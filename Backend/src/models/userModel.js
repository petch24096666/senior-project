const User = {
  registerUser: "INSERT INTO user (`fullname`,`email`,`password`) VALUES (?)",
  loginUser: "SELECT * FROM user WHERE `email` = ?",
};

export default User;
