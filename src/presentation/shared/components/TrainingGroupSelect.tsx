import { useState } from "react";
import { TRAINING_GROUPS, OTHER_TRAINING_GROUP } from "@domain/member/trainingGroups";

const inputBaseClass =
  "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300";

export interface TrainingGroupSelectProps {
  id: string;
  label?: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  required?: boolean;
  inputClassName?: string;
}

/**
 * Select de grupo/horario (ej. 0600) con opción "Otro" para texto libre.
 * Reutilizable (DRY) en el registro público y en el alta/edición de miembro del admin.
 */
export function TrainingGroupSelect({
  id,
  label = "Grupo / horario",
  value,
  onChange,
  disabled = false,
  required = false,
  inputClassName,
}: TrainingGroupSelectProps) {
  const isKnownGroup = value === undefined || value === "" || (TRAINING_GROUPS as readonly string[]).includes(value);
  const [showCustom, setShowCustom] = useState(!isKnownGroup);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <select
        id={id}
        required={required}
        disabled={disabled}
        value={showCustom ? OTHER_TRAINING_GROUP : (value ?? "")}
        onChange={e => {
          const selected = e.target.value;
          if (selected === OTHER_TRAINING_GROUP) {
            setShowCustom(true);
            onChange("");
            return;
          }
          setShowCustom(false);
          onChange(selected || undefined);
        }}
        className={`${inputBaseClass} ${inputClassName ?? ""}`.trim()}
      >
        <option value="">Seleccioná un horario</option>
        {TRAINING_GROUPS.map(group => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
        <option value={OTHER_TRAINING_GROUP}>Otro</option>
      </select>

      {showCustom && (
        <input
          type="text"
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          placeholder="Escribí el grupo/horario"
          disabled={disabled}
          className={`${inputBaseClass} mt-2`}
        />
      )}
    </div>
  );
}
