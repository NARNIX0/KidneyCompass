import React, { useState } from 'react';
import { fetchApi } from '../utils/api';
import FormField from './form/FormField';

interface ResultCardWithNotesProps {
  id: number;
  egfr: number;
  stage: string;
  notes?: string;
  createdAt?: string;
}

const ResultCardWithNotes: React.FC<ResultCardWithNotesProps> = ({ 
  id, 
  egfr, 
  stage, 
  notes: initialNotes = '',
  createdAt 
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [noteLoading, setNoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Format date if provided
  const formattedDate = createdAt 
    ? new Date(createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : null;
  
  const saveNote = async (resultId: number, noteText: string) => {
    setNoteLoading(true);
    setError(null);
    
    try {
      const updatedResult = await fetchApi(`/results/${resultId}/note`, {
        method: 'POST',
        body: JSON.stringify({ note: noteText })
      });
      
      // Update the local state with the response
      if (updatedResult && updatedResult.notes !== undefined) {
        setNotes(updatedResult.notes);
      }
    } catch (err) {
      console.error('Error saving note:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save note');
      }
    } finally {
      setNoteLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {formattedDate && (
        <div className="mb-4 text-sm text-gray-500">
          {formattedDate}
        </div>
      )}
      
      <h2 className="text-xl font-semibold text-nhsBlue mb-4">Results</h2>
      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-gray-600 text-sm mb-1">eGFR Value</p>
          <p className="text-3xl font-bold text-nhsBlue">{egfr}</p>
          <p className="text-gray-600 text-sm">mL/min/1.73m²</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-gray-600 text-sm mb-1">CKD Stage</p>
          <p className="text-3xl font-bold text-compassGreen">{stage}</p>
        </div>
      </div>
      
      {/* Notes Section */}
      <div className="mt-4">
        <FormField
          id={`notes-${id}`}
          label="Clinician Notes"
          error={error || undefined}
        >
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Clinician notes..."
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-nhsBlue resize-vertical"
            rows={3}
          />
        </FormField>
        
        <button
          onClick={() => saveNote(id, notes)}
          disabled={noteLoading}
          className={`mt-2 py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            noteLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-compassGreen hover:bg-opacity-90 text-white focus:ring-compassGreen'
          }`}
        >
          {noteLoading ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
};

export default ResultCardWithNotes; 