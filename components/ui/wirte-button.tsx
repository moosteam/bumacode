import React from 'react';

interface WriteButtonProps {
  onClick: () => void;
}

const WriteButton: React.FC<WriteButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-6 py-2 bg-blue-600 text-white rounded-md"
    >
      공유하기
    </button>
  );
};

export default WriteButton;