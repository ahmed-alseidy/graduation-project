import { SerializedEditorState } from "lexical";
import { useState } from "react";
import { Editor } from "@/components/blocks/editor-x/editor";

const initialValue = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState;

export function DescriptionEditor({
  description,
  setDescription,
}: {
  description: string;
  setDescription: (value: string) => void;
}) {
  const [editorState, setEditorState] = useState<SerializedEditorState>(
    description ? JSON.parse(description) : initialValue
  );

  function onChange(value: SerializedEditorState) {
    setEditorState(value);
    setDescription(JSON.stringify(value));
  }

  return (
    <Editor editorSerializedState={editorState} onSerializedChange={onChange} />
  );
}
