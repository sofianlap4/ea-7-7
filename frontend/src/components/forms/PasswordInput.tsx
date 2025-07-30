import React, { useState } from 'react';
import styles from './TextInput.module.css';

interface PasswordInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    label,
    value,
    onChange,
    required = false,
    placeholder,
}) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className={styles.formGroup}>
            <div className={styles.textInputContainer}>
                <input
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={styles.textInput}
                />

                <button type="button" onClick={() => setVisible(!visible)}>
                    {visible ? 'Hide' : 'Show'}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;
