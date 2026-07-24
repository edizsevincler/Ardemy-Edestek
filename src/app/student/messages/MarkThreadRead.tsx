"use client";

import { useEffect } from "react";
import { markOwnMessagesRead } from "./actions";

export function MarkThreadRead() {
  useEffect(() => {
    markOwnMessagesRead();
  }, []);

  return null;
}
