import { EditorContent, useEditor, JSONContent } from '@tiptap/react';

import styles from './App.module.css';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Note } from './types';
import NoteEditor from './NoteEditor';

function App() {
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const activeNote = activeNoteId ? notes[activeNoteId] : null;

  const handleChangeNoteContent = (
    noteId: string,
    content: JSONContent,
    title: string = 'New Note'
  ) => {
    setNotes((notes) => ({
      ...notes,
      [noteId]: {
        ...notes[noteId],
        updateAt: new Date(),
        content,
        title,
      },
    }));
  };

  const handleCreateNewNote = () => {
    const newNote = {
      id: uuid(),
      title: 'New note',
      content: `<h1>New note</h1>`,
      updateAt: new Date(),
    };

    setNotes((notes) => ({
      ...notes,
      [newNote.id]: newNote,
    }));

    setActiveNoteId(newNote.id);
  };

  const handleChangeActiveNote = (id: string) => {
    setActiveNoteId(id);
  };

  const notesList = Object.values(notes).sort(
    (a, b) => b.updateAt.getTime() - a.updateAt.getTime()
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sidebar}>
        <button className={styles.sidebarButton} onClick={handleCreateNewNote}>
          New Note
        </button>
        <div className={styles.sidebarList}>
          {notesList.map((note) => (
            <div
              key={note.id}
              role="button"
              tabIndex={0}
              className={
                note.id === activeNoteId
                  ? styles.sidebarItemActive
                  : styles.sidebarItem
              }
              onClick={() => handleChangeActiveNote(note.id)}
            >
              {note.title}
            </div>
          ))}
        </div>
      </div>

      {activeNote ? (
        <NoteEditor
          note={activeNote}
          onChange={(content, title) =>
            handleChangeNoteContent(activeNote.id, content, title)
          }
        />
      ) : (
        <div>Create a new note or select an existing one.</div>
      )}
    </div>
  );
}

export default App;
