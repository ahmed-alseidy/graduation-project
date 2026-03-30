"use client";

import { exportFile, importFile } from "@lexical/file";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DownloadIcon, UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ImportExportPlugin() {
  const [editor] = useLexicalComposerContext();
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Import editor state from JSON"
            className="p-2"
            onClick={() => importFile(editor)}
            size={"sm"}
            title="Import"
            variant={"ghost"}
          >
            <UploadIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Import Content</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Export editor state to JSON"
            className="p-2"
            onClick={() =>
              exportFile(editor, {
                fileName: `Playground ${new Date().toISOString()}`,
                source: "Playground",
              })
            }
            size={"sm"}
            title="Export"
            variant={"ghost"}
          >
            <DownloadIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export Content</TooltipContent>
      </Tooltip>
    </>
  );
}
