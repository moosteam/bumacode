import React from 'react';

interface WriteButtonProps {
  onWrite: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const WriteButton: React.FC<WriteButtonProps> = ({ onWrite, onCancel, disabled = false }) => {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onWrite}
        disabled={disabled}
        className={`px-6 py-2 rounded-md ${
          disabled 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        작성하기
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 bg-gray-300 text-white rounded-md"
      >
        취소
      </button>
    </div>
  );
};

export default WriteButton;