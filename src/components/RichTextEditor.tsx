"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { useCallback, useEffect, useState } from 'react';
import { useResizable } from '../hooks/useResizable';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Función para convertir texto tabular a tabla HTML - Estilo Gmail
const convertTextToTableGmail = (textData: string): string => {
  const lines = textData.split('\n').filter(line => line.trim());
  if (lines.length === 0) return '';
  
  let tableHTML = '<div style="margin: 15px 0; display: inline-block; max-width: 100%;">';
  tableHTML += '<table style="border-collapse: collapse; width: 100%; max-width: 100%; font-family: Arial, sans-serif; margin: 0 auto; border: 1px solid #dadce0; background-color: white;">';
  
  lines.forEach((line, index) => {
    const cells = line.split('\t').map(cell => cell.trim());
    if (cells.length > 1) {
      tableHTML += '<tr>';
      cells.forEach((cell, cellIndex) => {
        const isHeader = index === 0; // Primera fila como encabezado
        const tag = isHeader ? 'th' : 'td';
        const style = isHeader 
          ? 'padding: 8px 12px; border: 1px solid #dadce0; background-color: #f8f9fa; color: #3c4043; font-weight: 500; text-align: left; font-size: 14px;'
          : 'padding: 8px 12px; border: 1px solid #dadce0; background-color: white; color: #3c4043; text-align: left; font-size: 14px;';
        
        tableHTML += `<${tag} style="${style}">${cell}</${tag}>`;
      });
      tableHTML += '</tr>';
    }
  });
  
  tableHTML += '</table></div>';
  return tableHTML;
};

// Función para limpiar HTML de tablas - Estilo Gmail
const cleanTableHTML = (htmlData: string): string => {
  // Crear un parser temporal para limpiar el HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlData, 'text/html');
  const table = doc.querySelector('table');
  
  if (!table) return htmlData;
  
  // Aplicar estilos Gmail a la tabla
  (table as HTMLElement).style.cssText = 'border-collapse: collapse; width: 100%; max-width: 100%; font-family: Arial, sans-serif; margin: 15px 0; border: 1px solid #dadce0; background-color: white;';
  
  // Aplicar estilos a las celdas
  const cells = table.querySelectorAll('td, th');
  cells.forEach((cell, index) => {
    const htmlCell = cell as HTMLElement; // ✅ Fix de tipo
    const isHeader = htmlCell.tagName === 'TH';
    htmlCell.style.cssText = isHeader 
      ? 'padding: 8px 12px; border: 1px solid #dadce0; background-color: #f8f9fa; color: #3c4043; font-weight: 500; text-align: left; font-size: 14px;'
      : 'padding: 8px 12px; border: 1px solid #dadce0; background-color: white; color: #3c4043; text-align: left; font-size: 14px;';
  });
  
  return `<div style="margin: 15px 0; display: inline-block; max-width: 100%;">${table.outerHTML}</div>`;
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const { height, isResizing, containerRef, handleMouseDown } = useResizable({
    initialHeight: 200,
    minHeight: 100,
    maxHeight: 800
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          style: 'max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; margin: 10px 0;',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escribe tu mensaje aquí... (Puedes pegar tablas de Excel con Ctrl+V o imágenes con Ctrl+V)',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
    ],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        style: 'min-height: 200px; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; background-color: white;',
      },
   handlePaste: (view, event) => {
  const clipboardData = event.clipboardData;
  if (!clipboardData) return false; // ✅ Evita error por null

  const items = Array.from(clipboardData.items);

  // Verificar si hay una imagen en el portapapeles
  const imageItem = items.find(item => item.type.startsWith('image/'));
  
  if (imageItem) {
    const file = imageItem.getAsFile();
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Por favor, usa una imagen menor a 5MB.');
        return true;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        editor?.chain().focus().setImage({
          src: imageDataUrl,
          alt: 'Imagen pegada',
          title: 'Imagen pegada',
          style: 'max-width: 100%; height: auto; display: block; margin: 10px auto;'
        }).run();
      };
      reader.readAsDataURL(file);
    }
    return true;
  }

  const htmlData = clipboardData.getData('text/html');
  if (htmlData && htmlData.includes('<table')) {
    const cleanedHTML = cleanTableHTML(htmlData);
    editor?.chain().focus().insertContent(cleanedHTML).run();
    return true;
  }

  const textData = clipboardData.getData('text/plain');
  if (textData && (textData.includes('\t') || textData.includes('  '))) {
    const tableHTML = convertTextToTableGmail(textData);
    if (tableHTML) {
      editor?.chain().focus().insertContent(tableHTML).run();
      return true;
    }
  }

  return false;
},

    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const addImageFromFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Por favor, usa una imagen menor a 5MB.');
        event.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        editor?.chain().focus().setImage({ 
          src: imageDataUrl,
          alt: 'Imagen cargada',
          title: 'Imagen cargada'
        }).run();
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  }, [editor]);

  if (!isClient || !editor) {
    return (
      <div style={{ 
        minHeight: '200px', 
        padding: '12px', 
        border: '1px solid #d1d5db', 
        borderRadius: '6px',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280'
      }}>
        Cargando editor...
      </div>
    );
  }

  return (
    <div className="rich-text-editor" ref={containerRef}>
      {/* Toolbar */}
      <div className="editor-toolbar" style={{ 
        border: '1px solid #d1d5db', 
        borderBottom: 'none', 
        borderTopLeftRadius: '6px', 
        borderTopRightRadius: '6px',
        padding: '8px',
        backgroundColor: '#f9fafb',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        {/* Text formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive('bold') ? '#3b82f6' : 'white',
            color: editor.isActive('bold') ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          <strong>B</strong>
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive('italic') ? '#3b82f6' : 'white',
            color: editor.isActive('italic') ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          <em>I</em>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive('underline') ? '#3b82f6' : 'white',
            color: editor.isActive('underline') ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          <u>U</u>
        </button>

        {/* Separator */}
        <div style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }}></div>

        {/* Text Alignment - Estilo Gmail */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive({ textAlign: 'left' }) ? '#1a73e8' : 'white',
            color: editor.isActive({ textAlign: 'left' }) ? 'white' : 'black',
            cursor: 'pointer'
          }}
          title="Alinear a la izquierda"
        >
          ⬅️
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive({ textAlign: 'center' }) ? '#1a73e8' : 'white',
            color: editor.isActive({ textAlign: 'center' }) ? 'white' : 'black',
            cursor: 'pointer'
          }}
          title="Centrar"
        >
          ↔️
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive({ textAlign: 'right' }) ? '#1a73e8' : 'white',
            color: editor.isActive({ textAlign: 'right' }) ? 'white' : 'black',
            cursor: 'pointer'
          }}
          title="Alinear a la derecha"
        >
          ➡️
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive({ textAlign: 'justify' }) ? '#1a73e8' : 'white',
            color: editor.isActive({ textAlign: 'justify' }) ? 'white' : 'black',
            cursor: 'pointer'
          }}
          title="Justificar"
        >
          ⬌
        </button>

        {/* Separator */}
        <div style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }}></div>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive('bulletList') ? '#3b82f6' : 'white',
            color: editor.isActive('bulletList') ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          • Lista
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: editor.isActive('orderedList') ? '#3b82f6' : 'white',
            color: editor.isActive('orderedList') ? 'white' : 'black',
            cursor: 'pointer'
          }}
        >
          1. Lista
        </button>

        {/* Separator */}
        <div style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }}></div>

        {/* Image */}
        <div style={{ position: 'relative' }}>
          <input
            type="file"
            accept="image/*"
            onChange={addImageFromFile}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <button
            onClick={() => document.getElementById('image-upload')?.click()}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: 'black',
              cursor: 'pointer'
            }}
          >
            🖼️ Imagen
          </button>
        </div>


        {/* Separator */}
        <div style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }}></div>

        {/* Clear formatting */}
        <button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: 'black',
            cursor: 'pointer'
          }}
        >
          🧹 Limpiar
        </button>
      </div>

      {/* Editor content */}
      <div style={{ position: 'relative' }}>
        <EditorContent 
          editor={editor} 
          style={{ 
            border: '1px solid #d1d5db', 
            borderTop: 'none',
            borderBottomLeftRadius: '6px', 
            borderBottomRightRadius: '6px',
            height: `${height}px`,
            overflow: 'auto'
          }}
        />
        
        {/* Resize handle */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '20px',
            height: '20px',
            cursor: 'ns-resize',
            background: 'linear-gradient(-45deg, transparent 30%, #d1d5db 30%, #d1d5db 35%, transparent 35%, transparent 65%, #d1d5db 65%, #d1d5db 70%, transparent 70%)',
            backgroundSize: '8px 8px',
            borderRadius: '0 0 6px 0',
            opacity: isResizing ? 0.8 : 0.6,
            transition: 'opacity 0.2s ease',
            zIndex: 10
          }}
          title="Arrastra para redimensionar"
        />
      </div>
    </div>
  );
}
