import React from 'react';

interface FormMessageProps {
  message: string;
}

const FormMessage: React.FC<FormMessageProps> = ({ message }) => {
  if (!message) return null;
  return <p>{message}</p>;
};

export default FormMessage;
