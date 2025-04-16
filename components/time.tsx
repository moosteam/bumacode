'use client'

import { atom } from 'jotai';

export const currentTimeAtom = atom(new Date());

export const parseCreatedAt = (createdAt: string): Date => {
  const parts = createdAt.split(" ");
  const dateParts = parts[0].split(".").map(part => part.trim());
  const timeParts = parts[1].split(":").map(part => part.trim());
  
  if (dateParts.length >= 3 && timeParts.length >= 3) {
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);
    
    return new Date(year, month, day, hours, minutes, seconds);
  }
  return new Date(createdAt);
};

export const calculateRemainingTime = (createdAt: string, currentTime: Date): string => {
  const createdTime = parseCreatedAt(createdAt);
  const diffInMinutes = Math.floor((currentTime.getTime() - createdTime.getTime()) / (1000 * 60));
  const remainingMinutes = 20 - diffInMinutes;
  
  if (remainingMinutes <= 0) {
    return "곧 삭제 예정";
  }
  return `${remainingMinutes}분 후 삭제`;
}; 