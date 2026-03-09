"use client"

import { UserProfile } from "@clerk/nextjs"

export default function SettingsPage() {

  return (
    <div className="flex justify-center p-10">

      <UserProfile />

    </div>
  )
}