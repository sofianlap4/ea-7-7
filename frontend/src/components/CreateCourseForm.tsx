import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { fetchCreateCourse, createQuizz, addQuizzQuestion } from '../api/courses';
import { fetchAllPacksAdmin } from '../api/packs';

const CreateCourseForm: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [pdf, setPdf] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [videos, setVideos] = useState<{ title: string; url: string }[]>([]);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [quizzTitle, setQuizzTitle] = useState<string>('');
  const [questions, setQuestions] = useState<
    { question: string; choices: string[]; correctAnswer: string }[]
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentChoices, setCurrentChoices] = useState<string[]>(['', '', '', '']);
  const [currentCorrect, setCurrentCorrect] = useState<string>('');
  const [packIds, setPackIds] = useState<string[]>([]); 
  const [packs, setPacks] = useState<any[]>([]);
  const [isFree, setIsFree] = useState<boolean>(true);

  useEffect(() => {
    fetchAllPacksAdmin().then(response => {
      if (response.success) {
        setPacks(Array.isArray(response.data) ? response.data : []);
      } else {
        console?.error(response.error || 'Error fetching packs');
      }
    });
  }, []);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (pdf) formData.append('pdf', pdf);
    formData.append('videos', JSON.stringify(videos));
    formData.append('isFree', isFree ? "true" : "false");
    packIds.forEach(id => formData.append('packIds[]', id));

    const response1 = await fetchCreateCourse(formData);
    if (response1.success) {
      setMessage('Cours créé !');
      setTitle('');
      setDescription('');
      setPdf(null);
      setVideos([]);
      setPackIds([]);
      if (quizzTitle) {
        const response = await createQuizz(response1?.data?.id, quizzTitle);
        if (response?.success) {
          for (const q of questions) {
            await addQuizzQuestion(
              response?.data.id,
              q.question,
              q.correctAnswer,
              q.choices
            );
          }
          setMessage('Cours , quizz et questions créés !');
        } else {
          setMessage('Cours créé, mais échec de la création du quizz : ' + response.error);
        }
      }
      setQuizzTitle('');
      setQuestions([]);
      setCurrentQuestion('');
      setCurrentChoices(['', '', '', '']);
      setCurrentCorrect('');
    } else {
      console.error('Error creating course');
    }
  };

  const handleAddQuestion = () => {
    if (
      currentQuestion &&
      currentChoices.every(c => c) &&
      currentCorrect &&
      currentChoices.includes(currentCorrect)
    ) {
      setQuestions([
        ...questions,
        {
          question: currentQuestion,
          choices: currentChoices,
          correctAnswer: currentCorrect,
        },
      ]);
      setCurrentQuestion('');
      setCurrentChoices(['', '', '', '']);
      setCurrentCorrect('');
    }
  };

  return (
    <form onSubmit={handleCreate}>
      <h2>Créer un cours</h2>
      <label htmlFor="courseTitle">Titre du cours:</label>
      <input
        type="text"
        placeholder="Titre du cours"
        value={title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        required
      />
      <br />
      <input type="radio" name="isFree" id="isFree" value="true" checked={isFree} onChange={() => setIsFree(true)} />
      <label htmlFor="isFree">Gratuit</label>
      <input type="radio" name="isFree" id="isPaid" value="false" checked={!isFree} onChange={() => setIsFree(false)} />
      <label htmlFor="isPaid">Payant</label>
      <br />
      <label htmlFor="courseDescription">Description du cours:</label>
      <textarea
        placeholder="Description du cours"
        value={description}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
        required
      />
      <br />
      <input
        type="file"
        accept="application/pdf"
        onChange={e => setPdf(e.target.files?.[0] || null)}
      />
      <br />
      <h4>Ajouter des vidéos</h4>
      <input
        type="text"
        placeholder="Titre de la vidéo"
        value={videoTitle}
        onChange={e => setVideoTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="URL de la vidéo"
        value={videoUrl}
        onChange={e => setVideoUrl(e.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          if (videoTitle && videoUrl) {
            setVideos([...videos, { title: videoTitle, url: videoUrl }]);
            setVideoTitle('');
            setVideoUrl('');
          }
        }}
      >
        Ajouter une vidéo
      </button>
      <ul>
        {videos.map((v, i) => (
          <li key={i}>{v.title} - {v.url}</li>
        ))}
      </ul>
      <br />
      <input
        type="text"
        placeholder="Titre du quizz (optionnel)"
        value={quizzTitle}
        onChange={e => setQuizzTitle(e.target.value)}
      />
      {quizzTitle && (
        <div style={{ border: '1px solid #ccc', padding: 10, marginTop: 10 }}>
          <h4>Ajouter des questions au quizz</h4>
          <input
            type="text"
            placeholder="Question"
            value={currentQuestion}
            onChange={e => setCurrentQuestion(e.target.value)}
          />
          <br />
          {currentChoices.map((choice, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Choix ${idx + 1}`}
              value={choice}
              onChange={e => {
                const newChoices = [...currentChoices];
                newChoices[idx] = e.target.value;
                setCurrentChoices(newChoices);
              }}
              style={{ marginRight: 5 }}
            />
          ))}
          <br />
          <input
            type="text"
            placeholder="Réponse correcte (doit correspondre à l'un des choix)"
            value={currentCorrect}
            onChange={e => setCurrentCorrect(e.target.value)}
          />
          <button type="button" onClick={handleAddQuestion} style={{ marginLeft: 10 }}>
            Ajouter une question
          </button>
          <ul>
            {questions.map((q, i) => (
              <li key={i}>
                <b>{q.question}</b>
                <ul>
                  {q.choices.map((c, j) => (
                    <li key={j} style={{ color: c === q.correctAnswer ? 'green' : undefined }}>
                      {c}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
      <br />
      <label>Sélectionner un ou plusieurs packs :</label>
      <select
        multiple
        value={packIds}
        onChange={e => {
          const selected = Array.from(e.target.selectedOptions, option => option.value);
          setPackIds(selected);
        }}
        required
        style={{ width: "100%", minHeight: 80 }}
      >
        {packs.map(pack => (
          <option key={pack.id} value={pack.id}>{pack.name}</option>
        ))}
      </select>
      <br />
      <button type="submit">Create</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default CreateCourseForm;