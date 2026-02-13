import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Image as ImageIcon,
} from "lucide-react";

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-10 w-10 rounded-2xl border grid place-items-center transition-all duration-200",
        "focus:outline-none focus:ring-4 focus:ring-ring/20",
        disabled ? "opacity-50 cursor-not-allowed bg-muted/40" : "hover:bg-muted/70 hover:shadow-[var(--shadow-sm)] bg-background",
        active ? "border-primary/40 bg-primary/5" : "border-border/70",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write the story with structure and clarity…",
  className,
  onInsertImage,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  onInsertImage?: () => Promise<string | null> | string | null;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
        validate: (href) => /^https?:\/\//i.test(href),
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] px-4 py-4 md:px-5 md:py-5 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || "") !== (current || "")) editor.commands.setContent(value || "", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const can = (name: string) => {
    if (!editor) return false;
    // @ts-expect-error - tiptap typing not fully exhaustive here
    return editor.can()[name] ? true : false;
  };

  async function handleAddLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Paste a full URL (https://…)", prev || "https://");
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  }

  async function handleInsertImage() {
    if (!editor) return;
    let src: string | null = null;
    if (onInsertImage) {
      const res = await onInsertImage();
      src = typeof res === "string" ? res : res;
    } else {
      src = window.prompt("Image URL", "https://");
    }
    if (!src) return;
    editor.chain().focus().setImage({ src }).run();
  }

  return (
    <div className={cn("rounded-3xl border bg-card shadow-[var(--shadow-md)] overflow-hidden", className)}>
      <div className="p-3 md:p-4 border-b bg-background/60">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 pr-2 mr-2 border-r">
            <ToolbarButton
              title="Bold"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={!!editor?.isActive("bold")}
              disabled={!editor || !can("toggleBold")}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Italic"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={!!editor?.isActive("italic")}
              disabled={!editor || !can("toggleItalic")}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Underline"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              active={!!editor?.isActive("underline")}
              disabled={!editor}
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-2 pr-2 mr-2 border-r">
            <ToolbarButton
              title="Heading (H2)"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              active={!!editor?.isActive("heading", { level: 2 })}
              disabled={!editor}
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Heading (H3)"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              active={!!editor?.isActive("heading", { level: 3 })}
              disabled={!editor}
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Quote"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              active={!!editor?.isActive("blockquote")}
              disabled={!editor}
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-2 pr-2 mr-2 border-r">
            <ToolbarButton
              title="Bullet list"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={!!editor?.isActive("bulletList")}
              disabled={!editor}
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Ordered list"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              active={!!editor?.isActive("orderedList")}
              disabled={!editor}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-2 pr-2 mr-2 border-r">
            <ToolbarButton
              title="Align left"
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              active={editor?.getAttributes("textAlign")?.textAlign === "left"}
              disabled={!editor}
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Align center"
              onClick={() => editor?.chain().focus().setTextAlign("center").run()}
              active={editor?.getAttributes("textAlign")?.textAlign === "center"}
              disabled={!editor}
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Align right"
              onClick={() => editor?.chain().focus().setTextAlign("right").run()}
              active={editor?.getAttributes("textAlign")?.textAlign === "right"}
              disabled={!editor}
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-2 pr-2 mr-2 border-r">
            <ToolbarButton
              title="Link"
              onClick={handleAddLink}
              active={!!editor?.isActive("link")}
              disabled={!editor}
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Insert image"
              onClick={handleInsertImage}
              disabled={!editor}
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-2">
            <ToolbarButton
              title="Undo"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor || !can("undo")}
            >
              <Undo2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Redo"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor || !can("redo")}
            >
              <Redo2 className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <div className="ml-auto hidden md:flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddLink}
              className="rounded-2xl border-border/70 bg-card/50 hover:bg-card hover:shadow-[var(--shadow-sm)] transition-all"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Link
            </Button>
            <Button
              type="button"
              onClick={handleInsertImage}
              className="rounded-2xl bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-[0_14px_30px_hsl(var(--primary)/0.22)] hover:shadow-[0_18px_40px_hsl(var(--primary)/0.26)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Image
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
