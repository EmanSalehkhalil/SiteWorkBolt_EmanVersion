import { useEffect, useId, useState } from 'react';
import { Check, X, Minus } from 'lucide-react';
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
    const iconFor = (opt: string) => opt === 'Pass' || opt === 'Yes' ? <Check size={10} /> : opt === 'Fail' || opt === 'No' ? <X size={10} /> : <Minus size={10} />;
    const clsFor = (opt: string) => {
      if (value.text !== opt) return '';
      if (opt === 'Pass' || opt === 'Yes') return 'selected-pass';
      if (opt === 'Fail' || opt === 'No') return 'selected-fail';
      return 'selected-na';
    };
    return <fieldset className="checklist-answer">
      <div className="checklist-answer-options">
        {options.map((option) => <button type="button" key={option} className={clsFor(option)} onClick={() => setText(option)}>
          {iconFor(option)}{option === 'NA' ? 'N/A' : option}
        </button>)}
        {value.text && <button type="button" className="clear-btn" onClick={() => setText('')}>Clear</button>}
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
      {value.photo && <div className="checklist-answer-photo-wrap">
        {photoUrl && <img className="checklist-answer-photo" src={photoUrl} alt="Selected checklist answer" />}
        <span>{value.photo.name}</span>
        <button type="button" onClick={() => { setPhotoError(''); onChange({ text: '', photo: null }); }}>Remove</button>
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
