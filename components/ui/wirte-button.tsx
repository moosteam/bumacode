import React from 'react';

interface WriteButtonProps {
  onWrite: () => void;
  onCancel: () => void;
}

const WriteButton: React.FC<WriteButtonProps> = ({ onWrite, onCancel }) => {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onWrite}
        className="px-6 py-2 bg-blue-600 text-white rounded-md"
      >
        작성하기
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 bg-gray-500 text-white rounded-md"
      >
        취소
      </button>
    </div>
  );
};

export default WriteButton;