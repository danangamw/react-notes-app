import { EditorContent, useEditor, JSONContent } from '@tiptap/react';
import styles from './NotesPage.module.css';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Note, UserData } from './types';
import storage from './storage';
import NoteEditor from './NoteEditor';
import debounce from './debounce';
import { AES, enc } from 'crypto-js';

const STORAGE_KEY = 'notes';

const loadNotes = ({ username, passphrase }: UserData) => {
  const noteIds = storage.get<string[]>(`${username}:${STORAGE_KEY}`, []);
  const notes: Record<string, Note> = {};
  noteIds.forEach((id: string) => {
    const encryptedNote = storage.get<Note>(`${username}:${STORAGE_KEY}:${id}`);
    const note: Note = JSON.parse(
      AES.decrypt(encryptedNote, passphrase).toString(enc.Utf8)
    );
    notes[note.id] = {
      ...note,
      updateAt: new Date(note.updateAt),
    };
  });
  return notes;
};

const saveNote = debounce((note: Note, { username, passphrase }: UserData) => {
  const noteIds = storage.get<string[]>(`${username}:${STORAGE_KEY}`, []);
  const noteIdsWithoutNote = noteIds.filter((id: string) => id !== note.id);
  storage.set(`${username}:${STORAGE_KEY}`, [...noteIdsWithoutNote, note.id]);
  const encryptedNote = AES.encrypt(
    JSON.stringify(note),
    passphrase
  ).toString();
  storage.set(`${username}:${STORAGE_KEY}:${note.id}`, encryptedNote);
}, 200);

type Props = {
  userData: UserData;
};

function NotesPage({ userData }: Props) {
  const [notes, setNotes] = useState<Record<string, Note>>(() =>
    loadNotes(userData)
  );
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const activeNote = activeNoteId ? notes[activeNoteId] : null;

  const handleChangeNoteContent = (
    noteId: string,
    content: JSONContent,
    title: string
  ) => {
    const updatedNote = {
      ...notes[noteId],
      updatedAt: new Date(),
      content,
      title,
    };
    setNotes((notes) => ({
      ...notes,
      [noteId]: updatedNote,
    }));
    saveNote(updatedNote, userData);
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
    saveNote(newNote, userData);
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
          onChange={(content, title: string) =>
            handleChangeNoteContent(activeNote.id, content, title)
          }
        />
      ) : (
        <div>Create a new note or select an existing one.</div>
      )}
    </div>
  );
}

export default NotesPage;
