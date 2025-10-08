interface FormInputProps {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  defaultValue?: string;
}

export function FormInput({
  label,
  value,
  onChange,
  placeholder,
  name,
  defaultValue,
}: FormInputProps) {
  // If value and onChange are provided, use controlled mode
  if (value !== undefined && onChange) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    );
  }

  // Otherwise use uncontrolled mode with name and defaultValue
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
