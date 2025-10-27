"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useCallback, useEffect, useState } from "react";
import interact from "interactjs";
import { useResizable } from "../hooks/useResizable";
import "../styles/envioCorreos.css";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const convertTextToTableGmail = (textData: string): string => {
  const lines = textData.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return "";

  let tableHTML =
    '<div style="margin: 15px 0; display: inline-block; max-width: 100%;">';
  tableHTML +=
    '<table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; margin: 0 auto; border: 1px solid #dadce0; background-color: white;">';

  lines.forEach((line, index) => {
    const cells = line.split("\t").map((cell) => cell.trim());
    if (cells.length > 1) {
      tableHTML += "<tr>";
      cells.forEach((cell) => {
        const isHeader = index === 0;
        const tag = isHeader ? "th" : "td";
        const style = isHeader
          ? "padding: 8px 12px; border: 1px solid #dadce0; background-color: #f8f9fa; color: #3c4043; font-weight: 500; text-align: left; font-size: 14px;"
          : "padding: 8px 12px; border: 1px solid #dadce0; background-color: white; color: #3c4043; text-align: left; font-size: 14px;";
        tableHTML += `<${tag} style="${style}">${cell}</${tag}>`;
      });
      tableHTML += "</tr>";
    }
  });

  tableHTML += "</table></div>";
  return tableHTML;
};

const cleanTableHTML = (htmlData: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlData, "text/html");
  const table = doc.querySelector("table");
  if (!table) return htmlData;

  (table as HTMLElement).style.cssText =
    "border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; margin: 15px 0; border: 1px solid #dadce0; background-color: white;";

  const cells = table.querySelectorAll("td, th");
  cells.forEach((cell) => {
    const htmlCell = cell as HTMLElement;
    const isHeader = htmlCell.tagName === "TH";
    htmlCell.style.cssText = isHeader
      ? "padding: 8px 12px; border: 1px solid #dadce0; background-color: #f8f9fa; color: #3c4043; font-weight: 500; text-align: left; font-size: 14px;"
      : "padding: 8px 12px; border: 1px solid #dadce0; background-color: white; color: #3c4043; text-align: left; font-size: 14px;";
  });

  return `<div style="margin: 15px 0; display: inline-block; max-width: 100%;">${table.outerHTML}</div>`;
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const { height, isResizing, containerRef, handleMouseDown } = useResizable({
    initialHeight: 200,
    minHeight: 100,
    maxHeight: 800,
  });

  useEffect(() => setIsClient(true), []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: { class: "editor-image" },
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder:
          placeholder ||
          "Escribe tu mensaje aquí... (Puedes pegar tablas de Excel o imágenes con Ctrl+V)",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "editor-content" },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const items = Array.from(clipboardData.items);
        const imageItem = items.find((item) => item.type.startsWith("image/"));

        if (imageItem) {
          const file = imageItem.getAsFile();
          if (file) {
            if (file.size > 5 * 1024 * 1024) {
              alert("La imagen es demasiado grande (máx 5MB).");
              return true;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
              const imageDataUrl = e.target?.result as string;
              editor
                ?.chain()
                .focus()
                .setImage({ src: imageDataUrl, alt: "Imagen pegada" })
                .run();
            };
            reader.readAsDataURL(file);
          }
          return true;
        }

        const htmlData = clipboardData.getData("text/html");
        if (htmlData && htmlData.includes("<table")) {
          const cleanedHTML = cleanTableHTML(htmlData);
          editor?.chain().focus().insertContent(cleanedHTML).run();
          return true;
        }

        const textData = clipboardData.getData("text/plain");
        if (textData && (textData.includes("\t") || textData.includes("  "))) {
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

  const addImageFromFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        if (file.size > 5 * 1024 * 1024) {
          alert("La imagen es demasiado grande (máx 5MB).");
          event.target.value = "";
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string;
          editor
            ?.chain()
            .focus()
            .setImage({ src: imageDataUrl, alt: "Imagen cargada" })
            .run();
        };
        reader.readAsDataURL(file);
      }
      event.target.value = "";
    },
    [editor]
  );

  const toggleCase = (toUpper: boolean) => {
    const selection = editor?.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
    if (selection) {
      const newText = toUpper ? selection.toUpperCase() : selection.toLowerCase();
      editor?.chain().focus().insertContent(newText).run();
    }
  };

  // -----------------------
  // InteractJS integration
  // -----------------------
  useEffect(() => {
    if (!editor) return;
    const root = editor.view.dom as HTMLElement;

    const selector = () => Array.from(root.querySelectorAll("img, table")) as HTMLElement[];

    const applyInteract = () => {
      selector().forEach((el) => {
        if ((el as any).__interactInit) return;
        (el as any).__interactInit = true;

        el.style.touchAction = "none";
        el.style.userSelect = "none";
        el.style.maxWidth = "100%";

        if (getComputedStyle(el).display !== "table") {
          el.style.display = "inline-block";
          (el as HTMLElement).style.verticalAlign = "middle";
        }

        if (!el.getAttribute("data-x")) el.setAttribute("data-x", "0");
        if (!el.getAttribute("data-y")) el.setAttribute("data-y", "0");

        // draggable
        interact(el).draggable({
          inertia: true,
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: root,
              endOnly: true,
            }),
          ],
          listeners: {
            move(event) {
              const target = event.target as HTMLElement;
              const dx = (parseFloat(target.getAttribute("data-x") || "0") || 0) + event.dx;
              const dy = (parseFloat(target.getAttribute("data-y") || "0") || 0) + event.dy;
              target.style.transform = `translate(${dx}px, ${dy}px)`;
              target.setAttribute("data-x", String(dx));
              target.setAttribute("data-y", String(dy));
            },
            end() {
              onChange(editor.getHTML());
            },
          },
        });

        // resizable
        interact(el).resizable({
          edges: { left: true, right: true, bottom: true, top: false },
          inertia: true,
          listeners: {
            move(event) {
              const target = event.target as HTMLElement;
              const isImg = target.tagName.toLowerCase() === "img";

              const newWidth = event.rect.width;
              if (isImg) {
                const imgEl = target as HTMLImageElement;
                const naturalRatio =
                  imgEl.naturalWidth && imgEl.naturalHeight
                    ? imgEl.naturalHeight / imgEl.naturalWidth
                    : undefined;
                target.style.width = `${Math.max(40, Math.min(newWidth, root.clientWidth))}px`;
                if (naturalRatio) target.style.height = `${Math.round(newWidth * naturalRatio)}px`;
              } else {
                (target as HTMLElement).style.width = `${Math.max(40, Math.min(newWidth, root.clientWidth))}px`;
              }

              const dx = (parseFloat(target.getAttribute("data-x") || "0") || 0) + (event.deltaRect.left || 0);
              const dy = (parseFloat(target.getAttribute("data-y") || "0") || 0) + (event.deltaRect.top || 0);
              target.style.transform = `translate(${dx}px, ${dy}px)`;
              target.setAttribute("data-x", String(dx));
              target.setAttribute("data-y", String(dy));
            },
            end() {
              onChange(editor.getHTML());
            },
          },
          modifiers: [
            interact.modifiers.restrictSize({
              min: { width: 40, height: 20 },
              max: { width: root.clientWidth, height: root.clientHeight * 2 },
            }),
          ],
        });
      });
    };

    const obs = new MutationObserver(() => {
      applyInteract();
    });
    obs.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "style", "width"] });

    applyInteract();

    return () => {
      obs.disconnect();
      selector().forEach((el) => {
        try {
          interact(el).unset();
        } catch {
          /* ignore */
        }
        delete (el as any).__interactInit;
      });
    };
  }, [editor, onChange]);

  // ✅ NUEVO useEffect para mover/redimensionar imágenes sin interferir con lo existente
  useEffect(() => {
    if (!editor) return;
    const images = document.querySelectorAll(".editor-content img");
    images.forEach((img) => {
      img.style.cursor = "move";
      img.style.maxWidth = "100%";
      img.addEventListener("mousedown", () => {
        img.style.outline = "2px solid #007bff";
      });
      img.addEventListener("mouseup", () => {
        img.style.outline = "none";
      });
    });
  }, [editor]);

  if (!isClient || !editor) {
    return <div className="editor-loading">Cargando editor...</div>;
  }

  return (
    <div className="rich-text-editor" ref={containerRef}>
      <div className="editor-toolbar">
        {/* === Iconos tipo Excel === */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`}
          title="Negrita"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 4h8a4 4 0 010 8H6V4zm0 8h9a4 4 0 010 8H6v-8z"
              stroke="black"
              strokeWidth="2"
            />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`}
          title="Cursiva"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 4h8M6 20h8M12 4l-4 16"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className="toolbar-btn"
          title="Alinear a la izquierda"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h12M3 18h18" stroke="black" strokeWidth="2" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className="toolbar-btn"
          title="Centrar texto"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 6h12M3 12h18M6 18h12" stroke="black" strokeWidth="2" />
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className="toolbar-btn"
          title="Alinear a la derecha"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M9 12h12M3 18h18" stroke="black" strokeWidth="2" />
          </svg>
        </button>

        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          title="Color de texto"
        />

        <button onClick={() => toggleCase(true)} className="toolbar-btn" title="Mayúsculas">
          <span style={{ fontWeight: 600 }}>ABC</span>
        </button>
        <button onClick={() => toggleCase(false)} className="toolbar-btn" title="Minúsculas">
          <span style={{ fontWeight: 400 }}>abc</span>
        </button>

        <div className="toolbar-upload">
          <input
            type="file"
            accept="image/*"
            onChange={addImageFromFile}
            id="image-upload"
            hidden
          />
          <button
            onClick={() => document.getElementById("image-upload")?.click()}
            className="toolbar-btn"
            title="Insertar imagen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 5h16v14H4V5zm4 4a2 2 0 11-4 0 2 2 0 014 0zm-4 9l5-5 3 3 5-5 3 7H4z"
                stroke="black"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="editor-wrapper">
        <EditorContent editor={editor} style={{ height: `${height}px` }} />
        <div
          onMouseDown={handleMouseDown}
          className={`resize-handle ${isResizing ? "active" : ""}`}
          title="Arrastra para redimensionar"
        />
      </div>
    </div>
  );
}
