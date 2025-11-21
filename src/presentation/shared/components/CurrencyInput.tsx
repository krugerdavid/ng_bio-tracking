import { useState, type ChangeEvent } from "react";

interface CurrencyInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0",
  className = "",
  required = false,
  disabled = false,
  label,
  id,
}: CurrencyInputProps) {
  // Format initial value
  const formatValue = (val: string | number) => {
    if (!val) return "";
    const numStr = val.toString().replace(/\./g, "");
    const num = parseInt(numStr, 10);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("es-PY").format(num);
  };

  const [prevValue, setPrevValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(formatValue(value));

  if (value !== prevValue) {
    setPrevValue(value);
    setDisplayValue(formatValue(value));
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove all non-digit characters
    const rawValue = inputValue.replace(/\D/g, "");

    // Update parent with raw numeric string
    onChange(rawValue);

    // Update local display with formatted value
    if (rawValue) {
      setDisplayValue(new Intl.NumberFormat("es-PY").format(parseInt(rawValue, 10)));
    } else {
      setDisplayValue("");
    }
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type="text"
        id={id}
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        required={required}
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  );
}
