import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold, Code2, Heading1, Heading2, Italic, Link2, List, ListOrdered,
  Quote, Redo2, RemoveFormatting, Strikethrough, Underline, Undo2, Unlink,
} from "lucide-react";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

type Tool = {
  label: string;
  icon: typeof Bold;
  active?: string | { name: string; attributes?: Record<string, unknown> };
  run: () => void;
  disabled?: boolean;
};

export default function AdminRichTextEditor({ value, onChange, placeholder = "Start writing…", disabled }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true, defaultProtocol: "https" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor: nextEditor }) => onChange(nextEditor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => current ? {
      bold: current.isActive("bold"), italic: current.isActive("italic"), underline: current.isActive("underline"),
      strike: current.isActive("strike"), h1: current.isActive("heading", { level: 1 }), h2: current.isActive("heading", { level: 2 }),
      bullet: current.isActive("bulletList"), ordered: current.isActive("orderedList"), quote: current.isActive("blockquote"),
      code: current.isActive("codeBlock"), link: current.isActive("link"), canUndo: current.can().chain().focus().undo().run(),
      canRedo: current.can().chain().focus().redo().run(), words: current.getText().trim() ? current.getText().trim().split(/\s+/).length : 0,
    } : null,
  });

  if (!editor) return <div className="rich-editor rich-editor-loading">Loading editor…</div>;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL", previous || "https://");
    if (href === null) return;
    if (!href.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  const tools: Tool[] = [
    { label: "Bold", icon: Bold, active: "bold", run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: "italic", run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Underline", icon: Underline, active: "underline", run: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Strikethrough", icon: Strikethrough, active: "strike", run: () => editor.chain().focus().toggleStrike().run() },
    { label: "Heading 1", icon: Heading1, active: { name: "heading", attributes: { level: 1 } }, run: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: "Heading 2", icon: Heading2, active: { name: "heading", attributes: { level: 2 } }, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Bullet list", icon: List, active: "bulletList", run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: "orderedList", run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Blockquote", icon: Quote, active: "blockquote", run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Code block", icon: Code2, active: "codeBlock", run: () => editor.chain().focus().toggleCodeBlock().run() },
    { label: "Add or edit link", icon: Link2, active: "link", run: setLink },
    { label: "Remove link", icon: Unlink, run: () => editor.chain().focus().unsetLink().run(), disabled: !state?.link },
    { label: "Clear formatting", icon: RemoveFormatting, run: () => editor.chain().focus().clearNodes().unsetAllMarks().run() },
    { label: "Undo", icon: Undo2, run: () => editor.chain().focus().undo().run(), disabled: !state?.canUndo },
    { label: "Redo", icon: Redo2, run: () => editor.chain().focus().redo().run(), disabled: !state?.canRedo },
  ];

  return <div className="rich-editor">
    <div className="rich-editor-toolbar" role="toolbar" aria-label="Article formatting">
      {tools.map(tool => {
        const active = typeof tool.active === "string"
          ? editor.isActive(tool.active)
          : tool.active ? editor.isActive(tool.active.name, tool.active.attributes) : false;
        const Icon = tool.icon;
        return <button key={tool.label} type="button" title={tool.label} aria-label={tool.label} aria-pressed={active} disabled={disabled || tool.disabled} onClick={tool.run}><Icon size={16} /></button>;
      })}
    </div>
    <EditorContent editor={editor} />
    <div className="rich-editor-footer"><span>{state?.words || 0} words</span><span>Saved as clean HTML</span></div>
  </div>;
}
