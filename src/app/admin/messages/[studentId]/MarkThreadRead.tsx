"use client";

import { useEffect } from "react";
import { markThreadRead } from "../actions";

export function MarkThreadRead({ studentId }: { studentId: string }) {
  useEffect(() => {
    markThreadRead(studentId);
  }, [studentId]);

  return null;
}
