import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PracticalexerciceRunner from "./PracticalExerciceRunner"
import { fetchexerciceApi } from '../../api/practicalExercices';

const PracticalexerciceRunnerPage: React.FC = () => {
  const { exerciceId } = useParams();
  const [exercice, setexercice] = useState<any>(null);

  useEffect(() => {
    const loadexercice = async () => {
      const token = localStorage.getItem('token');
      if (typeof exerciceId === 'string' && token) {
        const response = await fetchexerciceApi(exerciceId, token);
        if (response?.success) {
          setexercice(response?.data);
        } else {
          console.error('Failed to load exercice:', response?.error || 'Unknown error');
        }
      }
    };
    loadexercice();
  }, [exerciceId]);

  if (!exercice) return <div>Loading...</div>;

  return (
    <PracticalexerciceRunner
      starterCode={exercice.starterCode}
      language={exercice.language}
      testCases={exercice.testCases}
    />
  );
};

export default PracticalexerciceRunnerPage;