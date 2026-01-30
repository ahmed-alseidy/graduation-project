import {
  ShieldCheck as Complete,
  Loader as Backlog,
  Shield as Planned,
  ShieldX as Cancelled,
  ShieldEllipsis as InProgress,
  Ellipsis as NoPriority,
  SignalLow as LowPriority,
  SignalMedium as MediumPriority,
  SignalHigh as HighPriority,
  OctagonAlert as UrgentPriority,
} from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const priorityOptions = [
  { value: 0, label: "No priority", icon: <NoPriority /> },
  { value: 1, label: "Low", icon: <LowPriority /> },
  { value: 2, label: "Medium", icon: <MediumPriority /> },
  { value: 3, label: "High", icon: <HighPriority /> },
  { value: 4, label: "Urgent", icon: <UrgentPriority /> },
];

const statusOptions = [
  { value: "backlog", label: "Backlog", icon: <Backlog color='#f2994a'/> },
  { value: "planned", label: "Planned", icon: <Planned color='#d7d8db'/> },
  { value: "in_progress", label: "In Progress", icon: <InProgress color='#f0bf00'/> },
  { value: "completed", label: "Completed", icon: <Complete color='#5e6ad2'/> },
  { value: "cancelled", label: "Cancelled", icon: <Cancelled color='#8a8f98'/> },
] as const;

export default function StatusPriority({form, selectedStatus, setSelectedStatus, selectedPriority, setSelectedPriority}:
   {form?: any, selectedStatus?: string, setSelectedStatus?: (status: string) => void, selectedPriority?: number, setSelectedPriority?: (priority: number) => void}) {
  const renderStatusSelect = () => (
    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
      <SelectTrigger className="w-auto h-8" size="sm">
        <SelectValue placeholder={
          <div className="flex items-center gap-2">
            {statusOptions[0].icon && (
              <span className="size-4">{statusOptions[0].icon}</span>
            )}
            <span>{statusOptions[0].label}</span>
          </div>
        } />
      </SelectTrigger>
      <SelectContent>
        {
          statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              <div className="flex items-center gap-2">
                {status.icon && (
                  <span className="size-4">{status.icon}</span>
                )}
                <span>{status.label}</span>
              </div>
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  );

  const renderPrioritySelect = () => (
    <Select value={String(selectedPriority)} onValueChange={(value) => setSelectedPriority && setSelectedPriority(Number(value))}>
      <SelectTrigger className="w-auto h-8" size="sm">
        <SelectValue placeholder={
          <div className="flex items-center gap-2">
            {priorityOptions[0].icon && (
              <span className="size-4">{priorityOptions[0].icon}</span>
            )}
            <span>{priorityOptions[0].label}</span>
          </div>
        } />
      </SelectTrigger>
      <SelectContent>
        {
          priorityOptions.map((priority) => (
            <SelectItem key={priority.value} value={String(priority.value)}>
              <div className="flex items-center gap-2">
                {priority.icon && (
                  <span className="size-4">{priority.icon}</span>
                )}
                <span>{priority.label}</span>
              </div>
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  );

  return (
    <>
      <div className="flex gap-2">
        {form ? (
          <>
            <FormField
                      control={form?.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-auto h-8" size="sm">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {
                                  statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      <div className="flex items-center gap-2">
                                        {status.icon && (
                                          <span className="size-4">{status.icon}</span>
                                        )}
                                        <span>{status.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form?.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select 
                              value={String(field.value)} 
                              onValueChange={(value) => field.onChange(Number(value))}
                            >
                              <SelectTrigger className="w-auto h-8" size="sm">
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                {
                                  priorityOptions.map((priority) => (
                                    <SelectItem key={priority.value} value={String(priority.value)}>
                                      <div className="flex items-center gap-2">
                                        {priority.icon && (
                                          <span className="size-4">{priority.icon}</span>
                                        )}
                                        <span>{priority.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))
                                }
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
          </>
        ) : (
          <>
            {renderStatusSelect()}
            {renderPrioritySelect()}
          </>
        )}
      </div>
    </>
  )
}