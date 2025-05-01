// src/utils/meetingUtils.js

export const generateMockMeetingLink = (platform) => {
    const random = Math.floor(Math.random() * 10000);
    return `https://${platform}.com/meeting/${random}`;
  };
  