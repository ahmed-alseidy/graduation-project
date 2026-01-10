"use client"

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader, OctagonAlert, User, CalendarClock, CalendarCheck } from "lucide-react";

export default function Project() {
  // ✅ State for project name, summary, and description
  const [projectName, setProjectName] = useState("");
  const [summary, setSummary] = useState("This is a summary of the project.");
  const [description, setDescription] = useState("");

  return (
    <>
      <div className="px-8 py-4">
        {/* Project Details */}
        <div>
          <Textarea
            placeholder="Project Name..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="text-2xl font-bold border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none placeholder:text-2xl placeholder:font-bold"
          />
          <Textarea
            placeholder="Add a short summary..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none"
          />
        </div>

        {/* state */}
        <div>
          <div className="flex gap-8 items-center">
            <h2 className="text-lg font-bold">Properties</h2>
            <ul className="flex gap-6 text-sm font-bold">
              <li className="flex items-center gap-1 px-2 py-1 cursor-pointer">
                <span><Loader color="#ffbd08b7" /></span><span>In Progress</span>
                </li> 
              <li className="flex items-center gap-1 px-2 py-1 cursor-pointer">
                <span><OctagonAlert color="#fb2c36" /></span><span>URGENT</span>
                </li>
              <li className="flex items-center gap-1 px-2 py-1 cursor-pointer">
                <span><User color="#9b9b9b" /></span><span>Abdullah hisham</span>
                </li>
              <li className="flex items-center gap-1 px-2 py-1 cursor-pointer">
                <span><CalendarClock color="#9b9b9b" /></span><span>Des 2, 2025</span>
                </li>
              <li className="flex items-center gap-1 px-2 py-1 cursor-pointer">
                <span><CalendarCheck color="#9b9b9b" /></span><span>May 30</span>
                </li>
            </ul>
          </div>
        </div>

        {/* description */}
        <div>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-bold cursor-pointer">Description</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  placeholder="Write project description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="font-semibold border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none placeholder:text-2xl placeholder:font-bold"
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