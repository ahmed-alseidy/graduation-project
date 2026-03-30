"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LockIcon, UnlockIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function EditModeTogglePlugin() {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={`${isEditable ? "Lock" : "Unlock"} read-only mode`}
          className="p-2"
          onClick={() => {
            editor.setEditable(!editor.isEditable());
            setIsEditable(editor.isEditable());
          }}
          size={"sm"}
          title="Read-Only Mode"
          variant={"ghost"}
        >
          {isEditable ? (
            <LockIcon className="size-4" />
          ) : (
            <UnlockIcon className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isEditable ? "View Only Mode" : "Edit Mode"}
      </TooltipContent>
    </Tooltip>
  );
}
