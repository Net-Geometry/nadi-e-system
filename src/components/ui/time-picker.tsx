"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function TimePicker() {
  const [hour, setHour] = useState<string>("");
  const [minute, setMinute] = useState<string>("");
  const [ampm, setAmPm] = useState<string>("");

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const ampmOptions = ["AM", "PM"];

  return (
    <div className="flex gap-2 items-center">
      {/* Hour Select */}
      <Select onValueChange={setHour} value={hour}>
        <SelectTrigger className="w-[60px]">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Minute Select */}
      <Select onValueChange={setMinute} value={minute}>
        <SelectTrigger className="w-[60px]">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* AM/PM Select */}
      <Select onValueChange={setAmPm} value={ampm}>
        <SelectTrigger className="w-[60px]">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          {ampmOptions.map((ap) => (
            <SelectItem key={ap} value={ap}>
              {ap}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}