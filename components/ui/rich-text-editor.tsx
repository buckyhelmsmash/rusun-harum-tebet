"use client";

import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Strikethrough,
  VideoIcon,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getNewsCoverUrl } from "@/lib/utils/news-cover";
import { useUploadNewsCover } from "@/hooks/api/use-news";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  className,
}: RichTextEditorProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadNewsCover();
  const isUploading = uploadMutation.isPending;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert sm:prose-base focus:outline-none min-h-[300px] w-full max-w-full p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      const result = await uploadMutation.mutateAsync({ file });
      const url = getNewsCoverUrl(result.fileId);

      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat mengunggah gambar");
    }
  };

  const addYoutubeVideo = useCallback(() => {
    if (youtubeUrl && editor) {
      editor.commands.setYoutubeVideo({
        src: youtubeUrl,
        width:
          Math.max(320, parseInt(editor.view.dom.clientWidth.toString(), 10)) ||
          640,
        height:
          Math.max(
            180,
            parseInt(editor.view.dom.clientHeight.toString(), 10),
          ) || 480,
      });
      setYoutubeUrl("");
    }
  }, [editor, youtubeUrl]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "border rounded-md overflow-hidden bg-background",
        className,
      )}
    >
      <div className="bg-muted/50 border-b p-2 flex flex-wrap gap-1 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={cn(editor.isActive("bold") ? "bg-muted" : "")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={cn(editor.isActive("italic") ? "bg-muted" : "")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleStrike().run();
          }}
          className={cn(editor.isActive("strike") ? "bg-muted" : "")}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={cn(
            editor.isActive("heading", { level: 1 }) ? "bg-muted" : "",
          )}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={cn(
            editor.isActive("heading", { level: 2 }) ? "bg-muted" : "",
          )}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          className={cn(
            editor.isActive("heading", { level: 3 }) ? "bg-muted" : "",
          )}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={cn(editor.isActive("bulletList") ? "bg-muted" : "")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={cn(editor.isActive("orderedList") ? "bg-muted" : "")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }}
          className={cn(editor.isActive("blockquote") ? "bg-muted" : "")}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              await handleImageUpload(file);
            }
            e.target.value = "";
          }}
          disabled={isUploading}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <VideoIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex space-x-2">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="YouTube Video URL..."
              />
              <Button
                onClick={() => {
                  addYoutubeVideo();
                }}
              >
                Embed
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
