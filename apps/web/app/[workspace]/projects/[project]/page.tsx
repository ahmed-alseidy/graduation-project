"use client";

import {
  CalendarCheck,
  CalendarClock,
  Loader,
  OctagonAlert,
  User,
} from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Project() {
  const [projectName, setProjectName] = useState("");
  const [summary, setSummary] = useState("This is a summary of the project.");
  const [description, setDescription] = useState("");

  return (
    <>
      <div className="px-8 py-4">
        <div>
          <Textarea
            className="border-none font-bold text-2xl shadow-none outline-none placeholder:font-bold placeholder:text-2xl focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name..."
            value={projectName}
          />
          <Textarea
            className="border-none shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Add a short summary..."
            value={summary}
          />
        </div>

        <div>
          <div className="flex items-center gap-8">
            <h2 className="font-bold text-lg">Properties</h2>
            <ul className="flex gap-6 font-bold text-sm">
              <li className="flex cursor-pointer items-center gap-2 px-2 py-1">
                <Button size="sm" variant="ghost">
                  <span>
                    <Loader color="#ffbd08b7" size={16} />
                  </span>
                  <span>In Progress</span>
                </Button>
              </li>
              <li className="flex cursor-pointer items-center gap-2 px-2 py-1">
                <span>
                  <OctagonAlert className="text-destructive" size={16} />
                </span>
                <span>URGENT</span>
              </li>
              <li className="flex cursor-pointer items-center gap-2 px-2 py-1">
                <span>
                  <User className="text-muted-foreground" size={16} />
                </span>
                <span>Abdullah hisham</span>
              </li>
              <li className="flex cursor-pointer items-center gap-2 px-2 py-1">
                <span>
                  <CalendarClock className="text-muted-foreground" size={16} />
                </span>
                <span>Des 2, 2025</span>
              </li>
              <li className="flex cursor-pointer items-center gap-2 px-2 py-1">
                <span>
                  <CalendarCheck className="text-muted-foreground" size={16} />
                </span>
                <span>May 30</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <Accordion collapsible type="single">
            <AccordionItem value="item-1">
              <AccordionTrigger className="cursor-pointer font-bold">
                Description
              </AccordionTrigger>
              <AccordionContent>
                <Textarea
                  className="border-none font-semibold shadow-none outline-none placeholder:font-bold placeholder:text-2xl focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write project description..."
                  value={description}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <hr />
    </>
  );
}
