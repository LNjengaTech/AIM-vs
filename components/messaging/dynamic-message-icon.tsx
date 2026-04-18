"use client"
import dynamic from "next/dynamic"

const DynamicMessageIcon = dynamic(
  () => import("./message-icon"),
  { ssr: false }
)

export default DynamicMessageIcon
