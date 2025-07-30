import React from 'react';
import styles from './TextInput.module.css';

interface Option {
    label: string;
    value: string;
}

interface SelectInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Option[];
    required?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
    label,
    value,
    onChange,
    options,
    required = false,
}) => (
    <div className={styles.formGroup}>
        <div className={styles.textInputContainer}>
            <select className={styles.textInput} value={value} onChange={onChange} required={required}>
                {options.map(opt => (
                    <option key={opt.label} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    </div>
);

export default SelectInput;
