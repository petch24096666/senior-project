import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

const styles = {
  dialog: {
    "& .MuiPaper-root": {
      borderRadius: "8px", // ตั้งค่า border radius สำหรับ Dialog ทั้งหมด
      fontFamily: "Inter, sans-serif", // ใช้ฟอนต์ Inter
    },
  },
  title: {
    fontFamily: "Inter, sans-serif",
    fontSize: "18px",
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    fontFamily: "Inter, sans-serif",
    fontSize: "16px",
    color: "#6B7280",
  },
  actions: {
    fontFamily: "Inter, sans-serif",
    display: "flex",
    justifyContent: "flex-end",
    padding: "16px",
  },
  buttonCancel: {
    fontFamily: "Inter, sans-serif",
    cursor: "pointer",
    border: "none",
    background: "none",
    justifyContent: "flex",
    textTransform: "none", // ทำให้ข้อความไม่เป็นตัวพิมพ์ใหญ่ทั้งหมด
  },
  buttonConfirm: {
    fontFamily: "Inter, sans-serif",
    borderRadius: "8px",
    textTransform: "none",
  },
};

const ConfirmationPopup = ({ 
  open, 
  title, 
  message, 
  onCancel, 
  onConfirm 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      sx={styles.dialog}
    >
      <DialogTitle id="confirmation-dialog-title" sx={styles.title}>
        {title || "Are you sure?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description" sx={styles.content}>
          {message || "Do you want to proceed with this action?"}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={styles.actions}>
        <Button onClick={onCancel} sx={styles.buttonCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained" sx={styles.buttonConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationPopup;
