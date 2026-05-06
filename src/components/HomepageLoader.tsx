"use client";

import React, { useEffect, useState } from "react";

export default function HomepageLoader({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowLoader(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (showLoader) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/newfavicon.png"
              alt="Adsaro"
              className="h-10 w-10  object-contain"
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
