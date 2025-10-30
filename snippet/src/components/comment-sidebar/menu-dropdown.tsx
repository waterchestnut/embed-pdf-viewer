import { h } from 'preact';
import { useRef } from 'preact/hooks';
import { useClickOutside } from '../../hooks/use-click-outside';

import { useTranslation } from "react-i18next";

interface MenuDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const MenuDropdown = ({ onEdit, onDelete, onClose }: MenuDropdownProps) => {
  const { t } = useTranslation();

  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, onClose);

  const handleEdit = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
    onClose();
  };

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-6 z-10 w-32 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
    >
      <div className="py-1">
        <button
          onClick={handleEdit}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          {t('Edit')}
        </button>
        <button
          onClick={handleDelete}
          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
        >
          {t('Delete')}
        </button>
      </div>
    </div>
  );
};
