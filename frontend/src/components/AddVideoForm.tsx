import React, { useState, FormEvent, ChangeEvent } from 'react';
import { addVideo } from '../api/videos';
import { RESPONSE_MESSAGES } from '../utils/responseMessages';

interface AddVideoFormProps {
  courseId: string | number;
  onAdd?: () => void;
}

const AddVideoForm: React.FC<AddVideoFormProps> = ({ courseId, onAdd }) => {
  const [title, setTitle] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidUrl(url)) {
      setMessage('Please enter a valid URL.');
      return;
    }
    setLoading(true);
    try {
      const response = await addVideo({ title, url, courseId });
      if (response.success) {
        setMessage(RESPONSE_MESSAGES.VIDEO_ADDED);
        setTitle('');
        setUrl('');
        if (onAdd) onAdd();
      } else {
        setMessage(response.error || 'Error adding video');
      }
    } catch {
      setMessage(RESPONSE_MESSAGES.ERROR_NEWORK);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAdd}>
      <h3>Add Video</h3>
      <label>
        Video Title
        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
        />
      </label>
      <label>
        Video URL
        <input
          type="text"
          placeholder="Video URL"
          value={url}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Video'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default AddVideoForm;