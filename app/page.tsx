"use client"

import { AppProvider } from "@/lib/store"
import { EducSportApp } from "@/components/educ-sport-app"

export default function Page() {
  return (
    <AppProvider>
      <EducSportApp />
    </AppProvider>
  )
}
