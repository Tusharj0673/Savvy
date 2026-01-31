"use client";

import { Button } from "@/components/ui/button";
import { scanReceipt } from "@actions/transaction";
import { Camera, Loader2 } from "lucide-react";
import useFetch from "hooks/use-fetch";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

const ReciptScanner = ({ onScanComplete }) => {
  const fileInputRef = useRef(null);
  const hasCalledRef = useRef(false);

  const {
    loading: scanReceiptLoading,
    fn: scanReception,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    hasCalledRef.current = false;

    const formData = new FormData();
    formData.append("file", file);

    await scanReception(formData); 
  };

  useEffect(() => {
    if (!scanReceiptLoading && scannedData && !hasCalledRef.current) {
      hasCalledRef.current = true;
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData, onScanComplete]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />

      <Button
        type="button"
        variant="outline"
        className="
          w-full h-10
          bg-linear-to-br from-cyan-400 via-cyan-600 to-yellow-500
          animate-gradient hover:opacity-90 transition-opacity
          text-white hover:text-white
        "
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default ReciptScanner;
