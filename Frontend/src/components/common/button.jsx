import React from "react";
import { Button } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

export const CustomButton = ({ label, variant = "contained", color = "primary", onClick, disabled, sx = {} }) => {
  return (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      disabled={disabled}
      sx={{
        fontFamily: "Inter, sans-serif", // ✅ กำหนดฟอนต์ Inter
        textTransform: "none", // ✅ ป้องกันตัวพิมพ์ใหญ่ทั้งหมด
        borderRadius: "8px",
        padding: "10px 20px",
        fontSize: "16px",
        minWidth: "130px", // ✅ ป้องกันปุ่มมีขนาดเล็กเกินไป
        ...sx, // ✅ รองรับการกำหนดสไตล์เพิ่มเติมจาก props
      }}
    >
      {label}
    </Button>
  );
};

// ปุ่มแสดงเมนูเพิ่มเติม (More Options)
export const MoreOptionsButton = ({ onClick, sx }) => (
  <CustomButton
    label={<MoreHorizIcon />}
    color="secondary"
    onClick={onClick}
    sx={{ minWidth: "50px", padding: "8px", ...sx }}
  />
);

// ปุ่มเพิ่มโปรเจกต์
export const AddProjectButton = ({ label = "+ Add Project", onClick, sx }) => (
  <CustomButton label={label} onClick={onClick} sx={sx} />
);
