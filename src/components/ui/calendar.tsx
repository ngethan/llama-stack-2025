"use client";

import type { DropdownProps, Locale } from "react-day-picker";
import * as React from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

import { buttonVariants } from "./button";
import { ScrollArea } from "./scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function genYears(beginYear: number, endYear: number) {
  const yearRange = endYear - beginYear + 1;
  return Array.from({ length: yearRange }, (_, i) => ({
    value: beginYear + i,
    label: (beginYear + i).toString(),
  }));
}

function genMonths(
  locale: Pick<Locale, "options" | "localize" | "formatLong">,
) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2021, i), "MMMM", { locale }),
  }));
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  markToday = false,
  beginYear = new Date().getFullYear(),
  endYear = new Date().getFullYear() + 1,
  ...props
}: CalendarProps & {
  beginYear?: number;
  endYear?: number;
  markToday?: boolean;
}) {
  const MONTHS = React.useMemo(() => {
    let locale: Pick<Locale, "options" | "localize" | "formatLong"> = enUS;
    const { options, localize, formatLong } = props.locale ?? {};
    if (options && localize && formatLong) {
      locale = {
        options,
        localize,
        formatLong,
      };
    }
    return genMonths(locale);
  }, [props.locale]);

  const YEARS = React.useMemo(
    () => genYears(beginYear, endYear),
    [beginYear, endYear],
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-y-0 justify-center mt-1",
        month: "space-y-4",
        month_caption: "flex justify-center relative items-center z-0",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center z-10",
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-5 top-[1.125rem] z-10 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-5 top-[1.125rem] z-10 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-l-md rounded-r-md p-0 font-normal aria-selected:opacity-100",
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md",
        today: cn(
          markToday ? "rounded-md bg-accent text-accent-foreground" : "",
        ),
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        months_dropdown: "flex space-x-2",
        dropdown: "flex space-x-2",
        dropdown_root: "flex space-x-2",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) =>
          props.orientation === "left" ? (
            <LuChevronLeft className="h-4 w-4" />
          ) : (
            <LuChevronRight className="h-4 w-4" />
          ),
        // MonthCaption: ({ calendarMonth }) => {
        //   return (
        //     <div className="inline-flex w-full justify-center gap-2">
        //       <Select
        //         defaultValue={calendarMonth.date.getMonth().toString()}
        //         onValueChange={(value) => {
        //           const newDate = new Date(calendarMonth.date);
        //           newDate.setMonth(Number.parseInt(value, 10));
        //           props.onMonthChange?.(newDate);
        //         }}
        //       >
        //         <SelectTrigger className="h-8 w-fit gap-1 border-none px-2 py-1 focus:bg-accent focus:text-accent-foreground">
        //           <SelectValue />
        //         </SelectTrigger>
        //         <SelectContent>
        //           {MONTHS.map((month) => (
        //             <SelectItem
        //               key={month.value}
        //               value={month.value.toString()}
        //             >
        //               {month.label}
        //             </SelectItem>
        //           ))}
        //         </SelectContent>
        //       </Select>
        //       <Select
        //         defaultValue={calendarMonth.date.getFullYear().toString()}
        //         onValueChange={(value) => {
        //           const newDate = new Date(calendarMonth.date);
        //           newDate.setFullYear(Number.parseInt(value, 10));
        //           props.onMonthChange?.(newDate);
        //         }}
        //       >
        //         <SelectTrigger className="h-8 w-fit gap-1 border-none px-2 py-1 focus:bg-accent focus:text-accent-foreground">
        //           <SelectValue />
        //         </SelectTrigger>
        //         <SelectContent>
        //           {YEARS.map((year) => (
        //             <SelectItem key={year.value} value={year.value.toString()}>
        //               {year.label}
        //             </SelectItem>
        //           ))}
        //         </SelectContent>
        //       </Select>
        //     </div>
        //   );
        // },
        DropdownNav: ({ children }) => {
          return <div className="flex space-x-2">{children}</div>;
        },
        Dropdown: ({ value, onChange, options }: DropdownProps) => {
          const selected = options?.find((child) => child.value === value);
          const handleChange = (value: string) => {
            const changeEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <Select
              value={value?.toString()}
              onValueChange={(value) => {
                handleChange(value);
              }}
            >
              <SelectTrigger className="hover:bg-accent-light h-8 border-none pr-1.5 ring-0 duration-150 focus:ring-0">
                <SelectValue>{selected?.label ?? "Select"}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper">
                <ScrollArea className="h-80">
                  {options?.map((option, id: number) => (
                    <SelectItem
                      key={`${option.value}-${id}`}
                      value={option.value?.toString() ?? ""}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
