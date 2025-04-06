import React from "react";

const SearchBar = ({ placeholder = "Search...", style = {}, onChange, value }) => {
    return (
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "12px 20px",
          fontSize: "16px",
          border: "1px solid #D1D5DB",
          borderRadius: "8px",
          outline: "none",
          color: "#6B7280",
          fontFamily: "Inter, sans-serif",
          ...style, // รับค่า style จาก props
        }}
      />
    );
  };
  
  export default SearchBar;
  
