// src/controllers/timeGridController.js

// สเกล: 1px = 1 นาที (ปรับ PIXELS_PER_MINUTE ตามดีไซน์ได้)
export const PIXELS_PER_MINUTE = 1;     // 1px = 1 นาที
export const MINUTES_PER_HOUR  = 60;
export const HOUR_SLOT_HEIGHT  = PIXELS_PER_MINUTE * MINUTES_PER_HOUR; // = 60px

/**
 * แปลงเวลา (Date, ISO string) → นาทีจากเที่ยงคืน
 */
export function toTotalMinutes(dateTime) {
  const d = new Date(dateTime);
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * คำนวณ Top offset (px)
 */
export function calcTop(dateTime) {
  return toTotalMinutes(dateTime) * PIXELS_PER_MINUTE;
}

/**
 * คำนวณ Height (px) จากช่วงเวลา start–end
 */
export function calcHeight(startDateTime, endDateTime) {
  const duration = toTotalMinutes(endDateTime) - toTotalMinutes(startDateTime);
  return duration * PIXELS_PER_MINUTE;
}

/**
 * จัด layout events ให้รองรับกรณี overlap ง่าย ๆ
 * @param events [{ id, start, end, ... }]
 * @returns [{ ev, top, height, left, width }]
 */
export function layoutEvents(events) {
  // สร้างตำแหน่งเบื้องต้น
  const positioned = events.map(ev => ({
    ev,
    top:    calcTop(ev.start),
    height: calcHeight(ev.start, ev.end),
    left:   0,
    width:  100
  }));

  // ตรวจจับ overlap แบบง่าย: แบ่ง 2 คอลัมน์ถ้าทับกัน
  for (let i = 0; i < positioned.length; i++) {
    for (let j = i + 1; j < positioned.length; j++) {
      const a = positioned[i];
      const b = positioned[j];
      const aEnd = a.top + a.height;
      const bEnd = b.top + b.height;
      if (!(aEnd <= b.top || bEnd <= a.top)) {
        // มี overlap
        a.width = b.width = 50;
        b.left  = 50;
      }
    }
  }

  return positioned;
}
