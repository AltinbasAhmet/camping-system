"use client";

import { useEffect, useState } from "react";
import CheckinPanel from "@/components/CheckinPanel";
import { apiRequest, type ApiDataResponse } from "@/lib/api";
import type { Camp } from "@/lib/types";

export default function StaffCheckinPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  useEffect(() => { apiRequest<ApiDataResponse<Camp[]>>("/staff/camps").then((response) => setCamps(response.data)).catch(() => setCamps([])); }, []);
  return <CheckinPanel camps={camps} />;
}
