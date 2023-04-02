import { Content, useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import styles from './App.module.css';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';

type Note = {
  id: string;
  title: string;
  content: Content;
  updateAt: Date;
};

function App() {
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
    editorProps: {
      attributes: {
        class: styles.textEditor,
      },
    },
  });

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
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
  };

  const notesList = Object.values(notes).sort(
    (a, b) => b.updateAt.getTime() - a.updateAt.getTime()
  );

  return (
    <section className={styles.pageContainer}>
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
              className={styles.sidebarItem}
            >
              {note.title}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.editorContainer}>
        <div className={styles.toolbar}>
          <button
            className={
              editor?.isActive('bold')
                ? styles.toolbarButtonActive
                : styles.toolbarButton
            }
            onClick={toggleBold}
          >
            Bold
          </button>
          <button
            className={
              editor?.isActive('italic')
                ? styles.toolbarButtonActive
                : styles.toolbarButton
            }
            onClick={toggleItalic}
          >
            Italic
          </button>
        </div>
        <EditorContent editor={editor} className={styles.textEditorContent} />
      </div>
    </section>
  );
}

export default App;
