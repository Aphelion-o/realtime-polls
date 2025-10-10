"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

export function ShareButton({ pollId }: { pollId: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Share</Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col items-center justify-center gap-6 py-8 sm:py-10">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Share Poll
          </DialogTitle>
        </DialogHeader>

        {/* Larger QR Code with responsive padding */}
        {url && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md flex items-center justify-center">
            <QRCode value={url} size={260} />
          </div>
        )}

        {/* Centered Copy Button */}
        <Button
          onClick={handleCopy}
          variant={copied ? "secondary" : "default"}
          className="mt-2 text-base px-6"
        >
          {copied ? "Copied!" : "Copy URL"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
