import React from 'react';
import { PREDEFINED_COLORS } from '../../utils/colors';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelectColor }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">Color</label>
      <div className="flex flex-wrap gap-2">
        {PREDEFINED_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelectColor(color)}
            className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${
              selectedColor === color ? 'border-sky-400 scale-110' : 'border-gray-700'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
