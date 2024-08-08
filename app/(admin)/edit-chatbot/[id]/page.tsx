"use client";
import { BASE_URL } from "@/components/graphql/apolloCient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const EditChatbot = ({ params: {id} }: { params: { id: string } }) => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const url = `${BASE_URL}/chatbot/${id}`;
    setUrl(url);
  }, [id]);
  return (
    <div className="px-0 md:p-10">
      <div className="md:sticky md:top-0 z-50 sm:max-w-sm ml-auto space-y-2 md:border p-5 rounded-b-lg md:rounded-lg bg-[#2991EE]">
        <h2 className="text-white text-sm font-bold">Link to Chat</h2>

        <p className="text-sm italic text-white">
          Share this link with your customers to start conversations with your
          chatbot
        </p>
        <div className="flex items-center space-x-2">
        <Link
          href={url}
          className="w-full cursor-pointer hover:opacity-50"
        >
          <Input value={url} readOnly className="cursor-pointer" />
        </Link>
        <Button
          size="sm"
          className="px-3"
          onClick={() => {
            navigator.clipboard.writeText(url);
            toast.success("Copied to clipboard");
          }}
        >
          <span className="sr-only">Copy</span>
          <Copy className="w-4 h-4" />
        </Button>
        </div>
      </div>
    </div>
  );
};

export default EditChatbot;
