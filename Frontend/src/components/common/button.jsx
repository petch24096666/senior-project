import React from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

// สไตล์ปุ่มพื้นฐาน
const buttonStyles = {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    padding: "10px 16px",
    border: "none",
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "500",
  },
  primary: {
    backgroundColor: "#4F46E5",
    color: "#fff",
  },
  secondary: {
    backgroundColor: "#E5E7EB",
    color: "#111827",
  },
};

// ปุ่มทั่วไปที่รองรับ style แบบ inline
const Button = ({ type = "primary", label, onClick, style = {} }) => {
  const defaultStyle =
    type === "primary"
      ? { ...buttonStyles.base, ...buttonStyles.primary }
      : { ...buttonStyles.base, ...buttonStyles.secondary };

  return (
    <button style={{ ...defaultStyle, ...style }} onClick={onClick}>
      {label}
    </button>
  );
};

// ปุ่มแสดงเมนูเพิ่มเติม
export const MoreOptionsButton = ({ onClick, style }) => (
  <Button type="secondary" label={<MoreHorizIcon />} onClick={onClick} style={style} />
);

// ปุ่มเพิ่มโปรเจกต์ที่สามารถกำหนดสไตล์ inline ได้
export const AddProjectButton = ({ label = "+ Add Project", onClick, style }) => (
  <Button label={label} onClick={onClick} style={style} />
);

export default Button;