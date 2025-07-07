import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PracticalExerciseRunner from '../components/PracticalExerciseRunner';
import { fetchExerciseApi } from '../api/practicalExercices';

const PracticalExerciseRunnerPage: React.FC = () => {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState<any>(null);

  useEffect(() => {
    const loadExercise = async () => {
      const token = localStorage.getItem('token');
      if (typeof exerciseId === 'string' && token) {
        const response = await fetchExerciseApi(exerciseId, token);
        if (response?.success) {
          setExercise(response?.data);
        } else {
          console.error('Failed to load exercise:', response?.error || 'Unknown error');
        }
      }
    };
    loadExercise();
  }, [exerciseId]);

  if (!exercise) return <div>Loading...</div>;

  return (
    <PracticalExerciseRunner
      starterCode={exercise.starterCode}
      language={exercise.language}
      testCases={exercise.testCases}
    />
  );
};

export default PracticalExerciseRunnerPage;