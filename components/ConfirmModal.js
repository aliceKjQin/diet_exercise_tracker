'use client'

const ConfirmModal = ({ onConfirm, onCancel }) => (
    <div className="flex flex-col gap-4">
      <p>Are you sure you want to remove the current active diet? This action cannot be undone.</p>
      <div className="flex justify-between">
        <button onClick={onConfirm} className="bg-teal-400 text-white font-bold py-2 px-4 rounded">
          Yes, Remove
        </button>
        <button onClick={onCancel} className="bg-stone-400 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
      </div>
    </div>
  );

export default ConfirmModal;