// app-src/components/aim-assistant/chat-widget-wrapper.tsx
"use client";

import dynamic from "next/dynamic";
import { CarContext } from "./types";

const ChatWidgetDynamic = dynamic(() => import("./chat-widget"), { ssr: false });

interface ChatWidgetProps {
  page: string;
  carContext?: CarContext;
  marketplaceContext?: MarketplaceContext;
  userRole?: string;
}

export default function ChatWidgetWrapper(props: ChatWidgetProps) {
  return <ChatWidgetDynamic {...props} />;
}
