import { useEffect, useId, useState } from 'react';
import './checklist-answer.css';

export type ChecklistAnswerValue = { text: string; photo: File | null };

type Props = {
  answerType: string;
  value: ChecklistAnswerValue;
  onChange: (value: ChecklistAnswerValue) => void;
};

export default function ChecklistAnswer({ answerType, value, onChange }: Props) {
  const inputId = useId();
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    if (!value.photo) {
      setPhotoUrl('');
      return;
    }
    const url = URL.createObjectURL(value.photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value.photo]);

  const setText = (text: string) => onChange({ text, photo: null });
  const options = answerType === 'Pass/Fail/NA' ? ['Pass', 'Fail', 'NA']
    : answerType === 'Yes/No/NA' ? ['Yes', 'No', 'NA'] : null;

  if (options) {
    return <fieldset className="checklist-answer">
      <legend>Answer ({answerType})</legend>
      <div className="checklist-answer-options">
        {options.map((option) => <label key={option}>
          <input type="radio" name={inputId} value={option} checked={value.text === option} onChange={() => setText(option)} />
          {option === 'NA' ? 'N/A' : option}
        </label>)}
        <button type="button" disabled={!value.text} onClick={() => setText('')}>Clear</button>
      </div>
    </fieldset>;
  }

  if (answerType === 'Photo') {
    return <div className="checklist-answer">
      <label htmlFor={inputId}>Photo answer</label>
      <input id={inputId} type="file" accept="image/*" aria-describedby={photoError ? `${inputId}-error` : undefined}
        onChange={(event) => {
          const photo = event.target.files?.[0];
          if (!photo) return;
          if (!photo.type.startsWith('image/')) {
            setPhotoError('Select an image file for this answer.');
            event.target.value = '';
            return;
          }
          setPhotoError('');
          onChange({ text: '', photo });
          event.target.value = '';
        }} />
      {photoError && <p id={`${inputId}-error`} role="alert">{photoError}</p>}
      {value.photo && <div>
        <span>{value.photo.name}</span>
        {photoUrl && <img className="checklist-answer-photo" src={photoUrl} alt="Selected checklist answer" />}
        <button type="button" onClick={() => { setPhotoError(''); onChange({ text: '', photo: null }); }}>Remove photo</button>
      </div>}
    </div>;
  }

  if (answerType === 'Text') {
    return <div className="checklist-answer">
      <label htmlFor={inputId}>Text answer</label>
      <textarea id={inputId} rows={3} value={value.text} onChange={(event) => setText(event.target.value)} />
    </div>;
  }

  if (answerType === 'Numeric' || answerType === 'Date' || answerType === 'Signature') {
    const label = answerType === 'Signature' ? "Signature (signer's name)" : `${answerType} answer`;
    return <div className="checklist-answer">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} type={answerType === 'Numeric' ? 'number' : answerType === 'Date' ? 'date' : 'text'}
        step={answerType === 'Numeric' ? 'any' : undefined}
        value={value.text} onChange={(event) => setText(event.target.value)} />
    </div>;
  }

  return <p className="checklist-answer" role="alert">Unsupported answer type: {answerType}</p>;
}
