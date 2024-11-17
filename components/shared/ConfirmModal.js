'use client'

const ConfirmModal = ({ onConfirm, onCancel }) => (
    <div className="flex flex-col gap-4">
      <p className="text-red-500">Are you sure you want to remove? This cannot be undone.</p>
      <div className="flex justify-between">
        <button onClick={onConfirm} className="bg-emerald-400 text-white font-bold py-2 px-4 rounded">
          Yes, Remove
        </button>
        <button onClick={onCancel} className="bg-stone-400 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
      </div>
    </div>
  );

export default ConfirmModal;