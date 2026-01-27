import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Target
} from "lucide-react";

export default function DateSelect({startDate, setStartDate, targetDate, setTargetDate}:
   {startDate: Date | undefined, setStartDate: (date: Date) => void, targetDate: Date | undefined, setTargetDate: (date: Date) => void})
    {
  return (
    <>
      <div className="flex items-center gap-2">
        <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 gap-1.5"
                      size="sm"
                      type="button"
                    >
                      {startDate ? (
                        format(startDate, "MMM dd, yyyy")
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="size-3.5" />
                          <span>Start</span>
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 gap-1.5"
                      size="sm"
                      type="button"
                      disabled={!startDate}
                    >
                      {targetDate ? (
                        format(targetDate, "MMM dd, yyyy")
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Target className="size-3.5" />
                          <span>Target</span>
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      disabled={(date) => {
                        if (date > new Date() || date < new Date("1900-01-01")) {
                          return true;
                        }
                        if (startDate && date <= startDate) {
                          return true;
                        }
                        return false;
                      }}
                    />
                  </PopoverContent>
                </Popover>
      </div>
    </>
  )
}