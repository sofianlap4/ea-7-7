import React from 'react';
import styles from './TextInput.module.css';

interface TextInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
    placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    placeholder,
}) => (
    <div className={styles.formGroup}>
        <div className={styles.textInputContainer}>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={styles.textInput}
            />
        </div>
    </div>
);

export default TextInput;
