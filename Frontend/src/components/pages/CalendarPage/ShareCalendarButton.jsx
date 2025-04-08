import React, { useState } from 'react';
import ShareCalendarModal from './ShareCalendarModal';

const ShareCalendarButton = () => {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShareSubmit = (email) => {
    // ตัวอย่าง: ส่ง email ไป backend เพื่อดำเนินการแชร์ปฏิทิน
    console.log("Sharing calendar with:", email);
    // หลังจากส่งคำขอแล้ว สามารถปิด modal ได้
    setShowShareModal(false);
  };

  return (
    <>
      <button 
        className="share-calendar-button" 
        onClick={() => setShowShareModal(true)}
      >
        Share Calendar
      </button>
      {showShareModal && (
        <ShareCalendarModal 
          onClose={() => setShowShareModal(false)}
          onSubmit={handleShareSubmit}
        />
      )}
    </>
  );
};

export default ShareCalendarButton;
