"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { NotebookPenIcon } from "lucide-react";
import { JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function TreeViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-2" size={"sm"} variant={"ghost"}>
          <NotebookPenIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tree View</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 overflow-hidden rounded-lg bg-foreground p-2 text-background">
          <TreeView
            editor={editor}
            timeTravelButtonClassName="debug-timetravel-button"
            timeTravelPanelButtonClassName="debug-timetravel-panel-button"
            timeTravelPanelClassName="debug-timetravel-panel"
            timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
            treeTypeButtonClassName="debug-treetype-button"
            viewClassName="tree-view-output"
          />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
